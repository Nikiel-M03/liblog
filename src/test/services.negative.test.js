import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addLog, getUserLogs, updateLog, deleteLog, getTotalHoursByUser } from '@/services/logs';
import { signUp, signIn, signOut, getProfile, updateProfile } from '@/services/auth';
import { supabase } from '@/services/supabase';
// Cast to any to access mocks
const mockSupabase = supabase;
describe('Services - Negative Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('Logs service - Negative Cases', () => {
        it('should throw error when adding log fails', async () => {
            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue({
                        data: null,
                        error: new Error('Database error'),
                    }),
                }),
            });
            await expect(addLog('user1', { date: '2024-01-15', start_time: '09:00', end_time: '10:00', duration_minutes: 60 })).rejects.toThrow('Database error');
        });
        it('should throw error when getUserLogs fails', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: null,
                            error: new Error('Query failed'),
                        }),
                    }),
                }),
            });
            await expect(getUserLogs('user1')).rejects.toThrow('Query failed');
        });
        it('should throw error when updateLog fails', async () => {
            mockSupabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockResolvedValue({
                            data: null,
                            error: new Error('Update failed'),
                        }),
                    }),
                }),
            });
            await expect(updateLog('log1', { duration_minutes: 120 })).rejects.toThrow('Update failed');
        });
        it('should throw error when deleteLog fails', async () => {
            mockSupabase.from.mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: new Error('Delete failed'),
                    }),
                }),
            });
            await expect(deleteLog('log1')).rejects.toThrow('Delete failed');
        });
        it('should throw error when getTotalHoursByUser fails', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: null,
                        error: new Error('Total hours query failed'),
                    }),
                }),
            });
            await expect(getTotalHoursByUser('user1')).rejects.toThrow('Total hours query failed');
        });
        it('should handle empty results from getTotalHoursByUser', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            });
            const result = await getTotalHoursByUser('user1');
            expect(result.totalMinutes).toBe(0);
            expect(result.totalHours).toBe(0);
            expect(result.remainingMinutes).toBe(0);
        });
        it('should calculate total hours correctly with non-zero minutes', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [
                            { duration_minutes: 90 },
                            { duration_minutes: 120 },
                            { duration_minutes: 45 },
                        ],
                        error: null,
                    }),
                }),
            });
            const result = await getTotalHoursByUser('user1');
            expect(result.totalMinutes).toBe(255);
            expect(result.totalHours).toBe(4);
            expect(result.remainingMinutes).toBe(15);
        });
        it('should handle null duration_minutes values', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [
                            { duration_minutes: 60 },
                            { duration_minutes: null },
                            { duration_minutes: 120 },
                        ],
                        error: null,
                    }),
                }),
            });
            const result = await getTotalHoursByUser('user1');
            expect(result.totalMinutes).toBe(180);
            expect(result.totalHours).toBe(3);
        });
    });
    describe('Auth service - Negative Cases', () => {
        it('should throw error on signUp failure', async () => {
            mockSupabase.auth.signUp.mockResolvedValue({
                data: null,
                error: new Error('Email already registered'),
            });
            await expect(signUp('test@example.com', 'password123', 'Test User')).rejects.toThrow('Email already registered');
        });
        it('should throw error when user creation returns no user', async () => {
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: null },
                error: null,
            });
            await expect(signUp('test@example.com', 'password123', 'Test User')).rejects.toThrow('User creation failed');
        });
        it('should throw error when profile creation fails', async () => {
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: { id: 'user1' } },
                error: null,
            });
            if (typeof mockSupabase.rpc === 'function' && mockSupabase.rpc.mockResolvedValue) {
                mockSupabase.rpc.mockResolvedValue({
                    data: null,
                    error: new Error('Profile insert failed'),
                });
            }
            await expect(signUp('test@example.com', 'password123', 'Test User')).rejects.toThrow('Failed to set display name: Profile insert failed');
        });
        it('should throw error on signIn failure', async () => {
            mockSupabase.auth.signInWithPassword.mockResolvedValue({
                data: null,
                error: new Error('Invalid credentials'),
            });
            await expect(signIn('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
        });
        it('should throw error on signOut failure', async () => {
            mockSupabase.auth.signOut.mockResolvedValue({
                error: new Error('Session invalid'),
            });
            await expect(signOut()).rejects.toThrow('Session invalid');
        });
        it('should return null when getProfile fails', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: new Error('Profile not found'),
                        }),
                    }),
                }),
            });
            const result = await getProfile('user1');
            expect(result).toBeNull();
        });
        it('should throw error on updateProfile failure', async () => {
            mockSupabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: new Error('Update failed'),
                    }),
                }),
            });
            await expect(updateProfile('user1', 'New Name')).rejects.toThrow('Update failed');
        });
    });
    describe('Integration - Cross-service Negative Cases', () => {
        it('should handle Supabase connection errors gracefully', async () => {
            mockSupabase.from.mockImplementation(() => {
                throw new Error('Network error');
            });
            await expect(getUserLogs('user1')).rejects.toThrow('Network error');
        });
        it('should throw error with proper message format from DB', async () => {
            const dbError = {
                message: 'Unique violation',
                code: '23505',
            };
            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue({
                        data: null,
                        error: dbError,
                    }),
                }),
            });
            await expect(addLog('user1', { date: '2024-01-15', start_time: '09:00', end_time: '10:00', duration_minutes: 60 })).rejects.toEqual(dbError);
        });
    });
});
