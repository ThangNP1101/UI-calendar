# eCalendar — Frontend Implementation Specification (Merged)

This document merges two source files into a single reference for the coding agent:
1. `ecalendar_ui_implementation_spec.txt` — translated visual/UI guidance derived from the `LichCongTac-UI-concept.pdf` concept board.
2. `ecalendar_frontend_requirements.txt` — functional, data, and API requirements for the frontend.

---

## 0. Purpose & Source-of-Truth Priority

This document gives an AI coding agent the full context needed to build the eCalendar mini-app frontend.

**Priority order when sources conflict:**
1. **Actual backend API behavior/response** (live, inspected)
2. **Backend source code**
3. **Swagger / API documentation**
4. **This document**
5. The original UI concept PDF is the visual source of truth for **appearance and interaction patterns only** — never for data, API, or business rules.

**Hard rule:** Never infer an API contract, authentication rule, authorization rule, enum value, or backend business rule from the PDF. The PDF only defines what the UI should *look like* and what interaction *states* exist visually.

If the actual backend differs from this document: do not "fix" the frontend by guessing — record the real contract and adjust the frontend to match the backend.

---

## 1. Tech Stack

**Frontend core:**
- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui (Button, Dialog, DropdownMenu, Popover, Input, Textarea, Select, Checkbox, Form, AlertDialog, etc.)
- React Hook Form + Yup (forms/validation)
- TanStack Query v5 (server state)
- Axios (HTTP client)
- date-fns (date/time handling)

**Calendar UI:**
- Build the calendar grid with React + CSS Grid + Tailwind (no requirement to use FullCalendar).
- Calendar grid / day cell / event card are custom components; shadcn/ui is used for generic primitives only.

**General rules:**
- Do not introduce another frontend framework unless explicitly requested.
- The frontend is primarily a presentation/client layer: call the API, receive data, render UI.
- The backend is already running; Calendar/Event APIs are functional.
- Docker/Compose configuration will be provided later — do not invent ports, hostnames, environment variables, or network config.
- SSO has a confirmed business-level flow, but exact endpoints/callback/token transport are **not yet confirmed** — do not invent them.

---

## 2. Frontend Architecture Principles

- The backend is the source of truth for: business logic, authorization/permissions, business validation, and actual data.
- The frontend does **not** need to hard-code business permissions right now.
  - Example: do not assume "only the owner sees button X" unless the backend requires it.
  - The frontend simply calls the relevant API.
  - On success, update the UI. On failure, handle/display the error appropriately.
- **Permissions today:** the owner has rights; a full permission matrix is not yet hard-coded on the frontend — the backend manages permissions.
- **Enums:** follow backend-defined values only; values may be added later; never invent new enum values.
- **Error format:** not yet standardized. Do not assume a fixed error response schema — build flexible error handling that can adapt later.

---

## 3. Screen / State Inventory (from the UI concept)

### Desktop
**A. Month calendar view**
- Main calendar application shell
- Left navigation/sidebar
- Header
- Month navigation
- View switcher
- 7-column monthly calendar grid
- Calendar/event list in sidebar
- Event chips/cards inside date cells
- Overflow indicator such as "+2 more"

**B. Month calendar view with event-detail popup**
- Same month calendar
- Floating event-detail popup anchored visually over the calendar
- Popup has event color accent, title, metadata, and action icons

**C. Event detail popup variants**
- Compact event-detail card
- Expanded event-detail card
- Multiple event colors shown
- Long-title and long-description states shown
- Attachment row shown in the expanded state

**D. Create calendar flow**
- Calendar/sidebar context
- "Create new calendar" modal
- Empty form state
- Filled form state
- Edit calendar state ("Edit calendar")
- Sidebar context menu with "Edit" and "Delete"

**E. Create event flow**
- Calendar/sidebar context
- "Create event" modal
- Initial/empty event form
- Focus/filled form state
- Filled event state with participants
- Event creation action

### Mobile
**F. Mobile month calendar**
- iOS-like mobile application framing shown in the concept
- Top status-bar area
- Header with back/search/notification/settings controls
- "Work Calendar" title
- Month selector
- Calendar grid
- Event chips
- Floating "+" create button

