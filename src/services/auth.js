import { supabase } from './supabase';
export async function signUp(email, password, displayName) {
    const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
    });
    if (signUpError)
        throw signUpError;
    if (!data.user)
        throw new Error('User creation failed');
    // Create profile - this is required for foreign key constraint
    const { error: profileError } = await supabase.from('profiles').insert([
        {
            id: data.user.id,
            email: email,
            display_name: displayName,
        },
    ]);
    if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
    }
    return data.user;
}
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error)
        throw error;
    return data.user;
}
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error)
        throw error;
}
export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) {
        console.error('Failed to fetch profile:', error);
        return null;
    }
    return data;
}
export async function updateProfile(userId, displayName) {
    const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', userId);
    if (error)
        throw error;
}
