import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCalendar, createEvent, deleteCalendar, deleteEvent, getCalendars, getEvents, updateCalendar, updateEvent } from "./api"
import { demoCalendars, demoEvents } from "./data"
import type { CalendarEventViewModel, CalendarViewModel, CreateCalendarRequest, CreateEventRequest, ID } from "./types"

export function useCalendars(search = "") {
  return useQuery({
    queryKey: ["calendars", search],
    queryFn: async (): Promise<CalendarViewModel[]> => {
      const items = await getCalendars(search)
      return items.flatMap((item) =>
        item.calendar
          ? [
              {
                ...item.calendar,
                isVisible: true,
                members: [
                  {
                    id: item.calendar.ownerId,
                    name: item.calendar.ownerName ?? item.calendar.title,
                    color: item.calendar.color,
                    initials: (item.calendar.ownerName ?? item.calendar.title).slice(0, 2).toUpperCase()
                  }
                ]
              }
            ]
          : []
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
        item.data
          ? [
              {
                id: item.eventSeriesId,
                calendarId: item.calendarId,
                title: item.data.title,
                description: item.data.description ?? "",
                location: item.data.location ?? "",
                link: item.data.link ?? "",
                startAt: item.data.startAt,
                endAt: item.data.endAt,
                timeZone: item.data.timeZone ?? "Asia/Ho_Chi_Minh",
                visibility: item.data.visibility,
                status: item.data.status,
                color: demoCalendars.find((calendar) => calendar.id === item.calendarId)?.color ?? "#7c8991",
                calendarTitle: demoCalendars.find((calendar) => calendar.id === item.calendarId)?.title ?? "Lịch",
                attendees: []
              }
            ]
          : []
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
    mutationFn: ({ id, payload }: { id: ID; payload: Partial<CreateEventRequest> }) => updateEvent(id, payload),
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
