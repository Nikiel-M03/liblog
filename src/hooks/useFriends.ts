import { useEffect, useState } from 'react'
import {
  getPendingRequests,
  getAcceptedFriends,
} from '@/services/friends'
import type { Database } from '@/types/supabase'

type Friendship = Database['public']['Tables']['friendships']['Row']

export function usePendingRequests(userId: string | undefined) {
  const [requests, setRequests] = useState<Friendship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchRequests = async () => {
      try {
        setIsLoading(true)
        const data = await getPendingRequests(userId)
        setRequests(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch requests'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [userId])

  return { requests, isLoading, error, setRequests }
}

export function useAcceptedFriends(userId: string | undefined) {
  const [friends, setFriends] = useState<Friendship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchFriends = async () => {
      try {
        setIsLoading(true)
        const data = await getAcceptedFriends(userId)
        setFriends(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch friends'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchFriends()
  }, [userId])

  return { friends, isLoading, error, setFriends }
}
