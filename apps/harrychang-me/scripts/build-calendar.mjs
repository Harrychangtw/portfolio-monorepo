/**
 * Snapshot the public calendar to content/generated/calendar.json.
 *
 * Run locally when your calendar changes:  pnpm build:calendar
 * The artifact is committed, so no Google credential is needed on Vercel and
 * /cal renders as a fully static page with no runtime API call.
 *
 * Privacy model is delegated to Google rather than implemented here. Each
 * calendar is shared with the service account at one of two levels, and the
 * level decides which endpoint can read it at all:
 *
 *   reader          -> events.list  returns titles, times, location
 *   freeBusyReader  -> events.list  returns an EMPTY list; only freeBusy.query
 *                                   yields anything, and it carries no title
 *
 * So an opaque calendar is not a detailed event with its title stripped by this
 * script -- it travels a different endpoint that never sends a title. Change a
 * calendar's sharing in the Google Calendar UI and the next snapshot follows.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, "..");

dotenv.config({ path: path.join(APP_ROOT, ".env.local") });

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const DETAILED_ROLES = new Set(["owner", "writer", "reader"]);

const TIMEZONE = "Asia/Taipei";

// A long window so a stale snapshot degrades by running short at the far end
// rather than by showing days that have already passed. The page filters to
// today onward, so staleness only matters when events actually change.
const WINDOW_DAYS = 120;

const OUTPUT = path.join(APP_ROOT, "content/generated/calendar.json");

/**
 * Calendars to snapshot. This list controls PRESENCE only -- how much each one
 * reveals is set by its sharing in Google Calendar (see the note above).
 *
 * Deliberately excluded:
 *   ai-deadlines.ics - subscribed public feed (aideadlines.org), not my schedule
 *   Deadlines, 長期目標, 小一福利社系統開發 - unshared, private
 */
const SOURCES = [
  {
    key: "ntu",
    id: "739e5e55821fe4023e0ff383e23308111334502cdb5867f56aaa38c34550754b@group.calendar.google.com",
  },
  {
    key: "projects",
    id: "4d76d9ed902b14cc99dfdb85c2e66fb9c6a10bef46cf1031c12d718585e33125@group.calendar.google.com",
  },
  {
    key: "work",
    id: "3e7bfbde828393f93b19f7aeb5075f58a4c3f570f162063f5e6e9c426a2dddb4@group.calendar.google.com",
  },
  { key: "personal", id: "pomelo.cw@gmail.com" },
];

const b64url = (input) =>
  Buffer.from(typeof input === "string" ? input : JSON.stringify(input)).toString(
    "base64url",
  );

/** Bare all-day dates sort as UTC midnight, ahead of that day's timed events. */
const toEpoch = (value) =>
  Date.parse(value.includes("T") ? value : `${value}T00:00:00Z`);

function loadKey() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  // Accept raw JSON or base64-encoded JSON; PEM newlines survive base64 in a
  // .env far more reliably than they survive quoting.
  const text = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");
  try {
    const parsed = JSON.parse(text);
    return parsed.client_email && parsed.private_key ? parsed : null;
  } catch {
    return null;
  }
}

async function getAccessToken(key) {
  const iat = Math.floor(Date.now() / 1000);
  const claim = {
    iss: key.client_email,
    scope: SCOPE,
    aud: TOKEN_ENDPOINT,
    exp: iat + 3600,
    iat,
  };
  const signingInput = `${b64url({ alg: "RS256", typ: "JWT" })}.${b64url(claim)}`;
  const signature = crypto
    .sign("RSA-SHA256", Buffer.from(signingInput), key.private_key)
    .toString("base64url");

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${signingInput}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`Google token error: ${res.status}`);
  return (await res.json()).access_token;
}

/**
 * All-day events keep their bare `YYYY-MM-DD`. Converting to an instant would
 * resolve midnight against whatever timezone this script runs in, shifting the
 * event by a day on a UTC machine. Google's all-day end date is exclusive.
 */
function instant(slot) {
  if (slot.dateTime) return { iso: slot.dateTime, allDay: false };
  return { iso: slot.date, allDay: true };
}

async function fetchDetailed(token, source, timeMin, timeMax) {
  const url = new URL(
    `${CALENDAR_API}/calendars/${encodeURIComponent(source.id)}/events`,
  );
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true"); // expand recurrences
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "2500");

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  // 404 means never shared with the service account -- a deliberate state.
  if (!res.ok) return { role: "none", events: [] };

  const data = await res.json();
  const role = data.accessRole ?? "none";
  if (!DETAILED_ROLES.has(role)) return { role, events: [] };

  const events = (data.items ?? [])
    .filter((item) => item.status !== "cancelled" && item.start)
    .map((item) => {
      const from = instant(item.start);
      const to = instant(item.end ?? item.start);
      return {
        id: `${source.key}:${item.id}`,
        start: from.iso,
        end: to.iso,
        allDay: from.allDay,
        fidelity: "detailed",
        calendarKey: source.key,
        title: item.summary || "Untitled",
        // Deliberately narrow: no description (may hold private notes or
        // conference links) and no attendees.
        ...(item.location ? { location: item.location } : {}),
        // singleEvents=true expands a recurrence into one item per occurrence;
        // recurringEventId marks those. The page uses it to keep the weekly
        // timetable out of the "further ahead" highlights, where months of
        // repeated lectures would bury the one-off talks worth showing.
        ...(item.recurringEventId ? { recurring: true } : {}),
      };
    });

  return { role, events };
}

