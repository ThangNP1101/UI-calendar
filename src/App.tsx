import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns"
import {
  Bell,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Globe2,
  Grid2X2,
  ImagePlus,
  Link2,
  List,
  MapPin,
  Maximize2,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Share2,
  SlidersHorizontal,
  Trash2,
  UserRound,
  Users,
  X
} from "lucide-react"
import { type CSSProperties, useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { demoCalendars, demoEvents } from "@/features/calendar/data"
import type { CalendarEventViewModel, CalendarViewModel } from "@/features/calendar/types"

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
const fullWeekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]

type ViewMode = "day" | "week" | "month"
type CalendarDialogState = { mode: "create" | "edit"; calendar?: CalendarViewModel } | null

function initials(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function formatEventTime(event: CalendarEventViewModel) {
  const start = format(new Date(event.startAt), "HH:mm")
  const end = format(new Date(event.endAt), "HH:mm")
  return `${start} - ${end}`
}

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1))
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 4, 9))
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [eventSearch, setEventSearch] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventViewModel | null>(null)
  const [calendarDialog, setCalendarDialog] = useState<CalendarDialogState>(null)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [calendars, setCalendars] = useState<CalendarViewModel[]>(demoCalendars)
  const [events, setEvents] = useState<CalendarEventViewModel[]>(demoEvents)

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(eventSearch.toLowerCase())
        const matchesCalendar = calendars.some((calendar) => calendar.id === event.calendarId && calendar.isVisible)
        return matchesSearch && matchesCalendar
      }),
    [calendars, eventSearch, events]
  )

  function toggleCalendar(calendarId: string) {
    setCalendars((items) =>
      items.map((calendar) =>
        calendar.id === calendarId ? { ...calendar, isVisible: !calendar.isVisible } : calendar
      )
    )
  }

  function saveCalendar(nextCalendar: CalendarViewModel, mode: "create" | "edit") {
    setCalendars((items) =>
      mode === "create"
        ? [nextCalendar, ...items]
        : items.map((calendar) => (calendar.id === nextCalendar.id ? nextCalendar : calendar))
    )
    setCalendarDialog(null)
  }

  function deleteCalendar(calendarId: string) {
    setCalendars((items) => items.filter((calendar) => calendar.id !== calendarId))
    setEvents((items) => items.filter((event) => event.calendarId !== calendarId))
  }

  function createEvent(event: CalendarEventViewModel) {
    setEvents((items) => [...items, event])
    setEventDialogOpen(false)
  }

  function goToToday() {
    const today = new Date(2026, 4, 9)
    setSelectedDate(today)
    setCurrentMonth(startOfMonth(today))
  }

  return (
    <div className="calendar-app flex min-h-screen text-[13px]">
      <DesktopRail />
      <CalendarSidebar
        calendars={calendars}
        search={search}
        onSearchChange={setSearch}
        onCreate={() => setCalendarDialog({ mode: "create" })}
        onCreateEvent={() => setEventDialogOpen(true)}
        onEdit={(calendar) => setCalendarDialog({ mode: "edit", calendar })}
        onDelete={deleteCalendar}
        onToggle={toggleCalendar}
      />

      <main className="flex min-w-0 flex-1 flex-col bg-[#f7f9f8]">
        <MobileHeader onMenu={() => setDrawerOpen(true)} />
        <CalendarHeader
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          viewMode={viewMode}
          eventSearch={eventSearch}
          onEventSearchChange={setEventSearch}
          onPrevious={() => setCurrentMonth((month) => subMonths(month, 1))}
          onNext={() => setCurrentMonth((month) => addMonths(month, 1))}
          onToday={goToToday}
          onViewChange={setViewMode}
        />
        <div className="relative flex min-h-0 flex-1 overflow-auto p-3 md:p-4">
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-[#e4eae7] bg-white">
            <div className="grid grid-cols-7 border-b border-[#e9eeec] bg-[#fbfcfc]">
              {fullWeekDays.map((day) => (
                <div
                  key={day}
                  className="px-2 py-2 text-center text-[10px] font-medium text-[#9aa6a1] md:px-3 md:py-2.5 md:text-[11px]"
                >
                  {day}
                </div>
              ))}
            </div>
            <MonthCalendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              events={filteredEvents}
              onDayClick={setSelectedDate}
              onEventClick={setSelectedEvent}
            />
          </div>
          {selectedEvent ? (
            <EventDetailCard
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onEdit={() => {
                setSelectedEvent(null)
                setEventDialogOpen(true)
              }}
              onDelete={() => {
                setEvents((items) => items.filter((event) => event.id !== selectedEvent.id))
                setSelectedEvent(null)
              }}
            />
          ) : null}
        </div>
        <MobileCreateButton onClick={() => setEventDialogOpen(true)} />
      </main>

      <CalendarDialog
        state={calendarDialog}
        onOpenChange={(open) => !open && setCalendarDialog(null)}
        onSave={saveCalendar}
      />
      <EventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        calendars={calendars}
        defaultDate={selectedDate}
        onCreate={createEvent}
      />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        viewMode={viewMode}
        onViewChange={setViewMode}
        calendars={calendars}
        onToggle={toggleCalendar}
      />
    </div>
  )
}

