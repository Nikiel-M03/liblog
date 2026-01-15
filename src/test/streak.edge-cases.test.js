import { describe, it, expect } from 'vitest';
import { calculateStreak, getUniqueDates } from '@/utils/streak';
const createLog = (id, date, startTime = '09:00', endTime = '10:00') => ({
    id,
    user_id: 'user1',
    date,
    start_time: startTime,
    end_time: endTime,
    duration_minutes: 60,
    created_at: '',
    updated_at: '',
});
describe('Streak utilities - Edge Cases', () => {
    describe('calculateStreak - Edge Cases', () => {
        it('should return 1 for single log today', () => {
            const today = new Date();
            const logs = [createLog('1', today.toISOString().split('T')[0])];
            expect(calculateStreak(logs)).toBe(1);
        });
        it('should return 0 for log from 2 days ago without today', () => {
            const today = new Date();
            const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
            const logs = [createLog('1', twoDaysAgo.toISOString().split('T')[0])];
            expect(calculateStreak(logs)).toBe(0);
        });
        it('should handle multiple logs on same day correctly', () => {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const logs = [
                createLog('1', todayStr),
                createLog('2', todayStr),
                createLog('3', todayStr),
            ];
            expect(calculateStreak(logs)).toBe(1);
        });
        it('should count long streak correctly', () => {
            const today = new Date();
            const logs = [];
            // Create 30-day streak
            for (let i = 0; i < 30; i++) {
                const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
                logs.push(createLog(`${i}`, date.toISOString().split('T')[0]));
            }
            expect(calculateStreak(logs)).toBe(30);
        });
        it('should break streak with gap in future logs', () => {
            const today = new Date();
            const logs = [
                createLog('1', today.toISOString().split('T')[0]),
                createLog('2', new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
                // Skip 1 day
                createLog('3', new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
            ];
            expect(calculateStreak(logs)).toBe(2);
        });
        it('should handle logs with future dates (doesn\'t count)', () => {
            const today = new Date();
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            const logs = [createLog('1', tomorrow.toISOString().split('T')[0])];
            expect(calculateStreak(logs)).toBe(0);
        });
        it('should not count streak if first matching date is not today or yesterday', () => {
            const today = new Date();
            const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
            const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
            const logs = [
                createLog('1', twoDaysAgo.toISOString().split('T')[0]),
                createLog('2', threeDaysAgo.toISOString().split('T')[0]),
            ];
            expect(calculateStreak(logs)).toBe(0);
        });
        it('should handle logs sorted in random order', () => {
            const today = new Date();
            const logs = [
                createLog('3', new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
                createLog('1', today.toISOString().split('T')[0]),
                createLog('2', new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
            ];
            expect(calculateStreak(logs)).toBe(3);
        });
        it('should handle duplicate dates in logs', () => {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const logs = [
                createLog('1', todayStr),
                createLog('2', todayStr),
                createLog('3', yesterday),
                createLog('4', yesterday),
            ];
            expect(calculateStreak(logs)).toBe(2);
        });
    });
    describe('getUniqueDates - Edge Cases', () => {
        it('should return empty array for empty logs', () => {
            expect(getUniqueDates([])).toEqual([]);
        });
        it('should handle single date', () => {
            const logs = [createLog('1', '2024-01-15')];
            expect(getUniqueDates(logs)).toEqual(['2024-01-15']);
        });
        it('should remove duplicates and sort', () => {
            const logs = [
                createLog('1', '2024-01-15'),
                createLog('2', '2024-01-15'),
                createLog('3', '2024-01-10'),
                createLog('4', '2024-01-10'),
                createLog('5', '2024-01-20'),
            ];
            expect(getUniqueDates(logs)).toEqual(['2024-01-10', '2024-01-15', '2024-01-20']);
        });
        it('should sort dates correctly with mixed month/year', () => {
            const logs = [
                createLog('1', '2024-12-31'),
                createLog('2', '2024-01-01'),
                createLog('3', '2025-01-01'),
                createLog('4', '2024-06-15'),
            ];
            const dates = getUniqueDates(logs);
            expect(dates).toEqual(['2024-01-01', '2024-06-15', '2024-12-31', '2025-01-01']);
        });
        it('should handle dates across multiple years', () => {
            const logs = [
                createLog('1', '2023-12-31'),
                createLog('2', '2024-01-01'),
                createLog('3', '2025-01-01'),
            ];
            expect(getUniqueDates(logs)).toEqual(['2023-12-31', '2024-01-01', '2025-01-01']);
        });
        it('should handle large number of unique dates', () => {
            const logs = [];
            for (let i = 0; i < 365; i++) {
                const date = new Date(2024, 0, 1);
                date.setDate(date.getDate() + i);
                logs.push(createLog(`${i}`, date.toISOString().split('T')[0]));
            }
            const dates = getUniqueDates(logs);
            expect(dates.length).toBe(365);
            expect(dates[0]).toBe('2024-01-01');
        });
    });
});
