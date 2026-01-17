import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAcceptedFriends } from '@/hooks/useFriends';
import { useTotalHours } from '@/hooks/useLogs';
import { getTotalHoursByUser } from '@/services/logs';
import { useState, useEffect } from 'react';
import Card from '@/components/Card';
function LeaderboardPage() {
    const { user } = useAuth();
    const { friends } = useAcceptedFriends(user?.id);
    const { hours: userHours } = useTotalHours(user?.id);
    const [friendsHours, setFriendsHours] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    console.log('LeaderboardPage - friends from hook:', friends);
    useEffect(() => {
        const fetchFriendHours = async () => {
            try {
                const hours = {};
                console.log('fetchFriendHours - friends.length:', friends.length);
                for (const friendship of friends) {
                    // Determine which user is the friend based on the friendship direction
                    const isFriendUser = friendship.user_id === user?.id;
                    const friendId = isFriendUser ? friendship.friend_id : friendship.user_id;
                    const friendData = friendship.friend;
                    console.log('Processing friend:', { friendId, isFriendUser, friendData });
                    const totalHours = await getTotalHoursByUser(friendId);
                    console.log('Got hours for', friendData?.display_name, ':', totalHours);
                    hours[friendId] = {
                        userId: friendId,
                        displayName: friendData.display_name || friendData.email,
                        totalHours: totalHours.totalHours,
                        remainingMinutes: totalHours.remainingMinutes,
                    };
                }
                console.log('friendsHours to be set:', hours);
                setFriendsHours(hours);
            }
            catch (err) {
                console.error('Failed to fetch friend hours:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        if (friends.length > 0) {
            fetchFriendHours();
        }
        else {
            setIsLoading(false);
        }
    }, [friends]);
    const leaderboard = useMemo(() => {
        if (!user)
            return [];
        const entries = [
            {
                userId: user.id,
                displayName: 'You',
                totalHours: userHours.totalHours,
                remainingMinutes: userHours.remainingMinutes,
            },
            ...Object.values(friendsHours).filter(friend => friend.userId !== user.id),
        ];
        return entries.sort((a, b) => (b.totalHours * 60 + b.remainingMinutes) - (a.totalHours * 60 + a.remainingMinutes));
    }, [user, userHours, friendsHours]);
    if (isLoading || !user) {
        return (_jsx("div", { className: "min-h-screen bg-gray-100 py-8 px-4", children: _jsx("div", { className: "max-w-4xl mx-auto", children: _jsx("p", { children: "Loading leaderboard..." }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-100 py-8 px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900", children: "Leaderboard" }), leaderboard.length === 1 ? (_jsx(Card, { children: _jsx("p", { className: "text-center text-gray-600", children: "Add friends to see the leaderboard. Visit the Friends page to get started!" }) })) : (_jsx(Card, { children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "text-left py-3 px-4", children: "Rank" }), _jsx("th", { className: "text-left py-3 px-4", children: "Name" }), _jsx("th", { className: "text-right py-3 px-4", children: "Total Hours" })] }) }), _jsx("tbody", { children: leaderboard.map((entry, index) => (_jsxs("tr", { className: `border-b ${entry.userId === user?.id ? 'bg-blue-50 dark:bg-blue-900' : ''}`, children: [_jsx("td", { className: "py-3 px-4", children: _jsxs("span", { className: "text-lg font-bold text-gray-600", children: ["#", index + 1] }) }), _jsx("td", { className: "py-3 px-4", children: entry.displayName }), _jsxs("td", { className: "text-right py-3 px-4 font-semibold", children: [entry.totalHours, "h ", entry.remainingMinutes, "m"] })] }, entry.userId))) })] }) }))] }) }));
}
export default LeaderboardPage;