function DesktopRail() {
  return (
    <aside className="app-rail hidden shrink-0 flex-col items-center justify-between py-3 lg:flex">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="size-8 border-2 border-white/70">
          <AvatarFallback className="bg-[#d8f1e4] text-[10px] font-bold text-[#0f754d]">TC</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-1">
          {[
            { icon: CalendarDays, label: "Lịch", active: true },
            { icon: List, label: "Danh sách" },
            { icon: Users, label: "Nhóm" },
            { icon: Copy, label: "Tài liệu" },
            { icon: SlidersHorizontal, label: "Tùy chọn" }
          ].map(({ icon: Icon, label, active }) => (
            <button key={label} className={cn("rail-button", active && "is-active")} title={label} type="button">
              <Icon aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
      <button className="rail-button" title="Cài đặt" type="button">
        <Settings aria-hidden="true" />
      </button>
    </aside>
  )
}

function CalendarSidebar({
  calendars,
  search,
  onSearchChange,
  onCreate,
  onCreateEvent,
  onEdit,
  onDelete,
  onToggle
}: {
  calendars: CalendarViewModel[]
  search: string
  onSearchChange: (value: string) => void
  onCreate: () => void
  onCreateEvent: () => void
  onEdit: (calendar: CalendarViewModel) => void
  onDelete: (calendarId: string) => void
  onToggle: (calendarId: string) => void
}) {
  const manageCalendars = calendars.filter((calendar) => ["personal", "team"].includes(calendar.type))
  const otherCalendars = calendars.filter((calendar) => !["personal", "team"].includes(calendar.type))

  return (
    <aside className="sidebar-scroll hidden w-[236px] shrink-0 overflow-y-auto border-r border-[#e3e9e6] bg-white px-3 py-3 lg:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-8 w-full rounded-[5px] bg-[#118b5b] text-xs font-semibold text-white hover:bg-[#087048]">
            <Plus data-icon="inline-start" />
            Tạo
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[210px]">
          <DropdownMenuItem onClick={onCreateEvent}>
            <CalendarDays data-icon="inline-start" />
            Sự kiện
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCreate}>
            <CalendarRange data-icon="inline-start" />
            Lịch
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <MiniCalendar />
      <div className="mt-3 flex items-center gap-2 rounded-[5px] border border-[#e5ece8] px-2.5">
        <Search className="size-3.5 shrink-0 text-[#a1ada8]" aria-hidden="true" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm kiếm lịch hoặc người theo dõi"
          className="h-8 border-0 px-0 text-[11px] shadow-none focus-visible:ring-0"
        />
      </div>
      <SidebarCalendarGroup
        title="Quản lý lịch"
        calendars={manageCalendars}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
      />
      <SidebarCalendarGroup
        title="Khác"
        calendars={otherCalendars}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
      />
    </aside>
  )
}

function SidebarCalendarGroup({
  title,
  calendars,
  onEdit,
  onDelete,
  onToggle
}: {
  title: string
  calendars: CalendarViewModel[]
  onEdit: (calendar: CalendarViewModel) => void
  onDelete: (calendarId: string) => void
  onToggle: (calendarId: string) => void
}) {
  return (
    <section className="mt-4">
      <div className="mb-1 flex items-center gap-1.5 px-1 text-[11px] font-semibold text-[#5f6c66]">
        <ChevronDown className="size-3" aria-hidden="true" />
        {title}
      </div>
      <div className="flex flex-col gap-0.5">
        {calendars.map((calendar) => (
          <div key={calendar.id} className="group flex min-w-0 items-center gap-1 rounded-[5px] px-1 py-1 hover:bg-[#f5f8f6]">
            <Checkbox checked={calendar.isVisible} onCheckedChange={() => onToggle(calendar.id)} className="size-3.5 rounded-[3px] border-[#becbc4] data-[state=checked]:border-[#128c5b] data-[state=checked]:bg-[#128c5b]" />
            <span className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: calendar.color }} />
            <Avatar className="size-4 shrink-0">
              <AvatarFallback className="text-[7px] font-semibold" style={{ backgroundColor: `${calendar.color}22`, color: calendar.color }}>
                {calendar.members?.[0]?.initials ?? initials(calendar.title)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 truncate text-[11px] text-[#49564f]">{calendar.title}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="grid size-5 place-items-center rounded text-[#a8b2ae] opacity-0 hover:bg-[#eaf3ee] hover:text-[#527267] group-hover:opacity-100" type="button" aria-label={`Tùy chọn ${calendar.title}`}>
                  <MoreHorizontal className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => onEdit(calendar)}>
                  <Pencil data-icon="inline-start" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDelete(calendar.id)}>
                  <Trash2 data-icon="inline-start" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </section>
  )
}

function MiniCalendar() {
  const month = new Date(2026, 4, 1)
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  })

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-semibold text-[#5e6c65]">
        <span>Tháng 5, 2026</span>
        <div className="flex items-center gap-1 text-[#a0ada7]">
          <ChevronLeft className="size-3" />
          <ChevronRight className="size-3" />
        </div>
      </div>
      <div className="mini-calendar-grid mb-1 text-[9px] font-medium text-[#a1ada8]">
        {weekDays.map((day) => <span key={day} className="text-center">{day}</span>)}
      </div>
      <div className="mini-calendar-grid">
        {days.map((day) => (
          <span
            key={day.toISOString()}
            className={cn("mini-calendar-day", !isSameMonth(day, month) && "is-muted", isSameDay(day, new Date(2026, 4, 9)) && "is-selected")}
          >
            {format(day, "d")}
          </span>
        ))}
      </div>
    </div>
  )
}

function MobileHeader({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="border-b border-[#e4eae7] bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between">
        <button type="button" className="grid size-8 place-items-center rounded-md text-[#5d6b64]" onClick={onMenu} aria-label="Mở lịch và chế độ xem">
          <Menu className="size-4" />
        </button>
        <div className="flex items-center gap-1">
          <button type="button" className="grid size-8 place-items-center rounded-md text-[#6f7c76]" aria-label="Tìm kiếm"><Search className="size-4" /></button>
          <button type="button" className="grid size-8 place-items-center rounded-md text-[#6f7c76]" aria-label="Thông báo"><Bell className="size-4" /></button>
          <button type="button" className="grid size-8 place-items-center rounded-md text-[#6f7c76]" aria-label="Cài đặt"><Settings className="size-4" /></button>
        </div>
      </div>
      <div className="mt-2 text-xl font-bold tracking-[-0.02em] text-[#202b26]">Lịch công tác</div>
    </header>
  )
}

function CalendarHeader({
  currentMonth,
  selectedDate,
  viewMode,
  eventSearch,
  onEventSearchChange,
  onPrevious,
  onNext,
  onToday,
  onViewChange
}: {
  currentMonth: Date
  selectedDate: Date
  viewMode: ViewMode
  eventSearch: string
  onEventSearchChange: (value: string) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: ViewMode) => void
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eae7] bg-white px-4 py-3 md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden items-center gap-2 text-sm font-bold text-[#28352f] sm:flex">
          <CalendarDays className="size-4 text-[#128c5b]" />
          Lịch công tác
        </div>
        <div className="hidden h-5 w-px bg-[#e8eeeb] sm:block" />
        <Button variant="outline" className="h-7 rounded-[5px] border-[#e4ebe7] px-2.5 text-[11px] font-medium text-[#52625a]" onClick={onToday}>
          Hôm nay
        </Button>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={onPrevious} className="grid size-7 place-items-center rounded-md text-[#7f8c86] hover:bg-[#f0f5f2]" aria-label="Tháng trước"><ChevronLeft className="size-4" /></button>
          <button type="button" onClick={onNext} className="grid size-7 place-items-center rounded-md text-[#7f8c86] hover:bg-[#f0f5f2]" aria-label="Tháng sau"><ChevronRight className="size-4" /></button>
        </div>
        <button type="button" className="flex items-center gap-1 text-[12px] font-semibold text-[#2c3b34]">
          {format(currentMonth, "MMMM, yyyy")}
          <ChevronDown className="size-3 text-[#99a59f]" />
        </button>
        <div className="hidden items-center gap-1 rounded-[5px] border border-[#e7ecea] px-2 sm:flex">
          <Search className="size-3 text-[#a0aca6]" />
          <Input value={eventSearch} onChange={(event) => onEventSearchChange(event.target.value)} className="h-7 w-36 border-0 px-0 text-[11px] shadow-none focus-visible:ring-0" placeholder="Tìm sự kiện" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-[5px] border border-[#e5ebe8] p-0.5">
          {(["day", "week", "month"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => onViewChange(view)}
              className={cn("rounded-[4px] px-2 py-1 text-[10px] font-medium text-[#929e99] transition-colors", viewMode === view && "bg-[#eef7f1] text-[#14895b]")}
            >
              {view === "day" ? "Ngày" : view === "week" ? "Tuần" : "Tháng"}
            </button>
          ))}
        </div>
        <button type="button" className="grid size-7 place-items-center rounded-md text-[#75847c] hover:bg-[#f0f5f2]" aria-label="Tùy chọn lịch"><SlidersHorizontal className="size-4" /></button>
        <span className="hidden text-[10px] text-[#a0aaa5] md:inline">{format(selectedDate, "dd/MM")}</span>
      </div>
    </header>
  )
}

