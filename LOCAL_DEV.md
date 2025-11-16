# Local Development Guide

## TL;DR - Get Running in 2 Steps

```bash
# 1. Start dev server
npm run dev

# 2. Open browser to http://localhost:5173
# That's it! Full app running locally
```

---

## What You Get

- **Frontend**: http://localhost:5173 (React with hot reload)
- **Backend API**: http://localhost:5000/api
- **In-Memory Storage**: All data ephemeral (lost on restart)
- **Full Authentication**: Session-based auth working
- **No Database**: Not needed for local testing

---

## Why Local is Better Than Vercel for Testing

| Feature | Local | Vercel |
|---------|-------|--------|
| Speed | Instant | Network dependent |
| Debugging | Full access | Limited |
| Hot reload | Works great | Limited |
| Cost | Free | Free but slowdown |
| Data | Ephemeral | Persists |
| Error messages | Detailed | May be hidden |
| **Testing** | **✅ Great** | **❌ Difficult** |

---

## The Problem You Had

When you deployed to Vercel:
1. Frontend and backend became separate services
2. CORS issues appeared
3. Session handling broke
4. Environment variables misconfigured
5. Hard to debug production issues

**Solution**: Test locally first where everything is one process!

---

## Architecture (Simple)

```
npm run dev
    ↓
    Starts Express server on :5000
    Serves Vite client dev server on :5173
    Client auto-proxies /api to backend
    Session middleware works
    No CORS issues
    Perfect for testing
```

---

## Testing Process

### 1. Basic Flow (5 min)
```
Register → Login → Dashboard → Discover → Apply to Club
```

### 2. Officer Features (10 min)
```
Promote to Officer → Dashboard → Manage Members → Create Event
```

### 3. Member Features (5 min)
```
My Clubs → My Events → My Payments
```

### 4. Full Test (20 min)
See TEST_SCENARIOS.md for detailed scenarios

---

## When You Need to Debug

### Frontend Issues
```
Open http://localhost:5173
Ctrl+Shift+I (DevTools)
See errors immediately
Hot reload on save
```

### Backend Issues
```
Look at console where you ran npm run dev
See all API logs
See errors with stack traces
Restart to reset data
```

### API Issues
```
Use cURL or Postman:
curl http://localhost:5000/api/clubs

Or test right in browser Network tab
```

---

## Key Difference From Vercel

**Vercel (broken)**:
- Frontend built as static HTML
- Deployed separately
- CORS configured wrong
- Sessions don't work across requests
- Hard to see real errors

**Local (working)**:
- Frontend served by same Express server
- No CORS because same origin
- Sessions work perfectly
- All errors visible in console
- Super fast iteration

---

## Common Tweaks

### If Port 5000 is In Use
```bash
lsof -ti:5000 | xargs kill -9
npm run dev
```

### If Frontend Isn't Updating
```bash
Hard refresh: Cmd+Shift+R on Mac
Ctrl+Shift+R on Windows
```

### If You Want Fresh Data
```bash
Ctrl+C (stop server)
npm run dev (restart)
All data resets
```

### If TypeScript Errors Appear
```bash
npm run check
Fix any errors
Server auto-restarts
```

---

## Using Persistent Database (Optional)

If you want data to survive restarts:

```bash
# 1. Create Supabase project (free tier)
# https://supabase.com

# 2. Copy connection string to .env.local
DATABASE_URL=postgresql://...

# 3. Push schema
npm run db:push

# 4. Restart npm run dev
# Now uses Supabase instead of MemStorage
```

But for initial testing, **MemStorage is better**:
- Instant
- No credentials needed
- Can nuke data anytime
- Perfect for development

---

## File Structure for Local Dev

```
CampusClubsHub/
├── client/              ← Frontend code
│   └── src/
│       ├── pages/      ← Route pages
│       ├── components/ ← React components
│       └── App.tsx     ← Main routes
├── server/              ← Backend code
│   ├── routes.ts       ← API endpoints
│   ├── storage.ts      ← Data layer
│   └── index.ts        ← Express setup
├── shared/              ← Shared types
│   └── schema.ts       ← Database schema
├── package.json         ← Dependencies & scripts
└── .env.local          ← Local config (YOU CREATE)
```

When you do `npm run dev`:
1. tsx watches `server/` and `shared/`
2. Vite watches `client/src/`
3. Both auto-restart/reload on file changes

---

## Workflow for Development

1. **Make change** (frontend or backend)
2. **Save file**
3. **See result immediately**
   - Frontend: Auto-refresh in browser
   - Backend: Auto-restart server
4. **Check for errors**
   - Browser console
   - Server logs
5. **Test in browser**

That's it! Way better than Vercel where you have to:
1. Commit
2. Wait for build
3. Deploy
4. Check errors (if visible)
5. Make fix
6. Repeat

---

## Deploy Later

Once local testing is solid:

```bash
# Build for production
npm run build

# This creates dist/ folder
# Deploy that to Vercel/Netlify/wherever

# Locally test the build:
npm start
# Server on :5000
# Client served from dist/public/
```

But that's later. For now, focus on `npm run dev`!

---

## Questions?

- Error in console? Check TESTING.md for detailed guides
- Want more test scenarios? See TEST_SCENARIOS.md
- Need API examples? See TESTING.md cURL section
- Want quick reference? See QUICKSTART.md

**TL;DR: `npm run dev` then open http://localhost:5173** ✅
