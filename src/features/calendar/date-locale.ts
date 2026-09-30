import { format } from "date-fns";
import { vi } from "date-fns/locale";

export const WEEK_STARTS_ON = 1 as const;

export const weekDayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;

export const fullWeekDayLabels = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
] as const;

export function formatWithVi(date: Date, pattern: string) {
  return format(date, pattern, { locale: vi });
}

export function formatMonthTitle(date: Date) {
  return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

export function formatDayTitle(date: Date) {
  return `${fullWeekDayLabels[(date.getDay() + 6) % 7]}, ${format(date, "dd/MM/yyyy")}`;
}

export function formatWeekTitle(weekStart: Date, weekEnd: Date) {
  return `${format(weekStart, "dd/MM")} – ${format(weekEnd, "dd/MM/yyyy")}`;
}

export function formatEventDateTime(date: Date) {
  const weekday = fullWeekDayLabels[(date.getDay() + 6) % 7];
  return `${format(date, "HH:mm")}, ${weekday} ${format(date, "dd/MM/yyyy")}`;
}
