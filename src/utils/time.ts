/**
 * Calculate duration in minutes between start and end times
 * Handles sessions crossing midnight when endDate is explicitly provided
 */
export function calculateDurationMinutes(
  startTime: string,
  endTime: string,
  startDate: string,
  endDate?: string,
): number {
  const startDate_ = new Date(`${startDate}T${startTime}:00`)
  let endDate_ = new Date(`${endDate || startDate}T${endTime}:00`)

  // If end time is earlier than start time on same day, assume it's next day
  // but only if we're dealing with reasonable evening hours (after 8 PM)
  if (endDate === undefined && endDate_ < startDate_) {
    const startHour = parseInt(startTime.split(':')[0], 10)
    // Only assume midnight crossing if start time is >= 20:00 (8 PM)
    if (startHour >= 20) {
      endDate_.setDate(endDate_.getDate() + 1)
    } else {
      // Otherwise throw error for clearly invalid input
      throw new Error('End time cannot be before start time')
    }
  }

  const durationMs = endDate_.getTime() - startDate_.getTime()
  const durationMinutes = Math.round(durationMs / (1000 * 60))

  if (durationMinutes < 0) {
    throw new Error('End time cannot be before start time')
  }

  return durationMinutes
}

/**
 * Format minutes into hours and minutes string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}m`
  }

  if (mins === 0) {
    return `${hours}h`
  }

  return `${hours}h ${mins}m`
}

/**
 * Get start of week (Monday)
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

/**
 * Get start of month
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * Get start of today
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}
