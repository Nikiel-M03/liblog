import { supabase } from './supabase';
export async function sendFriendRequest(fromUserId, toEmail) {
    // First, get the user ID from email
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', toEmail)
        .single();
    if (profileError)
        throw new Error('User not found');
    const toUserId = profiles.id;
    // Check if friendship already exists
    const { data: existing } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${fromUserId},friend_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_id.eq.${fromUserId})`)
        .single();
    if (existing) {
        throw new Error('Friendship request already exists');
    }
    // Create friendship request
    const { data, error } = await supabase
        .from('friendships')
        .insert([
        {
            user_id: fromUserId,
            friend_id: toUserId,
            status: 'pending',
        },
    ])
        .select();
    if (error)
        throw error;
    return data[0];
}
export async function acceptFriendRequest(friendshipId) {
    const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .select();
    if (error)
        throw error;
    return data[0];
}
export async function rejectFriendRequest(friendshipId) {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
    if (error)
        throw error;
}
export async function getPendingRequests(userId) {
    const { data, error } = await supabase
        .from('friendships')
        .select('*, user:user_id(id, email, display_name)')
        .eq('friend_id', userId)
        .eq('status', 'pending');
    if (error)
        throw error;
    return data;
}
export async function getAcceptedFriends(userId) {
    const { data, error } = await supabase
        .from('friendships')
        .select('*, friend:friend_id(id, email, display_name)')
        .eq('user_id', userId)
        .eq('status', 'accepted');
    if (error)
        throw error;
    return data;
}
export async function removeFriend(friendshipId) {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
    if (error)
        throw error;
}
