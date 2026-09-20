export type ID = string

export type CalendarType = "default" | "custom"
export type CalendarRole = "owner" | "admin" | "follower"
export type EventVisibility = "public" | "private"
export type EventStatus = "active" | "cancelled"

export type Calendar = {
  id: ID
  ownerId: ID
  ownerName?: string
  type: CalendarType
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
  role: CalendarRole
  accessReason: string
  calendar: CalendarAccessSnapshot
  status: string
  updatedAt: string
}

export type CalendarAccessSnapshot = {
  color: string
  ownerName: string
  title: string
}

export type EventData = {
  title: string
  description?: string
  location?: string
  link?: string
  startAt: string
  endAt: string
  timeZone?: string
  visibility: EventVisibility
  status: EventStatus
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

export type EventListItem = {
  id: ID
  calendarId: ID
  accessReason: string
  title: string
  description?: string
  location?: string
  link?: string
  startAt: string
  endAt: string
  timeZone: string
  visibility: EventVisibility
  status: EventStatus
}

export type AttendeeInput = {
  userId: ID
  userName: string
}

export type EventAttendee = {
  acceptedAt?: string
  calendarId?: ID
  deletedAt?: string
  eventSeriesId?: ID
  id?: ID
  invitedAt?: string
  invitedBy?: ID
  responseStatus?: string
  userId: ID
  userName: string
}

export type InitialMemberInput = {
  role: CalendarRole
  userName: string
  userid: ID
}

export type CreateCalendarRequest = {
  type: CalendarType
  title: string
  color: string
  description: string
  members?: InitialMemberInput[]
}

export type CreateEventRequest = {
  calendarId: ID
  title: string
  description: string
  location: string
  link: string
  attendees: EventAttendee[]
  startAt: string
  endAt: string
  timeZone: string
  visibility: EventVisibility
  attachments?: unknown[]
  recurrenceRule?: unknown
}

export type UpdateEventRequest = {
  title?: string
  description?: string
  location?: string
  link?: string
  startAt?: string
  endAt?: string
  timeZone?: string
  visibility?: EventVisibility
  attendees?: AttendeeInput[]
}

export type CalendarViewModel = Omit<Calendar, "type"> & {
  type: string
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
  visibility: EventVisibility
  status: EventStatus
  color: string
  calendarTitle: string
  attendees: Array<{ id: ID; name: string; initials: string; color: string }>
}
