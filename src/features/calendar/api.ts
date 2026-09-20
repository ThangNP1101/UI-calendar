import { apiClient } from "@/api/axios"
import type {
  Calendar,
  CalendarAccess,
  CreateCalendarRequest,
  CreateEventRequest,
  ID,
  EventListItem,
  UpdateEventRequest
} from "./types"

export async function getCalendars(search?: string) {
  const response = await apiClient.get<CalendarAccess[]>("/calendars", {
    params: search ? { search } : undefined
  })
  return response.data
}

export async function createCalendar(payload: CreateCalendarRequest) {
  const response = await apiClient.post<Calendar>("/calendars", payload)
  return response.data
}

export async function updateCalendar(id: ID, payload: Partial<Pick<Calendar, "title" | "color" | "description">>) {
  const response = await apiClient.patch<Calendar>(`/calendars/${id}`, payload)
  return response.data
}

export async function deleteCalendar(id: ID) {
  await apiClient.delete(`/calendars/${id}`)
}

export async function getEvents(params?: {
  search?: string
  from?: string
  to?: string
  calendarID?: string
}) {
  const response = await apiClient.get<EventListItem[]>("/events", { params })
  return response.data
}

export async function createEvent(payload: CreateEventRequest) {
  const response = await apiClient.post("/events", payload)
  return response.data
}

export async function updateEvent(id: ID, payload: UpdateEventRequest) {
  const response = await apiClient.patch(`/events/${id}`, payload)
  return response.data
}

export async function deleteEvent(id: ID) {
  await apiClient.delete(`/events/${id}`)
}
