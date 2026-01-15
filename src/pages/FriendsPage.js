import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePendingRequests, useAcceptedFriends } from '@/hooks/useFriends';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, } from '@/services/friends';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
function FriendsPage() {
    const { user } = useAuth();
    const { requests, setRequests } = usePendingRequests(user?.id);
    const { friends, setFriends } = useAcceptedFriends(user?.id);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSendRequest = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            await sendFriendRequest(user.id, email);
            setSuccess(`Friend request sent to ${email}`);
            setEmail('');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send request');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAccept = async (friendshipId) => {
        try {
            await acceptFriendRequest(friendshipId);
            setRequests(requests.filter((r) => r.id !== friendshipId));
            const accepted = requests.find((r) => r.id === friendshipId);
            if (accepted) {
                setFriends([...friends, accepted]);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to accept request');
        }
    };
    const handleReject = async (friendshipId) => {
        try {
            await rejectFriendRequest(friendshipId);
            setRequests(requests.filter((r) => r.id !== friendshipId));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reject request');
        }
    };
    const handleRemove = async (friendshipId) => {
        try {
            await removeFriend(friendshipId);
            setFriends(friends.filter((f) => f.id !== friendshipId));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove friend');
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-100 py-8 px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsx("h1", { className: "text-4xl font-bold", children: "Friends" }), error && _jsx("div", { className: "p-3 bg-red-100 text-red-700 rounded-lg", children: error }), success && _jsx("div", { className: "p-3 bg-green-100 text-green-700 rounded-lg", children: success }), _jsx(Card, { title: "Send Friend Request", children: _jsxs("form", { onSubmit: handleSendRequest, className: "space-y-4", children: [_jsx(Input, { label: "Friend's Email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "friend@example.com", required: true }), _jsx(Button, { isLoading: isLoading, className: "w-full", children: "Send Request" })] }) }), requests.length > 0 && (_jsx(Card, { title: "Pending Requests", children: _jsx("div", { className: "space-y-4", children: requests.map((request) => {
                            const sender = request.user;
                            return (_jsxs("div", { className: "flex justify-between items-center p-4 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: sender.display_name || sender.email }), _jsx("p", { className: "text-sm text-gray-600", children: sender.email })] }), _jsxs("div", { className: "space-x-2", children: [_jsx(Button, { size: "sm", onClick: () => handleAccept(request.id), children: "Accept" }), _jsx(Button, { size: "sm", variant: "danger", onClick: () => handleReject(request.id), children: "Reject" })] })] }, request.id));
                        }) }) })), friends.length > 0 && (_jsx(Card, { title: "Friends", children: _jsx("div", { className: "space-y-4", children: friends.map((friendship) => {
                            const friendData = friendship.friend;
                            return (_jsxs("div", { className: "flex justify-between items-center p-4 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: friendData.display_name || friendData.email }), _jsx("p", { className: "text-sm text-gray-600", children: friendData.email })] }), _jsx(Button, { size: "sm", variant: "danger", onClick: () => handleRemove(friendship.id), children: "Remove" })] }, friendship.id));
                        }) }) })), requests.length === 0 && friends.length === 0 && (_jsx(Card, { children: _jsx("p", { className: "text-center text-gray-600", children: "No pending requests or friends yet. Send a request to get started!" }) }))] }) }));
}
export default FriendsPage;
