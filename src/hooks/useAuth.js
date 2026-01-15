import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
export function useAuth() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                setUser(data?.session?.user || null);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to get user'));
            }
            finally {
                setIsLoading(false);
            }
        };
        checkUser();
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });
        return () => subscription?.unsubscribe();
    }, []);
    return { user, isLoading, error };
}
