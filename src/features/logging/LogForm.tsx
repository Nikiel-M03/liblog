import { useState } from 'react'
import { calculateDurationMinutes } from '@/utils/time'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Card from '@/components/Card'

interface LogFormProps {
  onSubmit: (data: {
    date: string
    start_time: string
    end_time: string
    notes?: string
    duration_minutes: number
  }) => Promise<void>
}

function LogForm({ onSubmit }: LogFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const durationMinutes = calculateDurationMinutes(startTime, endTime, date)

      await onSubmit({
        date,
        start_time: startTime,
        end_time: endTime,
        notes: notes || undefined,
        duration_minutes: durationMinutes,
      })

      setDate(new Date().toISOString().split('T')[0])
      setStartTime('09:00')
      setEndTime('10:00')
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add log')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card title="Log Hours">
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Input
          label="Start Time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />

        <Input
          label="End Time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />

        <textarea
          className="input resize-none"
          placeholder="Add notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <Button isLoading={isLoading} className="w-full">
          Add Log
        </Button>
      </form>
    </Card>
  )
}

export default LogForm
