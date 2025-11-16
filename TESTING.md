# Local Testing Guide for Univo

## Quick Start

### 1. Setup Environment
```bash
# Copy the example environment file
cp .env.local.example .env.local

# Install dependencies (if not done)
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173 (Vite dev server with HMR)
- **Backend**: http://localhost:5000 (Express server)
- **API routes**: http://localhost:5000/api

### 3. Access the Application
Open http://localhost:5173 in your browser. The frontend will automatically proxy API requests to the backend.

---

## Testing the Full User Journey

### User Journey: Student → Club Member → Officer

#### 1. **Register a New User**
```
URL: http://localhost:5173/register

Fields:
- Username: testuser
- Email: test@example.com
- Password: Test123!
- First Name: John
- Last Name: Doe

Expected: Should redirect to /dashboard
```

#### 2. **Discover Clubs**
```
URL: http://localhost:5173/discover

Expected:
- Shows list of all available clubs
- Can search by club name/description
- Click "View Club" or club card to go to club detail
```

#### 3. **View Club Detail**
```
URL: http://localhost:5173/club/{clubId}

Expected:
- Shows club info, banner, description
- "Apply to Join" button visible
- Tabs for Announcements, Events, Members
```

#### 4. **Apply to Join Club**
```
Click "Apply to Join" on club detail page

Expected:
- Application submitted
- User added to my-clubs (pending)
- Toast notification shows success
```

#### 5. **View My Clubs**
```
URL: http://localhost:5173/my-clubs

Expected:
- Shows clubs user is member of
- Shows role badge (member/officer/admin)
- "View Club" and "Dashboard" buttons
- For officers: "Dashboard" button is clickable
```

#### 6. **Access Club Dashboard (Officer)**
```
URL: http://localhost:5173/club/{clubId}/dashboard

Expected:
- Stats cards showing: Members, Applications, Events, Announcements, Dues
- Tabs for: Overview, Members, Applications, Events, Announcements, Dues
- Quick action buttons for creating content
```

---

## Testing Specific Features

### Testing Club Management

#### Manage Members
```
URL: http://localhost:5173/club/{clubId}/manage-members

Test:
1. Search for a member by name
2. Change role: Member → Officer → Admin
3. Remove a member

Expected:
- Member list updates immediately
- Toast confirms actions
- Roles change reflect in sidebar
```

#### Manage Applications
```
URL: http://localhost:5173/club/{clubId}/manage-applications

Test:
1. View pending applications
2. Click "Accept" on an application
3. Check that member appears in club members list

Expected:
- Application status changes to "accepted"
- User becomes club member
- Member appears in manage-members page
```

#### Manage Dues
```
URL: http://localhost:5173/club/{clubId}/manage-dues

Test:
1. Click "Create New Dues"
2. Fill in:
   - Name: Fall 2024 Dues
   - Amount: $25.00
   - Due Date: 2024-12-31
3. Submit

Expected:
- Dues appears in Active Dues list
- Can deactivate dues
- Appears in my-payments for members
```

### Testing Events

#### Create Event
```
URL: http://localhost:5173/events/create

Test:
1. Fill in event details:
   - Title: Club Social
   - Description: Fall social event
   - Date: Pick future date/time
   - Location: Campus Center
   - Price: $0 (free)
2. Submit

Expected:
- Event created
- Appears in /events list
- Appears in club's events tab
```

#### View Events
```
URL: http://localhost:5173/events

Expected:
- Shows all available events
- Can filter by date, price, location
```

#### My Events
```
URL: http://localhost:5173/my-events

Expected:
- Shows upcoming events user registered for
- Shows past events with attendance

Test: Click "Attend" on an event to add to your events
```

### Testing Announcements

#### Create Announcement
```
URL: http://localhost:5173/announcements/create

Test:
1. Title: Important Meeting
2. Content: Meeting next Thursday
3. Send to: All Members
4. Submit

Expected:
- Announcement created
- Appears in club detail announcements tab
- Other members see it when viewing club
```

### Testing Campaigns

#### Create Campaign
```
URL: http://localhost:5173/campaigns/create

Test:
1. Title: Spring Trip Fund
2. Description: Help us fund our annual trip
3. Goal Amount: $5000
4. Add tiers:
   - $25 Supporter
   - $100 Sponsor
   - $250 Patron
5. Submit

Expected:
- Campaign created
- Shows in campaigns list
- Progress bar reflects current donations
```

### Testing Payments

#### View Payment History
```
URL: http://localhost:5173/my-payments

Expected:
- Summary cards show total paid/pending
- Tabs for pending/completed/failed payments
- Payment history with dates and amounts
```

---

## API Testing with cURL

### Authentication

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!"
  }' \
  -c cookies.txt
```

#### Get Current User
```bash
curl http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### Club Operations

#### Get All Clubs
```bash
curl http://localhost:5000/api/clubs
```

#### Get Club by ID
```bash
curl http://localhost:5000/api/clubs/{clubId}
```

#### Create Club (Officer)
```bash
curl -X POST http://localhost:5000/api/clubs \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Chess Club",
    "description": "Strategic thinking club",
    "category": "Academic",
    "email": "chess@school.edu"
  }'
```

#### Get User's Clubs
```bash
curl http://localhost:5000/api/user/clubs \
  -b cookies.txt
```

#### Apply to Club
```bash
curl -X POST http://localhost:5000/api/clubs/{clubId}/apply \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "coverLetter": "I love chess!"
  }'
```

### Events

#### Get Club Events
```bash
curl http://localhost:5000/api/clubs/{clubId}/events
```

#### Create Event
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "clubId": "{clubId}",
    "title": "Club Meeting",
    "description": "Weekly meeting",
    "date": "2024-11-20T18:00:00Z",
    "location": "Room 101",
    "price": 0,
    "requiresPayment": false
  }'
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Connection Issues (if using Supabase)
- Check DATABASE_URL in .env.local
- Verify Supabase credentials
- For local testing, just use MemStorage (no DATABASE_URL needed)

### CORS Issues
- The server is configured to serve the client
- If testing API separately, check server/routes.ts for CORS headers

### Session/Authentication Issues
- Sessions stored in memory for MemStorage
- Clear browser cookies and re-login if issues occur
- Check browser console for detailed errors

### Hot Module Replacement (HMR) Issues
- If frontend doesn't auto-refresh:
  - Hard refresh browser (Cmd+Shift+R on Mac)
  - Check browser console for errors
  - Verify server is running

---

## Development Workflow

### Making Changes
1. **Backend changes**: 
   - Edit files in `server/` or `shared/schema.ts`
   - Server auto-restarts (tsx watch mode)
   
2. **Frontend changes**:
   - Edit files in `client/src/`
   - Frontend auto-refreshes (Vite HMR)

3. **Type changes**:
   - Update `shared/schema.ts`
   - Run `npm run check` to verify types
   - Both server and client pick up changes

### Testing After Changes
1. For backend: Call API endpoints to test
2. For frontend: Refresh browser, test UI flow
3. For types: Run `npm run check` to catch errors

---

## Performance Notes

- **MemStorage**: Fast for testing, all data in memory
- **Supabase**: Production-like, requires network calls
- **No Stripe**: Payment endpoints available but don't charge

---

## Next Steps

When ready for production:
1. Set up real database (Supabase/PostgreSQL)
2. Configure environment variables
3. Add Stripe for real payments
4. Set up email notifications
5. Deploy to Vercel or similar

For now, local testing with MemStorage is perfect for development!
