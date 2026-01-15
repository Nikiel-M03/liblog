import { describe, it, expect } from 'vitest'
import { calculateStreak, getUniqueDates } from '@/utils/streak'
import type { Database } from '@/types/supabase'

type Log = Database['public']['Tables']['logs']['Row']

describe('Streak utilities', () => {
  describe('calculateStreak', () => {
    it('should return 0 for empty logs', () => {
      expect(calculateStreak([])).toBe(0)
    })

    it('should calculate consecutive days streak', () => {
      const today = new Date()
      const logs: Log[] = [
        {
          id: '1',
          user_id: 'user1',
          date: new Date(today.getTime() - 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '10:00',
          duration_minutes: 60,
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          user_id: 'user1',
          date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '10:00',
          duration_minutes: 60,
          created_at: '',
          updated_at: '',
        },
        {
          id: '3',
          user_id: 'user1',
          date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '10:00',
          duration_minutes: 60,
          created_at: '',
          updated_at: '',
        },
      ]

      const streak = calculateStreak(logs)
      expect(streak).toBe(3)
    })

    it('should break streak on skipped day', () => {
      const today = new Date()
      const logs: Log[] = [
        {
          id: '1',
          user_id: 'user1',
          date: new Date(today.getTime() - 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '10:00',
          duration_minutes: 60,
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          user_id: 'user1',
          date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '10:00',
          duration_minutes: 60,
          created_at: '',
          updated_at: '',
        },
      ]

      const streak = calculateStreak(logs)
      expect(streak).toBe(1)
    })
  })

  describe('getUniqueDates', () => {
    it('should return unique dates sorted', () => {
      const logs: Log[] = [
        {
          id: '1',
          user_id: 'user1',
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:00',
          duration_minutes: 60,
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          user_id: 'user1',
          date: '2024-01-15',
          start_time: '14:00',
          end_time: '15:00',
          duration_minutes: 60,
          created_at: '',
          updated_at: '',
        },
        {
          id: '3',
          user_id: 'user1',
          date: '2024-01-14',
          start_time: '09:00',
          end_time: '10:00',
          duration_minutes: 60,
          created_at: '',
          updated_at: '',
        },
      ]

      const dates = getUniqueDates(logs)
      expect(dates).toEqual(['2024-01-14', '2024-01-15'])
    })
  })
})
