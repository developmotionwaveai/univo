# Univo Test Scenarios

Use this to manually test Univo locally. Each scenario is independent.

## Scenario 1: Basic User Flow (10 minutes)

**Goal**: Register, explore, join a club

### Steps
1. Go to http://localhost:5173/register
2. Fill in:
   - Username: `student1`
   - Email: `student1@school.edu`
   - Password: `Test123!`
   - First Name: Alex
   - Last Name: Smith
3. Click "Register"
4. Redirected to dashboard
5. Click "Discover Clubs" in sidebar
6. Search for a club or just click one
7. Click "View Club" on a club card
8. Click "Apply to Join"
9. Go to "My Clubs" - should see it pending
10. Refresh page - data persists during session

---

## Scenario 2: Officer Promotion & Club Management (15 minutes)

**Goal**: Become officer, manage club

### Setup
1. Complete Scenario 1 first
2. Need at least 2 users for this to be meaningful

### Steps (as first user - now officer)
1. In "My Clubs", find your club
2. Click "Dashboard" button
3. See club stats (members, applications, etc.)

#### Promote Another Member
1. Click "Members" tab on dashboard
2. Create another user account (student2) and apply to same club
3. As student1, go back to Manage Members
4. Search for student2
5. Change role from "Member" → "Officer"
6. Click role dropdown

#### Review Applications
1. As student1 (officer), click "Applications" tab
2. Create 3rd user (student3) and apply to club
3. Go to Manage Applications tab
4. See pending application from student3
5. Click "Accept"
6. student3 now appears in members list

#### Create Event
1. Click "Create Event" in dashboard
2. Fill:
   - Title: Club Social
   - Description: Casual hangout
   - Date: Tomorrow at 5pm
   - Location: Café
   - Price: $0
3. Click "Create Event"
4. Go to club detail page - event appears in Events tab

#### Post Announcement
1. Click "Create Announcement" in dashboard
2. Fill:
   - Title: Weekly Meeting
   - Content: Meeting on Thursday at 6pm
   - Send to: All Members
3. Click "Post Announcement"
4. Go to club detail - announcement appears

---

## Scenario 3: Full Member Experience (12 minutes)

**Goal**: Test all user features

### Setup
1. Register as `member1`
2. Apply to 2-3 different clubs
3. Have an officer accept your applications

### Steps
1. Go to "My Clubs"
   - Should see 2-3 clubs with "Member" role
   - Click "View Club" on each
   
2. Go to "My Events"
   - Should see events from your clubs
   - See "Attend" or "Registered" status
   
3. Go to "My Payments"
   - Stats: Total Paid, Pending, Transactions
   - Tabs for payment status
   - See pending dues if officer created them
   
4. Go to "My Clubs" → A club → See announcements
   - Should show announcements posted by officers

---

## Scenario 4: Dues Management (8 minutes)

**Goal**: Officer sets dues, member sees payment

### Setup
1. Officer account (from Scenario 2)
2. Have member in club

### Steps (as Officer)
1. Club Dashboard → "Dues" tab
2. Click "Create New Dues"
3. Fill:
   - Name: Fall Semester Dues
   - Amount: $25.00
   - Due Date: End of semester
4. Click "Create Dues"
5. See dues in "Active Dues" list

### Steps (as Member)
1. Go to "My Payments"
2. See new dues in "Pending" tab
3. Payment shows:
   - Amount: $25.00
   - Status: Pending
   - Due date

---

## Scenario 5: Campaign Fundraising (10 minutes)

**Goal**: Create campaign, see donation tiers

### Steps (as Officer)
1. Club Dashboard or go to http://localhost:5173/campaigns/create
2. Fill:
   - Title: Spring Trip Fund
   - Description: Help us go to regional conference
   - Goal: $5000
   - Deadline: Spring break
3. Add donation tiers:
   - $25 - Supporter (T-shirt)
   - $100 - Sponsor (Named in email)
   - $500 - Patron (Special recognition)
4. Click "Create Campaign"

### Steps (as Member or Public)
1. Go to http://localhost:5173/campaigns
2. See campaign with progress bar
3. Click campaign
4. See donation tiers with descriptions
5. (No real payment, but form structure is there)

