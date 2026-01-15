import { useEffect, useState } from 'react';
import { getPendingRequests, getAcceptedFriends, } from '@/services/friends';
export function usePendingRequests(userId) {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!userId)
            return;
        const fetchRequests = async () => {
            try {
                setIsLoading(true);
                const data = await getPendingRequests(userId);
                setRequests(data);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch requests'));
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchRequests();
    }, [userId]);
    return { requests, isLoading, error, setRequests };
}
export function useAcceptedFriends(userId) {
    const [friends, setFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!userId)
            return;
        const fetchFriends = async () => {
            try {
                setIsLoading(true);
                const data = await getAcceptedFriends(userId);
                setFriends(data);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch friends'));
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchFriends();
    }, [userId]);
    return { friends, isLoading, error, setFriends };
}
