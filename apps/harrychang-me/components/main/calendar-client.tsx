"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import {
  addDays,
  buildOccurrences,
  dayKey,
  layoutColumns,
  startOfWeek,
  type CalendarSnapshot,
  type Fidelity,
  type Occurrence,
} from "@/components/main/calendar-logic";

type View = "month" | "week";

/**
 * Per-calendar colour, resolved from themed CSS variables (--cal-*) so light
 * and dark each get a palette tuned to their ground rather than sharing one.
 */
const CAL_KEYS = ["ntu", "projects", "work", "personal"] as const;
const hueOf = (key: string) =>
  `var(--cal-${(CAL_KEYS as readonly string[]).includes(key) ? key : "work"})`;

/** Fill and edge for one event chip, shared by every view. */
const chipStyle = (fidelity: Fidelity, calendarKey: string) =>
  fidelity === "detailed"
    ? {
        borderLeftColor: `hsl(${hueOf(calendarKey)})`,
        background: `hsl(${hueOf(calendarKey)} / var(--cal-fill))`,
        color: "hsl(var(--foreground))",
      }
    : {
        borderLeftColor: "hsl(var(--muted-foreground))",
        background:
          "repeating-linear-gradient(135deg, hsl(var(--muted-foreground)/0.16) 0 4px, transparent 4px 8px)",
        color: "hsl(var(--muted-foreground))",
      };

const HOUR_HEIGHT = 48;
const DAY_HEIGHT = HOUR_HEIGHT * 24;
const GUTTER = 56; // px — hour labels column in week view
const HEADER_H = 52; // px — day name + number
// All-day chip metrics. The strip's height is derived from the busiest day so
// every column and the hour gutter share one height -- a per-column height
// would drift out of alignment as you scroll between days.
const CHIP_H = 20; // measured: 11px text, leading-tight, padding and border
const CHIP_GAP = 2;
const ALLDAY_PAD = 8;
/** Most all-day chips shown before collapsing into "+N". */
const ALLDAY_CAP = 3;
/**
 * Below this height an event block cannot fit time and title on separate
 * lines, so they run inline instead of the title being clipped away.
 */
const COMPACT_H = 30;
/** Vertical budget inside a month cell: date line, then chips, then "+N". */
const MONTH_DATE_H = 24;
const MONTH_PLUS_H = 14;
const MONTH_CHIP_CAP = 6;
/** Week rows visible in the month viewport. */
const VISIBLE_WEEKS = 6;
/**
 * Height of the calendar frame, shared by both views so switching between them
 * does not resize the page. Month divides it into VISIBLE_WEEKS rows, which is
 * why the row height is derived from it rather than set independently.
 */
const FRAME_VH = 70;
/**
 * Month's weekday-name row lives outside its scroller (week view puts its
 * headers inside, sticky). Subtracting it keeps the whole block the same
 * height in both views, so switching does not reflow the page.
 */
const MONTH_HEAD_H = 34;

const fmtUTC = (key: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts }).format(
    new Date(`${key}T00:00:00Z`),
  );

