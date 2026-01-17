# Signup Bug Fix: Email Verification Profile Conflict

## Problem

When signing up with a test email, the signup process would:
1. Create an auth user successfully
2. Email verification works fine
3. BUT return an error code (usually "duplicate key value violates unique constraint")

## Root Cause

The bug was caused by **two profile creation mechanisms conflicting**:

1. **Database Trigger** (`handle_new_user`) - Automatically creates a profile when an auth user is created
   - Creates profile with email as both the email and display_name
   
2. **Manual Insert in Code** (`signUp` function in `auth.ts`)
   - Tries to manually insert a new profile with custom display name
   - This conflicts with the auto-created profile, causing a UNIQUE constraint violation on the `email` field

### The Race Condition

```
User submits signup form
    ↓
Supabase creates auth user
    ↓
Trigger fires immediately: INSERT INTO profiles (id, email, display_name) VALUES (...)
    ↓
Code also tries: INSERT INTO profiles (id, email, display_name) VALUES (...)
    ↓
ERROR: duplicate key value violates unique constraint "profiles_email_key"
```

## Solution

Remove the manual INSERT and use UPDATE instead:

**Before (auth.ts)**
```typescript
const { error: profileError } = await supabase.from('profiles').insert([
  {
    id: data.user.id,
    email: email,
    display_name: displayName,
  },
])
```

**After (auth.ts)**
```typescript
const { error: profileError } = await supabase
  .from('profiles')
  .update({ display_name: displayName })
  .eq('id', data.user.id)
```

### Why This Works

1. **Trigger still runs** - Profile is automatically created with email as display_name
2. **No conflict** - UPDATE succeeds even if profile already exists
3. **Display name is correct** - We update the auto-created profile with the custom name user provided
4. **Email verification still works** - Unaffected by this change

## Files Changed

- `src/services/auth.ts` - Changed INSERT to UPDATE
- `src/services/auth.js` - Same change in compiled JavaScript
- `src/test/signup.test.ts` - Added tests for the fix
- `src/test/signup.integration.test.ts` - Added integration tests

## Testing

All signup tests pass:

```bash
npm test -- src/test/signup --run
```

This verifies:
- ✓ User and profile creation with email not yet confirmed
- ✓ Profile update with custom display name
- ✓ Rapid consecutive signups don't conflict
- ✓ Error handling for profile update failures

## Before & After

### Before (Broken)
```
User signs up with email: test@example.com, name: "Alice"
→ Auth user created ✓
→ Trigger creates profile with display_name="test@example.com" ✓
→ Code tries to INSERT profile → ERROR ✗
→ User sees error even though verification email was sent ✗
```

### After (Fixed)
```
User signs up with email: test@example.com, name: "Alice"  
→ Auth user created ✓
→ Trigger creates profile with display_name="test@example.com" ✓
→ Code updates profile with display_name="Alice" ✓
→ User can verify email normally ✓
```
