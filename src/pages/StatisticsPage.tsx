import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLogs } from '@/hooks/useLogs'
import { formatDuration } from '@/utils/time'
import { getStartOfMonth, getStartOfWeek } from '@/utils/time'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import Card from '@/components/Card'
import type { Database } from '@/types/supabase'

type Log = Database['public']['Tables']['logs']['Row']

function StatisticsPage() {
  const { user } = useAuth()
  const { logs } = useLogs(user?.id)

  const weeklyData = useMemo(() => {
    const data: Record<string, number> = {}
    const today = new Date()
    const weekStart = getStartOfWeek(today)

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      data[dateStr] = 0
    }

    logs.forEach((log) => {
      if (new Date(log.date) >= weekStart) {
        data[log.date] = (data[log.date] || 0) + (log.duration_minutes || 0)
      }
    })

    return Object.entries(data)
      .map(([date, minutes]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Math.round((minutes / 60) * 10) / 10,
        minutes,
      }))
      .slice(0, 7)
  }, [logs])

  const monthlyData = useMemo(() => {
    const data: Record<string, number> = {}
    const today = new Date()
    const monthStart = getStartOfMonth(today)

    logs.forEach((log) => {
      const logDate = new Date(log.date)
      if (logDate >= monthStart) {
        const week = Math.ceil(logDate.getDate() / 7)
        const key = `Week ${week}`
        data[key] = (data[key] || 0) + (log.duration_minutes || 0)
      }
    })

    return Object.entries(data)
      .map(([week, minutes]) => ({
        week,
        hours: Math.round((minutes / 60) * 10) / 10,
      }))
  }, [logs])

  const dailyStats = useMemo(() => {
    const stats: Record<string, { minutes: number; count: number }> = {}

    logs.forEach((log) => {
      if (!stats[log.date]) {
        stats[log.date] = { minutes: 0, count: 0 }
      }
      stats[log.date].minutes += log.duration_minutes || 0
      stats[log.date].count += 1
    })

    return Object.entries(stats)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: Math.round((data.minutes / 60) * 10) / 10,
        sessions: data.count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30)
  }, [logs])

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">Statistics</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="This Week">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="This Month (Weekly)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="Last 30 Days">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="hours"
                stroke="#3b82f6"
                name="Hours"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sessions"
                stroke="#10b981"
                name="Sessions"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

export default StatisticsPage
