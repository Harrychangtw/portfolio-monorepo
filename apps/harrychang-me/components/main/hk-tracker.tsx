"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Trash2, X, ArrowRight, Pencil, Share2 } from "lucide-react";

/* ================================================================
   HK Split — temporary expense tracker for the Hong Kong trip.
   One person pays the whole table at each place; everyone logs
   how much they personally ate. The entered total is a failsafe
   against the sum of individual amounts. State lives in
   localStorage on this device only (no backend).
   ================================================================ */

const PEOPLE = ["Harry", "Charlie", "Clement", "Benson"] as const;
type Person = (typeof PEOPLE)[number];

interface Expense {
  id: string;
  label: string;
  payer: Person;
  total: number; // what the payer actually paid (failsafe)
  shares: Record<Person, number>; // how much each person ate
  createdAt: number;
}

const STORAGE_KEY = "hk-split-v1";

const emptyShares = (): Record<Person, number> =>
  Object.fromEntries(PEOPLE.map((p) => [p, 0])) as Record<Person, number>;

function money(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const fixed = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2);
  return `HK$${fixed}`;
}

/* ── Validation ───────────────────────────────────────────── */

// Coerce arbitrary parsed JSON (corrupt storage, an old schema, or a
// tampered share link) into well-formed expenses. Invalid entries are
// dropped rather than allowed to crash the settlement math.
function sanitizeExpenses(raw: unknown): Expense[] {
  if (!Array.isArray(raw)) return [];
  const out: Expense[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.label !== "string") continue;
    if (!PEOPLE.includes(o.payer as Person)) continue;
    const total = Number(o.total);
    if (!Number.isFinite(total)) continue;
    const rawShares = (o.shares ?? {}) as Record<string, unknown>;
    const shares = emptyShares();
    for (const p of PEOPLE) {
      const v = Number(rawShares[p]);
      shares[p] = Number.isFinite(v) ? v : 0;
    }
    out.push({
      id:
        typeof o.id === "string" && o.id
          ? o.id
          : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: o.label,
      payer: o.payer as Person,
      total,
      shares,
      createdAt: Number.isFinite(Number(o.createdAt))
        ? Number(o.createdAt)
        : Date.now(),
    });
  }
  return out;
}

/* ── Shareable snapshot (read-only, URL-hash encoded) ─────── */

function encodeSnapshot(expenses: Expense[]): string {
  const bytes = new TextEncoder().encode(JSON.stringify(expenses));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeSnapshot(s: string): Expense[] | null {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    return Array.isArray(parsed) ? sanitizeExpenses(parsed) : null;
  } catch {
    return null;
  }
}

/* ── Persistence ──────────────────────────────────────────── */

function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setExpenses(sanitizeExpenses(JSON.parse(raw)));
    } catch {
      /* ignore corrupt / unreadable storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch {
      /* quota exceeded or storage disabled — keep running in memory */
    }
  }, [expenses, loaded]);

  // Keep other open tabs on this device in sync.
  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== STORAGE_KEY) return;
      try {
        setExpenses(
          ev.newValue ? sanitizeExpenses(JSON.parse(ev.newValue)) : [],
        );
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { expenses, setExpenses, loaded };
}

/* ── Settlement math ──────────────────────────────────────── */

function computeNet(expenses: Expense[]): Record<Person, number> {
  const net = emptyShares();
  for (const e of expenses) {
    net[e.payer] += e.total;
    for (const p of PEOPLE) net[p] -= e.shares[p] || 0;
  }
  return net;
}

interface Transfer {
  from: Person;
  to: Person;
  amount: number;
}

// Greedy minimal cash-flow settlement.
function settle(net: Record<Person, number>): Transfer[] {
  const debtors = PEOPLE.filter((p) => net[p] < -0.005).map((p) => ({
    person: p,
    amount: -net[p],
  }));
  const creditors = PEOPLE.filter((p) => net[p] > 0.005).map((p) => ({
    person: p,
    amount: net[p],
  }));
  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    transfers.push({
      from: debtors[i].person,
      to: creditors[j].person,
      amount: Math.round(pay * 100) / 100,
    });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount < 0.005) i++;
    if (creditors[j].amount < 0.005) j++;
  }
  return transfers;
}

