# Univo Documentation Index

Welcome to Univo! Here's where to find everything you need.

## 🚀 Start Here

**New to the project?** Start with one of these:

1. **[STARTUP.txt](./STARTUP.txt)** - Visual quick reference (2 min read)
   - Project overview
   - Key features checklist
   - Important URLs
   - Common commands

2. **[QUICKSTART.md](./QUICKSTART.md)** - Fast reference (5 min read)
   - 30-second setup
   - Common commands table
   - Key URLs
   - API quick test examples

3. **[LOCAL_DEV.md](./LOCAL_DEV.md)** - Why test locally (10 min read)
   - Explains local vs Vercel
   - Development workflow
   - File structure
   - Debugging tips

## 📚 Deep Dives

**Want to understand the system?**

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Visual diagrams (15 min read)
  - Local setup diagram
  - Data flow examples
  - Request flow for create event
  - Error handling flow
  - Session management
  - Storage layer abstraction

- **[README_SETUP.md](./README_SETUP.md)** - Complete reference (20 min read)
  - Status overview
  - All features built
  - Project structure
  - Debugging tips
  - Next steps for production

## 🧪 Testing Guides

**Ready to test?**

- **[TESTING.md](./TESTING.md)** - Detailed feature guide (30 min read)
  - Full user journey workflow
  - Club management test procedures
  - Event/campaign/announcement tests
  - API testing with cURL
  - Troubleshooting section

- **[TEST_SCENARIOS.md](./TEST_SCENARIOS.md)** - 10 complete workflows (40 min read)
  - Scenario 1: Basic user flow
  - Scenario 2: Officer promotion
  - Scenario 3: Full member experience
  - Scenario 4: Dues management
  - Scenario 5: Campaign fundraising
  - Scenario 6: Admin hierarchy
  - Scenario 7: Search & filter
  - Scenario 8: Edge cases
  - Scenario 9: Session handling
  - Scenario 10: Multi-club officer
  - Quick checks & performance notes

## ⚙️ Configuration

- **[.env.local.example](./.env.local.example)** - Environment template
  - Copy to `.env.local` and update values
  - For MemStorage: No DATABASE_URL needed
  - For Supabase: Add DATABASE_URL

## 🗺️ Navigation by Role

### If you're new to the project:
1. Read STARTUP.txt (2 min)
2. Run `npm run dev`
3. Follow basic flow in QUICKSTART.md
4. Explore TEST_SCENARIOS.md for inspiration

### If you're a developer:
1. Read LOCAL_DEV.md (why local is better)
2. Read ARCHITECTURE.md (system design)
3. Start with `npm run dev`
4. Reference TESTING.md while testing

### If you need to debug:
1. Check "Troubleshooting" section in LOCAL_DEV.md
2. See error-handling diagrams in ARCHITECTURE.md
3. Use API examples in TESTING.md
4. Check browser DevTools Network tab

### If you're deploying:
1. See "When You're Ready for Production" in README_SETUP.md
2. Follow database setup instructions
3. Test with persistent Supabase database
4. Use production build: `npm run build`

## 📋 Quick Command Reference

```bash
# Development
npm run dev              # Start dev server (use this!)
npm run check            # Check TypeScript
npm run build            # Build for production
npm start                # Run production build

# Database
npm run db:push          # Push migrations (needs DATABASE_URL)

# Kill stuck processes
lsof -ti:5000 | xargs kill -9   # Port 5000
lsof -ti:5173 | xargs kill -9   # Port 5173
```

## 🎯 Key URLs When Running Locally

| Page | URL | Use |
|------|-----|-----|
| Register | http://localhost:5173/register | Create account |
| Login | http://localhost:5173/login | Sign in |
| Dashboard | http://localhost:5173/dashboard | Main hub |
| Discover | http://localhost:5173/discover | Browse clubs |
| My Clubs | http://localhost:5173/my-clubs | Your clubs |
| Club Detail | http://localhost:5173/club/:id | Club info |
| Club Dashboard | http://localhost:5173/club/:id/dashboard | Officer tools |
| My Events | http://localhost:5173/my-events | Your events |
| My Payments | http://localhost:5173/my-payments | Payment history |

## ✅ What's Implemented

- ✅ Complete user authentication
- ✅ Club discovery & membership
- ✅ Club management dashboard
- ✅ Event creation & management
- ✅ Announcements & communication
- ✅ Fundraising campaigns
- ✅ Membership dues tracking
- ✅ Payment history
- ✅ Role-based access control
- ✅ Dynamic sidebar navigation
- ✅ TypeScript (zero errors!)
- ✅ Database schema & migrations

## ⚠️ Known Limitations

- ❌ No real Stripe payments (placeholder only)
- ❌ No email notifications (infrastructure ready)
- ❌ No image uploads (use URLs)
- ❌ MemStorage data lost on restart (by design)

## 🆘 Need Help?

1. **Quick answer?** → Check QUICKSTART.md
2. **How does X work?** → See ARCHITECTURE.md diagrams
3. **Testing X feature?** → See TESTING.md or TEST_SCENARIOS.md
4. **Error message?** → Check TESTING.md troubleshooting
5. **Setting up Supabase?** → See README_SETUP.md
6. **Code question?** → Check source (it's well-documented!)

## 📊 Document Overview

| File | Purpose | Read Time | Best For |
|------|---------|-----------|----------|
| STARTUP.txt | Quick visual reference | 2 min | Getting oriented |
| QUICKSTART.md | Fast 2-page guide | 5 min | Quick reference |
| LOCAL_DEV.md | Why local testing rocks | 10 min | Understanding setup |
| ARCHITECTURE.md | Visual system diagrams | 15 min | Learning design |
| README_SETUP.md | Complete reference | 20 min | Full context |
| TESTING.md | Feature testing guide | 30 min | Testing features |
| TEST_SCENARIOS.md | 10 test workflows | 40 min | Complete workflows |

## 🚀 Ready to Start?

```bash
npm run dev
```

Then open http://localhost:5173 and explore!

---

**Version**: November 16, 2025
**Status**: Complete & Ready for Testing
**TypeScript**: Zero compilation errors ✅
