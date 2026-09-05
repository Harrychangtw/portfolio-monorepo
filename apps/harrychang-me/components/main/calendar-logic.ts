// Pure calendar logic: no React, no DOM. Split out from calendar-client so the
// day-splitting and overlap-layout rules can be exercised directly in a test.
export type Fidelity = "detailed" | "busy";

export interface CalendarEvent {
  id: string;
  /** ISO 8601 instant, or a bare `YYYY-MM-DD` when `allDay` (end exclusive). */
  start: string;
  end: string;
  allDay: boolean;
  fidelity: Fidelity;
  calendarKey: string;
  title?: string;
  location?: string;
  /** Set on occurrences expanded from a recurring event. */
  recurring?: boolean;
}

export interface CalendarSnapshot {
  generatedAt: string;
  timezone: string;
  windowDays: number;
  /** False when the snapshot was built without a Google credential. */
  configured: boolean;
  events: CalendarEvent[];
}

/** One event as it appears on a single day, already clamped to that day. */
export interface Occurrence {
  id: string;
  key: string;
  fidelity: Fidelity;
  calendarKey: string;
  title?: string;
  location?: string;
  /** Minutes from local midnight. Both 0 for an all-day occurrence. */
  startMin: number;
  endMin: number;
  allDay: boolean;
  /** Column layout within a cluster of overlapping events (week view). */
  col?: number;
  cols?: number;
}

export const MINUTES_PER_DAY = 1440;

/**
 * Epoch millis for ordering. Times arrive in mixed forms -- events.list uses
 * offsets like `+08:00`, freeBusy uses `Z`, all-day values are bare dates -- so
 * comparing them as strings orders them wrongly.
 */
export function toEpoch(value: string): number {
  return Date.parse(value.includes("T") ? value : `${value}T00:00:00Z`);
}

/** `YYYY-MM-DD` in the given zone. All-day values are already in that form. */
export function dayKey(value: string, timeZone: string) {
  if (!value.includes("T")) return value;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function addDays(key: string, n: number) {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Offset of `timeZone` from UTC at a given instant, in ms. */
export function zoneOffsetMs(date: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  const asUTC = Date.UTC(
    +parts.year,
    +parts.month - 1,
    +parts.day,
    +parts.hour % 24,
    +parts.minute,
    +parts.second,
  );
  return asUTC - date.getTime();
}

/** The instant at which local midnight begins for `key` in `timeZone`. */
export function zonedMidnight(key: string, timeZone: string) {
  const guess = new Date(`${key}T00:00:00Z`);
  return guess.getTime() - zoneOffsetMs(guess, timeZone);
}

/** Monday-based weekday index (0 = Mon) for a bare date key. */
export function weekdayIndex(key: string) {
  return (new Date(`${key}T00:00:00Z`).getUTCDay() + 6) % 7;
}

export const startOfWeek = (key: string) => addDays(key, -weekdayIndex(key));

/**
 * Opaque blocks arrive per calendar, so an evening busy on both the work and
 * personal calendars would render as two stacked bars saying nothing extra.
 * Merge anything overlapping or touching into one span.
 */
export function mergeBusy(events: CalendarEvent[]): CalendarEvent[] {
  const busy = events
    .filter((e) => e.fidelity === "busy")
    .sort((a, b) => toEpoch(a.start) - toEpoch(b.start));
  const detailed = events.filter((e) => e.fidelity === "detailed");

  const merged: CalendarEvent[] = [];
  for (const block of busy) {
    const last = merged[merged.length - 1];
    if (last && toEpoch(block.start) <= toEpoch(last.end)) {
      if (toEpoch(block.end) > toEpoch(last.end)) last.end = block.end;
    } else {
      merged.push({ ...block });
    }
  }
  return [...detailed, ...merged];
}

/**
 * Explode events into per-day occurrences clamped to each day they touch, so a
 * multi-day span renders on every day rather than being pinned to its start.
 */
export function buildOccurrences(events: CalendarEvent[], timeZone: string) {
  const map = new Map<string, Occurrence[]>();
  const push = (key: string, occ: Occurrence) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(occ);
  };

  for (const event of mergeBusy(events)) {
    const base = {
      fidelity: event.fidelity,
      calendarKey: event.calendarKey,
      title: event.title,
      location: event.location,
    };

    if (event.allDay) {
      // Google's all-day end date is exclusive.
      let key = event.start;
      for (let guard = 0; key < event.end && guard < 90; guard++) {
        push(key, {
          ...base,
          id: `${event.id}:${key}`,
          key,
          startMin: 0,
          endMin: MINUTES_PER_DAY,
          allDay: true,
        });
        key = addDays(key, 1);
      }
      if (event.end <= event.start) {
        push(event.start, {
          ...base,
          id: `${event.id}:${event.start}`,
          key: event.start,
          startMin: 0,
          endMin: MINUTES_PER_DAY,
          allDay: true,
        });
      }
      continue;
    }

    const startKey = dayKey(event.start, timeZone);
    const endKey = dayKey(event.end, timeZone);
    let key = startKey;
    for (let guard = 0; guard < 90; guard++) {
      const dayStart = zonedMidnight(key, timeZone);
      const dayEnd = zonedMidnight(addDays(key, 1), timeZone);
      const segStart = Math.max(toEpoch(event.start), dayStart);
      const segEnd = Math.min(toEpoch(event.end), dayEnd);
      // An end exactly at midnight belongs to the previous day only.
      if (segEnd > segStart) {
        const startMin = Math.round((segStart - dayStart) / 60000);
        const endMin = Math.round((segEnd - dayStart) / 60000);
        push(key, {
          ...base,
          id: `${event.id}:${key}`,
          key,
          startMin,
          endMin,
          // A span covering the whole day is better shown in the all-day strip
          // than as a full-height column block.
          allDay: startMin <= 0 && endMin >= MINUTES_PER_DAY,
        });
      }
      if (key === endKey) break;
      key = addDays(key, 1);
    }
  }

  for (const list of map.values()) {
    list.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
  }
  return map;
}

/**
 * Assign side-by-side columns to overlapping timed occurrences, the way a
 * calendar grid splits a slot between concurrent events.
 */
export function layoutColumns(occurrences: Occurrence[]) {
  const timed = occurrences.filter((o) => !o.allDay);
  let cluster: Occurrence[] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) return;
    const columns: Occurrence[][] = [];
    for (const occ of cluster) {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        if (col[col.length - 1].endMin <= occ.startMin) {
          col.push(occ);
          occ.col = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        occ.col = columns.length;
        columns.push([occ]);
      }
    }
    cluster.forEach((o) => (o.cols = columns.length));
    cluster = [];
    clusterEnd = -1;
  };

  for (const occ of timed) {
    if (cluster.length > 0 && occ.startMin >= clusterEnd) flush();
    cluster.push(occ);
    clusterEnd = Math.max(clusterEnd, occ.endMin);
  }
  flush();
  return timed;
}
