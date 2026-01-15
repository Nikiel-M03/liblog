# LibLog - Setup Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project (https://supabase.com)

## 1. Supabase Configuration

### Step 1: Create a Supabase Project
1. Sign up at https://supabase.com
2. Create a new project
3. Note your project URL and anon key

### Step 2: Execute SQL Schema
1. In the Supabase dashboard, go to the SQL Editor
2. Create a new query and paste the contents of `SQL_SCHEMA.sql`
3. Run the query
4. Verify all tables and RLS policies are created

### Step 3: Configure Authentication
1. In Supabase, go to Authentication > Providers
2. Ensure Email provider is enabled
3. (Optional) Enable Google OAuth or other providers

## 2. Project Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BASE_URL=/liblog/
```

For local development, use:
```
VITE_BASE_URL=/
```

### Step 3: Run Development Server
```bash
npm run dev
```

The app will be available at http://localhost:3000

## 3. Testing

### Run Tests
```bash
npm test
```

### Run Tests in UI Mode
```bash
npm run test:ui
```

### Type Check
```bash
npm run type-check
```

## 4. Building for Production

### Build the App
```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build Locally
```bash
npm run preview
```

## 5. GitHub Pages Deployment

### Step 1: Update Repository Settings
1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Select "GitHub Actions" as the deployment source

### Step 2: Add Secrets to GitHub
In repository Settings > Secrets and variables > Actions, add:
- `VITE_SUPABASE_URL`: Your Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Step 3: Trigger Deployment
Push to `main` or `master` branch. GitHub Actions will automatically build and deploy.

The app will be available at: `https://username.github.io/liblog/`

## 6. Architecture Overview

### Directory Structure
```
src/
├── components/          # Reusable UI components
├── features/            # Feature-specific logic
│   └── logging/         # Hours logging feature
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # Supabase & API integration
├── styles/              # Global styles
├── test/                # Tests
├── types/               # TypeScript types
└── utils/               # Utility functions
```

### Key Components
- **Authentication**: Email/password signup and login
- **Dashboard**: Log hours, view statistics
- **Statistics**: Weekly/monthly charts
- **Leaderboard**: Compare hours with friends
- **Friends System**: Send/accept friend requests

### Data Model
- `profiles`: User profiles linked to auth.users
- `logs`: Hours logging entries
- `friendships`: Friend connections with pending/accepted status

### Security
- Row Level Security (RLS) policies enforce data isolation
- Users can only view their own logs
- Users can view friends' aggregate hours only if friendship accepted

## 7. Troubleshooting

### "Supabase environment variables missing"
Ensure `.env.local` is created with all required variables.

### Authentication errors
- Verify email provider is enabled in Supabase
- Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct

### RLS policy errors
- Ensure all SQL from SQL_SCHEMA.sql was executed
- Check that RLS is enabled on all tables

### Build failures
- Run `npm ci` to clean install dependencies
- Clear `.next` or `dist` directories
- Check Node.js version (should be 18+)

## 8. Development Tips

### Add New Features
1. Create feature folder under `src/features/`
2. Create service functions in `src/services/`
3. Create custom hooks in `src/hooks/`
4. Build components in feature folder or `src/components/`

### Testing
- Unit tests in `src/test/*.test.ts`
- Integration tests in `src/test/*.test.tsx`
- Use Vitest for running tests
- Use React Testing Library for component tests

### Styling
- Use Tailwind CSS utility classes
- Define custom components in `src/styles/globals.css`
- Mobile-first approach (configure in `tailwind.config.ts`)

## 9. Production Checklist

- [ ] All environment variables set
- [ ] Supabase RLS policies verified
- [ ] Tests passing
- [ ] Type checking passed
- [ ] Build successful with no errors
- [ ] GitHub secrets configured
- [ ] Domain configured (if custom domain)
