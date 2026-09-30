import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { WEEK_STARTS_ON } from "./date-locale";

export type ViewMode = "day" | "week" | "month";

export type VisibleRange = {
  from: Date;
  to: Date;
};

export function getWeekStart(date: Date) {
  return startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
}

export function getVisibleRange(viewMode: ViewMode, selectedDate: Date): VisibleRange {
  if (viewMode === "day") {
    const from = startOfDay(selectedDate);
    return { from, to: addDays(from, 1) };
  }
  if (viewMode === "week") {
    const from = getWeekStart(selectedDate);
    return { from, to: addDays(from, 7) };
  }
  const monthStart = startOfMonth(selectedDate);
  const from = getWeekStart(monthStart);
  const lastCell = startOfWeek(endOfMonth(monthStart), {
    weekStartsOn: WEEK_STARTS_ON,
  });
  const gridEnd = addDays(lastCell, 7);
  return { from, to: gridEnd };
}

export function toRfc3339(date: Date) {
  return date.toISOString();
}

export function shiftSelectedDate(viewMode: ViewMode, selectedDate: Date, direction: -1 | 1) {
  if (viewMode === "day") {
    return direction === 1 ? addDays(selectedDate, 1) : subDays(selectedDate, 1);
  }
  if (viewMode === "week") {
    return direction === 1 ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1);
  }
  return direction === 1 ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1);
}

export function weekdayDateForSelectedWeek(selectedDate: Date, weekdayIndex: number) {
  return addDays(getWeekStart(selectedDate), weekdayIndex);
}