export default function CalendarClient({ data }: { data: CalendarSnapshot }) {
  const { t } = useLanguage();
  const [view, setView] = useState<View>("month");
  const [showLocal, setShowLocal] = useState(false);
  const [active, setActive] = useState(0);
  const [rowH, setRowH] = useState(96);
  const [dayW, setDayW] = useState(120);
  /** A day clicked in month view, to be focused once week view mounts. */
  const [pendingDay, setPendingDay] = useState<string | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const viewerZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );
  const zone = showLocal ? viewerZone : data.timezone;
  const zonesDiffer = viewerZone !== data.timezone;

  // Resolved on the client so the prerendered HTML does not bake in a date.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    setToday(dayKey(new Date().toISOString(), zone));
  }, [zone]);

  const [nowMinutes, setNowMinutes] = useState(0);
  useEffect(() => {
    const tick = () => {
      const [h, m] = new Intl.DateTimeFormat("en-GB", {
        timeZone: zone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(new Date())
        .split(":")
        .map(Number);
      setNowMinutes((h % 24) * 60 + m);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [zone]);

  const occurrences = useMemo(
    () => buildOccurrences(data.events, zone),
    [data.events, zone],
  );

  const coverageEnd = useMemo(
    () => addDays(dayKey(data.generatedAt, zone), data.windowDays),
    [data.generatedAt, data.windowDays, zone],
  );

  /**
   * One continuous strip per view. Month scrolls a column of week rows; week
   * scrolls a row of day columns. Snapping is at that same grain, so a scroll
   * settles on a whole week (or day) rather than mid-row.
   */
  const weeks = useMemo(() => {
    if (!today) return [];
    const out: string[] = [];
    for (let w = startOfWeek(today); w < coverageEnd; w = addDays(w, 7))
      out.push(w);
    return out;
  }, [today, coverageEnd]);

  const dayStrip = useMemo(() => {
    if (!today) return [];
    const out: string[] = [];
    for (let d = startOfWeek(today); d < coverageEnd; d = addDays(d, 1))
      out.push(d);
    return out;
  }, [today, coverageEnd]);

  // Measure a row / derive a column width so scroll maths matches the layout.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => {
      if (rowRef.current) setRowH(rowRef.current.offsetHeight || 96);
      setDayW(Math.max(96, (scroller.clientWidth - GUTTER) / 7));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    return () => ro.disconnect();
  }, [view]);

  /** Tallest all-day stack in the strip, so no day's row is clipped. */
  const maxAllDay = useMemo(() => {
    let max = 0;
    for (const [, list] of occurrences) {
      const n = list.filter((o) => o.allDay).length;
      if (n > max) max = n;
    }
    return Math.min(max, ALLDAY_CAP);
  }, [occurrences]);

  /** How many chips fit in a month cell at the current row height. */
  const monthChipCap = Math.max(
    1,
    Math.min(
      MONTH_CHIP_CAP,
      Math.floor((rowH - MONTH_DATE_H - MONTH_PLUS_H) / (CHIP_H + CHIP_GAP)),
    ),
  );

  const allDayH =
    maxAllDay === 0
      ? 0
      : maxAllDay * CHIP_H + (maxAllDay - 1) * CHIP_GAP + ALLDAY_PAD;

  const firstEventHour = useMemo(() => {
    let min = 24 * 60;
    for (const [, list] of occurrences)
      for (const occ of list)
        if (!occ.allDay) min = Math.min(min, occ.startMin);
    return min === 24 * 60 ? 8 : Math.max(0, Math.floor(min / 60) - 1);
  }, [occurrences]);

  // On entering week view, land on the clicked day (or today) at the first
  // event hour rather than at midnight on the strip's first day.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (view !== "week" || !scroller || dayStrip.length === 0) return;
    const target = pendingDay ?? today;
    const index = Math.max(0, dayStrip.indexOf(target ?? ""));
    scroller.scrollTo({
      left: index * dayW,
      top: firstEventHour * HOUR_HEIGHT,
      behavior: "auto",
    });
    setActive(index);
    if (pendingDay) setPendingDay(null);
    // dayW is excluded: it settles via ResizeObserver and would re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, dayStrip.length, firstEventHour]);

  useLayoutEffect(() => {
    if (view !== "month" || !scrollerRef.current) return;
    scrollerRef.current.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setActive(0);
  }, [view]);

  /** Which row/column sits at the start of the viewport. */
  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const index =
      view === "month"
        ? Math.round(el.scrollTop / Math.max(1, rowH))
        : Math.round(el.scrollLeft / Math.max(1, dayW));
    setActive((a) => (a === index ? a : index));
  }, [view, rowH, dayW]);

  const scrollToIndex = (index: number, smooth = true) => {
    const el = scrollerRef.current;
    if (!el) return;
    const behavior = smooth ? "smooth" : "auto";
    if (view === "month") el.scrollTo({ top: index * rowH, behavior });
    else el.scrollTo({ left: index * dayW, behavior });
  };

  /** Arrows step a whole month / week even though snapping is finer. */
  const step = (dir: number) => {
    if (view === "week") {
      scrollToIndex(
        Math.min(Math.max(0, active + dir * 7), dayStrip.length - 1),
      );
      return;
    }
    const focus = weeks[Math.min(active + 2, weeks.length - 1)] ?? weeks[0];
    const month = addDays(focus, 3).slice(0, 7); // Thursday decides the month
    const d = new Date(`${month}-01T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + dir);
    const targetMonth = d.toISOString().slice(0, 7);
    let index = weeks.findIndex(
      (w) => addDays(w, 3).slice(0, 7) === targetMonth,
    );
    if (index < 0) index = dir > 0 ? weeks.length - 1 : 0;
    scrollToIndex(Math.max(0, index - 2));
  };

  const timeLabel = (min: number) =>
    `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

  const heading = useMemo(() => {
    if (view === "month") {
      // The month of the middle visible week, by its Thursday -- so a row that
      // straddles two months does not flip the title early.
      const focus = weeks[Math.min(active + 2, weeks.length - 1)];
      if (!focus) return "";
      return fmtUTC(addDays(focus, 3), { month: "long", year: "numeric" });
    }
    const from = dayStrip[active];
    if (!from) return "";
    return fmtUTC(addDays(from, 3), { month: "long", year: "numeric" });
  }, [view, weeks, dayStrip, active]);

  if (!data.configured) {
    return (
      <p className="text-body-secondary py-12 border-t border-border">
        {t("calendar.unavailable", "common")}
      </p>
    );
  }

  const VIEWS: View[] = ["month", "week"];
  const hourLines = {
    backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${HOUR_HEIGHT - 1}px, hsl(var(--border)/0.4) ${HOUR_HEIGHT - 1}px ${HOUR_HEIGHT}px)`,
  };

  const Chip = ({ occ }: { occ: Occurrence }) => (
    <div
      title={
        occ.fidelity === "detailed"
          ? `${occ.allDay ? "" : timeLabel(occ.startMin) + " "}${occ.title}`
          : t("calendar.busy", "common")
      }
      className="truncate px-1 py-[1px] text-[10px] md:text-[11px] leading-tight border-l-2"
      style={chipStyle(occ.fidelity, occ.calendarKey)}
    >
      {occ.fidelity === "detailed" ? occ.title : t("calendar.busy", "common")}
    </div>
  );

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-lg tracking-wide text-foreground min-w-[10rem]">
            {heading}
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => step(-1)}
              disabled={active === 0}
              className="font-heading text-xl text-secondary hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => step(1)}
              className="font-heading text-xl text-secondary hover:text-accent transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {zonesDiffer && (
            <button
              type="button"
              onClick={() => setShowLocal((v) => !v)}
              className="font-mono text-xs text-secondary hover:text-primary underline decoration-dashed underline-offset-4 transition-colors"
            >
              {showLocal
                ? t("calendar.showSource", "common")
                : t("calendar.showLocal", "common")}
            </button>
          )}
          <div className="flex border border-border">
            {VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition-colors ${
                  view === v
                    ? "bg-foreground text-background"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {t(`calendar.view.${v}`, "common")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Month: a column of week rows, snapping by week ── */}
      {view === "month" && (
        <>
          <div className="grid grid-cols-7 border-t border-l border-border">
            {Array.from({ length: 7 }, (_, i) => addDays("2026-01-05", i)).map(
              (key) => (
                <div
                  key={`wk-${key}`}
                  className="border-r border-b border-border px-2 flex items-center"
                  style={{ height: MONTH_HEAD_H }}
                >
                  <span className="label-mono uppercase">
                    {fmtUTC(key, { weekday: "short" })}
                  </span>
                </div>
              ),
            )}
          </div>

          <div
            ref={scrollerRef}
            onScroll={onScroll}
            className="no-scrollbar overflow-y-auto snap-y snap-mandatory border-l border-border overscroll-contain"
            style={{ height: `calc(${FRAME_VH}vh - ${MONTH_HEAD_H}px)` }}
          >
            {weeks.map((weekStart, i) => (
              <div
                key={weekStart}
                ref={i === 0 ? rowRef : undefined}
                className="grid grid-cols-7 snap-start"
                style={{
                  height: `calc((${FRAME_VH}vh - ${MONTH_HEAD_H}px) / ${VISIBLE_WEEKS})`,
                }}
              >
                {Array.from({ length: 7 }, (_, d) => addDays(weekStart, d)).map(
                  (key) => {
                    const isToday = key === today;
                    const list = occurrences.get(key) ?? [];
                    // The month a row belongs to, by its Thursday -- so the
                    // dimming matches the heading rather than fighting it.
                    const rowMonth = addDays(weekStart, 3).slice(0, 7);
                    const inMonth = key.slice(0, 7) === rowMonth;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => {
                          setPendingDay(key);
                          setView("week");
                        }}
                        className={`flex flex-col items-stretch justify-start text-left border-r border-b border-border h-full p-1.5 overflow-hidden hover:bg-muted/40 transition-colors ${
                          inMonth ? "" : "opacity-35"
                        }`}
                      >
                        <div className="mb-1">
                          <span
                            className={`font-mono text-xs tabular-nums ${
                              isToday
                                ? "bg-foreground text-background px-1.5 py-0.5"
                                : "text-secondary"
                            }`}
                          >
                            {key.slice(-2)}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {list.slice(0, monthChipCap).map((occ) => (
                            <Chip key={occ.id} occ={occ} />
                          ))}
                          {list.length > monthChipCap && (
                            <span className="px-1 font-mono text-[10px] text-secondary">
                              +{list.length - monthChipCap}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Week: a row of day columns, snapping by day ──── */}
      {view === "week" && (
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="no-scrollbar overflow-auto snap-x snap-mandatory border-t border-border overscroll-contain"
          style={{ height: `${FRAME_VH}vh` }}
        >
          <div
            className="flex"
            style={{ width: GUTTER + dayStrip.length * dayW }}
          >
            {/* Hour gutter pins to the left as days scroll past it */}
            <div
              className="sticky left-0 z-30 bg-background shrink-0 border-r border-border"
              style={{ width: GUTTER }}
            >
              <div
                className="sticky top-0 z-30 bg-background border-b border-border"
                style={{ height: HEADER_H + allDayH }}
              />
              <div style={hourLines}>
                {Array.from({ length: 24 }, (_, h) => h).map((h) => (
                  <div
                    key={h}
                    className="px-1 text-right"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    <span className="font-mono text-[10px] text-secondary tabular-nums">
                      {String(h).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {dayStrip.map((key) => {
              const list = occurrences.get(key) ?? [];
              const allDay = list.filter((o) => o.allDay);
              return (
                <div
                  key={key}
                  className="shrink-0 snap-start border-r border-border"
                  style={{ width: dayW }}
                >
                  <div className="sticky top-0 z-20 bg-background">
                    <div
                      className="px-2 py-1.5 border-b border-border"
                      style={{ height: HEADER_H }}
                    >
                      <div className="label-mono uppercase">
                        {fmtUTC(key, { weekday: "short" })}
                      </div>
                      <div
                        className={`font-mono text-sm tabular-nums mt-0.5 inline-block ${
                          key === today
                            ? "bg-foreground text-background px-1.5"
                            : "text-foreground"
                        }`}
                      >
                        {key.slice(-2)}
                      </div>
                    </div>
                    {allDayH > 0 && (
                      <div
                        className="border-b border-border p-1 space-y-0.5 overflow-hidden"
                        style={{ height: allDayH }}
                      >
                        {allDay.slice(0, ALLDAY_CAP).map((occ) => (
                          <Chip key={occ.id} occ={occ} />
                        ))}
                        {allDay.length > ALLDAY_CAP && (
                          <span className="block px-1 font-mono text-[10px] text-secondary">
                            +{allDay.length - ALLDAY_CAP}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className="relative"
                    style={{ ...hourLines, height: DAY_HEIGHT }}
                  >
                    {key === today && (
                      <div
                        className="absolute left-0 right-0 pointer-events-none z-10"
                        style={{
                          top: nowMinutes * (HOUR_HEIGHT / 60),
                          borderTop: "1px solid hsl(var(--accent))",
                        }}
                      />
                    )}
                    {layoutColumns(list).map((occ) => {
                      const cols = occ.cols ?? 1;
                      const col = occ.col ?? 0;
                      const height = Math.max(
                        18,
                        (occ.endMin - occ.startMin) * (HOUR_HEIGHT / 60),
                      );
                      const compact = height < COMPACT_H;
                      const label =
                        occ.fidelity === "detailed"
                          ? occ.title
                          : t("calendar.busy", "common");
                      return (
                        <div
                          key={occ.id}
                          title={`${timeLabel(occ.startMin)}–${timeLabel(occ.endMin)} ${
                            occ.fidelity === "detailed"
                              ? occ.title
                              : t("calendar.busy", "common")
                          }`}
                          className="absolute overflow-hidden px-1 py-0.5 border-l-2 text-[10px] leading-tight"
                          style={{
                            top: occ.startMin * (HOUR_HEIGHT / 60),
                            height,
                            left: `${(col / cols) * 100}%`,
                            width: `${(1 / cols) * 100}%`,
                            ...chipStyle(occ.fidelity, occ.calendarKey),
                          }}
                        >
                          {compact ? (
                            <span className="block truncate">
                              <span className="font-mono text-[9px] opacity-70 mr-1">
                                {timeLabel(occ.startMin)}
                              </span>
                              {label}
                            </span>
                          ) : (
                            <>
                              <span className="block truncate font-mono text-[9px] opacity-70">
                                {timeLabel(occ.startMin)}
                              </span>
                              <span className="block truncate">{label}</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Legend + provenance ─────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-8 pt-4 border-t border-border/30">
        {CAL_KEYS.filter((k) => k === "ntu" || k === "projects").map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 shrink-0"
              style={{ background: `hsl(${hueOf(k)})` }}
            />
            <span className="label-mono">
              {t(`calendar.cal.${k}`, "common")}
            </span>
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 shrink-0"
            style={{
              background:
                "repeating-linear-gradient(135deg, hsl(var(--muted-foreground)/0.5) 0 3px, transparent 3px 6px)",
              border: "1px solid hsl(var(--border))",
            }}
          />
          <span className="label-mono">{t("calendar.busy", "common")}</span>
        </span>
        <span className="label-mono ml-auto">
          {t("calendar.timezone", "common")} · {zone.replace("_", " ")} ·{" "}
          {t("calendar.updated", "common")}{" "}
          {new Intl.DateTimeFormat("en-GB", {
            timeZone: zone,
            day: "numeric",
            month: "short",
          }).format(new Date(data.generatedAt))}
        </span>
      </div>
    </div>
  );
}
