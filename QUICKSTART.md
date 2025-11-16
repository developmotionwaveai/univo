# Univo Quick Reference

## Getting Started (30 seconds)

```bash
# 1. Start the dev server
npm run dev

# 2. Open browser
# Client:  http://localhost:5173
# API:     http://localhost:5000/api

# 3. Register at /register and start exploring!
```

## Common Commands

```bash
# Start development server
npm run dev

# Check TypeScript errors
npm run check

# Build for production
npm run build

# Run production build
npm start

# Push database migrations (if using Supabase)
npm run db:push
```

## Key URLs

| Page | URL | Purpose |
|------|-----|---------|
| Register | http://localhost:5173/register | Create account |
| Login | http://localhost:5173/login | Sign in |
| Dashboard | http://localhost:5173/dashboard | Main hub |
| Discover Clubs | http://localhost:5173/discover | Browse clubs |
| My Clubs | http://localhost:5173/my-clubs | Your memberships |
| Club Detail | http://localhost:5173/club/:id | View club |
| Club Dashboard | http://localhost:5173/club/:id/dashboard | Officer controls |
| Manage Members | http://localhost:5173/club/:id/manage-members | Edit roles |
| Manage Applications | http://localhost:5173/club/:id/manage-applications | Review joins |
| Manage Dues | http://localhost:5173/club/:id/manage-dues | Payment setup |
| My Events | http://localhost:5173/my-events | Your events |
| My Payments | http://localhost:5173/my-payments | Payment history |

## Testing a Feature

### Full Club Management Workflow

```bash
# 1. Register as user
http://localhost:5173/register

# 2. Browse clubs
http://localhost:5173/discover

# 3. Apply to a club
# Go to /club/:id → Click "Apply to Join"

# 4. Promote yourself to officer (in MemStorage, this is instant)
# Go to /club/:id/manage-members → Change your role to Officer

# 5. Create club content
# Dashboard → Create Event/Announcement/Campaign

# 6. Manage club
# - Members: Modify roles, remove users
# - Applications: Accept/reject pending
# - Dues: Create membership fees
```

## API Quick Test

### Register and Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test123!","firstName":"John","lastName":"Doe"}' \
  -c cookies.txt

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!"}' \
  -c cookies.txt

# Get current user
curl http://localhost:5000/api/auth/me -b cookies.txt
```

### Club Operations
```bash
# List all clubs
curl http://localhost:5000/api/clubs

# Get user's clubs
curl http://localhost:5000/api/user/clubs -b cookies.txt

# Apply to club (replace {clubId})
curl -X POST http://localhost:5000/api/clubs/{clubId}/apply \
  -H "Content-Type: application/json" \
  -d '{"coverLetter":"Interested!"}' \
  -b cookies.txt
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│     Browser (React + TypeScript)        │
│  http://localhost:5173 (Vite dev)      │
└──────────────────┬──────────────────────┘
                   │
                   │ API Requests
                   ▼
┌─────────────────────────────────────────┐
│   Express Server (tsx watch mode)       │
│  http://localhost:5000                 │
│  - Routes (server/routes.ts)           │
│  - Storage (MemStorage by default)     │
│  - Auth (express-session)              │
└─────────────────────────────────────────┘

Storage Options:
- MemStorage (default): All data in memory, fast, local only
- SupabaseStorage: Real database, production-like
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | `lsof -ti:5000 \| xargs kill -9` |
| Port 5173 in use | `lsof -ti:5173 \| xargs kill -9` |
| TypeScript errors | `npm run check` |
| Frontend not updating | Hard refresh: Cmd+Shift+R |
| Sessions not working | Clear cookies, re-login |
| API returns 500 | Check server console for errors |

## Key Features to Test

- ✅ User registration & authentication
- ✅ Club discovery & search
- ✅ Join/apply to clubs
- ✅ View club details & members
- ✅ Create & manage events
- ✅ Post announcements
- ✅ Create fundraising campaigns
- ✅ Officer role management
- ✅ Member application review
- ✅ Set up membership dues
- ✅ Payment history tracking

## Notes

- **Data is ephemeral**: When server restarts, data is lost (MemStorage)
- **No real payments**: Stripe endpoints exist but don't actually charge
- **No emails**: Notification infrastructure in place but not configured
- **Sessions in memory**: Using express-session with MemoryStore locally

For persistent testing, see TESTING.md for Supabase setup instructions.