**G. Mobile sidebar / view selector**
- Sidebar/drawer overlays the calendar
- View options: **Schedule, Day, 3-Day, Month**
- Selected "Month" state is highlighted
- Calendar management list
- "Other calendars" section
- Background calendar is visually dimmed while the drawer is open

---

## 4. Desktop App Shell

**Left rail**
- Narrow vertical green navigation rail
- User/avatar area at the top
- Stacked navigation icons
- Currently selected section is visually emphasized
- Settings/control area toward the bottom
- Keep the rail narrow and fixed; the main calendar area fills the rest of the width

**Sidebar**
- White/light background
- "Work Calendar" context/title area
- Green "+ Create" button near the top
- Small monthly mini-calendar
- Search field for finding/filtering calendars/people
- Calendar groups with collapsible section labels ("Manage calendars", "Others" visible in the concept)
- Each calendar row: checkbox/toggle, optional avatar/person image, calendar/person name, colored indicator matching the calendar/event color
- Sidebar content is vertically scrollable if needed

**Main header**
- White background
- App title "Work Calendar"
- Small icon controls on the right
- Month navigation row: "Today", previous/next, month/year label, dropdown indicator
- View switcher: **Day, Week, Month** ("Month" is selected in the concept)

Do not invent additional navigation items just because a typical calendar product might have them.

---

## 5. Month Calendar Grid

**General**
- 7 columns: Monday through Sunday
- Shows adjacent-month dates as needed to fill the grid
- Current/selected date: green filled circular/rounded highlight
- Adjacent-month dates: muted/gray
- Clean white cell background, very light gray borders/dividers
- Generous whitespace; day number is visually stronger than secondary info

**Day cell hierarchy**
1. Day number
2. Optional secondary/lunar or adjacent-date info in muted gray
3. Event chips
4. Overflow indicator

**Event chips**
- Compact horizontal rounded rectangles
- Narrow vertical color marker on the left
- Background is a lighter tint of the event/calendar color; title uses the stronger color
- Time aligned to the right
- Long titles truncate with ellipsis
- Multiple events stack vertically within a cell
- Overflow text such as "+2 more" when the visible count is exceeded
- Multiple distinct colors are visible (green, blue, orange, red/pink, purple, cyan, yellow, gray, etc.) — **treat these as visual values from real app data/config, not hard-coded business enums**

**Grid behavior**
- Preserve the 7-column structure on desktop
- Consistent cell heights for the spacious month-grid look
- Event content must not break the grid layout; overflow stays compact; long titles never expand a cell horizontally

---

## 6. Event Detail Popup

Floating white card over the calendar.

**Card**
- White/light surface, rounded corners, soft visible shadow
- Compact desktop width for normal content; grows for long descriptions/attachments
- Event color used as a small square/vertical accent and in the title text

**Header**
- Prominent event title (wraps or truncates depending on width)
- Event date/time as secondary text beneath the title
- Action icons top-right: edit/share-like, delete-like, more, close (in the concept)
- **Do not assign backend meaning to these icons from the PDF** — wire them only to behaviors defined by the functional requirements/API

**Body metadata**
Rows separated by icon + text. Examples shown: location, meeting/link, participants/avatars, description, attachment, duration, calendar, visibility.

Expanded example: inline participant avatars, multi-line description, attachment as a compact file row, metadata rows stay visually compact.

**Color variants**
Implement **one reusable `EventDetail` component** with a color/accent variant rather than separate components per color.

---

## 7. Create Calendar Modal

Three states shown: Create (empty), Create (filled), Edit (filled).

**Modal**
- Centered, white background, rounded corners, soft shadow, compact desktop width
- Centered header title, "X" close at top-right
- Bottom action area separated by a subtle divider
- Cancel = neutral/light button; primary action = green button

**Header titles**
- Create state: "Create new calendar"
- Edit state: "Edit calendar"

**Fields**
- Avatar/image field labeled "Avatar"
- Name field
- Description textarea with a visible character counter in the concept
- Calendar color selector ("Calendar color")
- Sharing section ("Share with")
- "+ Add person" action
- Member rows: avatar/name + role/status text

**Form visuals**
- Inputs: very light gray filled background, subtle border
- Modest rounded corners (not pill-shaped, except small controls/tags)
- Small, visually secondary labels
- Vertically stacked content, consistent spacing
- Avatar selector uses a circular image/placeholder

