# LibLog - Library Hours Tracker

A modern, serverless web application for tracking library study hours with statistics, streaks, and social features.

## Features

- **Authentication** - Secure email/password signup and login
- **Hour Logging** - Quick and easy logging with date, time range, and notes
- **Statistics** - Visual charts showing weekly/monthly progress
- **Streak Counter** - Track consecutive days of study
- **Social Leaderboard** - Compare total hours with friends
- **Friend System** - Send and manage friend requests
- **Mobile Responsive** - Works great on phones and tablets

## Quick Start

### Prerequisites
- Node.js 18+
- A Supabase account (free tier available at https://supabase.com)

### Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Configure Supabase**
   - Create a project at https://supabase.com
   - Run SQL from `SQL_SCHEMA.sql` in Supabase SQL Editor
   - Copy your project URL and anon key

3. **Set environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

5. **Open** http://localhost:3000

See [SETUP.md](./SETUP.md) for detailed instructions.

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm test` | Run tests with Vitest |
| `npm run test:ui` | Run tests in UI mode |
| `npm run type-check` | Check TypeScript types |
| `npm run lint` | Run ESLint |

## Deployment

### GitHub Pages

1. Push to GitHub
2. Go to repository Settings > Secrets and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. GitHub Actions will automatically deploy on push to main/master

The app will be available at `https://username.github.io/liblog/`

### Custom Domain

Update `vite.config.ts`:
```ts
base: 'https://yourdomain.com/'
```

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL + Auth)
- **Testing**: Vitest + React Testing Library
- **Hosting**: GitHub Pages (Static)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Project Structure

```
src/
├── components/      # Reusable UI components
├── features/        # Feature modules
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # Supabase API integration
├── styles/          # Global styles
├── test/            # Tests
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## Key Features Explained

### Logging Hours
1. Go to Dashboard
2. Fill in date, start time, end time
3. Add optional notes
4. Click "Add Log"
5. Hours are automatically calculated (even if crossing midnight)

### Viewing Statistics
- **Dashboard**: Total hours, current streak, session count
- **Statistics**: Weekly/monthly charts, 30-day trend
- **Leaderboard**: Compare with friends (only shows accepted friends)

### Managing Friends
1. Go to Friends page
2. Enter friend's email and send request
3. They'll see it in "Pending Requests"
4. Once accepted, you can view each other on leaderboard

### Time Calculation
- Handles sessions crossing midnight correctly
- Example: 23:00 to 01:00 = 2 hours
- Prevents negative durations (validates input)

## Testing

Run tests with:
```bash
npm test
```

Tests cover:
- Time utilities (duration calculation, formatting)
- Streak calculation logic
- Component integration (LogForm submission)
- Edge cases (midnight crossing, negative inputs)

## Security

- Row Level Security (RLS) enforces data isolation
- Users can only access their own logs
- Users can only see friends' aggregate hours if friendship accepted
- Passwords hashed by Supabase Auth
- No sensitive data in frontend code

## Data Model

**Profiles** - User accounts
- id, email, display_name

**Logs** - Hours entries
- id, user_id, date, start_time, end_time, duration_minutes, notes

**Friendships** - Friend connections
- id, user_id, friend_id, status (pending/accepted)

See [SQL_SCHEMA.sql](./SQL_SCHEMA.sql) for full schema.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

**"User not found" on signup**
- Check email isn't already registered
- Verify Supabase email provider is enabled

**Can't login**
- Check credentials are correct
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

**Build fails**
- Run `npm ci` for clean install
- Check Node.js version (18+)
- Verify all .env variables are set

See [SETUP.md](./SETUP.md) for more troubleshooting.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run tests: `npm test`
5. Run type check: `npm run type-check`
6. Submit pull request

## License

MIT

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, and Supabase**
