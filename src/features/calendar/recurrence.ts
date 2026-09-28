import {
  addDays,
  addMilliseconds,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  getDay,
  isBefore,
  isValid,
  set
} from "date-fns"
import type { RecurrenceRule, UserEventFeed } from "./types"

const weekdayIndexes: Record<string, number> = {
  SU: 6,
  MO: 0,
  TU: 1,
  WE: 2,
  TH: 3,
  FR: 4,
  SA: 5
}

type GeneratedOccurrence = {
  startAt: string
  endAt: string
  renderId: string
  isGeneratedOccurrence: boolean
}

function isInRange(value: Date, from: Date, to: Date) {
  return !isBefore(value, from) && isBefore(value, to)
}

function isAfterUntil(value: Date, until?: Date) {
  return Boolean(until && isBefore(until, value))
}

function timeOfDayOffset(value: Date) {
  const startOfDay = set(value, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
  return value.getTime() - startOfDay.getTime()
}

function occurrenceFromStart(event: UserEventFeed, start: Date, duration: number, generated: boolean) {
  const startAt = start.toISOString()
  return {
    startAt,
    endAt: addMilliseconds(start, duration).toISOString(),
    renderId: generated ? `${event.eventSeriesId}:${startAt}` : event.id,
    isGeneratedOccurrence: generated
  }
}

function normalizeInterval(rule: RecurrenceRule) {
  if (!Number.isInteger(rule.interval) || rule.interval < 1) {
    throw new Error("Recurrence interval must be a positive integer")
  }
  return rule.interval
}

function generateDaily(
  event: UserEventFeed,
  rule: RecurrenceRule,
  from: Date,
  to: Date,
  until: Date | undefined,
  duration: number
) {
  const occurrences: GeneratedOccurrence[] = []
  const originalStart = new Date(event.data?.startAt ?? "")
  const interval = normalizeInterval(rule)
  let current = originalStart

  if (isBefore(current, from)) {
    const daysToSkip = Math.max(0, differenceInCalendarDays(from, current))
    current = addDays(current, Math.floor(daysToSkip / interval) * interval)
    while (isBefore(current, from)) current = addDays(current, interval)
  }

  while (isBefore(current, to) && !isAfterUntil(current, until)) {
    if (isInRange(current, from, to)) {
      occurrences.push(occurrenceFromStart(event, current, duration, true))
    }
    current = addDays(current, interval)
  }

  return occurrences
}

function generateWeekly(
  event: UserEventFeed,
  rule: RecurrenceRule,
  from: Date,
  to: Date,
  until: Date | undefined,
  duration: number
) {
  const occurrences: GeneratedOccurrence[] = []
  const originalStart = new Date(event.data?.startAt ?? "")
  const interval = normalizeInterval(rule)
  const weekdays = (rule.byWeekday?.length ? rule.byWeekday : [Object.keys(weekdayIndexes).find((key) => weekdayIndexes[key] === ((getDay(originalStart) + 6) % 7)) ?? "MO"])
    .map((day) => weekdayIndexes[day.toUpperCase()])
    .filter((day): day is number => day !== undefined)
    .sort((a, b) => a - b)
  const firstWeek = set(originalStart, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
  const monday = addDays(firstWeek, -((getDay(firstWeek) + 6) % 7))
  const offset = timeOfDayOffset(originalStart)
  let weekIndex = 0

  while (true) {
    const currentMonday = addDays(monday, weekIndex * 7)
    if (!isBefore(currentMonday, to) || isAfterUntil(currentMonday, until)) break
    if (weekIndex % interval === 0) {
      for (const weekday of weekdays) {
        const current = addMilliseconds(addDays(currentMonday, weekday), offset)
        if (isBefore(current, originalStart) || isAfterUntil(current, until)) continue
        if (isInRange(current, from, to)) {
          occurrences.push(occurrenceFromStart(event, current, duration, true))
        }
      }
    }
    weekIndex += 1
  }

  return occurrences
}

function generateMonthly(
  event: UserEventFeed,
  rule: RecurrenceRule,
  from: Date,
  to: Date,
  until: Date | undefined,
  duration: number
) {
  const occurrences: GeneratedOccurrence[] = []
  const originalStart = new Date(event.data?.startAt ?? "")
  const interval = normalizeInterval(rule)
  const monthDays = rule.byMonthDay?.length ? rule.byMonthDay : [originalStart.getDate()]
  const offset = timeOfDayOffset(originalStart)
  let month = set(originalStart, { date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })

  while (isBefore(month, to) && !isAfterUntil(month, until)) {
    const lastDay = endOfMonth(month).getDate()
    for (const monthDay of monthDays) {
      if (!Number.isInteger(monthDay) || monthDay < 1 || monthDay > lastDay) continue
      const current = addMilliseconds(set(month, { date: monthDay }), offset)
      if (isBefore(current, originalStart) || isAfterUntil(current, until)) continue
      if (isInRange(current, from, to)) {
        occurrences.push(occurrenceFromStart(event, current, duration, true))
      }
    }
    month = addMonths(month, interval)
  }

  return occurrences.sort((a, b) => a.startAt.localeCompare(b.startAt))
}

export function generateEventOccurrences({
  event,
  from,
  to
}: {
  event: UserEventFeed
  from: string | Date
  to: string | Date
}): GeneratedOccurrence[] {
  if (!event.data) return []

  const rangeStart = from instanceof Date ? from : new Date(from)
  const rangeEnd = to instanceof Date ? to : new Date(to)
  const originalStart = new Date(event.data.startAt)
  const originalEnd = new Date(event.data.endAt)

  if (!isValid(rangeStart) || !isValid(rangeEnd) || !isValid(originalStart) || !isValid(originalEnd)) {
    throw new Error("Invalid event or recurrence range date")
  }
  if (!isBefore(rangeStart, rangeEnd)) return []

  const duration = originalEnd.getTime() - originalStart.getTime()
  if (!event.recurrenceRule) {
    return isInRange(originalStart, rangeStart, rangeEnd)
      ? [occurrenceFromStart(event, originalStart, duration, false)]
      : []
  }

  const until = event.recurrenceRule.until ? new Date(event.recurrenceRule.until) : undefined
  if (until && !isValid(until)) throw new Error("Invalid recurrence until date")
  if (until && isBefore(until, rangeStart)) return []

  switch (event.recurrenceRule.frequency) {
    case "daily":
      return generateDaily(event, event.recurrenceRule, rangeStart, rangeEnd, until, duration)
    case "weekly":
      return generateWeekly(event, event.recurrenceRule, rangeStart, rangeEnd, until, duration)
    case "monthly":
      return generateMonthly(event, event.recurrenceRule, rangeStart, rangeEnd, until, duration)
    default:
      throw new Error(`Unsupported recurrence frequency: ${String(event.recurrenceRule.frequency)}`)
  }
}
