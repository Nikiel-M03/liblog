import { describe, it, expect } from 'vitest';
import { calculateDurationMinutes, formatDuration, getStartOfWeek, getStartOfMonth } from '@/utils/time';
describe('Time utilities', () => {
    describe('calculateDurationMinutes', () => {
        it('should calculate duration for same day', () => {
            const minutes = calculateDurationMinutes('09:00', '10:30', '2024-01-15');
            expect(minutes).toBe(90);
        });
        it('should handle sessions crossing midnight', () => {
            const minutes = calculateDurationMinutes('23:00', '01:00', '2024-01-15');
            expect(minutes).toBe(120);
        });
        it('should throw for negative duration', () => {
            expect(() => {
                calculateDurationMinutes('10:30', '09:00', '2024-01-15');
            }).toThrowError('End time cannot be before start time');
        });
        it('should handle zero duration', () => {
            const minutes = calculateDurationMinutes('09:00', '09:00', '2024-01-15');
            expect(minutes).toBe(0);
        });
        it('should handle cross-date sessions correctly', () => {
            const minutes = calculateDurationMinutes('22:00', '02:00', '2024-01-15', '2024-01-16');
            expect(minutes).toBe(240);
        });
    });
    describe('formatDuration', () => {
        it('should format minutes only', () => {
            expect(formatDuration(45)).toBe('45m');
        });
        it('should format hours only', () => {
            expect(formatDuration(120)).toBe('2h');
        });
        it('should format hours and minutes', () => {
            expect(formatDuration(90)).toBe('1h 30m');
        });
        it('should handle zero', () => {
            expect(formatDuration(0)).toBe('0m');
        });
    });
    describe('getStartOfWeek', () => {
        it('should return Monday of the week', () => {
            const date = new Date('2024-01-17'); // Wednesday
            const start = getStartOfWeek(date);
            expect(start.getDay()).toBe(1); // Monday
            expect(start.getDate()).toBe(15);
        });
    });
    describe('getStartOfMonth', () => {
        it('should return first day of month', () => {
            const date = new Date('2024-01-15');
            const start = getStartOfMonth(date);
            expect(start.getDate()).toBe(1);
            expect(start.getMonth()).toBe(0);
        });
    });
});
