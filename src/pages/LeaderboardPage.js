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
    useEffect(() => {
        const fetchFriendHours = async () => {
            try {
                const hours = {};
                for (const friendship of friends) {
                    const friendId = friendship.friend_id;
                    const friendData = friendship.friend;
                    const totalHours = await getTotalHoursByUser(friendId);
                    hours[friendId] = {
                        userId: friendId,
                        displayName: friendData.display_name || friendData.email,
                        totalHours: totalHours.totalHours,
                        totalMinutes: totalHours.totalMinutes,
                    };
                }
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
                totalMinutes: userHours.totalMinutes,
            },
            ...Object.values(friendsHours),
        ];
        return entries.sort((a, b) => b.totalMinutes - a.totalMinutes);
    }, [user, userHours, friendsHours]);
    if (isLoading || !user) {
        return (_jsx("div", { className: "min-h-screen bg-gray-100 py-8 px-4", children: _jsx("div", { className: "max-w-4xl mx-auto", children: _jsx("p", { children: "Loading leaderboard..." }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-100 py-8 px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsx("h1", { className: "text-4xl font-bold", children: "Leaderboard" }), leaderboard.length === 1 ? (_jsx(Card, { children: _jsx("p", { className: "text-center text-gray-600", children: "Add friends to see the leaderboard. Visit the Friends page to get started!" }) })) : (_jsx(Card, { children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "text-left py-3 px-4", children: "Rank" }), _jsx("th", { className: "text-left py-3 px-4", children: "Name" }), _jsx("th", { className: "text-right py-3 px-4", children: "Total Hours" })] }) }), _jsx("tbody", { children: leaderboard.map((entry, index) => (_jsxs("tr", { className: `border-b ${entry.userId === user?.id ? 'bg-blue-50 dark:bg-blue-900' : ''}`, children: [_jsx("td", { className: "py-3 px-4", children: _jsxs("span", { className: "text-lg font-bold text-gray-600", children: ["#", index + 1] }) }), _jsx("td", { className: "py-3 px-4", children: entry.displayName }), _jsxs("td", { className: "text-right py-3 px-4 font-semibold", children: [entry.totalHours, "h ", entry.totalMinutes % 60, "m"] })] }, entry.userId))) })] }) }))] }) }));
}
export default LeaderboardPage;