**Calendar sidebar context menu**
- Small overflow menu on a calendar row with "Edit" and "Delete"
- Delete is visually emphasized as destructive

**Important:** do not infer who can edit/delete calendars or what roles exist from the screenshot — those rules come from the functional requirements/backend API.

---

## 8. Create Event Modal

Progression shown from empty to populated form.

**Modal**
- White rounded card, soft shadow
- Header/upper-right: expand/maximize-like icon + close
- Bottom action bar: cancel + green primary action
- Wider than a simple form, but still compact

**Title**
- Large title input/placeholder near the top: "Add title"
- Filled state renders as dark, prominent text

**Date/time**
- Start date + start time — "to" — End date + end time
- Compact controls arranged horizontally on desktop

**Optional event fields shown**
- Location ("Add location")
- Meeting/link ("Add meeting")
- Participants ("Add participants")
- Description ("Add description")
- Notification/reminder dropdown
- Calendar selector with colored calendar indicator
- Visibility selector

**Participants**
- Populated state: avatar + name rows, each with a remove "X" on the right

**Selectors**
- Compact dropdown/select controls, subtle light-gray surfaces
- Left-aligned icons on many fields; keep density close to the concept

**Event form states to implement**
- empty, focused, filled, populated participant list, validation/error states if required by functional requirements

Do not invent validation rules from the PDF.

---

## 9. Mobile Month View

**Header**
- Mobile status-bar area
- Top row: navigation + utility icons
- Large "Work Calendar" title below
- Bottom border/divider under the header

**Month header**
- "May 2026"-style month label, dropdown indicator, menu/sidebar icon on the right

