import { formatDuration } from '@/utils/time'
import Card from '@/components/Card'
import type { Database } from '@/types/supabase'

type Log = Database['public']['Tables']['logs']['Row']

interface LogListProps {
  logs: Log[]
}

function LogList({ logs }: LogListProps) {
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
              <div>
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
              <p className="text-lg font-bold text-blue-600">
                {formatDuration(log.duration_minutes || 0)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default LogList
