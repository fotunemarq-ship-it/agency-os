# FortuneMarq - Complete Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Application Features](#application-features)
5. [Database Schema](#database-schema)
6. [Routes & Pages](#routes--pages)
7. [Components Library](#components-library)
8. [Key Utilities & Libraries](#key-utilities--libraries)
9. [Design System](#design-system)
10. [Authentication & Authorization](#authentication--authorization)
11. [Recent Updates & Enhancements](#recent-updates--enhancements)

---

## Recent Updates & Enhancements

### Mobile Experience Overhaul
- **Unified Navigation System**: Replaced split layout logic with a single `LayoutWrapper` and `AppSidebar`.
- **Responsive Sidebar**: Implemented a smooth off-canvas sidebar for mobile devices with backdrop blur.
- **Mobile Header**: Added a sticky mobile header with easy access to the menu and branding.
- **Touch Optimizations**: Improved tap targets and overflow handling for better mobile usability.

### Sales Intelligence Cockpit
- **Lead Type Switching**: Seamless toggle between "Hot Inbound" and "Cold Outbound" leads.
- **Keyboard Shortcuts**: Added power-user shortcuts for rapid lead processing.
- **Split-Screen Layout**: Optimized desktop view for simultaneous information consumption and action.

---

## Overview

**FortuneMarq** is a comprehensive CRM and Project Management platform designed specifically for digital marketing agencies. The application streamlines the entire client lifecycle from lead generation and sales prospecting through project execution and client delivery.

### Core Purpose
- **Lead Management**: Import, track, and manage leads from various sources (inbound and outbound)
- **Sales Intelligence**: Data-driven selling with market insights, smart pitch generation, and lead type switching
- **Strategy Management**: Close deals with strategy sessions and pipeline management
- **Project Management**: Execute projects with task tracking and milestone management
- **Client Portal**: Self-service client dashboard for project visibility
- **Financial Analytics**: Revenue tracking, forecasting, and profitability analysis
- **Operations Dashboard**: Team workload, project health, and performance metrics

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16.0.7 (App Router with Turbopack)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Utilities**: 
  - `clsx` for conditional classes
  - `tailwind-merge` for class merging
  - `date-fns` for date formatting
  - `react-markdown` for markdown rendering

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (`@supabase/ssr` v0.8.0)
- **API**: Next.js Server Components & API Routes
- **Real-time**: Supabase real-time subscriptions

### Data Visualization
- **Charts**: Recharts v3.5.1

### Data Processing
- **CSV Parsing**: PapaParse v5.5.3

---

## User Roles & Permissions

The application supports six distinct user roles, each with specific dashboards and capabilities:

### 1. **Admin** (`/admin`)
- Full access to all features
- Command Hub with executive summary and key metrics
- Financial analytics and reporting
- Sales force management and analytics
- Strategy oversight and pipeline management
- Operations monitoring
- Lead upload capabilities (CSV import)
- Access to all dashboards and reports

### 2. **Sales Exec / Telecaller** (`/sales`)
- **Sales Intelligence Cockpit** - Redesigned unified interface
- Lead type switching (Inbound/Hot vs Outbound/Cold)
- Power dialer interface with one-click calling
- Market intelligence integration
- AI-powered pitch generation
- Call outcome tracking with keyboard shortcuts
- Industry and city filtering
- Strategy session booking
- Lead status updates and notes
- WhatsApp integration
- Session statistics tracking

### 3. **Strategist** (`/strategist`)
- Strategy pipeline management
- Qualified leads → Strategy booked → Strategy completed workflow
- Strategy session scheduling
- Deal closing capabilities with deal value tracking
- Win/loss tracking and analysis
- Lead conversion management

### 4. **Project Manager** (`/projects`)
- Project dashboard and overview
- Task assignment and management
- Milestone tracking and approval workflow
- Client communication interface
- Project timeline management
- Resource allocation and workload monitoring
- Project status updates

### 5. **Staff / Specialist** (`/staff`)
- Personal task dashboard
- Task execution and status updates
- Project assignments visibility
- Task completion tracking
- Time tracking capabilities

### 6. **Client** (`/client/dashboard`)
- Self-service project portal
- Milestone visibility and progress tracking
- Project status and timeline
- Project manager contact information
- Support access

---

## Application Features

### 1. Lead Management System

#### Lead Types
Leads are categorized into two types:
- **Inbound (Hot)**: Leads that have reached out to the agency (forms, referrals, etc.)
  - Displayed with flame icon (🔥)
  - Prioritized by creation date (newest first - speed to lead)
  - Source tracking (form, referral, etc.)
  - New inbound leads show count badge
- **Outbound (Cold)**: Leads that the agency is proactively reaching out to
  - Displayed with zap icon (⚡)
  - Prioritized by next_action_date and creation date
  - Traditional cold calling workflow

#### Lead Import
- **CSV Upload** (`/admin/upload`)
  - Bulk lead import via CSV files
  - Supported columns: Company Name, Contact Person, Phone, Email, Industry, City, Lead Type, Source
  - Automatic validation and error handling
  - Batch tracking with `import_batch_id`
  - Upload history tracking
  - Debug mode for troubleshooting

#### Lead Status Pipeline
Leads progress through the following statuses:
1. `new` - Freshly imported lead
2. `first_call_pending` - Ready for initial contact
3. `calling` - Currently being contacted
4. `contacted` - Initial contact made
5. `qualified` - Lead qualified for strategy session
6. `strategy_booked` - Strategy session scheduled
7. `strategy_completed` - Strategy session completed
8. `nurture` - Lead in nurturing phase
9. `closed_won` - Deal won
10. `closed_lost` - Deal lost
11. `disqualified` - Lead disqualified

#### Lead Assignment
- Sales Exec assignment (`assigned_sales_exec`)
- Strategist assignment (`assigned_strategist`)
- Next action date tracking
- Notes and call history
- Source tracking for inbound leads

### 2. Sales Intelligence & Power Dialer (Redesigned)

#### Sales Intelligence Cockpit Features
The redesigned sales page (`/sales`) features a modern, efficient interface:

**Split-Screen Layout**:
- **Left Panel (65%)**: Intelligence Cheat Sheet
  - Lead header with company name, contact person, phone number
  - Context badges (Industry, City, Search Volume, Website status)
  - AI-powered pitch card with copy-to-clipboard
  - Market intelligence data (search volume, competition, competitors)
  - Previous notes history
  - Industry and city filters (sticky header)

- **Right Panel (35%)**: Quick Actions
  - Navigation controls (Previous/Next with counter)
  - Book Strategy Call button (prominent)
  - 9-button action grid:
    - **Positive Actions (Green)**: Interested, Follow-up
    - **Retry Actions (Amber)**: No Answer, Not Reachable, Busy
    - **Negative Actions (Red)**: Not Interested, Wrong Number, Invalid Number
  - WhatsApp integration button
  - Call notes textarea
  - Session statistics (Calls, Hot leads, Follow-ups)

**Lead Type Switching**:
- Toggle between "Outbound / Cold" and "Inbound / Hot" leads
- New inbound leads show count badge
- Different sorting algorithms:
  - Inbound: Newest first (speed to lead)
  - Outbound: Next action date priority, then newest

**Advanced Filtering**:
- Industry filter dropdown (dynamic from leads)
- City filter dropdown (dynamic from leads)
- Filter combination support
- Filter summary with lead count
- Clear filters button

**Keyboard Shortcuts**:
- `1` - Mark as Interested (Qualified)
- `2` - Schedule Follow-up
- `3` - No Answer (move to end)
- `4` - Not Reachable (move to end)
- `5` - Not Interested (Disqualified)
- `W` - Open WhatsApp
- `N` / `→` - Next lead
- `P` / `←` - Previous lead

**Smart Features**:
- Lead scoring (0-100) displayed in top bar
- AI-powered pitch generation with service recommendation
- Market intelligence integration
- One-click phone calling
- Call outcome tracking with automatic status updates
- Next action date scheduling
- Real-time queue updates

#### Market Insights Integration
- Industry-specific search volume data
- Market difficulty analysis (low/medium/high)
- Top competitors information
- Pitch angle recommendations
- Location-based insights (city level)

#### Smart Pitch Engine (`lib/pitch-engine.ts`)
- **Context-Aware Pitch Generation**
  - Analyzes lead data (company, industry, city, website presence)
  - Incorporates market intelligence (search volume, competition)
  - Generates personalized pitch scripts
  - Recommends service type based on:
    - Website presence (SEO for no website, Performance Marketing for existing website)
    - Market competition levels
    - Search volume data
    - Industry and location patterns

- **Lead Scoring Algorithm (0-100)**
  - Factors: Market opportunity, competition level, website presence
  - Visual indicators: Green (80+), Blue (60-79), Gray (<60)

- **Service Recommendations**:
  - SEO (for businesses without websites)
  - Performance Marketing (for businesses with websites)
  - Local SEO (for location-based businesses)
  - Other service types based on market data

### 3. Strategy & Deal Management

#### Strategy Pipeline
- **Active Pipeline View**
  - Qualified leads ready for strategy sessions
  - Strategy booked leads (scheduled sessions)
  - Strategy completed leads (ready for deal closing)

- **Deal Closing Workflow**
  - Close deal modal with deal value input
  - Service type selection
  - Automatic project creation upon deal closure
  - Client record creation/linking
  - Deal status tracking (won, lost, accepted)

- **Win/Loss Analysis**
  - Closed won tracking
  - Closed lost tracking
  - Conversion rate analysis
  - Deal value aggregation

### 4. Project Management

#### Project Lifecycle
1. **Project Creation**
   - Automatic creation from closed deals
   - Manual project creation
   - Service type assignment
   - Client linking
   - Build type tracking

2. **Task Management**
   - Task templates by service type
   - Automatic task generation from templates
   - Task assignment to team members
   - Due date tracking with calculated offsets
   - Status updates (not_started, in_progress, completed, cancelled)
   - Task dependencies and ordering

3. **Milestone Tracking**
   - Milestone templates by service type
   - Automatic milestone generation
   - Status tracking (not_started, in_progress, completed, approved)
   - Order index for sequencing
   - Client-visible milestones

4. **Project Statuses**
   - `not_started` - Project created but not started
   - `in_progress` - Active project
   - `completed` - Project finished
   - `on_hold` - Temporarily paused
   - `cancelled` - Project cancelled

#### Service Types Supported
- `web_dev` - Web Development
- `web_design` - Web Design
- `seo` - SEO Services
- `ads` - Paid Advertising
- `social_media` - Social Media Marketing
- `branding` - Branding Services
- `local_seo` - Local SEO
- `performance_marketing` - Performance Marketing
- `whatsapp_marketing` - WhatsApp Marketing

### 5. Financial Analytics (`/admin/financials`)

#### Metrics Tracked
- **Total Revenue**: Sum of all closed won/accepted deals
- **Average Deal Value**: Mean value of closed deals
- **Pipeline Value**: Sum of all open deals
- **Weighted Forecast**: Probability-adjusted pipeline value
- **Monthly Revenue Trends**: Historical revenue analysis
- **Revenue by Service Type**: Service breakdown
- **Revenue by Source**: Lead source revenue attribution
- **Cash Flow Health**: Forecast vs. historical comparison

#### Visualizations
- Revenue pie charts (by service type)
- Revenue bar charts (by source)
- Monthly revenue trend line charts
- Cash flow health indicators

### 6. Sales Analytics (`/admin/sales`)

#### Metrics
- **Total Leads**: All leads in system (filtered by lead type)
- **Calls Logged**: Total call activities
- **Strategy Sessions Booked**: Qualified + booked leads
- **Contact Rate**: Percentage of leads contacted
- **Conversion Funnel**: Calls → Connected → Interested → Sessions Booked
- **Lead Status Distribution**: Visual breakdown of lead statuses

#### Visualizations
- Lead status distribution charts
- Call outcomes funnel chart
- Telecaller leaderboard (calls, sessions, conversions)
- Conversion rate metrics

### 7. Operations Dashboard (`/admin/operations`)

#### Metrics
- **Active Projects**: Projects in progress or not started
- **Total Tasks**: All tasks in system
- **Tasks Due Today**: Tasks with today's due date
- **Critical Overdue**: Tasks past due date
- **Stalled Projects**: Projects with no task activity in 7 days
- **At-Risk Projects**: Projects with overdue tasks or approaching deadlines

#### Visualizations
- Service distribution (active projects by type)
- Team load chart (tasks per team member)
- Task status distribution
- Task completion rates
- Stalled projects list
- At-risk projects list

### 8. Client Portal

#### Features
- Project overview and status
- Milestone roadmap visualization with progress tracking
- Progress percentage calculation
- Project manager contact information
- Support access
- Timeline (start date, estimated launch)
- Real-time project updates

### 9. Task Board (`/tasks`)

#### Features
- Kanban-style task board
- Task filtering and sorting
- Status updates
- Project and client context
- Due date indicators
- Assignment tracking

### 10. Command Hub (`/admin`)

#### Executive Dashboard
- **Financial Health Card**: Total revenue, quick access to financials
- **Sales Force Card**: Total leads, calls today, sales analytics
- **Strategy Engine Card**: Closed won count, close rate, strategy management
- **Operations Card**: Active projects, overdue tasks, operations dashboard

Each card provides:
- Key metrics at a glance
- Direct navigation to detailed dashboards
- Visual indicators and trends
- Quick action links

---

## Database Schema

### Core Tables

#### `leads`
```typescript
{
  id: string (UUID, Primary Key)
  company_name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  industry: string | null
  city: string | null
  status: LeadStatus (enum)
  lead_type: string | null ("inbound" | "outbound")
  source: string | null (for inbound leads: "form", "referral", etc.)
  assigned_sales_exec: string | null (UUID, FK to profiles)
  assigned_strategist: string | null (UUID, FK to profiles)
  import_batch_id: string | null
  next_action_date: string | null (date)
  notes: string | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### `market_insights`
```typescript
{
  id: string (UUID, Primary Key)
  industry: string
  city: string
  search_volume: string | null
  market_difficulty: string | null ("low" | "medium" | "high")
  top_competitors: Json | null (array of competitor names)
  pitch_angle: string | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### `deals`
```typescript
{
  id: string (UUID, Primary Key)
  lead_id: string | null (FK to leads)
  client_id: string | null (FK to clients)
  deal_value: number | null
  deal_probability: number | null
  status: string (won, lost, accepted, pending, etc.)
  service_type: string | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### `projects`
```typescript
{
  id: string (UUID, Primary Key)
  client_id: string | null (FK to clients)
  deal_id: string | null (FK to deals)
  name: string | null
  service_type: string | null
  build_type: string | null
  status: string (not_started, in_progress, completed, on_hold, cancelled)
  start_date: date | null
  deadline: date | null
  assigned_pm: string | null (FK to profiles)
  created_at: timestamp
  updated_at: timestamp
}
```

#### `tasks`
```typescript
{
  id: string (UUID, Primary Key)
  project_id: string | null (FK to projects)
  title: string | null
  description: string | null
  status: string (not_started, in_progress, completed, cancelled)
  assigned_to: string | null (UUID or name)
  due_date: date | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### `project_milestones`
```typescript
{
  id: string (UUID, Primary Key)
  project_id: string (FK to projects)
  name: string
  description: string | null
  status: string (not_started, in_progress, completed, approved)
  order_index: number
  created_at: timestamp
  updated_at: timestamp
}
```

#### `call_activities`
```typescript
{
  id: string (UUID, Primary Key)
  lead_id: string | null (FK to leads)
  created_by: string | null (FK to profiles)
  outcome: string | null
  notes: string | null
  created_at: timestamp
}
```

#### `clients`
```typescript
{
  id: string (UUID, Primary Key)
  business_name: string | null
  primary_email: string | null
  phone: string | null
  // ... other client fields
  created_at: timestamp
  updated_at: timestamp
}
```

#### `profiles`
```typescript
{
  id: string (UUID, Primary Key, FK to auth.users)
  full_name: string | null
  email: string | null
  role: string (admin, telecaller, strategist, pm, staff, client)
  // ... other profile fields
  created_at: timestamp
  updated_at: timestamp
}
```

#### `task_templates`
```typescript
{
  id: string (UUID, Primary Key)
  service_type: string
  name: string
  description: string | null
  offset_days: number (days from project start)
  order_index: number
  created_at: timestamp
  updated_at: timestamp
}
```

#### `milestone_templates`
```typescript
{
  id: string (UUID, Primary Key)
  service_type: string
  name: string
  description: string | null
  order_index: number
  created_at: timestamp
  updated_at: timestamp
}
```

#### `csv_uploads` (for tracking uploads)
```typescript
{
  id: string (UUID, Primary Key)
  filename: string
  total_rows: number
  successful_rows: number
  failed_rows: number
  uploaded_by: string | null (FK to profiles)
  created_at: timestamp
}
```

---

## Routes & Pages

### Public Routes
- `/` - Home/redirect page (redirects based on authenticated user role)
- `/login` - Authentication page with email/password

### Admin Routes
- `/admin` - Command Hub (executive dashboard with key metrics)
- `/admin/financials` - Financial analytics and revenue tracking
- `/admin/sales` - Sales analytics and performance metrics
- `/admin/strategy` - Strategy pipeline management
- `/admin/operations` - Operations dashboard with project health
- `/admin/upload` - CSV lead upload interface
- `/admin/upload/history` - Upload history and batch tracking
- `/admin/upload/debug` - Debug mode for upload troubleshooting

### Sales Routes
- `/sales` - Sales Intelligence Cockpit (redesigned unified interface)
- `/sales/pitch/[industry]/[city]` - Industry/City-specific pitch page

### Strategist Routes
- `/strategist` - Strategy Board (pipeline management for strategists)
- `/admin/strategy` - Strategy pipeline (shared with admin)

### Project Manager Routes
- `/projects` - Project dashboard with all projects
- `/projects/[id]` - Individual project details and management

### Staff Routes
- `/staff` - Staff task dashboard (personal task view)

### Client Routes
- `/client/dashboard` - Client portal (self-service dashboard)
- `/client-portal/[id]` - Client portal (alternate route with ID)

### General Routes
- `/tasks` - Task board (all tasks across projects)

---

## Components Library

### Admin Components (`components/admin/`)
- `funnel-chart.tsx` - Call outcomes funnel visualization
- `lead-status-chart.tsx` - Lead status distribution chart
- `monthly-revenue-chart.tsx` - Monthly revenue trends (line chart)
- `pipeline-bar-chart.tsx` - Pipeline value visualization
- `revenue-by-source-chart.tsx` - Revenue attribution by lead source
- `revenue-pie-chart.tsx` - Service type revenue breakdown
- `service-distribution-chart.tsx` - Project distribution by service type
- `task-completion-pie-chart.tsx` - Task completion statistics
- `task-status-chart.tsx` - Task status distribution
- `team-load-chart.tsx` - Team workload visualization

### Sales Components (`components/sales/`)
- `sales-intelligence-cockpit.tsx` - **Main redesigned sales dashboard component**
  - Split-screen layout (65/35)
  - Lead type switching integration
  - Industry/city filtering
  - AI pitch display
  - Market intelligence cards
  - Quick action buttons
  - Keyboard shortcuts
  - Session statistics
- `sales-lead-type-switcher.tsx` - **Lead type toggle component**
  - Outbound/Cold vs Inbound/Hot switching
  - New inbound count badge
  - Refresh functionality
  - Context provider for lead type state
- `sales-page-client.tsx` - **Client-side wrapper for Sales Page**
  - Manages `LeadTypeContext`
  - Composition of Switcher and Cockpit
- `call-outcome-modal.tsx` - Modal for logging call outcomes
- `lead-call-row.tsx` - Lead row with calling interface (legacy)
- `leads-list.tsx` - List of leads with filtering (legacy)
- `market-insight-card.tsx` - Market intelligence display card
- `power-dialer.tsx` - One-click calling interface (legacy)
- `strategy-booking-modal.tsx` - Book strategy session modal

### Project Components (`components/projects/`)
- `pm-dashboard.tsx` - Project manager dashboard
- `project-task-list.tsx` - Tasks for a project
- `task-manager.tsx` - Task management interface

### Staff Components (`components/staff/`)
- `staff-dashboard.tsx` - Staff member dashboard
- `task-execution-modal.tsx` - Task completion interface

### Strategist Components (`components/strategist/`)
- `close-deal-modal.tsx` - Deal closing interface with value input
- `strategist-pipeline.tsx` - Strategy pipeline view
- `strategy-session-modal.tsx` - Strategy session management

### Task Components (`components/tasks/`)
- `task-board.tsx` - Kanban-style task board
- `task-card.tsx` - Individual task card

### Client Portal Components (`components/client-portal/`)
- `client-milestone-list.tsx` - Milestone visualization with progress

### Layout Components (`components/layout/`)
- `app-shell.tsx` - *Legacy* Application shell (replaced by `LayoutWrapper`)
- `nav-sidebar.tsx` - *Legacy* Navigation sidebar

### UI Components (`components/ui/`)
- `app-sidebar.tsx` - **Main Application Sidebar & Mobile Menu**
  - Role-based dynamic navigation
  - **Mobile Header Integration**: Built-in header for mobile view
  - **Responsive Logic**: Overlay sidebar pattern for mobile, static for desktop
  - User profile and sign-out management
  - Active state tracking
- `layout-wrapper.tsx` - **Core Layout Wrapper**
  - route protection logic (public vs private)
  - Integrates `AppSidebar`
  - Handles main content padding/margin adjustments for responsiveness
- `fortune-marq-logo.tsx` - Logo component with size variants

### Dashboard Components (`components/dashboard/`)
- `csv-uploader.tsx` - CSV file upload and parsing component

---

## Key Utilities & Libraries

### `lib/supabase.ts`
- `createClient()` - Browser Supabase client (Client Components)
  - Uses `@supabase/ssr` for SSR-compatible client creation
- `createServerClient()` - Server Supabase client (Server Components)
  - Server-side data fetching with proper cookie handling

### `lib/supabase-server.ts`
- Server-side Supabase utilities
- Server client creation for API routes and Server Components

### `lib/pitch-engine.ts`
- **Smart Pitch Generation System**
- `generateSmartPitch(lead, marketData)` - Context-aware pitch generation
  - Analyzes lead data and market intelligence
  - Generates personalized pitch scripts
  - Recommends service types
- `calculateLeadScore(lead, marketData)` - Lead scoring algorithm (0-100)
  - Factors: market opportunity, competition, website presence
- `getServiceRecommendations()` - Service recommendations based on lead/market data
- **Service Logic**:
  - SEO recommended for businesses without websites
  - Performance Marketing for businesses with existing websites
  - Local SEO for location-based businesses
  - Web Development/Design based on market competition

### `lib/project-utils.ts`
- `generateProjectTasks(projectId, serviceType)` - Auto-generate tasks from templates
- `generateProjectMilestones(projectId, serviceType)` - Auto-generate milestones from templates
- Task and milestone template matching logic

### `lib/utils.ts`
- Utility functions for class merging (`cn` function)
- Formatting utilities
- Type helpers

---

## Design System

### Color Palette
- **Background**: `#0f0f0f` (Rich Black) / `#0a0a0a` (Pure Black)
- **Surface**: `#1a1a1a` (Dark Gray)
- **Primary/Accent**: `#42CA80` (Success Green) / `#3ab872` (Dark Green)
- **Text Primary**: `#ffffff` (White)
- **Text Muted**: `#a1a1aa` (Light Gray) / `#666` (Medium Gray)
- **Borders**: `#1a1a1a` (Dark Gray) / `#333` (Lighter Gray)
- **Success**: `#42CA80` (Green)
- **Warning**: `#fbbf24` (Amber) / `#fb923c` (Orange)
- **Error**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue) / `#60a5fa` (Light Blue)

### Typography
- **Font Family**: Geist Sans (primary), Geist Mono (code/numbers)
- **Font Sizes**: Responsive scaling with Tailwind utilities
- **Font Weights**: 
  - Regular: 400
  - Medium: 500
  - Semibold: 600
  - Bold: 700

### Component Patterns
- **Cards**: 
  - Rounded corners (`rounded-2xl`, `rounded-xl`)
  - Border (`border-[#1a1a1a]`)
  - Gradient backgrounds for highlights
  - Backdrop blur for overlays
- **Buttons**: 
  - Primary: `bg-[#42CA80]` with hover states
  - Secondary: Border with hover fill
  - Ghost: Transparent with hover background
  - Transition effects (`transition-all`)
  - Active states with scale (`active:scale-[0.98]`)
- **Modals**: 
  - Backdrop blur
  - Centered positioning
  - Dark overlay (`bg-black/60`)
  - Rounded corners
- **Charts**: 
  - Dark theme
  - Accent color highlights
  - Responsive sizing
  - Custom tooltips

### Responsive Design
- **Mobile-First Approach**: All components designed for mobile first
- **Navigation**:
  - **Desktop**: Fixed sidebar (288px width, `md:w-72`)
  - **Mobile**: Collapsible sidebar with hamburger menu header
  - **Overlay**: Backdrop blur overlay when mobile menu is open
  - **Interaction**: Touch-friendly targets (>44px)
- **Breakpoints**: 
  - `sm:` - 640px (small tablets)
  - `md:` - 768px (tablets)
  - `lg:` - 1024px (desktops)
  - `xl:` - 1280px (large desktops)
- **Mobile Optimizations**:
  - Sticky headers for easy access
  - Scrollable content areas
  - Hidden overflow on body when modals/menus open
  - Touch-friendly button sizes
  - Responsive grid layouts

### Animation & Transitions
- **Framer Motion**: For complex animations (page transitions, list animations)
- **CSS Transitions**: For hover states and micro-interactions
- **Loading States**: 
  - Spinner animations
  - Skeleton loaders
  - Progressive loading
- **Toast Notifications**: Slide-in animations with auto-dismiss

### UI Patterns
- **Split-Screen Layouts**: 65/35 or 60/40 splits for detail/action views
- **Sticky Headers**: Filters and navigation stick to top on scroll
- **Badge System**: Status indicators, counts, and labels
- **Context Menus**: Dropdown filters and actions
- **Keyboard Navigation**: Full keyboard support for power users

---

## Authentication & Authorization

### Authentication Flow
1. User accesses application at `/`
2. System checks for authenticated user via Supabase Auth
3. If not authenticated → redirect to `/login`
4. If authenticated → fetch user role from `profiles` table
5. If no profile → check `clients` table by email
6. Default role → `staff` if no role found
7. Redirect to role-specific dashboard based on role

### Role-Based Routing
```typescript
{
  admin: "/admin",
  telecaller: "/sales",
  strategist: "/strategist",
  pm: "/projects",
  staff: "/staff",
  client: "/client/dashboard"
}
```

### Authentication Implementation
- **Client Components**: Use `createClient()` from `@/lib/supabase`
- **Server Components**: Use `createServerClient()` from `@/lib/supabase-server`
- **Session Management**: Handled by Supabase Auth with SSR support
- **Protected Routes**: Server-side checks in page components

### Security
- Supabase Row Level Security (RLS) policies (database-level)
- Environment variables for sensitive data (`.env.local`)
- Server-side authentication checks on all protected routes
- Client-side role verification for UI rendering
- Secure cookie handling via `@supabase/ssr`

---

## Recent Updates & Enhancements

### December 2024 - Sales Intelligence Cockpit Redesign

#### Major Features Added:

1. **Unified Sales Interface**
   - Redesigned `/sales` page with split-screen layout
   - Integrated lead type switching (Inbound/Outbound)
   - Combined power dialer and intelligence features

2. **Lead Type Management**
   - Inbound vs Outbound lead categorization
   - Visual indicators (Flame for Inbound, Zap for Outbound)
   - Different sorting algorithms for each type
   - New inbound lead count badges
   - Source tracking for inbound leads

3. **Advanced Filtering**
   - Industry filter dropdown (dynamic)
   - City filter dropdown (dynamic)
   - Combined filter support
   - Filter summary display
   - Clear filters functionality

4. **Keyboard Shortcuts**
   - Full keyboard navigation support
   - Number keys (1-5) for quick actions
   - Arrow keys for navigation
   - W key for WhatsApp
   - Visual keyboard hints

5. **Enhanced UI/UX**
   - Split-screen 65/35 layout
   - Sticky filter bar
   - Context badges for quick info
   - AI pitch card with copy functionality
   - Market intelligence cards
   - Session statistics tracking
   - Toast notifications

6. **Performance Improvements**
   - Optimized lead filtering and sorting
   - Memoized computations
   - Efficient state management
   - Real-time queue updates

### Code Quality Improvements
- Removed duplicate code across multiple components
- Fixed React hook dependencies
- Improved TypeScript type safety
- Enhanced error handling
- Logo path standardization
- Component cleanup and organization

---

## Key Features Summary

### ✅ Fully Implemented Features

#### Lead Management
- ✅ Multi-type lead system (Inbound/Outbound)
- ✅ CSV bulk import with validation
- ✅ Lead type switching interface
- ✅ Source tracking for inbound leads
- ✅ Lead pipeline with status tracking
- ✅ Industry and city filtering
- ✅ Lead assignment (Sales Exec, Strategist)
- ✅ Next action date scheduling

#### Sales Intelligence
- ✅ Redesigned Sales Intelligence Cockpit
- ✅ AI-powered pitch generation
- ✅ Lead scoring algorithm (0-100)
- ✅ Market intelligence integration
- ✅ Industry/city filtering
- ✅ Keyboard shortcuts (full support)
- ✅ One-click calling workflow
- ✅ WhatsApp integration
- ✅ Strategy session booking
- ✅ Call outcome tracking
- ✅ Session statistics

#### Strategy & Deals
- ✅ Strategy pipeline management
- ✅ Deal closing workflow
- ✅ Win/loss tracking
- ✅ Deal value tracking
- ✅ Automatic project creation from deals

#### Project Management
- ✅ Project lifecycle management
- ✅ Task templates and auto-generation
- ✅ Milestone templates and tracking
- ✅ Task assignment and tracking
- ✅ Project status management
- ✅ Build type tracking

#### Analytics & Reporting
- ✅ Financial analytics (revenue, forecasting)
- ✅ Sales analytics (leads, calls, conversions)
- ✅ Operations dashboard (projects, tasks, health)
- ✅ Command Hub (executive summary)
- ✅ Revenue by service type
- ✅ Revenue by source
- ✅ Team workload tracking

#### Client Portal
- ✅ Self-service dashboard
- ✅ Milestone visibility
- ✅ Project progress tracking
- ✅ PM contact information

#### Infrastructure
- ✅ Multi-role authentication
- ✅ Role-based dashboards
- ✅ Responsive design (mobile-first)
- ✅ Dark theme UI
- ✅ Real-time updates
- ✅ Error handling and validation

### 🔄 Data Flow Highlights

1. **Lead → Deal → Project → Tasks**
   - Lead imported (with type and source) → Sales calls (with lead type filtering) → Strategy session → Deal closed → Project created → Tasks auto-generated

2. **Market Intelligence → Smart Pitches**
   - Market insights stored → Pitch engine analyzes → Contextual pitches generated → Sales team uses pitches → Lead scoring calculated

3. **Task Templates → Project Tasks**
   - Service type selected → Templates matched → Tasks created with calculated due dates → Assigned to team members

4. **Deal Closure → Client Record**
   - Deal won → Client record created/linked → Project assigned → PM notified → Milestones generated

5. **Inbound Lead Workflow**
   - Lead received (form/referral) → Marked as inbound → Prioritized (newest first) → Quick response workflow → Higher conversion focus

---

## Environment Variables

Required environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional (for server-side operations):
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (server-only, never expose to client)
```

---

## Build & Deployment

### Development
```bash
npm run dev
```
- Starts Next.js dev server with Turbopack
- Hot module replacement enabled
- Runs on `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```
- Creates optimized production build
- Runs production server

### Linting
```bash
npm run lint
```
- Runs ESLint with Next.js config

### Project Structure
```
/app                    # Next.js App Router pages
  /admin               # Admin routes
  /sales               # Sales routes
  /projects            # Project routes
  /staff               # Staff routes
  /client              # Client routes
/components            # React components
  /admin              # Admin components
  /sales              # Sales components
  /projects           # Project components
  /ui                 # UI components
/lib                   # Utility libraries
/public                # Static assets
/types                 # TypeScript type definitions
supabase/migrations    # Database migrations
```

---

## Future Enhancements (Noted in Code)

### Planned Features
- Enhanced task drag-and-drop (full Kanban support)
- Advanced reporting and exports (PDF, Excel)
- Email notifications for key events
- Calendar integrations (Google Calendar, Outlook)
- Mobile app support (React Native)
- Advanced analytics and AI insights
- Lead enrichment (automatic data enhancement)
- Multi-language support
- Custom workflows and automation
- Integration with external tools (Slack, Zapier)

### Technical Improvements
- Full RLS policy implementation documentation
- Performance optimization (image optimization, code splitting)
- Enhanced caching strategies
- Real-time collaboration features
- Advanced search functionality
- Bulk operations interface
- Audit logging
- Backup and restore functionality

---

## Support & Documentation

For additional support or documentation updates:
- Refer to the codebase comments and TypeScript type definitions
- Check component prop interfaces for usage examples
- Review database types in `types/database.types.ts`
- Contact the development team for questions

---

## Version Information

**Document Version**: 2.0  
**Last Updated**: December 12, 2024  
**Application Version**: Next.js 16.0.7  
**Node Version**: Compatible with Node.js 18+  
**Package Manager**: npm

### Recent Version Highlights
- **v2.0** (December 2024): Sales Intelligence Cockpit redesign, Lead type management, Advanced filtering
- **v1.0** (Initial): Core CRM and Project Management features

---

**© 2024 FortuneMarq. All rights reserved.**