**Calendar**
- 7 compact columns; short weekday labels (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
- Compact date typography; current date highlighted green
- Event chips much smaller than desktop; aggressive title truncation
- Overflow shown as "+3" etc.

**Create action**
- Floating circular green "+" button, bottom-right, with visible elevation/shadow

**Mobile responsiveness**
- Do not simply scale the desktop sidebar down — it becomes an overlay drawer
- Calendar cells become much more compact
- Desktop multi-row event details collapse/truncate to fit mobile

---

## 10. Mobile Sidebar / Drawer

Overlay/drawer pattern.

**Background**
- Calendar stays visible behind a dark translucent overlay
- Drawer is a white panel occupying most of the screen width, leaving some dimmed calendar visible

**View selector**
Rows: Schedule, Day, 3-Day, Month.
Each row: left-side view icon, label; selected = green icon/text + pale green background; unselected = muted gray.

**Calendar list**
- Collapsible "Manage calendars" section
- Calendar rows: checkbox + avatar/color + label
- "Others" section below
- Divider lines between major sections
- Same calendar colors as the desktop sidebar

---

## 11. Visual Design Tokens

**Color language**
- Primary application/action color: green
- Main surfaces: white / very light gray
- Borders/dividers: very light gray
- Secondary text: muted gray
- Destructive action: red
- Calendar/event accents: multiple distinct colors (treat as data-driven values, not fixed enums)

**Important:** The large yellow section-label bars in the concept board ("Month view", "Event detail", "Create calendar — calendar options", "Create event", "Mobile") are presentation-board labels only — **not part of the actual application UI** and must not become the app's primary color.

**Typography**
- Clean sans-serif UI typography
- Hierarchy: app title = bold; calendar/date headings = medium/bold; event title = medium/bold with color accent; metadata = smaller, muted
- Avoid excessive font weights; preserve compact metadata/sidebar typography

**Radius**
- App cards/modals: moderate rounded corners
- Event chips: small rounded corners
- Current-date marker: circular/strongly rounded
- Buttons: modest radius, not extreme pill styling

**Shadow**
- Modals and event-detail popups: soft diffuse shadow
- Floating mobile "+" button: visible elevation
- Avoid harsh/drop shadows

**Spacing**
- Compact, consistent spacing in forms
- Calendar itself has generous whitespace
- Sidebar rows are compact
- Modal sections are clearly separated without excessive whitespace

---

## 12. Component Architecture (recommended)

```
AppShell
├── DesktopNavRail
├── CalendarSidebar
│   ├── CreateButton
│   ├── MiniCalendar
│   ├── CalendarSearch
│   ├── CalendarGroup
│   └── CalendarListItem
├── CalendarHeader
│   ├── TodayButton
│   ├── DateNavigator
│   └── ViewSwitcher
├── MonthCalendar
│   ├── WeekdayHeader
│   ├── MonthGrid
│   └── CalendarDayCell
│       ├── DayNumber
│       ├── EventChip
│       └── EventOverflow
├── EventDetailPopover
│   ├── EventDetailHeader
│   ├── EventMetaRow
│   ├── ParticipantAvatars
│   └── AttachmentRow
├── CalendarFormDialog
│   ├── AvatarPicker
│   ├── TextField
│   ├── TextareaField
│   ├── ColorPicker
│   └── MemberShareList
└── EventFormDialog
    ├── EventTitleInput
    ├── DateTimeRange
    ├── OptionalEventField
    ├── ParticipantList
    └── SelectField
```

**Mobile:**
```
MobileCalendarShell
├── MobileHeader
├── MobileMonthCalendar
├── MobileCreateButton
└── MobileCalendarDrawer
    ├── MobileViewSwitcher
    └── MobileCalendarList
```

Use shadcn/ui for generic primitives (Dialog, DropdownMenu, Popover, Button, Input, Textarea, Select, Checkbox) where the default structure can be styled to match the concept. Use custom components for: month grid, day cell, event chip, event detail card, calendar sidebar, mobile calendar drawer.

**Suggested folder structure (feature-based):**
```
src/
  features/
    calendar/
      api/
      components/
      hooks/
      pages/
      types/
    event/
      api/
      components/
      hooks/
      pages/
      types/
```

**Example hooks (naming may be adjusted, but behavior must map exactly to backend endpoints):**
`useCalendars()`, `useCreateCalendar()`, `useUpdateCalendar()`, `useDeleteCalendar()`, `useEvents()`, `useCreateEvent()`, `useUpdateEvent()`, `useDeleteEvent()`.

After each mutation: invalidate/refetch the related query. Do not mutate data according to a business rule that the backend hasn't confirmed.

---

## 13. Responsive Behavior

**Desktop:** full nav rail + sidebar + calendar; event-detail popup floats over the calendar; create/edit dialogs are centered.

**Mobile:** nav rail/sidebar replaced by mobile navigation/drawer; calendar takes nearly the full viewport; event chips become compact; create button becomes a floating circular action; drawer overlays the calendar instead of permanently occupying sidebar space.

Do not create an unrelated separate mobile design — the mobile concept shares the desktop's visual language and should preserve it.

---

## 14. Interaction Patterns Visible in the Concept

- Previous/next month navigation
- "Today" action
- Month view selection
- Calendar visibility toggles via checkboxes
- Calendar group collapse/expand
- Event click opens the detail popup
- Create button opens the creation flow
- Calendar row overflow menu opens edit/delete menu
- Mobile menu opens the drawer
- Mobile view selection highlights the selected view
- Modal close/cancel/primary action behavior
- Participant add/remove controls

The exact business effect, permissions, API calls, and allowed transitions must come from the API contract below — never from the PDF.

---

## 15. API Base Path

```
/api/v1
```

Confirmed endpoints:

**Events**
```
GET    /api/v1/events
POST   /api/v1/events
PATCH  /api/v1/events/:id
DELETE /api/v1/events/:id
```

**Calendars**
```
GET    /api/v1/calendars
POST   /api/v1/calendars
PATCH  /api/v1/calendars/:id
DELETE /api/v1/calendars/:id
```

Note: some earlier Swagger/route text had typos such as `/api/vl`, `/api/vi`, or a missing `/api/v1`. Use the confirmed contract `/api/v1/...` above. Do not infer endpoints beyond this list.

---

## 16. Calendar API

### 16.1 `GET /api/v1/calendars`

**Query params:**
- `accessReason` — type `CalendarAccessReason`, optional. Filters by access reason. Exact enum values not yet required to hard-code.
- `search` — string, optional. Searches by calendar title or owner name.

**Response:** `HTTP 200`, array of `CalendarAccess`

```ts
CalendarAccess {
  id: ObjectID,
  userId: ObjectID,
  calendarId: ObjectID,
  role: CalendarRole,
  accessReason: CalendarAccessReason,
  calendar: CalendarAccessSnapshot,
  status: CalendarAccessStatus,
  updatedAt: time
}
```

**Not yet confirmed:** the exact shape of `CalendarAccessSnapshot`. **Do not invent this shape.** If UI needs to render data inside `calendar`, get the real definition from the backend source/Swagger/response JSON first.

### 16.2 `POST /api/v1/calendars`

**Request:**
```ts
{
  type: CalendarType,
  title: string,
  color: string,
  description: string,
  members?: InitialMemberInput[]
}

InitialMemberInput {
  userId: string,
  role: CalendarRole,
  userName: string
}
```

**Response:** `HTTP 201`, `Calendar`

Note: `CreateCalendarInput` is an internal backend type and is **not** the frontend request contract — the frontend sends `CreateCalendarRequest` (the shape above).

### 16.3 `PATCH /api/v1/calendars/:id`

**Request (partial update):**
```ts
{
  title?: string,
  color?: string,
  description?: string
}
```
Do not update: `ownerId`, `type`.

**Response:** `HTTP 200`, `Calendar`

### 16.4 `DELETE /api/v1/calendars/:id`

**Response:** `HTTP 200`. Backend currently returns `map[string]string` with a success message; the exact key/value is not standardized in this document — do not invent it.

### 16.5 Calendar response shape

```ts
Calendar {
  id: ObjectID,
  ownerId: ObjectID,
  ownerName?: string,
  type: CalendarType,
  title: string,
  color: string,
  description?: string,
  createdAt: time,
  updatedAt: time,
  deletedAt?: time
}
```
JSON field naming is camelCase: `id`, `ownerId`, `ownerName`, `createdAt`, `updatedAt`, `deletedAt`.

---

## 17. Event API

### 17.1 `GET /api/v1/events`

**Query params:**
- `search` — string, optional. Search by event title.
- `from` — string, optional, RFC3339. Filter events starting from this time.
- `to` — string, optional, RFC3339. Filter events starting before this time.
- `calendarID` — string, optional. Filter by calendar ID.

**Note:** the backend currently names this query param `calendarID` (capital ID). Do not rename it to `calendarId` unless the backend contract changes.

**Response:** `HTTP 200`, array of `UserEventFeed`

### 17.2 `POST /api/v1/events`

**Main request:**
```ts
{
  calendarId: ObjectID,
  title: string,
  description: string,
  location: string,
  link: string,
  attendees: EventAttendee[],
  startAt: time,
  endAt: time,
  timeZone: string,
  visibility: EventVisibility
}
```

The backend model also has `attachments` and `recurrenceRule`, but **these are out of scope for the current frontend phase** (`EventAttachment` and `RecurrenceRule` are not needed yet). If the backend runtime requires these fields, get the real contract from the backend first — do not invent it.

**Response:** `HTTP 201`, `EventSeries`

### 17.3 `PATCH /api/v1/events/:id`

**Request (partial update):**
```ts
{
  title?: string,
  description?: string,
  location?: string,
  link?: string,
  startAt?: time,
  endAt?: time,
  timeZone?: string,
  visibility?: EventVisibility,
  attendees?: AttendeeInput[]
}
```
JSON tags must be standard camelCase: `location`, `link`, `startAt`, `endAt`, `timeZone`, `visibility`, `attendees`.

**Response:** `HTTP 200`, `EventSeries`

### 17.4 `DELETE /api/v1/events/:id`

**Response:** `HTTP 200`. Backend returns `map[string]string` success message; exact key/value not standardized — do not invent it.

---

## 18. Event Response Models

### 18.1 `EventSeries`
```ts
{
  id: ObjectID,
  calendarId: ObjectID,
  creatorId: ObjectID,
  creatorName?: string,
  title: string,
  description?: string,
  location?: string,
  link?: string,
  attachments?: EventAttachment[],
  startAt: time,
  endAt: time,
  timeZone: string,
  recurrenceRule?: RecurrenceRule,
  visibility: EventVisibility,
  status: EventStatus,
  createdAt: time,
  updatedAt: time,
  updatorName?: string,
  updatedBy: ObjectID,
  deletedAt?: time
}
```
Current frontend scope: `attachments` and `recurrenceRule` may be ignored — no recurrence/attachment UI needed for this phase unless required later.

### 18.2 `UserEventFeed`
```ts
{
  id: ObjectID,
  userId: ObjectID,
  calendarId: ObjectID,
  eventSeriesId: ObjectID,
  accessReason: EventAccessReason,
  data?: EventData,
  projectionVersion?: number,
  updatedAt: time
}
```
`projectionVersion` is not currently needed by the frontend.

### 18.3 `EventData`
```ts
{
  title: string,
  description?: string,
  location?: string,
  link?: string,
  startAt: time,
  endAt: time,
  timeZone?: string,
  visibility: EventVisibility,
  status: EventStatus
}
```
When rendering an event from `GET /api/v1/events`: the main display info lives in `data`; `calendarId` lives at the `UserEventFeed` level; `eventSeriesId` is the event series ID.

---

## 19. Event Attendee

```ts
EventAttendee {
  id: ObjectID,
  eventSeriesId: ObjectID,
  calendarId: ObjectID,
  userId: ObjectID,
  userName?: string,
  responseStatus: AttendeeResponseStatus,
  invitedAt: time,
  acceptedAt?: time,
  invitedBy: ObjectID,
  deletedAt?: time
}

AttendeeInput {
  userId: ObjectID,
  userName: string
}
```
Use `AttendeeInput` when creating/updating attendees.

---

## 20. Calendar Member

```ts
CalendarMember {
  id: ObjectID,
  calendarId: ObjectID,
  userId: ObjectID,
  userName?: string,
  role: CalendarRole,
  createdAt: time,
  updatedAt: time,
  deletedAt?: time
}
```
Note: the provided backend definition has fields/tags that need verification, especially `userName`. Do not modify the contract without checking the backend source. If the frontend needs `CalendarMember` directly, get the real definition from the backend.

---

## 21. Enums

Enums that exist/are used:
- `CalendarType`
- `CalendarRole`
- `EventCalendarRole`
- `CalendarAccessReason`
- `CalendarAccessStatus`
- `EventAccessReason`
- `AttendeeResponseStatus`
- `EventVisibility`
- `EventStatus`

**`EventCalendarRole`** already has confirmed values: `owner`, `admin`, `follow`. Do not add other values.

**All other enums:** specific values are not yet finalized in this context. The agent may create a TypeScript type/union from backend source/Swagger if that source is provided. **Never invent enum values.**

---

## 22. Date/Time Contract

Confirmed:
- API uses RFC3339 / ISO 8601 strings for datetime.
- Frontend uses date-fns to parse/format.
- Do not manually slice datetime strings unless necessary.

Example: `2026-09-17T09:00:00+07:00`

Datetime fields: `startAt`, `endAt`, `createdAt`, `updatedAt`, `deletedAt`, `invitedAt`, `acceptedAt`.

`timeZone` is a separate field, e.g. IANA format `Asia/Ho_Chi_Minh`.

**Note:** it is not yet confirmed whether the backend normalizes all datetimes to UTC before responding, or preserves the original offset. Do not invent this behavior — parse per RFC3339 and preserve the timezone information from the response; inspect the actual API response/Swagger if the exact serialization needs to be known.

---

## 23. SSO Flow

Confirmed business-level flow:
1. User opens the MiniApp.
2. MiniApp calls the service/backend.
3. Service requires authentication.
4. MiniApp redirects the user to Signet SSO.
5. Signet SSO authenticates the user.
6. Signet SSO returns an Authorization Code.
7. MiniApp sends the Authorization Code to the backend.
8. Backend exchanges the Authorization Code for an Access Token.
9. MiniApp/backend uses the Access Token to call the service.
10. Service validates the token.
11. Service retrieves account/user information.
12. Service returns the result.

Summary: `User → MiniApp → Signet SSO → Authorization Code → Backend → Access Token → Service → Validate Token → User Info / Result`

**Important — NOT yet confirmed, do NOT invent:**
- Specific SSO login endpoint
- Specific SSO callback endpoint
- Signet SSO URL
- Client ID
- Redirect URI
- How the frontend receives the Authorization Code
- Backend endpoint that receives the Authorization Code
- Which endpoint the backend uses to exchange the code
- Where the Access Token is stored
- Whether the Access Token is sent from FE to API via cookie or Authorization header
- Whether a refresh token exists
- Whether a `/me` or user-info endpoint exists
- Whether Axios needs `withCredentials: true`

Therefore: only implement SSO integration once real endpoints/config are supplied by backend/Signet. Do not create fake `/login`, `/callback`, `/auth/...` routes. Do not choose cookie vs. bearer without backend confirmation. If the backend already handles auth via cookie/session, the frontend just calls the API per the backend's mechanism. If the backend requires a Bearer token, an Axios interceptor can be used — but only after the contract is confirmed.

---

## 24. API Client / TanStack Query

- Use Axios as the HTTP client.
- Organize by feature (see folder structure in §12).
- Contents per feature: Axios instance, TanStack Query hooks, request/response TypeScript types.
- After a mutation: invalidate/refetch related queries. Do not mutate data per an unconfirmed business rule.

---

## 25. UI Requirements (functional minimum)

- Display calendar list.
- Display calendar month view.
- Display events on their corresponding date.
- Create calendar.
- Update calendar title/color/description.
- Delete calendar.
- Create event.
- Update event.
- Delete event.
- Filter/search events.
- Filter/search calendars.
- Select a calendar when creating an event.
- Display core event info: `title`, `description`, `location`, `link`, `startAt`, `endAt`, `timeZone`, `visibility`, `status`, and `attendees` if the UI supports it.

**Calendar grid:**
- Use CSS Grid + React + date-fns.
- Days outside the current month may be rendered per design.
- Display events based on `startAt`/`endAt`.
- Do not invent business rules about edit/delete permissions.

**UI components:**
- Prefer shadcn/ui for common controls.
- TailwindCSS for layout/styling.
- Responsive.

---

## 26. Search / Filter

**Calendar** — `GET /api/v1/calendars`: `search`, `accessReason`.

**Event** — `GET /api/v1/events`: `search`, `from`, `to`, `calendarID`.

Build the query object using the exact backend field names. Do **not** rename `calendarID` → `calendarId` in the query string unless the backend contract changes.

---

## 27. ID / TypeScript

Backend uses `bson.ObjectID`, serialized to a string over the HTTP API in normal marshaling.

Frontend should represent IDs as:
```ts
type ID = string
```

ID fields: `id`, `ownerId`, `userId`, `calendarId`, `eventSeriesId`, `creatorId`, `updatedBy`, `invitedBy`.

Do not send a Mongo ObjectID object from the frontend — send a string ID per the JSON contract. If the actual Swagger/JSON response shows a different format, prefer the actual API response.

---

## 28. Data / API Boundary — What NOT to Derive from the PDF

Do not derive any of the following from the visual concept:
- Endpoint paths
- HTTP methods
- Query parameters
- Request body shape
- Response body shape
- Authentication flow
- Authorization/permission rules
- Role definitions
- Enum values
- Visibility semantics
- Recurrence rules
- Error codes
- Backend validation
- Event/calendar ownership rules

The PDF only tells the agent what the UI should look like and what interaction states are visually represented.

**For implementation:**
- Read this document's API sections before connecting UI to data.
- Inspect the real backend API before implementing API calls.
- Map backend data to UI-specific view models where useful.
- Keep API/service logic separate from presentation components.
- Never invent mock API fields merely because a UI element exists.

---

## 29. Full List of Things the Frontend Agent Must NOT Invent

- Docker port
- Backend hostname
- Vite proxy target
- API base URL (beyond the confirmed `/api/v1`)
- Environment variables
- SSO endpoint(s)
- SSO redirect URI
- SSO client ID
- Access Token storage location
- Cookie/Bearer strategy
- Refresh token behavior
- User profile endpoint
- `CalendarAccessSnapshot` shape
- Error response schema
- Enum values not yet provided
- Detailed permission matrix
- `RecurrenceRule` behavior
- `EventAttachment` behavior
- Backend UTC-normalization behavior

If any of the above is missing: check backend source/Swagger if provided; if still unavailable, leave a clear TODO/config placeholder — do not invent an API or behavior just to make it "work."

---

## 30. Recommended Implementation Order

**Phase 1 — Setup**
React + Vite + TypeScript, TailwindCSS + shadcn/ui, Axios, TanStack Query v5, React Hook Form + Yup, date-fns.

**Phase 2 — Data layer**
Define TypeScript API models, Axios instance, Calendar API functions, Event API functions, TanStack Query hooks.

**Phase 3 — Core layout**
Calendar layout, calendar list/sidebar, month calendar grid, event cards.

**Phase 4 — CRUD UI**
Calendar create/edit/delete UI, event create/edit/delete UI.

**Phase 5 — Search/filter & states**
Search/filter, loading/empty/error states.

**Phase 6 — SSO**
Integrate only after real SSO endpoint/config is supplied.

**Phase 7 — Docker**
Integrate only after docker-compose/backend/frontend networking config is supplied.

---

## 31. Implementation Acceptance Criteria (Visual)

A UI implementation is visually complete only when:

**Layout**
- Desktop shell proportions resemble the concept.
- Sidebar, header, and calendar grid share the same visual hierarchy.
- Modal/popup placement and relative size resemble the concept.
- Mobile drawer behavior resembles the concept.

**Calendar**
- 7-column month grid.
- Correct visual distinction for current/adjacent dates.
- Event chips have colored accents and light tinted backgrounds.
- Multiple events stack correctly; overflow stays compact.
- Long titles truncate instead of breaking the grid.

**Event detail**
- Reusable card; accent color changes with event/calendar color.
- Metadata rows use icons and compact spacing.
- Long description and attachment states supported.

**Forms**
- Calendar create/edit dialog matches the concept's hierarchy.
- Event create dialog matches the concept's hierarchy.
- Inputs, selectors, member rows, footer actions, and close controls match density/spacing.

**Mobile**
- Compact month grid, mobile header, floating create button, overlay drawer, selected view state, calendar list styling.

**Visual QA priority order:**
1. Overall layout
2. Component size/position
3. Calendar grid
4. Spacing
5. Typography hierarchy
6. Colors
7. Borders/radius
8. Shadows
9. Icon placement
10. Small decorative details

Do not change the product design just to make implementation easier.

---

## 32. Note on the Original Concept PDF

The concept PDF is a single visual reference board with multiple desktop/mobile screenshots and states. Its extracted text is mostly labels for those visual sections — **not** a complete written specification.

When implementing:
- Inspect the actual PDF pages visually.
- Use the screenshots to determine visual relationships.
- Use §3–§14 of this document as an implementation checklist.
- Use §15–§29 (API/data contract) + the real backend API for data/behavior.
- Do not treat PDF labels as API or domain definitions.

Source sections visible in the PDF include: Calendar-view-month, Calendar-view-detail, Popup - Event Detail, Popup - Event Detail Copy / Copy 2, Month view, Event detail, Create calendar — calendar options, Create event, Mobile, Mobile-Calendar-view-month, Mobile-Calendar-sidebar.

---

## 33. Known Gaps / To Be Confirmed Later

**Not needed immediately:**
- Docker/Compose configuration
- Frontend container port
- Backend container port
- MongoDB container config
- FE ↔ BE network/proxy
- Production API base URL

**Needed once SSO work starts:**
- Signet SSO URL
- Login/auth endpoint
- Callback flow
- Redirect URI
- Authorization Code handling
- Backend endpoint that receives the code
- Token transport (cookie vs. Bearer)
- Credentials configuration
- User/account endpoint, if any

**Needed if the calendar list UI requires nested calendar details:**
- `CalendarAccessSnapshot` definition

**May be added later:**
- Full enum value sets
- Standardized error response schema
- `EventAttachment`
- `RecurrenceRule`
- Detailed permission matrix

---

## 34. Summary for the Coding Agent

Treat the backend API as the primary contract.

**Implement:**
- React + TypeScript + Vite
- TailwindCSS + shadcn/ui
- React Hook Form + Yup
- TanStack Query v5
- Axios
- date-fns
- Calendar CRUD
- Event CRUD
- Calendar/Event list + search/filter
- Month calendar UI (per the visual spec in §3–§14)
- RFC3339 datetime handling
- Frontend does not decide business permissions on its own — it calls the API and reacts to the backend's result

**Do not implement/invent:**
- Docker config (to be provided later)
- SSO endpoint/config specifics (not yet provided)
- `CalendarAccessSnapshot` (shape unknown)
- Error schema (not standardized)
- Enum values (not finalized)
- RecurrenceRule/Attachment UI (out of current scope)
- Detailed permission business logic

**Confirmed SSO business flow:**
`User → MiniApp → Signet SSO → Authorization Code → Backend → Access Token → Service → Validate Token → User Info/Result`

But the specific endpoints/config for this flow are not yet provided, so none of it should be invented.
