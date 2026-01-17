import { describe, it, expect } from 'vitest';
import { calculateDurationMinutes, formatDuration, getStartOfWeek, getStartOfMonth, getStartOfDay, } from '@/utils/time';
describe('Time utilities - Edge Cases', () => {
    describe('calculateDurationMinutes - Edge Cases', () => {
        it('should handle very short durations (1 minute)', () => {
            const minutes = calculateDurationMinutes('09:00', '09:01', '2024-01-15');
            expect(minutes).toBe(1);
        });
        it('should handle very long durations (24+ hours)', () => {
            const minutes = calculateDurationMinutes('09:00', '09:00', '2024-01-15', '2024-01-17');
            expect(minutes).toBe(1440 * 2); // 2 days
        });
        it('should handle midnight exactly', () => {
            const minutes = calculateDurationMinutes('23:59', '00:01', '2024-01-15');
            expect(minutes).toBe(2);
        });
        it('should handle 00:00 start time', () => {
            const minutes = calculateDurationMinutes('00:00', '02:00', '2024-01-15');
            expect(minutes).toBe(120);
        });
        it('should handle 23:59 end time', () => {
            const minutes = calculateDurationMinutes('22:00', '23:59', '2024-01-15');
            expect(minutes).toBe(119);
        });
        it('should not auto-adjust midnight crossing for early morning start', () => {
            expect(() => {
                calculateDurationMinutes('09:00', '08:00', '2024-01-15');
            }).toThrowError('End time cannot be before start time');
        });
        it('should auto-adjust midnight crossing for evening start (>= 20:00)', () => {
            const minutes = calculateDurationMinutes('20:00', '02:00', '2024-01-15');
            expect(minutes).toBe(360); // 6 hours
        });
        it('should auto-adjust at exactly 20:00', () => {
            const minutes = calculateDurationMinutes('20:00', '02:00', '2024-01-15');
            expect(minutes).toBe(360); // 6 hours (midnight crossing)
        });
        it('should not auto-adjust at 19:59', () => {
            expect(() => {
                calculateDurationMinutes('19:59', '18:00', '2024-01-15');
            }).toThrowError('End time cannot be before start time');
        });
        it('should handle leap year dates', () => {
            const minutes = calculateDurationMinutes('09:00', '10:00', '2024-02-29');
            expect(minutes).toBe(60);
        });
        it('should handle year boundary transitions', () => {
            const minutes = calculateDurationMinutes('23:00', '01:00', '2024-12-31', '2025-01-01');
            expect(minutes).toBe(120);
        });
        it('should handle month boundary transitions', () => {
            const minutes = calculateDurationMinutes('23:00', '02:00', '2024-01-31', '2024-02-01');
            expect(minutes).toBe(180);
        });
    });
    describe('formatDuration - Edge Cases', () => {
        it('should handle single digit minutes', () => {
            expect(formatDuration(1)).toBe('1m');
            expect(formatDuration(9)).toBe('9m');
        });
        it('should handle 59 minutes', () => {
            expect(formatDuration(59)).toBe('59m');
        });
        it('should handle large hour values', () => {
            expect(formatDuration(3600)).toBe('60h');
        });
        it('should handle very large durations', () => {
            expect(formatDuration(14400)).toBe('240h'); // 10 days
        });
        it('should handle 60 minute boundary', () => {
            expect(formatDuration(60)).toBe('1h');
            expect(formatDuration(61)).toBe('1h 1m');
        });
    });
    describe('getStartOfWeek - Edge Cases', () => {
        it('should return Monday for Sunday', () => {
            const date = new Date('2024-01-14'); // Sunday
            const start = getStartOfWeek(date);
            expect(start.getDay()).toBe(1); // Monday
            expect(start.getDate()).toBe(8);
        });
        it('should return same day for Monday', () => {
            const date = new Date('2024-01-15'); // Monday
            const start = getStartOfWeek(date);
            expect(start.getDay()).toBe(1);
            expect(start.getDate()).toBe(15); // Monday itself
        });
        it('should return previous Monday for Saturday', () => {
            const date = new Date('2024-01-20'); // Saturday
            const start = getStartOfWeek(date);
            expect(start.getDay()).toBe(1);
            expect(start.getDate()).toBe(15);
        });
        it('should handle month boundary', () => {
            const date = new Date('2024-02-04'); // Sunday
            const start = getStartOfWeek(date);
            expect(start.getMonth()).toBe(0); // January
            expect(start.getDate()).toBe(29); // Previous Monday in January->February boundary
        });
        it('should handle year boundary', () => {
            const date = new Date('2025-01-05'); // Sunday
            const start = getStartOfWeek(date);
            expect(start.getFullYear()).toBe(2024);
            expect(start.getMonth()).toBe(11); // December
            expect(start.getDate()).toBe(30); // Previous Monday in 2024->2025 boundary
        });
    });
    describe('getStartOfMonth - Edge Cases', () => {
        it('should handle already first day of month', () => {
            const date = new Date(2024, 0, 1); // Use constructor instead of string parsing
            const start = getStartOfMonth(date);
            expect(start.getDate()).toBe(1);
            expect(start.getMonth()).toBe(0); // January
            expect(start.getFullYear()).toBe(2024);
        });
        it('should handle last day of month', () => {
            const date = new Date('2024-01-31');
            const start = getStartOfMonth(date);
            expect(start.getDate()).toBe(1);
            expect(start.getMonth()).toBe(0);
        });
        it('should handle February in leap year', () => {
            const date = new Date('2024-02-29');
            const start = getStartOfMonth(date);
            expect(start.getDate()).toBe(1);
            expect(start.getMonth()).toBe(1);
        });
        it('should handle December -> January boundary', () => {
            const date = new Date('2024-12-31');
            const start = getStartOfMonth(date);
            expect(start.getDate()).toBe(1);
            expect(start.getMonth()).toBe(11);
            expect(start.getFullYear()).toBe(2024);
        });
    });
    describe('getStartOfDay - Edge Cases', () => {
        it('should reset to midnight', () => {
            const date = new Date('2024-01-15T23:59:59.999');
            const start = getStartOfDay(date);
            expect(start.getHours()).toBe(0);
            expect(start.getMinutes()).toBe(0);
            expect(start.getSeconds()).toBe(0);
            expect(start.getMilliseconds()).toBe(0);
        });
        it('should handle already midnight', () => {
            const date = new Date('2024-01-15T00:00:00');
            const start = getStartOfDay(date);
            expect(start.getHours()).toBe(0);
            expect(start.getDate()).toBe(15);
        });
        it('should handle month boundary', () => {
            const date = new Date('2024-01-31T12:30:00');
            const start = getStartOfDay(date);
            expect(start.getDate()).toBe(31);
            expect(start.getMonth()).toBe(0);
        });
    });
});
