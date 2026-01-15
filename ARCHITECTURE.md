# LibLog - Architecture Documentation

## Project Overview

LibLog is a serverless React application for tracking library study hours. It features authentication, session logging, statistics visualization, and a social leaderboard system.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| State Management | React Hooks + Custom Hooks |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Testing | Vitest + React Testing Library |
| Hosting | GitHub Pages (Static) |
| CI/CD | GitHub Actions |

## Directory Structure

```
liblog/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Navbar.tsx
│   │   └── LoadingSpinner.tsx
│   │
│   ├── features/                # Feature-specific logic
│   │   └── logging/
│   │       ├── LogForm.tsx      # Add/edit logs
│   │       └── LogList.tsx      # Display logs
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Authentication state
│   │   ├── useLogs.ts           # Logs data fetching
│   │   └── useFriends.ts        # Friends data fetching
│   │
│   ├── pages/                   # Full-page components
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx    # Main page
│   │   ├── StatisticsPage.tsx   # Charts & stats
│   │   ├── LeaderboardPage.tsx  # Friends comparison
│   │   └── FriendsPage.tsx      # Friend management
│   │
│   ├── services/                # Supabase API integration
│   │   ├── supabase.ts          # Client initialization
│   │   ├── auth.ts              # Auth functions
│   │   ├── logs.ts              # Logs CRUD
│   │   └── friends.ts           # Friends management
│   │
│   ├── styles/                  # Global styles
│   │   └── globals.css
│   │
│   ├── types/                   # TypeScript types
│   │   └── supabase.ts          # Database types
│   │
│   ├── utils/                   # Utility functions
│   │   ├── time.ts              # Time calculations
│   │   └── streak.ts            # Streak calculations
│   │
│   ├── test/                    # Tests
│   │   ├── setup.ts
│   │   ├── time.test.ts
│   │   ├── streak.test.ts
│   │   └── LogForm.test.tsx
│   │
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── vitest.config.ts         # Test config
│
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI/CD
│
├── public/                      # Static assets
│
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind config
├── postcss.config.js            # PostCSS config
├── package.json
├── SQL_SCHEMA.sql               # Database schema
├── SETUP.md                     # Setup guide
├── ARCHITECTURE.md              # This file
└── README.md
```

## Data Flow Architecture

### Authentication Flow

```
User Input (Login/Signup)
    ↓
LoginPage / SignupPage
    ↓
auth.ts (signIn / signUp)
    ↓
Supabase Auth
    ↓
useAuth Hook (monitors session)
    ↓
App.tsx (protected routes)
    ↓
Protected Pages
```

### Logging Flow

```
User submits LogForm
    ↓
calculateDurationMinutes() utility
    ↓
logs.ts (addLog)
    ↓
Supabase logs table
    ↓
useLogs Hook (re-fetches)
    ↓
DashboardPage component update
```

### Statistics Flow

```
useLogs Hook
    ↓
Raw logs data
    ↓
useMemo calculations
    ↓
Aggregated data by week/month/day
    ↓
Recharts components
    ↓
Visual charts
```

### Friends/Leaderboard Flow

```
useFriends Hooks
    ↓
Pending requests / Accepted friends
    ↓
FriendsPage for management
    ↓
getTotalHoursByUser() for each friend
    ↓
LeaderboardPage sorting
    ↓
Ranked display
```

## Database Schema

### Tables

#### `profiles`
- Links to Supabase `auth.users`
- Stores display name for each user
- RLS: Users can view own + accepted friends' profiles

#### `logs`
- Stores hours entries with date, start/end times, duration
- References user via user_id
- RLS: Users can only access their own logs

#### `friendships`
- Self-referential join table
- Status: pending | accepted
- Prevents duplicate requests via UNIQUE constraint
- RLS: Users can manage own friendships

### Indexes
- `logs(user_id, date)` for fast filtering
- `friendships(user_id, friend_id, status)` for queries