/**
 * freeBusy.query rejects any range wider than ~90 days (93 returns HTTP 400),
 * so a long window has to be requested in chunks and concatenated.
 */
const FREEBUSY_MAX_DAYS = 80;

async function fetchBusyChunk(token, sources, timeMin, timeMax) {
  const res = await fetch(`${CALENDAR_API}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: sources.map((s) => ({ id: s.id })),
    }),
  });

  // Fail loudly. Silently returning [] here once produced a snapshot with zero
  // busy blocks that looked perfectly valid.
  if (!res.ok) {
    throw new Error(
      `freeBusy ${res.status} for ${timeMin.slice(0, 10)}..${timeMax.slice(0, 10)}: ${await res.text()}`,
    );
  }

  const data = await res.json();
  const events = [];
  for (const source of sources) {
    const entry = data.calendars?.[source.id];
    if (!entry) continue;
    if (entry.errors) {
      throw new Error(
        `freeBusy error for ${source.key}: ${JSON.stringify(entry.errors)}`,
      );
    }
    (entry.busy ?? []).forEach((block, index) => {
      // Zero-length blocks render as an empty 00:00-00:00 row.
      if (toEpoch(block.end) <= toEpoch(block.start)) return;
      events.push({
        id: `${source.key}:busy:${block.start}:${index}`,
        start: block.start,
        end: block.end,
        allDay: false,
        fidelity: "busy",
        calendarKey: source.key,
      });
    });
  }
  return events;
}

async function fetchBusy(token, sources, timeMin, timeMax) {
  if (sources.length === 0) return [];

  const chunks = [];
  const end = toEpoch(timeMax);
  for (let from = toEpoch(timeMin); from < end; ) {
    const to = Math.min(from + FREEBUSY_MAX_DAYS * 864e5, end);
    chunks.push([new Date(from).toISOString(), new Date(to).toISOString()]);
    from = to;
  }

  const results = await Promise.all(
    chunks.map(([from, to]) => fetchBusyChunk(token, sources, from, to)),
  );

  // Chunk boundaries can split one busy period in two; merging per calendar
  // stitches those back together.
  const byCalendar = new Map();
  for (const event of results.flat()) {
    if (!byCalendar.has(event.calendarKey)) byCalendar.set(event.calendarKey, []);
    byCalendar.get(event.calendarKey).push(event);
  }

  const merged = [];
  for (const list of byCalendar.values()) {
    list.sort((a, b) => toEpoch(a.start) - toEpoch(b.start));
    for (const event of list) {
      const last = merged[merged.length - 1];
      if (
        last &&
        last.calendarKey === event.calendarKey &&
        toEpoch(event.start) <= toEpoch(last.end)
      ) {
        if (toEpoch(event.end) > toEpoch(last.end)) last.end = event.end;
      } else {
        merged.push({ ...event });
      }
    }
  }
  return merged;
}

function writeSnapshot({ configured, events }) {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(
    OUTPUT,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        timezone: TIMEZONE,
        windowDays: WINDOW_DAYS,
        configured,
        events,
      },
      null,
      2,
    )}\n`,
  );
}

async function main() {
  const key = loadKey();
  if (!key) {
    // Write an empty, explicitly unconfigured snapshot rather than failing.
    // /cal reads this file at build time, so a hard exit here would break any
    // build without the credential -- a contributor's fork, or a local `next
    // build`. The page shows an unavailable state instead of claiming the
    // calendar is wide open.
    writeSnapshot({ configured: false, events: [] });
    console.warn(
      "[calendar] GOOGLE_SERVICE_ACCOUNT_KEY not set — wrote an empty snapshot.\n" +
        "[calendar] /cal will render an unavailable state until it is configured.",
    );
    return;
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const timeMin = start.toISOString();
  const timeMax = new Date(start.getTime() + WINDOW_DAYS * 864e5).toISOString();

  const token = await getAccessToken(key);
  const probes = await Promise.all(
    SOURCES.map((s) => fetchDetailed(token, s, timeMin, timeMax)),
  );

  const detailed = probes.flatMap((p) => p.events);
  const opaque = SOURCES.filter(
    (_, i) => !DETAILED_ROLES.has(probes[i].role) && probes[i].role !== "none",
  );
  const busy = await fetchBusy(token, opaque, timeMin, timeMax);

  const events = [...detailed, ...busy].sort(
    (a, b) => toEpoch(a.start) - toEpoch(b.start),
  );

  writeSnapshot({ configured: true, events });

  SOURCES.forEach((s, i) => {
    const role = probes[i].role;
    const label =
      role === "none"
        ? "not shared (skipped)"
        : DETAILED_ROLES.has(role)
          ? `${role} -> titles`
          : `${role} -> opaque`;
    console.log(`  ${s.key.padEnd(9)} ${label}`);
  });
  console.log(
    `\n[calendar] ${events.length} events (${detailed.length} detailed, ${busy.length} busy) over ${WINDOW_DAYS} days -> ${path.relative(APP_ROOT, OUTPUT)}`,
  );
}

main().catch((err) => {
  console.error("[calendar] failed:", err.message);
  process.exit(1);
});