/* ── Person chip ──────────────────────────────────────────── */

function PersonChip({
  person,
  active,
  onClick,
}: {
  person: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md border text-sm font-body transition-colors ${
        active
          ? "border-accent bg-accent/10 text-foreground"
          : "border-border text-secondary hover:border-secondary"
      }`}
    >
      {person}
    </button>
  );
}

/* ── Add / edit form ──────────────────────────────────────── */

function ExpenseForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Expense;
  onSave: (e: Expense) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [payer, setPayer] = useState<Person>(initial?.payer ?? PEOPLE[0]);
  const [total, setTotal] = useState<string>(
    initial ? String(initial.total) : "",
  );
  const [shares, setShares] = useState<Record<Person, string>>(
    () =>
      Object.fromEntries(
        PEOPLE.map((p) => [p, initial ? String(initial.shares[p] || "") : ""]),
      ) as Record<Person, string>,
  );

  const num = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const totalNum = num(total);
  const sumShares = PEOPLE.reduce((acc, p) => acc + num(shares[p]), 0);
  const remainder = Math.round((totalNum - sumShares) * 100) / 100;
  const reconciled = Math.abs(remainder) < 0.005;

  const splitRemainder = () => {
    const per = remainder / PEOPLE.length;
    setShares(
      (prev) =>
        Object.fromEntries(
          PEOPLE.map((p) => [
            p,
            String(Math.round((num(prev[p]) + per) * 100) / 100),
          ]),
        ) as Record<Person, string>,
    );
  };

  const canSave = label.trim() !== "" && totalNum > 0 && reconciled;

  const saveLabel = (() => {
    if (totalNum <= 0) return "Enter the bill total";
    if (!reconciled)
      return `Logged ${money(sumShares)} of ${money(totalNum)} · ${money(
        Math.abs(remainder),
      )} ${remainder > 0 ? "under" : "over"}`;
    return initial ? "Save changes" : "Add place";
  })();

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id:
        initial?.id ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: label.trim(),
      payer,
      total: totalNum,
      shares: Object.fromEntries(
        PEOPLE.map((p) => [p, num(shares[p])]),
      ) as Record<Person, number>,
      createdAt: initial?.createdAt ?? Date.now(),
    });
  };

  return (
    <div className="border border-border rounded-lg bg-card p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <span className="section-label text-primary">
          {initial ? "Edit place" : "New place"}
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-secondary hover:text-foreground transition-colors"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Label */}
      <div className="space-y-1.5">
        <label className="label-mono uppercase">Place</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Australia Dairy Co."
          className="w-full bg-transparent border border-border rounded-md px-3 py-2.5 font-body text-foreground placeholder:text-secondary/50 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Payer */}
      <div className="space-y-1.5">
        <label className="label-mono uppercase">Who paid the table</label>
        <div className="flex flex-wrap gap-2">
          {PEOPLE.map((p) => (
            <PersonChip
              key={p}
              person={p}
              active={payer === p}
              onClick={() => setPayer(p)}
            />
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="space-y-1.5">
        <label className="label-mono uppercase">Bill total (failsafe)</label>
        <input
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          className="w-full bg-transparent border border-border rounded-md px-3 py-2.5 font-mono text-foreground placeholder:text-secondary/50 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Per-person shares */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="label-mono uppercase">How much each ate</label>
          {!reconciled && Math.abs(remainder) > 0.005 && (
            <button
              type="button"
              onClick={splitRemainder}
              className="font-mono text-xs text-secondary hover:text-accent transition-colors whitespace-nowrap"
            >
              split evenly
            </button>
          )}
        </div>
        <div className="space-y-2">
          {PEOPLE.map((p) => (
            <div key={p} className="flex items-center gap-3">
              <span className="font-body text-foreground w-20 shrink-0">
                {p}
                {p === payer && (
                  <span className="text-accent text-xs ml-1">paid</span>
                )}
              </span>
              <input
                value={shares[p]}
                onChange={(e) =>
                  setShares((prev) => ({ ...prev, [p]: e.target.value }))
                }
                inputMode="decimal"
                placeholder="0"
                className="flex-1 bg-transparent border border-border rounded-md px-3 py-2 font-mono text-foreground placeholder:text-secondary/50 focus:border-accent focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border/50 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 bg-accent text-background font-body font-medium rounded-md py-2.5 transition-opacity disabled:opacity-40"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   Main
   ═════════════════════════════════════════════════════════════ */

export default function HkTracker() {
  const { expenses, setExpenses, loaded } = useExpenses();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  // Read-only snapshot opened from a #s=… share link. While set, the UI
  // shows the shared data and hides all editing controls; the user's own
  // localStorage ledger is left untouched until they explicitly import.
  const [snapshot, setSnapshot] = useState<Expense[] | null>(null);
  const [confirmImport, setConfirmImport] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const m = window.location.hash.match(/[#&]s=([A-Za-z0-9_-]+)/);
    if (!m) return;
    const decoded = decodeSnapshot(m[1]);
    if (decoded) setSnapshot(decoded);
  }, []);

  const viewing = snapshot !== null;
  const data = snapshot ?? expenses;

  const net = useMemo(() => computeNet(data), [data]);
  const transfers = useMemo(() => settle(net), [net]);

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.createdAt - a.createdAt),
    [data],
  );

  const grandTotal = data.reduce((acc, e) => acc + e.total, 0);

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#s=${encodeSnapshot(expenses)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const exitSnapshot = () => {
    setSnapshot(null);
    setConfirmImport(false);
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  };

  const importSnapshot = () => {
    if (snapshot) setExpenses(snapshot);
    exitSnapshot();
  };

  const upsert = (e: Expense) => {
    setExpenses((prev) => {
      const exists = prev.some((x) => x.id === e.id);
      return exists ? prev.map((x) => (x.id === e.id ? e : x)) : [...prev, e];
    });
    setFormOpen(false);
    setEditing(null);
  };

  const remove = (id: string) =>
    setExpenses((prev) => prev.filter((x) => x.id !== id));

  const startEdit = (e: Expense) => {
    setEditing(e);
    setFormOpen(true);
  };

  const startAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <article className="container mt-24 md:mt-32 mb-32 max-w-2xl">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-8 md:mb-12 flex items-start justify-between gap-4">
        <h1 className="font-heading text-[clamp(2.25rem,9vw,4rem)] font-regular tracking-[-0.02em] text-foreground leading-[0.95]">
          HK Ledger
        </h1>
        {!viewing && expenses.length > 0 && (
          <button
            type="button"
            onClick={share}
            className="shrink-0 mt-2 flex items-center gap-2 border border-border hover:border-accent rounded-md px-3 py-1.5 text-sm font-body text-secondary hover:text-foreground transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? "Copied" : "Share"}
          </button>
        )}
      </div>

      {/* ── Snapshot banner ─────────────────────────────────── */}
      {viewing && (
        <div className="border border-accent/40 bg-accent/5 rounded-lg p-4 mb-8 flex flex-wrap items-center justify-between gap-3">
          <span className="font-body text-sm text-foreground">
            Viewing a shared snapshot · read-only
          </span>
          <div className="flex items-center gap-2">
            {confirmImport ? (
              <>
                <button
                  type="button"
                  onClick={importSnapshot}
                  className="text-sm font-body bg-accent text-background rounded-md px-3 py-1.5"
                >
                  Replace my ledger
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmImport(false)}
                  className="text-sm font-body text-secondary hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmImport(true)}
                className="text-sm font-body border border-border hover:border-accent rounded-md px-3 py-1.5 text-secondary hover:text-foreground transition-colors"
              >
                Import…
              </button>
            )}
            <button
              type="button"
              onClick={exitSnapshot}
              className="text-sm font-body text-secondary hover:text-foreground transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* ── Settlement ──────────────────────────────────────── */}
      <section className="border-t border-border pt-6 mb-8">
        <h2 className="section-label text-primary mb-4">Settle up</h2>

        {!loaded ? (
          <p className="text-body-secondary">Loading…</p>
        ) : transfers.length === 0 ? (
          <p className="text-body-secondary">
            {data.length === 0
              ? "No places logged yet. Add the first one below."
              : "All settled — nobody owes anyone."}
          </p>
        ) : (
          <ul className="space-y-2.5">
            {transfers.map((t, i) => (
              <li
                key={i}
                className="flex items-center justify-between border border-border rounded-md px-4 py-3"
              >
                <span className="flex items-center gap-2 font-body text-foreground">
                  <span className="text-destructive">{t.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-accent">{t.to}</span>
                </span>
                <span className="font-mono text-foreground">
                  {money(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Net per person */}
        {loaded && data.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {PEOPLE.map((p) => {
              const v = Math.round(net[p] * 100) / 100;
              return (
                <div
                  key={p}
                  className="border border-border/50 rounded-md px-3 py-2"
                >
                  <div className="label-mono">{p}</div>
                  <div
                    className={`font-mono text-sm ${
                      v > 0.005
                        ? "text-accent"
                        : v < -0.005
                          ? "text-destructive"
                          : "text-secondary"
                    }`}
                  >
                    {v > 0.005 ? "+" : ""}
                    {money(v)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Add / form ──────────────────────────────────────── */}
      {!viewing && (
        <AnimatePresence mode="wait">
          {formOpen ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <ExpenseForm
                initial={editing ?? undefined}
                onSave={upsert}
                onCancel={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
              />
            </motion.div>
          ) : (
            <button
              key="add"
              type="button"
              onClick={startAdd}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-border hover:border-accent rounded-lg py-4 text-secondary hover:text-foreground transition-colors mb-8"
            >
              <Plus className="w-4 h-4" />
              <span className="font-body">Add a place</span>
            </button>
          )}
        </AnimatePresence>
      )}

      {/* ── History ─────────────────────────────────────────── */}
      {sorted.length > 0 && (
        <section>
          <div className="flex items-center justify-between border-t border-border pt-6 mb-4">
            <h2 className="section-label text-primary">Places</h2>
            <span className="label-mono">
              {sorted.length} · {money(grandTotal)}
            </span>
          </div>
          <ul className="space-y-3">
            {sorted.map((e, i) => {
              const logged = PEOPLE.reduce(
                (acc, p) => acc + (e.shares[p] || 0),
                0,
              );
              const off = Math.abs(logged - e.total) > 0.005;
              return (
                <li
                  key={e.id}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-heading font-medium text-lg text-foreground leading-snug truncate">
                          {e.label}
                        </h3>
                      </div>
                      <p className="text-body-secondary mt-0.5">
                        <span className="text-accent">{e.payer}</span> paid{" "}
                        {money(e.total)}
                        {off && (
                          <span className="text-destructive">
                            {" "}
                            · logged {money(logged)}
                          </span>
                        )}
                      </p>
                    </div>
                    {!viewing && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(e)}
                          className="p-2 text-secondary hover:text-foreground transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(e.id)}
                          className="p-2 text-secondary hover:text-destructive transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border/40 pt-3">
                    {PEOPLE.filter((p) => (e.shares[p] || 0) > 0).map((p) => (
                      <span
                        key={p}
                        className="font-mono text-xs text-secondary"
                      >
                        {p}{" "}
                        <span className="text-foreground">
                          {money(e.shares[p])}
                        </span>
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
