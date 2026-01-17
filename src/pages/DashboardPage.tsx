import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLogs, useTotalHours } from '@/hooks/useLogs'
import { calculateStreak } from '@/utils/streak'
import { addLog, updateLog, deleteLog } from '@/services/logs'
import { getProfile } from '@/services/auth'
import LogForm from '@/features/logging/LogForm'
import LogList from '@/features/logging/LogList'
import Card from '@/components/Card'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type Log = Database['public']['Tables']['logs']['Row']

function DashboardPage() {
    const { user } = useAuth()
    const { logs, setLogs } = useLogs(user?.id)
    const { hours } = useTotalHours(user?.id)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [streak, setStreak] = useState(0)
    const [editingLog, setEditingLog] = useState<Log | null>(null)

    useEffect(() => {
        if (!user?.id) return

        const fetchProfile = async () => {
            try {
                const data = await getProfile(user.id)
                setProfile(data)
            } catch (err) {
                console.error('Failed to fetch profile:', err)
            }
        }

        fetchProfile()
    }, [user?.id])

    useEffect(() => {
        setStreak(calculateStreak(logs))
    }, [logs])

    const handleAddLog = async (logData: any) => {
        try {
            if (editingLog) {
                // Update existing log
                await updateLog(editingLog.id, logData)
                setLogs(logs.map((log) => (log.id === editingLog.id ? { ...log, ...logData } : log)))
                setEditingLog(null)
            } else {
                // Add new log
                const newLog = await addLog(user!.id, logData)
                setLogs([newLog, ...logs])
            }
        } catch (err) {
            console.error('Failed to save log:', err)
            throw err
        }
    }

    const handleEdit = (log: Log) => {
        setEditingLog(log)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (logId: string) => {
        try {
            await deleteLog(logId)
            setLogs(logs.filter((log) => log.id !== logId))
        } catch (err) {
            console.error('Failed to delete log:', err)
            throw err
        }
    }

    const handleCancelEdit = () => {
        setEditingLog(null)
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-lg text-gray-600">
                        Welcome, {profile?.display_name ? profile.display_name : user?.email}!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card title="Total Hours">
                        <p className="text-3xl font-bold text-blue-600">
                            {hours.totalHours}
                            <span className="text-lg text-gray-600 ml-2">h {hours.remainingMinutes}m</span>
                        </p>
                    </Card>

                    <Card title="Current Streak">
                        <p className="text-3xl font-bold text-purple-600">{streak}</p>
                        <p className="text-sm text-gray-600 mt-2">days</p>
                    </Card>

                    <Card title="Sessions">
                        <p className="text-3xl font-bold text-green-600">{logs.length}</p>
                        <p className="text-sm text-gray-600 mt-2">total logged</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <LogForm onSubmit={handleAddLog} editingLog={editingLog} onCancel={handleCancelEdit} />
                    <div className="lg:col-span-2">
                        <LogList logs={logs} onEdit={handleEdit} onDelete={handleDelete} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
