import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
} from "date-fns";
import { type CSSProperties, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import {
  getWeekStart,
  weekdayDateForSelectedWeek,
} from "./calendar-range";
import { fullWeekDayLabels, WEEK_STARTS_ON } from "./date-locale";
import {
  buildWeekSegments,
  eventOverlapsDay,
  isMultiDayEvent,
} from "./multi-day-layout";
import type { CalendarEventViewModel } from "./types";

const HOUR_HEIGHT = 48;
const LANE_HEIGHT = 18;

function weekChunks(days: Date[]) {
  const weeks: Date[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
}

function hourOffset(date: Date) {
  return ((date.getHours() * 60 + date.getMinutes()) / (24 * 60)) * (24 * HOUR_HEIGHT);
}

function eventHeight(event: CalendarEventViewModel) {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  const minutes = Math.max(30, (end.getTime() - start.getTime()) / 60000);
  return (minutes / (24 * 60)) * (24 * HOUR_HEIGHT);
}

export function MonthCalendar({
  currentMonth,
  selectedDate,
  events,
  onDayNumberClick,
  onSlotClick,
  onEventClick,
  onWeekdayClick,
}: {
  currentMonth: Date;
  selectedDate: Date;
  events: CalendarEventViewModel[];
  onDayNumberClick: (day: Date) => void;
  onSlotClick: (date: Date) => void;
  onEventClick: (event: CalendarEventViewModel) => void;
  onWeekdayClick: (weekdayIndex: number) => void;
}) {
  const days = eachDayOfInterval({
    start: getWeekStart(startOfMonth(currentMonth)),
    end: addDays(
      getWeekStart(endOfMonth(currentMonth)),
      6,
    ),
  });
  const weeks = weekChunks(days);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid shrink-0 grid-cols-7 border-b border-[#e9eeec] bg-[#fbfcfc]">
        {fullWeekDayLabels.map((day, index) => (
          <button
            key={day}
            type="button"
            className="px-2 py-2 text-center text-[10px] font-medium text-[#9aa6a1] hover:text-[#14895b] md:px-3 md:py-2.5 md:text-[11px]"
            onClick={() => onWeekdayClick(index)}
          >
            {day}
          </button>
        ))}
      </div>
      <div
        className="calendar-grid"
        style={{ "--week-count": weeks.length } as CSSProperties}
      >
        {weeks.map((week) => {
          const weekStart = week[0];
          const { segments, laneCount } = buildWeekSegments(events, weekStart);
          return (
            <div key={weekStart.toISOString()} className="month-week">
              {week.map((day) => {
                const dayEvents = events.filter(
                  (event) =>
                    !isMultiDayEvent(event) && eventOverlapsDay(event, day),
                );
                const visibleEvents = dayEvents.slice(0, 3);
                const overflow = dayEvents.length - visibleEvents.length;
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => onSlotClick(day)}
                    className={cn(
                      "calendar-cell group p-1.5 text-left transition-colors hover:bg-[#fbfdfc] md:p-2",
                      !isSameMonth(day, currentMonth) && "is-muted",
                    )}
                    style={{
                      paddingTop: `${26 + laneCount * LANE_HEIGHT}px`,
                    }}
                  >
                    <div className="absolute left-1.5 top-1.5 md:left-2 md:top-2">
                      <span
                        className={cn(
                          "grid size-5 place-items-center rounded-full text-[11px] font-semibold text-[#405149] md:size-6 md:text-[12px]",
                          !isSameMonth(day, currentMonth) &&
                            "font-normal text-[#b0bbb6]",
                          isSameDay(day, selectedDate) &&
                            "bg-[#128d5b] text-white",
                        )}
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation();
                          onDayNumberClick(day);
                        }}
                        onKeyDown={(keyboardEvent) => {
                          if (keyboardEvent.key === "Enter") {
                            keyboardEvent.stopPropagation();
                            onDayNumberClick(day);
                          }
                        }}
                        role="link"
                        tabIndex={0}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-col gap-1">
                      {visibleEvents.map((event) => (
                        <span
                          key={event.id}
                          className="event-chip flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium leading-3 md:text-[10px]"
                          style={
                            {
                              "--event-color": event.color,
                            } as CSSProperties
                          }
                          onClick={(clickEvent) => {
                            clickEvent.stopPropagation();
                            onEventClick(event);
                          }}
                        >
                          <span className="event-chip-title min-w-0 flex-1">
                            {event.title}
                          </span>
                          <span className="hidden shrink-0 text-[8px] opacity-70 md:inline">
                            {format(new Date(event.startAt), "HH:mm")}
                          </span>
                        </span>
                      ))}
                      {overflow > 0 ? (
                        <span className="pl-1 text-[9px] font-medium text-[#a1ada7]">
                          +{overflow} nữa
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
              <div
                className="month-week-lanes"
                style={{ height: `${laneCount * LANE_HEIGHT}px` }}
              >
                {segments.map((segment) => (
                  <button
                    key={`${segment.event.id}-${segment.startCol}`}
                    type="button"
                    className="event-span text-left"
                    style={
                      {
                        gridColumn: `${segment.startCol + 1} / span ${segment.span}`,
                        gridRow: segment.lane + 1,
                        "--event-color": segment.event.color,
                      } as CSSProperties
                    }
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      onEventClick(segment.event);
                    }}
                  >
                    {segment.event.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AllDayRow({
  days,
  events,
  onEventClick,
}: {
  days: Date[];
  events: CalendarEventViewModel[];
  onEventClick: (event: CalendarEventViewModel) => void;
}) {
  const weekStart = days[0];
  const { segments, laneCount } = buildWeekSegments(events, weekStart);
  return (
    <div
      className="relative grid border-b border-[#e9eeec]"
      style={{
        gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))`,
        minHeight: `${Math.max(28, 12 + laneCount * LANE_HEIGHT)}px`,
      }}
    >
      <div className="px-1 py-1 text-[9px] text-[#9aa6a1]">Cả ngày</div>
      {days.map((day) => (
        <div
          key={day.toISOString()}
          className="border-l border-[#e9eeec]"
        />
      ))}
      <div
        className="absolute right-0 top-1"
        style={{
          left: 56,
          display: "grid",
          gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
        }}
      >
        {segments.map((segment) => (
          <button
            key={`${segment.event.id}-${segment.startCol}`}
            type="button"
            className="event-span text-left"
            style={
              {
                gridColumn: `${segment.startCol + 1} / span ${segment.span}`,
                gridRow: segment.lane + 1,
                "--event-color": segment.event.color,
              } as CSSProperties
            }
            onClick={() => onEventClick(segment.event)}
          >
            {segment.event.title}
          </button>
        ))}
      </div>
    </div>
  );
}

function TimeGrid({
  days,
  events,
  onEventClick,
  onSlotClick,
}: {
  days: Date[];
  events: CalendarEventViewModel[];
  onEventClick: (event: CalendarEventViewModel) => void;
  onSlotClick: (date: Date, time: string) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, hour) => hour);

  function handleColumnClick(day: Date, clickEvent: MouseEvent<HTMLDivElement>) {
    const bounds = clickEvent.currentTarget.getBoundingClientRect();
    const ratio = (clickEvent.clientY - bounds.top) / bounds.height;
    const totalMinutes = Math.max(0, Math.min(23 * 60, Math.round((ratio * 24 * 60) / 30) * 30));
    const hoursValue = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const minutesValue = String(totalMinutes % 60).padStart(2, "0");
    onSlotClick(day, `${hoursValue}:${minutesValue}`);
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div
        className="time-grid relative"
        style={{ "--day-count": days.length } as CSSProperties}
      >
        <div>
          {hours.map((hour) => (
            <div
              key={hour}
              className="time-grid-hour pr-2 text-right text-[9px] text-[#9aa6a1]"
            >
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>
        {days.map((day) => {
          const timedEvents = events.filter(
            (event) =>
              !isMultiDayEvent(event) && eventOverlapsDay(event, day),
          );
          return (
            <div
              key={day.toISOString()}
              className="relative border-l border-[#e9eeec]"
              style={{ height: 24 * HOUR_HEIGHT }}
              onClick={(clickEvent) => handleColumnClick(day, clickEvent)}
            >
              {hours.map((hour) => (
                <div key={hour} className="time-grid-hour" />
              ))}
              {timedEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className="timed-event text-left"
                  style={
                    {
                      top: hourOffset(new Date(event.startAt)),
                      height: eventHeight(event),
                      left: 4,
                      right: 4,
                      "--event-color": event.color,
                    } as CSSProperties
                  }
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  {event.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WeekCalendar({
  selectedDate,
  events,
  onDayHeaderClick,
  onSlotClick,
  onEventClick,
}: {
  selectedDate: Date;
  events: CalendarEventViewModel[];
  onDayHeaderClick: (day: Date) => void;
  onSlotClick: (date: Date, time: string) => void;
  onEventClick: (event: CalendarEventViewModel) => void;
}) {
  const weekStart = getWeekStart(selectedDate);
  const days = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className="grid shrink-0 border-b border-[#e9eeec] bg-[#fbfcfc]"
        style={{ gridTemplateColumns: `56px repeat(7, minmax(0, 1fr))` }}
      >
        <div />
        {days.map((day) => (
          <button
            key={day.toISOString()}
            type="button"
            className={cn(
              "px-2 py-2 text-center text-[10px] font-medium text-[#9aa6a1] hover:text-[#14895b]",
              isSameDay(day, selectedDate) && "font-semibold text-[#14895b]",
            )}
            onClick={() => onDayHeaderClick(day)}
          >
            {fullWeekDayLabels[(day.getDay() + 6) % 7]} {format(day, "dd/MM")}
          </button>
        ))}
      </div>
      <AllDayRow days={days} events={events} onEventClick={onEventClick} />
      <TimeGrid
        days={days}
        events={events}
        onEventClick={onEventClick}
        onSlotClick={onSlotClick}
      />
    </div>
  );
}

export function DayCalendar({
  selectedDate,
  events,
  onSlotClick,
  onEventClick,
}: {
  selectedDate: Date;
  events: CalendarEventViewModel[];
  onSlotClick: (date: Date, time: string) => void;
  onEventClick: (event: CalendarEventViewModel) => void;
}) {
  const days = [selectedDate];
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[#e9eeec] bg-[#fbfcfc] px-3 py-2 text-center text-[11px] font-medium text-[#5f6c66]">
        {fullWeekDayLabels[(selectedDate.getDay() + 6) % 7]}{" "}
        {format(selectedDate, "dd/MM/yyyy")}
      </div>
      <AllDayRow days={days} events={events} onEventClick={onEventClick} />
      <TimeGrid
        days={days}
        events={events}
        onEventClick={onEventClick}
        onSlotClick={onSlotClick}
      />
    </div>
  );
}

export function selectedWeekdayDate(selectedDate: Date, weekdayIndex: number) {
  return weekdayDateForSelectedWeek(selectedDate, weekdayIndex);
}

export { WEEK_STARTS_ON };
