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
    // Profile is automatically created by trigger with email as display_name
    // Small delay to ensure profile exists before updating
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Call the RPC function to update display name
    const { error: rpcError } = await supabase.rpc('set_profile_display_name', {
        user_id: data.user.id,
        new_display_name: displayName,
    });
    if (rpcError) {
        console.error('Display name update error:', rpcError);
        throw new Error(`Failed to set display name: ${rpcError.message}`);
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
