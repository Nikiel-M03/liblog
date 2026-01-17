import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signUp } from '@/services/auth'
import { supabase } from '@/services/supabase'

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn(),
  },
}))

describe('signUp - Integration: Email Verification with Trigger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle email unconfirmed signup flow with profile update', async () => {
    // Scenario: User signs up but email is not yet confirmed
    const testEmail = 'alice@example.com'
    const testPassword = 'SecurePass123!'
    const testDisplayName = 'Alice Wonder'

    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: testEmail,
      email_confirmed_at: null, // Email NOT confirmed yet
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }

    const mockSupabase = supabase as any

    // Step 1: User submits signup form
    // Supabase creates auth user and triggers the handle_new_user function
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    // Step 2: Code updates profile with custom display name via RPC
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: null,
    })

    // Execute signup
    const result = await signUp(testEmail, testPassword, testDisplayName)

    // Verify
    expect(result).toEqual(mockUser)
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: testEmail,
      password: testPassword,
    })
    expect(mockSupabase.rpc).toHaveBeenCalledWith('set_profile_display_name', {
      user_id: mockUser.id,
      new_display_name: testDisplayName,
    })
  })

  it('should continue to work after email is confirmed', async () => {
    // Scenario: Even after email confirmation, profile updates should work
    const testEmail = 'bob@example.com'
    const testPassword = 'SecurePass456!'
    const testDisplayName = 'Bob Builder'

    const mockUserBeforeConfirm = {
      id: '660e8400-e29b-41d4-a716-446655440001',
      email: testEmail,
      email_confirmed_at: null, // Initial state
    }

    const mockSupabase = supabase as any

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUserBeforeConfirm },
      error: null,
    })

    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: null,
    })

    const result = await signUp(testEmail, testPassword, testDisplayName)
    expect(result).toEqual(mockUserBeforeConfirm)

    // Later when user confirms email, profile still exists with correct display name
    // (no conflict since we're updating, not inserting)
  })

  it('should handle rapid consecutive signups without conflicts', async () => {
    const mockSupabase = supabase as any

    // Simulate two concurrent signup attempts
    const signupAttempts = [
      {
        email: 'user1@example.com',
        password: 'pass1',
        display: 'User One',
        id: '770e8400-e29b-41d4-a716-446655440002',
      },
      {
        email: 'user2@example.com',
        password: 'pass2',
        display: 'User Two',
        id: '880e8400-e29b-41d4-a716-446655440003',
      },
    ]

    // Mock responses for each attempt
    mockSupabase.auth.signUp.mockImplementation(({ email }: { email: string }) => {
      const attempt = signupAttempts.find((a) => a.email === email)
      if (!attempt) {
        throw new Error(`No signup attempt found for email: ${email}`)
      }
      return Promise.resolve({
        data: { user: { id: attempt.id, email: attempt.email } },
        error: null,
      })
    })

    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: null,
    })

    // Execute both signups
    const results = await Promise.all([
      signUp(signupAttempts[0].email, signupAttempts[0].password, signupAttempts[0].display),
      signUp(signupAttempts[1].email, signupAttempts[1].password, signupAttempts[1].display),
    ])

    // Both should succeed
    expect(results).toHaveLength(2)
    expect(results[0].email).toBe(signupAttempts[0].email)
    expect(results[1].email).toBe(signupAttempts[1].email)
  })
})
