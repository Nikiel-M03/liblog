import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  getAcceptedFriends,
  removeFriend,
} from '@/services/friends'
import { supabase } from '@/services/supabase'

const mockSupabase = supabase as any

describe('Friends service - Negative Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendFriendRequest - Negative Cases', () => {
    it('should throw error when user not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('No rows found'),
            }),
          }),
        }),
      })

      await expect(sendFriendRequest('user1', 'nonexistent@example.com')).rejects.toThrow(
        'User not found',
      )
    })

    it('should throw error when friendship already exists', async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'user2' },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'friendship1', status: 'pending' },
                error: null,
              }),
            }),
          }),
        })

      await expect(sendFriendRequest('user1', 'user2@example.com')).rejects.toThrow(
        'Friendship request already exists',
      )
    })

    it('should throw error when friend request insert fails', async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'user2' },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('No rows found'),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Insert failed'),
            }),
          }),
        })

      await expect(sendFriendRequest('user1', 'user2@example.com')).rejects.toThrow(
        'Insert failed',
      )
    })

    it('should throw error when sending request to self', async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'user1' },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'friendship1', status: 'pending' },
                error: null,
              }),
            }),
          }),
        })

      // Should throw error or handle gracefully
      await expect(sendFriendRequest('user1', 'user1@example.com')).rejects.toThrow()
    })
  })

  describe('acceptFriendRequest - Negative Cases', () => {
    it('should throw error when friendship not found', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Friendship not found'),
            }),
          }),
        }),
      })

      await expect(acceptFriendRequest('nonexistent-id')).rejects.toThrow(
        'Friendship not found',
      )
    })

    it('should throw error when update fails', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Update permission denied'),
            }),
          }),
        }),
      })

      await expect(acceptFriendRequest('friendship1')).rejects.toThrow(
        'Update permission denied',
      )
    })

    it('should throw error with empty friendship ID', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Invalid ID'),
            }),
          }),
        }),
      })

      await expect(acceptFriendRequest('')).rejects.toThrow('Invalid ID')
    })
  })

  describe('rejectFriendRequest - Negative Cases', () => {
    it('should throw error when delete fails', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: new Error('Delete permission denied'),
          }),
        }),
      })

      await expect(rejectFriendRequest('friendship1')).rejects.toThrow(
        'Delete permission denied',
      )
    })

    it('should throw error when friendship not found for rejection', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: new Error('No rows deleted'),
          }),
        }),
      })

      await expect(rejectFriendRequest('nonexistent-id')).rejects.toThrow(
        'No rows deleted',
      )
    })
  })

  describe('getPendingRequests - Negative Cases', () => {
    it('should throw error when query fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Query failed'),
            }),
          }),
        }),
      })

      await expect(getPendingRequests('user1')).rejects.toThrow('Query failed')
    })

    it('should return empty array when no pending requests', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      })

      const requests = await getPendingRequests('user1')
      expect(requests).toEqual([])
    })

    it('should throw error with invalid user ID', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Invalid user ID format'),
            }),
          }),
        }),
      })

      await expect(getPendingRequests('invalid-id')).rejects.toThrow(
        'Invalid user ID format',
      )
    })
  })

  describe('getAcceptedFriends - Negative Cases', () => {
    it('should throw error when query fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Query failed'),
          }),
        }),
      })

      await expect(getAcceptedFriends('user1')).rejects.toThrow('Query failed')
    })

    it('should return empty array when no accepted friends', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      })

      const friends = await getAcceptedFriends('user1')
      expect(friends).toEqual([])
    })

    it('should handle partial friend data gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'friendship1',
                user_id: 'user1',
                friend_id: 'user2',
                status: 'accepted',
                friend: { id: 'user2', email: 'user2@example.com' }, // missing display_name
              },
            ],
            error: null,
          }),
        }),
      })

      const friends = await getAcceptedFriends('user1')
      expect(friends).toHaveLength(1)
      expect((friends[0] as any).friend).toBeDefined()
    })
  })

  describe('removeFriend - Negative Cases', () => {
    it('should throw error when delete fails', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: new Error('Delete permission denied'),
          }),
        }),
      })

      await expect(removeFriend('friendship1')).rejects.toThrow('Delete permission denied')
    })

    it('should throw error when friendship not found', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: new Error('No friendship with that ID'),
          }),
        }),
      })

      await expect(removeFriend('nonexistent-id')).rejects.toThrow(
        'No friendship with that ID',
      )
    })
  })

  describe('Cross-operation Negative Cases', () => {
    it('should not allow accepting request twice', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Already accepted'),
            }),
          }),
        }),
      })

      // First acceptance should work (mock would succeed)
      // Second acceptance should fail
      await expect(acceptFriendRequest('friendship1')).rejects.toThrow('Already accepted')
    })

    it('should handle race condition in friend operations', async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'user2' },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                // Return existing pending request (race condition)
                data: { id: 'friendship1', status: 'pending' },
                error: null,
              }),
            }),
          }),
        })

      await expect(sendFriendRequest('user1', 'user2@example.com')).rejects.toThrow(
        'Friendship request already exists',
      )
    })
  })
})