---

## Scenario 6: Admin Promotes to Officer (8 minutes)

**Goal**: Simulate admin hierarchy

### Steps
1. Have 3 users in club (student1, student2, student3)
2. student1 is admin
3. student2 is officer

### As Admin (student1)
1. Go to Manage Members
2. Change student2 from Officer → Admin
3. Change student3 from Member → Officer

### Verify
1. student2 now sees "Dashboard" button in My Clubs
2. student3 sees "Dashboard" button
3. All can access /club/:id/dashboard path

---

## Scenario 7: Complex Search & Filter (10 minutes)

**Goal**: Test discovery experience

### Setup
1. Create 5-10 clubs with different categories
   - Academic: Math Club, CS Club
   - Sports: Running Club, Tennis Club
   - Arts: Photography Club, Art Club

### Steps
1. Go to Discover page
2. See all clubs in card grid
3. Search by name:
   - Type "Art" → only Art Club shows
   - Type "Club" → all clubs show (in name)
4. Filter by category (if implemented)
5. Click club card to view details

---

## Scenario 8: Edge Cases (15 minutes)

**Goal**: Test error handling

### Try These (Expect Errors)
1. **Invalid login**: Register as user1, try to login as different user
2. **Duplicate username**: Try to register twice with same username
3. **Apply twice**: Apply to club, apply again (should error)
4. **Remove yourself**: As officer, remove yourself from club
5. **Delete club with members**: Delete club that has members
6. **Invalid dues amount**: Try to create dues with $0
7. **Past due date**: Try to create dues with yesterday's date
8. **Capacity exceeded**: If event has capacity, exceed it

### Expected
- Helpful error messages in toasts
- Proper form validation
- Graceful error states
- No blank screens or crashes

---

## Scenario 9: Session & Authentication (8 minutes)

**Goal**: Test auth persistence

### Steps
1. Register and login
2. Go to dashboard (shows authenticated)
3. Refresh page - should stay logged in
4. Clear cookies in browser dev tools
5. Refresh - should redirect to login
6. Logout (if button exists)
7. Verify redirected to login
8. Try to access /dashboard directly - redirected to login

---

## Scenario 10: Multi-Club Officer (15 minutes)

**Goal**: Manage multiple clubs as officer

### Setup
1. Create 2 clubs as officer
2. Or join 2 clubs and get promoted to officer in both

### Steps
1. Go to "My Clubs"
2. See both clubs with "Officer" role
3. Click "Dashboard" on first club
4. Do some club operations (create event, etc.)
5. Go back to "My Clubs"
6. Click "Dashboard" on second club
7. See separate data (different members, events, etc.)
8. In sidebar, verify "Club Management" section shows all your clubs

### Verify
- Each club has separate:
  - Members list
  - Applications
  - Events
  - Announcements
  - Dues
- Creating content in one club doesn't affect the other

---

## Quick Checks

Run through these on each test:
- [ ] No console errors (check DevTools)
- [ ] API requests succeed (check Network tab)
- [ ] Forms validate properly
- [ ] Errors show helpful messages
- [ ] Data persists on page refresh
- [ ] Sidebar updates when roles change
- [ ] Images load without errors
- [ ] Responsive on mobile (test with browser resize)
- [ ] Toast notifications appear
- [ ] Buttons are clickable and responsive

---

## Performance Observations

**Expected behavior** (MemStorage):
- API responses: <10ms
- Page navigation: <100ms
- Search: Instant

**If you see slowness**:
- Check server console for errors
- Check browser Network tab for slow requests
- Look for TypeScript errors: `npm run check`

---

## Known Limitations (by design)

✗ No real email notifications
✗ No real Stripe payments (endpoints exist but no charges)
✗ Data lost on server restart (use Supabase for persistence)
✗ No image upload (use URLs)
✗ No real SMS notifications

✓ Everything else should work!

---

## Resetting Between Tests

To completely reset state:
1. Restart server: Ctrl+C then `npm run dev`
2. Clear browser cookies
3. All data clears (MemStorage)

To keep data:
1. Connect to Supabase database
2. Update DATABASE_URL in .env.local
3. Data persists between restarts
