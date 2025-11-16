# Architecture Diagrams

## Local Development Setup

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Computer                            │
│                    (localhost)                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           npm run dev                                  │ │
│  │                                                        │ │
│  │  ┌──────────────────────┐      ┌─────────────────┐   │ │
│  │  │   Express Server     │      │  React Frontend │   │ │
│  │  │  (Port 5000)         │      │  (Port 5173)    │   │ │
│  │  │                      │      │                 │   │ │
│  │  │  API Routes          │◄─────│ Hot Module      │   │ │
│  │  │  - /api/clubs        │      │ Replacement     │   │ │
│  │  │  - /api/events       │      │                 │   │ │
│  │  │  - /api/auth         │      │ Client Code:    │   │ │
│  │  │  - etc...            │      │ - pages/        │   │ │
│  │  │                      │      │ - components/   │   │ │
│  │  │ Storage:             │      │ - hooks/        │   │ │
│  │  │ MemStorage (RAM)     │      │ - lib/          │   │ │
│  │  │ All data in memory   │      │                 │   │ │
│  │  └──────────────────────┘      └─────────────────┘   │ │
│  │                                                        │ │
│  │  File Watchers:                                       │ │
│  │  - tsx (server/ and shared/)                          │ │
│  │  - Vite (client/src/)                                 │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Browser: http://localhost:5173                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  DevTools:                                             │ │
│  │  - Console (see logs)                                  │ │
│  │  - Network (see API calls)                             │ │
│  │  - Elements (inspect DOM)                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Keys:
✅ Single process = No CORS
✅ HMR enabled = Instant updates
✅ MemStorage = Fast + ephemeral
✅ Full debugging = See everything
```

---

## Data Flow: User Registration

```
User fills out form
        │
        ▼
┌──────────────────────┐
│  Frontend Validation │  ← Zod schema
│  (email, password)   │
└──────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  POST /api/auth/register             │
│  Body: {username, email, password,   │
│         firstName, lastName}         │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  Express Route Handler               │
│  (server/routes.ts)                  │
│  1. Validate data (Zod)             │
│  2. Hash password (bcrypt)          │
│  3. Create user in storage          │
│  4. Set session cookie              │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  MemStorage.createUser()             │
│  (server/storage.ts)                 │
│  1. Generate UUID                   │
│  2. Create User object              │
│  3. Store in Map (RAM)              │
│  4. Return user object              │
└──────────────────────────────────────┘
        │
        ▼
Response + Session Cookie
        │
        ▼
Frontend stores session
Redirect to /dashboard
        │
        ▼
User authenticated ✅
```

---

## Data Flow: Browse & Join Club

```
User clicks "Discover Clubs"
        │
        ▼
┌──────────────────────┐
│  GET /api/clubs      │
└──────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  MemStorage.getAllClubs()        │
│  Returns array of all clubs      │
└──────────────────────────────────┘
        │
        ▼
Frontend displays club cards
with search/filter
        │
        ▼
User clicks club → /club/:id
        │
        ▼
┌──────────────────────────┐
│  GET /api/clubs/:id      │  ← Fetch club details
│  GET /api/clubs/:id/     │  ← Fetch announcements
│        announcements     │
│  GET /api/clubs/:id/     │  ← Fetch events
│        events            │
│  GET /api/clubs/:id/     │  ← Fetch members
│        members           │
└──────────────────────────┘
        │
        ▼
Display club detail page with tabs
- Info
- Events
- Announcements
- Members
- Apply button
        │
        ▼
User clicks "Apply to Join"
        │
        ▼
┌──────────────────────────────────┐
│  POST /api/clubs/:id/apply       │
│  Body: {coverLetter?}            │
│  Header: Cookie (session)        │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  Check: Is user authenticated?   │
│  Check: User not already member? │
│  Check: No pending application?  │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  MemStorage.createClubApplication()
│  1. Generate UUID               │
│  2. Create ClubApplication      │
│  3. Store in Map                │
│  4. Return application object   │
└──────────────────────────────────┘
        │
        ▼
Response: success
        │
        ▼
Frontend shows toast: "Applied!"
Redirect to /my-clubs
        │
        ▼
