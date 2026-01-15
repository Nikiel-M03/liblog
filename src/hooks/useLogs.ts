import { useEffect, useState } from 'react'
import { getUserLogs, getTotalHoursByUser } from '@/services/logs'
import type { Database } from '@/types/supabase'

type Log = Database['public']['Tables']['logs']['Row']

export function useLogs(userId: string | undefined, startDate?: string, endDate?: string) {
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchLogs = async () => {
      try {
        setIsLoading(true)
        const data = await getUserLogs(userId, startDate, endDate)
        setLogs(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch logs'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [userId, startDate, endDate])

  return { logs, isLoading, error, setLogs }
}

export function useTotalHours(userId: string | undefined) {
  const [hours, setHours] = useState({ totalHours: 0, remainingMinutes: 0, totalMinutes: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchHours = async () => {
      try {
        setIsLoading(true)
        const data = await getTotalHoursByUser(userId)
        setHours(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch hours'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchHours()
  }, [userId])

  return { hours, isLoading, error }
}
