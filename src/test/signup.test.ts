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

describe('signUp - Email Verification Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create user and update profile with custom display name', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      email_confirmed_at: null, // Email not yet confirmed
    }

    const mockSupabase = supabase as any

    // Supabase auth.signUp succeeds
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    // RPC call succeeds
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: null,
    })

    const result = await signUp('test@example.com', 'password123', 'Test User')
    expect(result).toEqual(mockUser)
    expect(mockSupabase.rpc).toHaveBeenCalledWith('set_profile_display_name', {
      user_id: mockUser.id,
      new_display_name: 'Test User',
    })
  })

  it('should successfully create and update on normal signup flow', async () => {
    const mockUser = {
      id: 'user-456',
      email: 'newuser@example.com',
      email_confirmed_at: null,
    }

    const mockSupabase = supabase as any

    // Supabase auth.signUp succeeds
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    // RPC call succeeds
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: null,
    })

    const result = await signUp('newuser@example.com', 'password123', 'New User')
    expect(result).toEqual(mockUser)
  })

  it('should handle profile update failure gracefully', async () => {
    const mockUser = {
      id: 'user-789',
      email: 'testuser@example.com',
    }

    const mockSupabase = supabase as any

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    // Simulate RPC failure
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: {
        message: 'Profile update failed',
      },
    })

    // Should throw on RPC failure
    await expect(signUp('testuser@example.com', 'password123', 'Test User')).rejects.toThrow(
      'Failed to set display name: Profile update failed'
    )
  })
})
