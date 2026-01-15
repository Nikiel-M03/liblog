import { supabase } from './supabase'
import type { Database } from '@/types/supabase'

type Log = Database['public']['Tables']['logs']['Row']
type LogInsert = Database['public']['Tables']['logs']['Insert']

export async function addLog(userId: string, log: LogInsert) {
  const { data, error } = await supabase
    .from('logs')
    .insert([{ ...log, user_id: userId }])
    .select()

  if (error) throw error

  return data[0]
}

export async function getUserLogs(userId: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (startDate) {
    query = query.gte('date', startDate)
  }

  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query

  if (error) throw error

  return data as Log[]
}

export async function updateLog(logId: string, updates: Partial<LogInsert>) {
  const { data, error } = await supabase
    .from('logs')
    .update(updates)
    .eq('id', logId)
    .select()

  if (error) throw error

  return data[0]
}

export async function deleteLog(logId: string) {
  const { error } = await supabase.from('logs').delete().eq('id', logId)

  if (error) throw error
}

export async function getTotalHoursByUser(userId: string) {
  const { data, error } = await supabase
    .from('logs')
    .select('duration_minutes')
    .eq('user_id', userId)

  if (error) throw error

  const totalMinutes = data.reduce((sum, log) => sum + (log.duration_minutes || 0), 0)

  return {
    totalMinutes,
    totalHours: Math.floor(totalMinutes / 60),
    remainingMinutes: totalMinutes % 60,
  }
}
