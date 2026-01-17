import { formatDuration } from '@/utils/time'
import Card from '@/components/Card'
import type { Database } from '@/types/supabase'

type Log = Database['public']['Tables']['logs']['Row']

interface LogListProps {
  logs: Log[]
  onEdit?: (log: Log) => void
  onDelete?: (logId: string) => Promise<void>
}

function LogList({ logs, onEdit, onDelete }: LogListProps) {
  const handleDelete = async (logId: string) => {
    if (!onDelete) return
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await onDelete(logId)
      } catch (err) {
        console.error('Failed to delete log:', err)
      }
    }
  }

  if (logs.length === 0) {
    return (
      <Card title="Recent Sessions">
        <p className="text-center text-gray-600">No sessions logged yet</p>
      </Card>
    )
  }

  return (
    <Card title="Recent Sessions">
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="border-l-4 border-blue-600 p-4 bg-gray-50 rounded">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {new Date(log.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {log.start_time} - {log.end_time}
                </p>
                {log.notes && <p className="text-sm text-gray-700 mt-2">{log.notes}</p>}
              </div>
              <div className="flex items-center gap-4 ml-4">
                <p className="text-lg font-bold text-blue-600">
                  {formatDuration(log.duration_minutes || 0)}
                </p>
                {(onEdit || onDelete) && (
                  <div className="flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(log)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default LogList