function MonthCalendar({
  currentMonth,
  selectedDate,
  events,
  onDayClick,
  onEventClick
}: {
  currentMonth: Date
  selectedDate: Date
  events: CalendarEventViewModel[]
  onDayClick: (day: Date) => void
  onEventClick: (event: CalendarEventViewModel) => void
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
  })

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="calendar-grid">
        {days.map((day) => {
          const dayEvents = events.filter((event) => isSameDay(new Date(event.startAt), day))
          const visibleEvents = dayEvents.slice(0, 3)
          const overflow = dayEvents.length - visibleEvents.length
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn("calendar-cell group p-1.5 text-left transition-colors hover:bg-[#fbfdfc] md:p-2", !isSameMonth(day, currentMonth) && "is-muted")}
            >
              <div className="flex items-start justify-between">
                <span className={cn(
                  "grid size-5 place-items-center rounded-full text-[11px] font-semibold text-[#405149] md:size-6 md:text-[12px]",
                  !isSameMonth(day, currentMonth) && "font-normal text-[#b0bbb6]",
                  isSameDay(day, selectedDate) && "bg-[#128d5b] text-white"
                )}>
                  {format(day, "d")}
                </span>
                {dayEvents.length > 3 ? <span className="text-[9px] text-[#a9b4af]">{dayEvents.length}</span> : null}
              </div>
              <div className="mt-1 flex flex-col gap-1">
                {visibleEvents.map((event) => (
                  <span
                    key={event.id}
                    className="event-chip flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium leading-3 md:text-[10px]"
                    style={{ "--event-color": event.color } as CSSProperties}
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation()
                      onEventClick(event)
                    }}
                  >
                    <span className="event-chip-title min-w-0 flex-1">{event.title}</span>
                    <span className="hidden shrink-0 text-[8px] opacity-70 md:inline">{format(new Date(event.startAt), "HH:mm")}</span>
                  </span>
                ))}
                {overflow > 0 ? <span className="pl-1 text-[9px] font-medium text-[#a1ada7]">+{overflow} more</span> : null}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EventDetailCard({
  event,
  onClose,
  onEdit,
  onDelete
}: {
  event: CalendarEventViewModel
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="event-detail-card absolute left-1/2 top-[16%] z-20 -translate-x-1/2 md:left-[54%] md:translate-x-0">
      <div className="flex items-start justify-between gap-3 px-4 pb-1 pt-3">
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <span className="mt-1 size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: event.color }} />
            <h2 className="text-[13px] font-bold leading-4" style={{ color: event.color }}>{event.title}</h2>
          </div>
          <p className="mt-1 pl-4 text-[10px] font-medium text-[#75827b]">
            {format(new Date(event.startAt), "HH:mm, EEEE dd/MM/yyyy")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 text-[#8b9891]">
          <button type="button" className="grid size-5 place-items-center rounded hover:bg-[#f0f4f2]" onClick={onEdit} aria-label="Chỉnh sửa"><Pencil className="size-3" /></button>
          <button type="button" className="grid size-5 place-items-center rounded hover:bg-[#f0f4f2]" aria-label="Chia sẻ"><Share2 className="size-3" /></button>
          <button type="button" className="grid size-5 place-items-center rounded hover:bg-[#f0f4f2]" onClick={onDelete} aria-label="Xóa"><Trash2 className="size-3" /></button>
          <button type="button" className="grid size-5 place-items-center rounded hover:bg-[#f0f4f2]" onClick={onClose} aria-label="Đóng"><X className="size-3" /></button>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4 pb-4 pt-2 text-[10px] text-[#56635c]">
        <EventMeta icon={MapPin} value={event.location || "Thành phố Hồ Chí Minh"} />
        <EventMeta icon={Link2} value={event.link || "meetings-004@abc123"} />
        {event.attendees.length > 0 ? (
          <div className="flex items-center gap-2">
            <Users className="size-3 shrink-0 text-[#9ca8a2]" />
            <div className="flex -space-x-1">
              {event.attendees.map((attendee) => (
                <Avatar key={attendee.id} className="size-5 border-2 border-white">
                  <AvatarFallback className="text-[7px]" style={{ backgroundColor: `${attendee.color}35`, color: attendee.color }}>{attendee.initials}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span>{event.attendees.map((attendee) => attendee.name).join(", ")}</span>
          </div>
        ) : null}
        {event.description ? <EventMeta icon={List} value={event.description} /> : null}
        <EventMeta icon={Clock3} value={formatEventTime(event)} />
        <EventMeta icon={CalendarDays} value={event.calendarTitle} />
        <EventMeta icon={Globe2} value="Công khai" />
      </div>
    </div>
  )
}

function EventMeta({ icon: Icon, value }: { icon: typeof MapPin; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 size-3 shrink-0 text-[#9ca8a2]" />
      <span className="min-w-0 truncate">{value}</span>
    </div>
  )
}

function CalendarDialog({
  state,
  onOpenChange,
  onSave
}: {
  state: CalendarDialogState
  onOpenChange: (open: boolean) => void
  onSave: (calendar: CalendarViewModel, mode: "create" | "edit") => void
}) {
  const calendar = state?.calendar
  const [title, setTitle] = useState(calendar?.title ?? "")
  const [description, setDescription] = useState(calendar?.description ?? "")
  const [color, setColor] = useState(calendar?.color ?? "#ff8a22")

  useEffect(() => {
    setTitle(calendar?.title ?? "")
    setDescription(calendar?.description ?? "")
    setColor(calendar?.color ?? "#ff8a22")
  }, [calendar])

  if (!state) return null

  const dialogMode = state.mode

  function save() {
    const now = new Date().toISOString()
    onSave(
      {
        ...(calendar ?? {
          id: `calendar-${Date.now()}`,
          ownerId: "user-1",
          type: "team",
          createdAt: now,
          updatedAt: now,
          isVisible: true
        }),
        title: title || "Lịch mới",
        color,
        description,
        updatedAt: now,
        members: calendar?.members ?? [{ id: "user-1", name: "Trần Chí Công", color, initials: "TC" }]
      },
      dialogMode
    )
  }

  return (
    <Dialog open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogContent className="modal-surface max-w-[348px] p-0">
        <DialogHeader className="border-b border-[#edf1ef] px-4 py-3">
          <DialogTitle className="text-center text-[14px] font-bold text-[#26332d]">
            {dialogMode === "create" ? "Tạo lịch mới" : "Chỉnh sửa lịch"}
          </DialogTitle>
        </DialogHeader>
        <div className="modal-scroll flex flex-col gap-3 px-4 py-3">
          <div>
            <div className="mb-1.5 text-[10px] font-semibold text-[#56635d]">Ảnh đại diện</div>
            <button type="button" className="relative grid size-12 place-items-center rounded-full border border-[#e2e9e5] bg-[#f5f7f6] text-[#b4bfba]" aria-label="Chọn ảnh đại diện">
              <ImagePlus className="size-4" />
              <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full border border-white bg-[#f0f4f2] text-[#78857f]"><Pencil className="size-2.5" /></span>
            </button>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-[#56635d]">Tên</span>
            <Input className="soft-field h-8 text-[11px]" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nhập tên" />
          </label>
          <label className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#56635d]">Mô tả</span>
              <span className="text-[9px] text-[#8c9892]">{description.length}/500</span>
            </div>
            <Textarea className="soft-field min-h-20 resize-none text-[11px]" value={description} onChange={(event) => setDescription(event.target.value.slice(0, 500))} placeholder="Nhập mô tả" />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-[#56635d]">Màu lịch</span>
            <div className="flex items-center gap-2">
              {["#ff8a22", "#0f9d65", "#4478f3", "#8d43f7", "#f05357"].map((swatch) => (
                <button
                  type="button"
                  key={swatch}
                  aria-label={`Chọn màu ${swatch}`}
                  onClick={() => setColor(swatch)}
                  className={cn("grid size-7 place-items-center rounded-[5px] border border-[#e2e9e5]", color === swatch && "ring-2 ring-[#bce6cf]")}
                >
                  <span className="size-3.5 rounded-[3px]" style={{ backgroundColor: swatch }} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#56635d]">Chia sẻ với ai</span>
            <button type="button" className="rounded bg-[#e8f6ee] px-2 py-1 text-[9px] font-semibold text-[#239465]"><Plus className="mr-1 inline size-3" />Thêm người</button>
          </div>
          <div className="flex flex-col gap-2">
            {(calendar?.members ?? [
              { id: "user-1", name: "Trần Chí Công", color: "#4478f3", initials: "TC" },
              { id: "user-2", name: "Nguyễn Văn An", color: "#e2a36d", initials: "NA" },
              { id: "user-3", name: "Trần Thị Liễu", color: "#56a77d", initials: "TL" }
            ]).map((member, index) => (
              <div key={member.id} className="flex items-center gap-2">
                <Avatar className="size-5"><AvatarFallback className="text-[7px]" style={{ backgroundColor: `${member.color}2f`, color: member.color }}>{member.initials}</AvatarFallback></Avatar>
                <span className="flex-1 text-[11px] text-[#4f5d56]">{member.name}</span>
                <span className="text-[9px] text-[#7f8c85]">{index === 0 ? "Người tạo" : "Người theo dõi"}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="border-t border-[#edf1ef] px-4 py-3">
          <DialogClose asChild><Button variant="outline" className="h-8 rounded-[5px] px-4 text-[10px]">Hủy</Button></DialogClose>
          <Button className="h-8 rounded-[5px] bg-[#118b5b] px-4 text-[10px] text-white hover:bg-[#087048]" onClick={save}>
            {dialogMode === "create" ? "Tạo lịch" : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EventDialog({
  open,
  onOpenChange,
  calendars,
  defaultDate,
  onCreate
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  calendars: CalendarViewModel[]
  defaultDate: Date
  onCreate: (event: CalendarEventViewModel) => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [link, setLink] = useState("")
  const [calendarId, setCalendarId] = useState(calendars[4]?.id ?? calendars[0]?.id ?? "")
  const [attendees, setAttendees] = useState<Array<{ id: string; name: string; initials: string; color: string }>>([])

  function submit() {
    const calendar = calendars.find((item) => item.id === calendarId) ?? calendars[0]
    if (!calendar) return
    const dateText = format(defaultDate, "yyyy-MM-dd")
    onCreate({
      id: `event-${Date.now()}`,
      calendarId: calendar.id,
      title: title || "Sự kiện mới",
      description,
      location,
      link,
      startAt: `${dateText}T09:00:00+07:00`,
      endAt: `${dateText}T10:00:00+07:00`,
      timeZone: "Asia/Ho_Chi_Minh",
      visibility: "public",
      status: "active",
      color: calendar.color,
      calendarTitle: calendar.title,
      attendees
    })
    setTitle("")
    setDescription("")
    setLocation("")
    setLink("")
    setAttendees([])
  }

  function addAttendee() {
    if (attendees.length < 2) {
      setAttendees((items) => [...items, items.length === 0 ? { id: "attendee-a", name: "Nguyễn Văn An", initials: "NA", color: "#e2a36d" } : { id: "attendee-b", name: "Trần Thị Liễu", initials: "TL", color: "#56a77d" }])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-surface max-w-[440px] p-0" showCloseButton={false}>
        <DialogHeader className="border-b border-[#edf1ef] px-5 py-3">
          <div className="flex items-center justify-end gap-1 text-[#84918b]">
            <button type="button" className="grid size-6 place-items-center rounded hover:bg-[#f0f4f2]" aria-label="Mở rộng"><Maximize2 className="size-3.5" /></button>
            <DialogClose asChild><button type="button" className="grid size-6 place-items-center rounded hover:bg-[#f0f4f2]" aria-label="Đóng"><X className="size-4" /></button></DialogClose>
          </div>
        </DialogHeader>
        <div className="modal-scroll flex flex-col gap-3 px-5 py-3">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} className="h-9 border-0 px-0 text-lg font-semibold shadow-none focus-visible:ring-0" placeholder="Thêm tiêu đề" />
          <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2">
            <Clock3 className="size-3.5 text-[#6e7c74]" />
            <Input defaultValue={format(defaultDate, "dd/MM/yyyy")} className="soft-field h-8 text-[10px]" />
            <span className="text-[10px] text-[#a6b1ac]">đến</span>
            <Input defaultValue={format(defaultDate, "dd/MM/yyyy")} className="soft-field h-8 text-[10px]" />
          </div>
          <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2">
            <span />
            <Input defaultValue="09:00" className="soft-field h-8 text-[10px]" />
            <span />
            <Input defaultValue="09:00" className="soft-field h-8 text-[10px]" />
          </div>
          <EventField icon={MapPin} value={location} onChange={setLocation} placeholder="Thêm địa điểm" />
          <EventField icon={Link2} value={link} onChange={setLink} placeholder="Thêm cuộc họp" />
          <div className="flex items-center gap-2 text-[#95a19b]">
            <UserRound className="size-3.5 shrink-0" />
            <button type="button" className="text-[11px] hover:text-[#168b5a]" onClick={addAttendee}>Thêm người tham gia</button>
          </div>
          {attendees.map((attendee) => (
            <div key={attendee.id} className="ml-6 flex items-center gap-2">
              <Avatar className="size-5"><AvatarFallback className="text-[7px]" style={{ backgroundColor: `${attendee.color}2f`, color: attendee.color }}>{attendee.initials}</AvatarFallback></Avatar>
              <span className="flex-1 text-[11px] text-[#4e5d55]">{attendee.name}</span>
              <button type="button" onClick={() => setAttendees((items) => items.filter((item) => item.id !== attendee.id))} aria-label={`Xóa ${attendee.name}`}><X className="size-3.5 text-[#919d97]" /></button>
            </div>
          ))}
          <Separator />
          <EventField icon={List} value={description} onChange={setDescription} placeholder="Thêm mô tả" multiline />
          <Select defaultValue="30">
            <SelectTrigger className="soft-field h-8 text-[10px]"><Bell className="mr-2 size-3.5 text-[#78867e]" /><SelectValue placeholder="Thông báo khi bắt đầu sự kiện" /></SelectTrigger>
            <SelectContent><SelectItem value="0">Khi bắt đầu sự kiện</SelectItem><SelectItem value="30">Trước 30 phút</SelectItem><SelectItem value="60">Trước 1 giờ</SelectItem></SelectContent>
          </Select>
          <Select value={calendarId} onValueChange={setCalendarId}>
            <SelectTrigger className="soft-field h-8 text-[10px]"><CalendarDays className="mr-2 size-3.5 text-[#78867e]" /><SelectValue placeholder="Chọn lịch" /></SelectTrigger>
            <SelectContent>{calendars.map((calendar) => <SelectItem key={calendar.id} value={calendar.id}><span className="mr-2 inline-block size-2 rounded-[2px]" style={{ backgroundColor: calendar.color }} />{calendar.title}</SelectItem>)}</SelectContent>
          </Select>
          <Select defaultValue="public">
            <SelectTrigger className="soft-field h-8 text-[10px]"><Globe2 className="mr-2 size-3.5 text-[#78867e]" /><SelectValue placeholder="Công khai" /></SelectTrigger>
            <SelectContent><SelectItem value="public">Công khai</SelectItem><SelectItem value="private">Riêng tư</SelectItem></SelectContent>
          </Select>
        </div>
        <DialogFooter className="border-t border-[#edf1ef] px-5 py-3">
          <DialogClose asChild><Button variant="outline" className="h-8 rounded-[5px] px-4 text-[10px]">Hủy</Button></DialogClose>
          <Button className="h-8 rounded-[5px] bg-[#118b5b] px-4 text-[10px] text-white hover:bg-[#087048]" onClick={submit}>Tạo sự kiện</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EventField({
  icon: Icon,
  value,
  onChange,
  placeholder,
  multiline
}: {
  icon: typeof MapPin
  value: string
  onChange: (value: string) => void
  placeholder: string
  multiline?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-2 size-3.5 shrink-0 text-[#78867e]" />
      {multiline ? (
        <Textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="soft-field min-h-9 resize-none text-[11px]" />
      ) : (
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="soft-field h-8 text-[11px]" />
      )}
    </div>
  )
}

function MobileCreateButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="fixed bottom-5 right-5 z-10 grid size-12 place-items-center rounded-full bg-[#118b5b] text-white shadow-[0_8px_20px_rgba(15,120,75,0.32)] lg:hidden" onClick={onClick} aria-label="Tạo sự kiện">
      <Plus className="size-5" />
    </button>
  )
}

function MobileDrawer({
  open,
  onClose,
  viewMode,
  onViewChange,
  calendars,
  onToggle
}: {
  open: boolean
  onClose: () => void
  viewMode: ViewMode
  onViewChange: (view: ViewMode) => void
  calendars: CalendarViewModel[]
  onToggle: (calendarId: string) => void
}) {
  if (!open) return null
  const views: Array<{ key: ViewMode; label: string; icon: typeof List }> = [
    { key: "day", label: "Ngày", icon: List },
    { key: "week", label: "3 ngày", icon: CalendarRange },
    { key: "week", label: "Tuần", icon: Grid2X2 },
    { key: "month", label: "Tháng", icon: CalendarDays }
  ]
  return (
    <div className="drawer-overlay fixed inset-0 z-40 flex justify-end lg:hidden" onClick={onClose}>
      <aside className="h-full w-[82%] max-w-[320px] overflow-y-auto bg-white px-4 py-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <span className="text-sm font-bold text-[#29362f]">Lịch công tác</span>
          <button type="button" className="grid size-8 place-items-center rounded-md text-[#738179] hover:bg-[#f0f5f2]" onClick={onClose} aria-label="Đóng"><X className="size-4" /></button>
        </div>
        <div className="flex flex-col gap-1">
          {views.map(({ key, label, icon: Icon }, index) => (
            <button
              type="button"
              key={`${label}-${index}`}
              onClick={() => onViewChange(key)}
              className={cn("flex items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[12px] text-[#87938d]", viewMode === key && label === "Tháng" && "bg-[#e9f6ef] font-semibold text-[#118b5b]")}
            >
              <Icon className="size-4" />
              {label}
              {viewMode === key && label === "Tháng" ? <Check className="ml-auto size-3.5" /> : null}
            </button>
          ))}
        </div>
        <Separator className="my-5" />
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#5e6b64]"><ChevronDown className="size-3" />Quản lý lịch</div>
        <div className="flex flex-col gap-1">
          {calendars.filter((calendar) => ["personal", "team"].includes(calendar.type)).map((calendar) => (
            <label key={calendar.id} className="flex items-center gap-2 rounded px-1 py-1.5">
              <Checkbox checked={calendar.isVisible} onCheckedChange={() => onToggle(calendar.id)} className="size-3.5 rounded-[3px]" />
              <span className="size-2 rounded-[2px]" style={{ backgroundColor: calendar.color }} />
              <span className="truncate text-[11px] text-[#4e5c55]">{calendar.title}</span>
            </label>
          ))}
        </div>
        <Separator className="my-5" />
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#5e6b64]"><ChevronDown className="size-3" />Khác</div>
        <div className="flex flex-col gap-1">
          {calendars.filter((calendar) => !["personal", "team"].includes(calendar.type)).map((calendar) => (
            <label key={calendar.id} className="flex items-center gap-2 rounded px-1 py-1.5">
              <Checkbox checked={calendar.isVisible} onCheckedChange={() => onToggle(calendar.id)} className="size-3.5 rounded-[3px]" />
              <span className="size-2 rounded-[2px]" style={{ backgroundColor: calendar.color }} />
              <span className="truncate text-[11px] text-[#4e5c55]">{calendar.title}</span>
            </label>
          ))}
        </div>
      </aside>
    </div>
  )
}

export default App
