import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCalendar, createEvent, deleteCalendar, deleteEvent, getCalendars, getEvents, updateCalendar, updateEvent } from "./api"
import { demoCalendars } from "./data"
import { generateEventOccurrences } from "./recurrence"
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
  })
}

export function useEvents(params?: { search?: string; from?: string; to?: string; calendarID?: string }) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async (): Promise<CalendarEventViewModel[]> => {
      const items = await getEvents(params)
      return items.flatMap((item) => {
        if (!item.data) return []
        const calendar = demoCalendars.find((candidate) => candidate.id === item.calendarId)
        return generateEventOccurrences({
          event: item,
          from: params?.from ?? item.data.startAt,
          to: params?.to ?? item.data.endAt
        }).map((occurrence) => ({
          id: occurrence.renderId,
          calendarId: item.calendarId,
          title: item.data?.title ?? "",
          description: item.data?.description ?? "",
          location: item.data?.location ?? "",
          link: item.data?.link ?? "",
          startAt: occurrence.startAt,
          endAt: occurrence.endAt,
          timeZone: item.data?.timeZone ?? "UTC",
          visibility: item.data?.visibility ?? "public",
          status: item.data?.status ?? "active",
          color: calendar?.color ?? "#7c8991",
          calendarTitle: calendar?.title ?? "Lịch",
          attendees: [],
          sourceEventId: item.id,
          eventSeriesId: item.eventSeriesId,
          persistedId: occurrence.isGeneratedOccurrence ? undefined : item.id,
          recurrenceRule: item.recurrenceRule,
          isGeneratedOccurrence: occurrence.isGeneratedOccurrence
        }))
      })
    },
    retry: false,
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
