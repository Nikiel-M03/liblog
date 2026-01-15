import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import LeaderboardPage from '@/pages/LeaderboardPage';
import * as useAuthModule from '@/hooks/useAuth';
import * as useFriendsModule from '@/hooks/useFriends';
import * as useLogsModule from '@/hooks/useLogs';
import * as logsService from '@/services/logs';
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/useFriends');
vi.mock('@/hooks/useLogs');
vi.mock('@/services/logs');
vi.mock('@/components/Card', () => ({
    default: ({ children }) => _jsx("div", { "data-testid": "card", children: children })
}));
describe('LeaderboardPage', () => {
    const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        user_metadata: { display_name: 'Test User' }
    };
    const mockFriends = [
        {
            friend_id: 'friend-1',
            friend: {
                id: 'friend-1',
                display_name: 'Friend One',
                email: 'friend1@example.com'
            }
        },
        {
            friend_id: 'friend-2',
            friend: {
                id: 'friend-2',
                display_name: 'Friend Two',
                email: 'friend2@example.com'
            }
        }
    ];
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('should show loading state when user is loading', () => {
        vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
            user: null,
            isLoading: true,
            error: null
        });
        vi.spyOn(useFriendsModule, 'useAcceptedFriends').mockReturnValue({
            friends: [],
            isLoading: true,
            error: null,
            setFriends: vi.fn()
        });
        vi.spyOn(useLogsModule, 'useTotalHours').mockReturnValue({
            hours: { totalHours: 0, totalMinutes: 0, remainingMinutes: 0 },
            isLoading: true,
            error: null
        });
        render(_jsx(LeaderboardPage, {}));
        expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
    });
    it('should handle null user gracefully and show loading state', () => {
        vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
            user: null,
            isLoading: false,
            error: null
        });
        vi.spyOn(useFriendsModule, 'useAcceptedFriends').mockReturnValue({
            friends: [],
            isLoading: false,
            error: null,
            setFriends: vi.fn()
        });
        vi.spyOn(useLogsModule, 'useTotalHours').mockReturnValue({
            hours: { totalHours: 0, totalMinutes: 0, remainingMinutes: 0 },
            isLoading: false,
            error: null
        });
        render(_jsx(LeaderboardPage, {}));
        // Should not crash and show loading message
        expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
    });
    it('should render leaderboard with user and friends', async () => {
        vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
            user: mockUser,
            isLoading: false,
            error: null
        });
        vi.spyOn(useFriendsModule, 'useAcceptedFriends').mockReturnValue({
            friends: mockFriends,
            isLoading: false,
            error: null,
            setFriends: vi.fn()
        });
        vi.spyOn(useLogsModule, 'useTotalHours').mockReturnValue({
            hours: { totalHours: 10, totalMinutes: 30, remainingMinutes: 30 },
            isLoading: false,
            error: null
        });
        vi.spyOn(logsService, 'getTotalHoursByUser')
            .mockResolvedValueOnce({ totalHours: 5, totalMinutes: 45, remainingMinutes: 45 })
            .mockResolvedValueOnce({ totalHours: 20, totalMinutes: 15, remainingMinutes: 15 });
        render(_jsx(LeaderboardPage, {}));
        await waitFor(() => {
            expect(screen.getByText('Leaderboard')).toBeInTheDocument();
            expect(screen.getByText('You')).toBeInTheDocument();
            expect(screen.getByText('Friend One')).toBeInTheDocument();
            expect(screen.getByText('Friend Two')).toBeInTheDocument();
        });
    });
    it('should show empty state when user has no friends', async () => {
        vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
            user: mockUser,
            isLoading: false,
            error: null
        });
        vi.spyOn(useFriendsModule, 'useAcceptedFriends').mockReturnValue({
            friends: [],
            isLoading: false,
            error: null,
            setFriends: vi.fn()
        });
        vi.spyOn(useLogsModule, 'useTotalHours').mockReturnValue({
            hours: { totalHours: 10, totalMinutes: 30, remainingMinutes: 30 },
            isLoading: false,
            error: null
        });
        render(_jsx(LeaderboardPage, {}));
        await waitFor(() => {
            expect(screen.getByText(/Add friends to see the leaderboard/i)).toBeInTheDocument();
        });
    });
    it('should sort leaderboard by total minutes descending', async () => {
        vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
            user: mockUser,
            isLoading: false,
            error: null
        });
        vi.spyOn(useFriendsModule, 'useAcceptedFriends').mockReturnValue({
            friends: mockFriends,
            isLoading: false,
            error: null,
            setFriends: vi.fn()
        });
        vi.spyOn(useLogsModule, 'useTotalHours').mockReturnValue({
            hours: { totalHours: 5, totalMinutes: 15, remainingMinutes: 15 },
            isLoading: false,
            error: null
        });
        vi.spyOn(logsService, 'getTotalHoursByUser')
            .mockResolvedValueOnce({ totalHours: 20, totalMinutes: 45, remainingMinutes: 45 })
            .mockResolvedValueOnce({ totalHours: 10, totalMinutes: 30, remainingMinutes: 30 });
        render(_jsx(LeaderboardPage, {}));
        await waitFor(() => {
            const rows = screen.getAllByRole('row');
            // rows[0] is header, rows[1] is first entry, etc
            expect(rows[1]).toHaveTextContent('Friend One');
            expect(rows[2]).toHaveTextContent('Friend Two');
            expect(rows[3]).toHaveTextContent('You');
        });
    });
});