User sees club in "My Clubs" with
status badge: "Pending"
```

---

## Role-Based Feature Access

```
User Role in Club
        │
        ├─ member
        │   └─ Can:
        │       ✓ View club info
        │       ✓ See events
        │       ✓ See announcements
        │       ✓ View members
        │       ✗ No dashboard access
        │       ✗ Cannot modify anything
        │
        ├─ officer
        │   └─ Can:
        │       ✓ Everything member can do
        │       ✓ Access dashboard
        │       ✓ Create events
        │       ✓ Post announcements
        │       ✓ Manage members
        │       ✓ Review applications
        │       ✓ Set up dues
        │       ✗ Cannot delete club
        │       ✗ Cannot promote to admin
        │
        └─ admin
            └─ Can:
                ✓ Everything officer can do
                ✓ Full club control
                ✓ Delete club
                ✓ Promote to admin
                ✓ All management features
```

---

## Database Schema Relationships

```
users (1) ──── (many) club_members (many) ──── (1) clubs
           └────────────────────────────────┘
                  Junction Table
                  
       users (1) ──── (many) club_applications (many) ──── (1) clubs


clubs (1) ────────────────────── (many)
                   │
         ┌─────────┼─────────┬──────────────┬────────────┐
         │         │         │              │            │
    events      announcements campaigns  club_members club_dues
                              │
                              └─ (1) ──── (many) donations
                              └─ (1) ──── (many) duesPayments


events (1) ────── (many) rsvps
campaign (1) ──── (many) donations
clubDues (1) ──── (many) duesPayments
```

---

## Request Flow: Create Event

```
Officer in Club Dashboard
    │
    ▼
Clicks "Create Event"
    │
    ▼
Navigates to /events/create
    │
    ▼
┌─────────────────────────────────────┐
│  Frontend: EventCreate Component    │
│                                     │
│  - Form with fields:               │
│    - title (required)              │
│    - description (required)        │
│    - date (required)               │
│    - location (optional)           │
│    - capacity (optional)           │
│    - price (optional)              │
│                                     │
│  - Validation: Zod schema          │
│  - Error display: Toast + form     │
└─────────────────────────────────────┘
    │
    ▼
User fills form and submits
    │
    ▼
Frontend validates with Zod
    │
    ├─ Invalid? Show error on form
    │
    └─ Valid? Send to API
        │
        ▼
┌─────────────────────────────────────┐
│  POST /api/events                   │
│  Headers:                           │
│  - Content-Type: application/json   │
│  - Cookie: session_id=...           │
│                                     │
│  Body:                              │
│  {                                  │
│    title: "Club Social",            │
│    description: "...",              │
│    date: "2024-11-20T18:00:00Z",   │
│    location: "Campus Center",       │
│    clubId: "{club_id}",             │
│    price: 0 (in cents)              │
│    requiresPayment: false           │
│  }                                  │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Express Route Handler              │
│  (server/routes.ts)                 │
│                                     │
│  1. Extract user from session       │
│  2. Validate user authenticated     │
│  3. Validate user is officer/admin  │
│  4. Validate club ownership         │
│  5. Validate data (Zod schema)      │
│  6. Call storage.createEvent()      │
│  7. Return event object             │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  MemStorage.createEvent()           │
│                                     │
│  1. Generate UUID for event        │
│  2. Create Event object            │
│  3. Store in events Map (RAM)      │
│  4. Return event                   │
└─────────────────────────────────────┘
    │
    ▼
HTTP 200 OK
Response Body:
{
  id: "uuid-xxx",
  title: "Club Social",
  clubId: "club-xxx",
  date: "2024-11-20T18:00:00.000Z",
  location: "Campus Center",
  ...
}
    │
    ▼
Frontend receives response
    │
    ▼
┌─────────────────────────────────────┐
│  Frontend Success Handler           │
│                                     │
│  1. Show toast: "Event created!"   │
│  2. Invalidate query: club events  │
│  3. Invalidate query: user events  │
│  4. Navigate to /club/:id          │
└─────────────────────────────────────┘
    │
    ▼
User sees event in club detail page
Event appears in "My Events"
```

---

## Error Handling Flow

```
User submits form
        │
        ▼
Frontend validation (Zod)
        ├─ Invalid?
        │   ├─ Show field errors
        │   └─ Block submission
        │
        └─ Valid? Send to API
            │
            ▼
