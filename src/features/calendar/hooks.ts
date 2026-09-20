import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCalendar, createEvent, deleteCalendar, deleteEvent, getCalendars, getEvents, updateCalendar, updateEvent } from "./api"
import { demoCalendars, demoEvents } from "./data"
import type {
  CalendarEventViewModel,
  CalendarViewModel,
  CreateCalendarRequest,
  CreateEventRequest,
  ID,
  UpdateEventRequest
} from "./types"

export function useCalendars(search = "") {
  return useQuery({
    queryKey: ["calendars", search],
    queryFn: async (): Promise<CalendarViewModel[]> => {
      const items = await getCalendars(search)
      return items.flatMap((item) =>
        [
          {
            id: item.calendarId,
            ownerId: item.userId,
            ownerName: item.calendar.ownerName,
            type: "custom",
            title: item.calendar.title,
            color: item.calendar.color,
            description: "",
            createdAt: item.updatedAt,
            updatedAt: item.updatedAt,
            isVisible: true,
            members: [
              {
                id: item.userId,
                name: item.calendar.ownerName || item.calendar.title,
                color: item.calendar.color,
                initials: (item.calendar.ownerName || item.calendar.title).slice(0, 2).toUpperCase()
              }
            ]
          }
        ]
      )
    },
    retry: false,
    placeholderData: demoCalendars
  })
}

export function useEvents(params?: { search?: string; from?: string; to?: string; calendarID?: string }) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async (): Promise<CalendarEventViewModel[]> => {
      const items = await getEvents(params)
      return items.flatMap((item) =>
        [
          {
            id: item.id,
            calendarId: item.calendarId,
            title: item.title,
            description: item.description ?? "",
            location: item.location ?? "",
            link: item.link ?? "",
            startAt: item.startAt,
            endAt: item.endAt,
            timeZone: item.timeZone,
            visibility: item.visibility,
            status: item.status,
            color: demoCalendars.find((calendar) => calendar.id === item.calendarId)?.color ?? "#7c8991",
            calendarTitle: demoCalendars.find((calendar) => calendar.id === item.calendarId)?.title ?? "Lịch",
            attendees: []
          }
        ]
      )
    },
    retry: false,
    placeholderData: demoEvents
  })
}

export function useCreateCalendar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCalendarRequest) => createCalendar(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendars"] })
  })
}

export function useUpdateCalendar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: ID; payload: Partial<{ title: string; color: string; description: string }> }) =>
      updateCalendar(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendars"] })
  })
}

export function useDeleteCalendar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: ID) => deleteCalendar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendars"] })
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEventRequest) => createEvent(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] })
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: ID; payload: UpdateEventRequest }) => updateEvent(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] })
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: ID) => deleteEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] })
  })
}
