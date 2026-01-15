import '@testing-library/jest-dom';
import { vi } from 'vitest';
// Mock Supabase
vi.mock('@/services/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            onAuthStateChange: vi.fn(() => ({
                data: {
                    subscription: {
                        unsubscribe: vi.fn(),
                    },
                },
            })),
        },
        from: vi.fn(),
    },
}));
