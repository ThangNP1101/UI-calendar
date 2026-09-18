export type ID = string

export type Calendar = {
  id: ID
  ownerId: ID
  ownerName?: string
  type: string
  title: string
  color: string
  description?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type CalendarAccess = {
  id: ID
  userId: ID
  calendarId: ID
  role: string
  accessReason: string
  calendar?: Calendar
  status: string
  updatedAt: string
}

export type EventData = {
  title: string
  description?: string
  location?: string
  link?: string
  startAt: string
  endAt: string
  timeZone?: string
  visibility: string
  status: string
}

export type UserEventFeed = {
  id: ID
  userId: ID
  calendarId: ID
  eventSeriesId: ID
  accessReason: string
  data?: EventData
  projectionVersion?: number
  updatedAt: string
}

export type AttendeeInput = {
  userId: ID
  userName: string
}

export type CreateCalendarRequest = {
  type: string
  title: string
  color: string
  description: string
  members?: Array<AttendeeInput & { role: string }>
}

export type CreateEventRequest = {
  calendarId: ID
  title: string
  description: string
  location: string
  link: string
  attendees: AttendeeInput[]
  startAt: string
  endAt: string
  timeZone: string
  visibility: string
}

export type CalendarViewModel = Calendar & {
  isVisible: boolean
  members?: Array<{ id: ID; name: string; color: string; initials: string }>
}

export type CalendarEventViewModel = {
  id: ID
  calendarId: ID
  title: string
  description: string
  location: string
  link: string
  startAt: string
  endAt: string
  timeZone: string
  visibility: string
  status: string
  color: string
  calendarTitle: string
  attendees: Array<{ id: ID; name: string; initials: string; color: string }>
}