### RLS Policies
- **Profiles**: View own, view friends' (accepted only)
- **Logs**: CRUD own only
- **Friendships**: View own, create requests, update received requests

## Component Hierarchy

```
App
├── Router (React Router)
│   ├── LoginPage
│   ├── SignupPage
│   ├── Navbar (when authenticated)
│   ├── DashboardPage
│   │   ├── Card (stats)
│   │   ├── LogForm
│   │   │   ├── Input
│   │   │   └── Button
│   │   └── LogList
│   │       └── Card
│   ├── StatisticsPage
│   │   ├── Card
│   │   └── Recharts components
│   ├── LeaderboardPage
│   │   └── Card
│   └── FriendsPage
│       ├── Input
│       ├── Button
│       └── Card
```

## Utility Functions

### `utils/time.ts`
- `calculateDurationMinutes()` - Handles sessions crossing midnight
- `formatDuration()` - Converts minutes to "Xh Ym" format
- `getStartOfWeek/Month/Day()` - Date calculations

### `utils/streak.ts`
- `calculateStreak()` - Consecutive days visited counter
- `getUniqueDates()` - Extract unique dates from logs

## Custom Hooks

### `useAuth()`
- Returns current user and loading state
- Listens to auth state changes
- Auto-updates on login/logout

### `useLogs(userId, startDate?, endDate?)`
- Fetches user's logs
- Supports date range filtering
- Updates on dependency change

### `useTotalHours(userId)`
- Calculates aggregate hours
- Useful for leaderboard

### `usePendingRequests(userId)`
- Fetches incoming friend requests
- Auto-updates

### `useAcceptedFriends(userId)`
- Fetches accepted friends list
- Auto-updates

## Security Considerations

1. **RLS Enforcement**
   - All direct table access uses RLS policies
   - No custom SQL bypasses RLS

2. **Authentication**
   - Supabase Auth handles token management
   - Sessions persist with secure cookies

3. **Friend Requests**
   - UNIQUE constraint prevents duplicates
   - Users can only modify their own requests

4. **Data Isolation**
   - Users cannot access other users' logs
   - Cross-user queries use friend relationship

## Testing Strategy

### Unit Tests
- Time calculations with edge cases (midnight crossing, negative duration)
- Streak calculation logic
- Utility functions

### Integration Tests
- LogForm submission and validation
- Component rendering with mocked API

### Test Setup
- Vitest for test runner
- React Testing Library for component tests
- JSDOM for DOM simulation
- Mocked Supabase client

## Performance Optimizations

1. **Code Splitting**
   - Vite automatically chunks route components
   - Lazy load pages with React.lazy

2. **Data Fetching**
   - Fetch only needed date ranges
   - Cache logs in component state
   - useMemo for expensive calculations

3. **Styling**
   - Tailwind purges unused classes
   - No runtime CSS-in-JS

4. **Bundle Size**
   - ~100KB gzipped (React + utils)
   - Supabase client is tree-shakeable

## Deployment Pipeline

1. **Local Development**
   - `npm run dev` starts Vite dev server
   - HMR enabled for fast feedback

2. **Pre-deployment Checks**
   - `npm test` runs Vitest
   - `npm run type-check` validates TypeScript
   - `npm run build` creates optimized bundle

3. **GitHub Actions**
   - Triggers on push to main/master
   - Runs tests, type check, build
   - Deploys dist/ to gh-pages branch

4. **GitHub Pages**
   - Serves from gh-pages branch
   - Base URL configured in vite.config.ts

## Future Enhancements

1. **Features**
   - Export logs to CSV
   - Dark mode toggle
   - Mobile app with React Native
   - Notifications for friends

2. **Performance**
   - Infinite scroll for logs
   - Real-time updates with Supabase subscriptions
   - Service worker for offline support

3. **Analytics**
   - Usage tracking
   - Goal setting and progress
   - Weekly email summaries

4. **UI/UX**
   - Skeleton loaders
   - Undo log deletion
   - Drag-drop log editing
