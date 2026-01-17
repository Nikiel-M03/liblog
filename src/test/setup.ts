import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase
vi.mock('@/services/supabase', () => {
    const supabase = {
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
        rpc: vi.fn(),
    };
    
    // Don't set default mocks - tests must set them up
    // This avoids conflicts with test-specific mockReturnValue() calls
    
    return { supabase };
});
