import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/services/supabase';
import * as logsService from '@/services/logs';
import { calculateStreak } from '@/utils/streak';
const mockSupabase = supabase;
describe('Supabase Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('Logs & Streaks Integration', () => {
        it('should calculate streak from fetched logs', async () => {
            const today = new Date();
            const logs = [
                {
                    id: '1',
                    user_id: 'user1',
                    date: today.toISOString().split('T')[0],
                    start_time: '09:00',
                    end_time: '10:00',
                    duration_minutes: 60,
                    created_at: '',
                    updated_at: '',
                },
                {
                    id: '2',
                    user_id: 'user1',
                    date: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    start_time: '09:00',
                    end_time: '10:00',
                    duration_minutes: 60,
                    created_at: '',
                    updated_at: '',
                },
            ];
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: logs,
                            error: null,
                        }),
                    }),
                }),
            });
            const userLogs = await logsService.getUserLogs('user1');
            const streak = calculateStreak(userLogs);
            expect(streak).toBe(2);
            expect(userLogs).toHaveLength(2);
        });
        it('should handle empty logs for streak calculation', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: [],
                            error: null,
                        }),
                    }),
                }),
            });
            const userLogs = await logsService.getUserLogs('user1');
            const streak = calculateStreak(userLogs);
            expect(streak).toBe(0);
        });
        it('should recalculate streak after adding new log', async () => {
            const today = new Date();
            // Mock first call - before adding log
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: [],
                            error: null,
                        }),
                    }),
                }),
            });
            const initialLogs = await logsService.getUserLogs('user1');
            const initialStreak = calculateStreak(initialLogs);
            expect(initialStreak).toBe(0);
            // Mock add log
            mockSupabase.from.mockReturnValueOnce({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue({
                        data: [
                            {
                                id: '1',
                                user_id: 'user1',
                                date: today.toISOString().split('T')[0],
                                start_time: '09:00',
                                end_time: '10:00',
                                duration_minutes: 60,
                                created_at: '',
                                updated_at: '',
                            },
                        ],
                        error: null,
                    }),
                }),
            });
            await logsService.addLog('user1', {
                date: today.toISOString().split('T')[0],
                start_time: '09:00',
                end_time: '10:00',
                duration_minutes: 60,
            });
            // Mock second call - after adding log
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: '1',
                                    user_id: 'user1',
                                    date: today.toISOString().split('T')[0],
                                    start_time: '09:00',
                                    end_time: '10:00',
                                    duration_minutes: 60,
                                    created_at: '',
                                    updated_at: '',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            });
            const updatedLogs = await logsService.getUserLogs('user1');
            const updatedStreak = calculateStreak(updatedLogs);
            expect(updatedStreak).toBe(1);
        });
    });
    describe('Date Range Queries Integration', () => {
        it('should fetch logs within date range', async () => {
            const logs = [
                {
                    id: '2',
                    user_id: 'user1',
                    date: '2024-01-20',
                    start_time: '09:00',
                    end_time: '10:00',
                    duration_minutes: 60,
                    created_at: '',
                    updated_at: '',
                },
                {
                    id: '1',
                    user_id: 'user1',
                    date: '2024-01-15',
                    start_time: '09:00',
                    end_time: '10:00',
                    duration_minutes: 60,
                    created_at: '',
                    updated_at: '',
                },
            ];
            const chainable = {
                gte: vi.fn().mockReturnThis(),
                lte: vi.fn().mockResolvedValue({
                    data: logs,
                    error: null,
                }),
            };
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue(chainable),
                    }),
                }),
            });
            const userLogs = await logsService.getUserLogs('user1', '2024-01-10', '2024-01-25');
            expect(userLogs).toHaveLength(2);
            expect(userLogs[0].date).toBe('2024-01-20'); // Descending order
            expect(userLogs[1].date).toBe('2024-01-15');
        });
        it('should handle queries with only start date', async () => {
            const logs = [
                {
                    id: '1',
                    user_id: 'user1',
                    date: '2024-01-20',
                    start_time: '09:00',
                    end_time: '10:00',
                    duration_minutes: 60,
                    created_at: '',
                    updated_at: '',
                },
            ];
            const chainable = {
                gte: vi.fn().mockResolvedValue({
                    data: logs,
                    error: null,
                }),
            };
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue(chainable),
                    }),
                }),
            });
            const userLogs = await logsService.getUserLogs('user1', '2024-01-10');
            expect(userLogs).toHaveLength(1);
        });
        it('should handle queries with only end date', async () => {
            const chainable = {
                lte: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            };
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue(chainable),
                    }),
                }),
            });
            const userLogs = await logsService.getUserLogs('user1', undefined, '2024-01-25');
            expect(userLogs).toEqual([]);
        });
    });
    describe('Hours Calculation Integration', () => {
        it('should calculate total hours from multiple logs', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [
                            { duration_minutes: 480 }, // 8 hours
                            { duration_minutes: 240 }, // 4 hours
                            { duration_minutes: 90 }, // 1.5 hours
                        ],
                        error: null,
                    }),
                }),
            });
            const totals = await logsService.getTotalHoursByUser('user1');
            expect(totals.totalMinutes).toBe(810);
            expect(totals.totalHours).toBe(13);
            expect(totals.remainingMinutes).toBe(30);
        });
        it('should handle rounding of remaining minutes', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [
                            { duration_minutes: 125 }, // 2h 5m
                            { duration_minutes: 185 }, // 3h 5m
                        ],
                        error: null,
                    }),
                }),
            });
            const totals = await logsService.getTotalHoursByUser('user1');
            expect(totals.totalMinutes).toBe(310);
            expect(totals.totalHours).toBe(5);
            expect(totals.remainingMinutes).toBe(10);
        });
    });
    describe('Update & Delete Operations', () => {
        it('should update log successfully', async () => {
            mockSupabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: 'log1',
                                    user_id: 'user1',
                                    date: '2024-01-15',
                                    start_time: '09:00',
                                    end_time: '11:00',
                                    duration_minutes: 120,
                                    created_at: '',
                                    updated_at: '',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            });
            const updated = await logsService.updateLog('log1', {
                end_time: '11:00',
                duration_minutes: 120,
            });
            expect(updated.duration_minutes).toBe(120);
        });
        it('should delete log successfully', async () => {
            mockSupabase.from.mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: null,
                    }),
                }),
            });
            // Should not throw
            await expect(logsService.deleteLog('log1')).resolves.toBeUndefined();
        });
        it('should handle concurrent update and delete operations', async () => {
            mockSupabase.from
                .mockReturnValueOnce({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: 'log1',
                                    user_id: 'user1',
                                    date: '2024-01-15',
                                    start_time: '09:00',
                                    end_time: '10:00',
                                    duration_minutes: 60,
                                    created_at: '',
                                    updated_at: '',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            })
                .mockReturnValueOnce({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: null,
                    }),
                }),
            });
            // Perform both operations in parallel
            const [updateResult, deleteResult] = await Promise.all([
                logsService.updateLog('log1', { duration_minutes: 60 }),
                logsService.deleteLog('log2'),
            ]);
            expect(updateResult.id).toBe('log1');
            expect(deleteResult).toBeUndefined();
        });
    });
    describe('Error Handling in Integration', () => {
        it('should handle timeout in batch operations', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockRejectedValue(new Error('Query timeout')),
                    }),
                }),
            });
            await expect(logsService.getUserLogs('user1')).rejects.toThrow('Query timeout');
        });
        it('should handle partial failures in multi-operation sequences', async () => {
            // First operation succeeds
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: '1',
                                    user_id: 'user1',
                                    date: '2024-01-15',
                                    start_time: '09:00',
                                    end_time: '10:00',
                                    duration_minutes: 60,
                                    created_at: '',
                                    updated_at: '',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            });
            const logs = await logsService.getUserLogs('user1');
            expect(logs).toHaveLength(1);
            // Second operation fails
            mockSupabase.from.mockReturnValueOnce({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockResolvedValue({
                            data: null,
                            error: new Error('Update failed'),
                        }),
                    }),
                }),
            });
            await expect(logsService.updateLog('1', { duration_minutes: 120 })).rejects.toThrow('Update failed');
        });
    });
});