┌──────────────────────────────┐
│  Express Route Handler       │
│  - Authenticate user         │
│  - Authorize action          │
│  - Validate data             │
│  - Check business rules      │
└──────────────────────────────┘
            │
            ├─ Error?
            │   ├─ Return HTTP error code
            │   ├─ Include error message
            │   └─ Log error
            │
            └─ Success? Process request
                │
                ▼
            Return data
                │
                ▼
            Frontend receives response
                │
                ├─ Success?
                │   ├─ Show toast
                │   ├─ Update UI
                │   └─ Navigate if needed
                │
                └─ Error?
                    ├─ Show toast with message
                    ├─ Log for debugging
                    └─ Keep form visible

Examples of error scenarios:
- Invalid email format → Frontend Zod error
- Email already exists → Backend responds 409
- User not authenticated → Backend responds 401
- User not authorized → Backend responds 403
- Database error → Backend responds 500
- Network error → Frontend shows "Connection failed"
```

---

## Storage Layer Abstraction

```
┌──────────────────────┐
│   IStorage Interface │  ← Contract/definition
│  (server/storage.ts) │
│                      │
│  - getUser()         │
│  - createUser()      │
│  - getAllClubs()     │
│  - getClub()         │
│  - etc...            │
└──────────────────────┘
         │
         ├─ Implementation #1: MemStorage
         │  ├─ Uses: Map<string, Type>
         │  ├─ Speed: Instant (RAM)
         │  ├─ Durability: Lost on restart
         │  ├─ Setup: None needed
         │  └─ Use: Local development
         │
         └─ Implementation #2: SupabaseStorage
            ├─ Uses: PostgreSQL via Supabase
            ├─ Speed: Network dependent
            ├─ Durability: Persistent
            ├─ Setup: DATABASE_URL env var
            └─ Use: Production testing


To switch storage:
- MemStorage: Just use npm run dev (default)
- SupabaseStorage: Set DATABASE_URL, server auto-detects
```

---

## Sidebar Navigation Updates

```
User Action
    │
    ├─ Register/Login
    │   └─ Fetch user → Populate sidebar
    │
    ├─ Apply to club
    │   └─ Trigger: GET /api/user/clubs
    │       └─ Update: "Your Clubs" section
    │
    ├─ Get promoted to officer
    │   └─ Trigger: GET /api/user/club-roles
    │       └─ Update: Show "Dashboard" button
    │
    └─ Create event in club
        └─ Sidebar doesn't change
            (event is for members, not nav)


Sidebar Components:
┌──────────────────────────┐
│ Personal Section         │
│ - Home                   │
│ - Discover Clubs         │
│ - My Clubs               │
│ - My Events              │
│ - My Payments            │
│ - Notifications          │
└──────────────────────────┘
         │
┌──────────────────────────┐
│ Your Clubs (Dynamic)     │
│ Loaded via:              │
│ GET /api/user/clubs      │
│                          │
│ Shows:                   │
│ - Club name              │
│ - Your role badge        │
│ - Links to club detail   │
└──────────────────────────┘
         │
┌──────────────────────────┐
│ Club Management          │
│ (if officer/admin)       │
│                          │
│ Shows club list          │
│ - Dashboard link         │
│ - Manage submenus        │
└──────────────────────────┘
```

---

## Session & Authentication

```
Step 1: Register
User → POST /api/auth/register
       → Backend creates user + sets session
       → Response includes Set-Cookie header
       → Browser stores cookie

Step 2: Subsequent requests
Browser → Sends cookie with every request
       → Express reads cookie
       → Looks up session in MemoryStore
       → Finds user object
       → Continues with request

Step 3: Protected routes
If session not found:
  → Return 401 Unauthorized
  → Frontend redirects to /login
  → User not authenticated

Step 4: Logout
User → GET /api/auth/logout
    → Express destroys session
    → Clears cookie
    → Browser deletes cookie

Session Storage Hierarchy:
┌──────────────────────────┐
│  express-session         │  ← Middleware
│  (in-memory by default)  │
│                          │
│  Maps: sessionID → User  │
│                          │
│  In production:          │
│  - Use Redis store       │
│  - Use database store    │
│  - Never use memory      │
└──────────────────────────┘
```

This is everything you need to understand how Univo works locally!
