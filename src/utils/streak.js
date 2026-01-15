/**
 * Calculate current streak from logs
 * Streak breaks if a day is skipped
 */
export function calculateStreak(logs) {
    if (logs.length === 0)
        return 0;
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let currentDate = new Date(today);
    for (const log of sortedLogs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        if (logDate.getTime() === currentDate.getTime()) {
            currentStreak++;
            currentDate.setDate(currentDate.getDate() - 1);
        }
        else if (logDate < currentDate) {
            break;
        }
    }
    return currentStreak;
}
/**
 * Get unique dates from logs
 */
export function getUniqueDates(logs) {
    const dates = new Set();
    logs.forEach((log) => {
        dates.add(log.date);
    });
    return Array.from(dates).sort();
}
