# Univo Campus Clubs Platform - Design Guidelines

## Design Approach
**System-Based Design**: Strict adherence to the provided Whop-inspired CSS variable system and component library. All visual elements must match the exact specifications provided in the root variables file.

## Core Design Principles

### 1. Typography System
- **Font Family**: Inter (via `--whop-font-inter`)
- **Size Scale**: Use predefined `.fui-r-size-*` classes (1-6)
  - Size 1: 12px/16px (labels, captions)
  - Size 2: 14px/20px (body text, table data)
  - Size 3: 16px/24px (primary body, form inputs)
  - Size 4: 18px/28px (section headings)
  - Size 5: 20px/28px (page titles)
  - Size 6: 24px/32px (hero headings)
- **Weights**: Medium (500), Semi-bold (600), Bold (700)

### 2. Layout System
- **Grid Structure**: `var(--dashboard-sidebar-width)` (260px) + fluid content area
- **Sidebar**: Substantial, grouped navigation with clear sections:
  - General (Dashboard, Members, Applications)
  - Events (All Events, Create Event, Tickets)
  - Fundraising (Campaigns, Create Campaign, Donors)
  - Announcements (All Announcements, Create, Notifications)
  - Settings (Club Settings, Preferences)
- **Spacing**: Use 12px, 16px, 24px, 32px based on `--root-container-padding`
- **Container Padding**: 24px standard

### 3. Component Library

**Cards**:
- Use `.elevated-card` class: 16px border-radius, 24px padding
- Background: `var(--panel-elevation-a3)`
- Border: `var(--gray-a5)` (1px)
- Subtle shadow: `0px 1px 2px 0px rgba(0, 0, 0, 0.05)`

**Buttons**:
- Variants: solid (primary), soft (secondary), surface (outlined), ghost (minimal)
- Padding: 8px 16px, border-radius: 8px
- Icon buttons: 32px × 32px

**Navigation Items**:
- Height: 48px, padding: 0 12px
- Border-radius: 12px
- Active state background: `var(--accent-a3)`

**Badges/Status Indicators**:
- Padding: 2px 8px, border-radius: 6px
- Font-size: 12px, weight: 500

### 4. Color Application
- **Backgrounds**: `var(--gray-2)` for page, `var(--panel-solid)` for cards
- **Borders/Strokes**: `var(--stroke)`
- **Text**: `var(--gray-12)` primary, `var(--gray-11)` secondary, `var(--gray-a10)` tertiary
- **Accent**: `var(--accent-9)` (blue #3b82f6) for primary actions
- **Status Colors**: Success (`--success-9`), Warning (`--warning-a11`), Danger (`--danger-9`)

### 5. Module-Specific Layouts

**Member Management Dashboard**:
- Table view with elevated-card wrapper
- Member rows: avatar (32px circle) + name + role badge + status + actions
- Filter bar: soft variant buttons for role/status filters

**Form Builder**:
- Drag-and-drop field list in left panel (200px width)
- Live preview in center elevated-card
- Field configuration sidebar (280px) on right

**Event Landing Pages**:
- Hero section: Event banner image (16:9 ratio, full-width)
- Overlay gradient for text readability
- Buttons with blurred backgrounds when on images
- Details grid: 2-column layout (event info + ticket purchase card)

**Campaign Pages**:
- Progress bar: height 12px, rounded, animated fill
- Donation tiers: grid of elevated-cards (3 columns on desktop)
- Donor wall: avatars + names in masonry grid

**Announcements**:
- Message composer: elevated-card with rich text editor
- Recipient selector: checkbox list with member avatars
- Notification center: timeline view with unread indicators (blue dot)

### 6. Responsive Behavior
- Sidebar collapses to icon-only on tablet (<1024px)
- Tables switch to card view on mobile (<768px)
- Grid columns: 3→2→1 as viewport narrows

### 7. Interactive States
- All buttons/links: 0.15s ease transitions
- Hover: subtle background change (`var(--gray-a3)`)
- No custom animations beyond provided transitions
- Focus states: 2px accent-colored outline

## Images
- **Event Banners**: 1200×675px hero images for event pages
- **Campaign Headers**: 1200×400px images for fundraising campaigns
- **Member Avatars**: 32px circles throughout, 64px on profile pages
- **Club Logo**: 48px square in sidebar header

This design system ensures visual consistency across all modules while maintaining the sophisticated, data-dense aesthetic shown in the provided screenshots.