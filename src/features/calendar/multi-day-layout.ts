import { addDays, differenceInCalendarDays, min, startOfDay } from "date-fns";

export type DatedEvent = {
  id: string;
  startAt: string;
  endAt: string;
};

export type WeekSegment<T extends DatedEvent> = {
  event: T;
  startCol: number;
  span: number;
  lane: number;
};

export function eventOverlapsRange(event: DatedEvent, from: Date, to: Date) {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  return start < to && end > from;
}

export function eventOverlapsDay(event: DatedEvent, day: Date) {
  const dayStart = startOfDay(day);
  return eventOverlapsRange(event, dayStart, addDays(dayStart, 1));
}

export function isMultiDayEvent(event: DatedEvent) {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  if (!(end > start)) return false;
  const lastInstant = new Date(end.getTime() - 1);
  return differenceInCalendarDays(lastInstant, start) >= 1;
}

export function buildWeekSegments<T extends DatedEvent>(
  events: T[],
  weekStart: Date,
): { segments: WeekSegment<T>[]; laneCount: number } {
  const weekEnd = addDays(weekStart, 7);
  const candidates = events
    .filter(isMultiDayEvent)
    .filter((event) => eventOverlapsRange(event, weekStart, weekEnd))
    .map((event) => {
      const start = startOfDay(new Date(event.startAt));
      const lastInstant = new Date(new Date(event.endAt).getTime() - 1);
      const clippedStart = start < weekStart ? weekStart : start;
      const clippedEnd = min([startOfDay(lastInstant), addDays(weekStart, 6)]);
      const startCol = Math.max(
        0,
        Math.min(6, differenceInCalendarDays(clippedStart, weekStart)),
      );
      const endCol = Math.max(
        startCol,
        Math.min(6, differenceInCalendarDays(clippedEnd, weekStart)),
      );
      return {
        event,
        startCol,
        span: endCol - startCol + 1,
        startMs: new Date(event.startAt).getTime(),
      };
    })
    .sort((left, right) => {
      if (left.startCol !== right.startCol) return left.startCol - right.startCol;
      if (right.span !== left.span) return right.span - left.span;
      return left.startMs - right.startMs;
    });

  const laneEnds: number[] = [];
  const segments: WeekSegment<T>[] = candidates.map((candidate) => {
    let lane = laneEnds.findIndex((endCol) => candidate.startCol >= endCol);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(candidate.startCol + candidate.span);
    } else {
      laneEnds[lane] = candidate.startCol + candidate.span;
    }
    return {
      event: candidate.event,
      startCol: candidate.startCol,
      span: candidate.span,
      lane,
    };
  });

  return { segments, laneCount: laneEnds.length };
}
