# LibLog Testing Guide

This document describes the comprehensive testing suite for LibLog, including unit tests, edge cases, integration tests, and negative tests.

## Test Structure

Tests are organized in `src/test/` directory with the following coverage:

### 1. Unit Tests - Edge Cases

#### Time Utilities (`time.edge-cases.test.ts`)
- **calculateDurationMinutes**: Very short/long durations, midnight handling, timezone boundaries, leap years
- **formatDuration**: Single digits, 59/60 minute boundaries, large values
- **getStartOfWeek**: Month/year boundaries, different days of week
- **getStartOfMonth**: Various date boundaries, leap years
- **getStartOfDay**: Midnight edge cases, month transitions

#### Streak Utilities (`streak.edge-cases.test.ts`)
- **calculateStreak**: Single logs, long streaks (30+ days), gap handling, duplicate dates
- **getUniqueDates**: Sorting across months/years, large datasets (365+ days)

### 2. Negative Tests

#### Services Negative Tests (`services.negative.test.ts`)
Tests for error handling across all service layers:
- **Logs Service**: Failures in add/update/delete/query operations
- **Auth Service**: SignUp/signIn/signOut failures, profile creation errors
- **Integration**: Network errors, database errors with proper message formats

#### Friends Service Negative Tests (`friends.negative.test.ts`)
- User not found scenarios
- Duplicate friendship requests
- Permission denied errors
- Race condition handling
- Self-friend request prevention

### 3. Integration Tests

#### Supabase Integration (`supabase.integration.test.ts`)
- **Logs & Streaks**: Fetching logs and calculating streaks from real data
- **Date Range Queries**: Filtering with startDate/endDate parameters
- **Hours Calculation**: Total hours aggregation with correct rounding
- **Update & Delete Operations**: Concurrent operations handling
- **Error Handling**: Timeout and partial failure scenarios

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in UI mode
```bash
npm run test:ui
```

### Run specific test file
```bash
npm test -- src/test/time.edge-cases.test.ts
```

### Run with coverage
```bash
npm test -- --coverage
```

## Test Statistics

- **Total Tests**: 115
- **Test Files**: 9
- **Coverage Areas**:
  - Time utilities (40 tests)
  - Streak utilities (19 tests)
  - Services (17 negative tests)
  - Friends service (19 negative tests)
  - Supabase integration (13 tests)
  - Component tests (3 tests)
  - Supabase client (4 tests)

## Key Testing Patterns

### Mocking Supabase
Tests use Vitest mocks to simulate Supabase responses:

```typescript
const mockSupabase = supabase as any

mockSupabase.from.mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: logs,
        error: null,
      }),
    }),
  }),
})
```

### Testing Async Operations
Tests use `waitFor()` for async operations and `mockResolvedValue`/`mockRejectedValue` for promise handling.

### Error Scenarios
Each service function has negative tests covering:
- Network failures
- Database constraint violations
- Permission errors
- Invalid input handling
- Partial data handling

## Edge Cases Covered

### Time-Related
- Midnight crossing (22:00 → 02:00)
- Leap year dates (Feb 29)
- Year/month boundaries
- 24-hour+ durations
- Single minute durations

### Streak Calculation
- Empty logs
- Multiple logs per day
- 30-day streaks
- Gaps breaking streaks
- Future-dated logs
- Unsorted logs

### Data Operations
- Empty result sets
- Null/missing values
- Duplicate records
- Large datasets (365+ records)
- Concurrent operations

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on others
2. **Clarity**: Test names clearly describe what's being tested
3. **Mocking**: External dependencies (Supabase) are fully mocked
4. **Edge Cases**: Both happy path and error scenarios are tested
5. **Assertions**: Multiple assertions per test verify expected behavior

## Continuous Integration

All tests must pass before merging:
```bash
npm test -- --run
npm run type-check
npm run lint
```

## Future Improvements

- [ ] Add visual regression tests for React components
- [ ] Add E2E tests with real Supabase instance in CI
- [ ] Increase component test coverage (currently 3 tests)
- [ ] Add performance benchmarks for large data sets
- [ ] Add accessibility tests for UI components
