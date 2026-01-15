import { useEffect, useState } from 'react';
import { getUserLogs, getTotalHoursByUser } from '@/services/logs';
export function useLogs(userId, startDate, endDate) {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!userId)
            return;
        const fetchLogs = async () => {
            try {
                setIsLoading(true);
                const data = await getUserLogs(userId, startDate, endDate);
                setLogs(data);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [userId, startDate, endDate]);
    return { logs, isLoading, error, setLogs };
}
export function useTotalHours(userId) {
    const [hours, setHours] = useState({ totalHours: 0, remainingMinutes: 0, totalMinutes: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!userId)
            return;
        const fetchHours = async () => {
            try {
                setIsLoading(true);
                const data = await getTotalHoursByUser(userId);
                setHours(data);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch hours'));
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchHours();
    }, [userId]);
    return { hours, isLoading, error };
}
