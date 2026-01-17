import { supabase } from './supabase'
import type { Database } from '@/types/supabase'

type Friendship = Database['public']['Tables']['friendships']['Row']

export async function sendFriendRequest(fromUserId: string, toEmail: string) {
  // First, get the user ID from email
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', toEmail)
    .single()

  if (profileError || !profiles) throw new Error('User not found')

  const toUserId = profiles.id

  // Check if trying to friend yourself
  if (fromUserId === toUserId) throw new Error('Cannot send a friend request to yourself')

  // Check if friendship already exists
  const { data: existing } = await supabase
    .from('friendships')
    .select('*')
    .or(
      `and(user_id.eq.${fromUserId},friend_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_id.eq.${fromUserId})`,
    )
    .single()

  if (existing) {
    throw new Error('Friendship request already exists')
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
    .select('*, friend:friend_id(id, email, display_name)')

  if (error) throw error

  return data[0]
}

export async function acceptFriendRequest(friendshipId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)
    .select()

  if (error) throw error

  return data[0]
}

export async function rejectFriendRequest(friendshipId: string) {
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)

  if (error) throw error
}

export async function getPendingRequests(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select('*, user:user_id(id, email, display_name)')
    .eq('friend_id', userId)
    .eq('status', 'pending')

  if (error) throw error

  return data as Friendship[]
}

export async function getAcceptedFriends(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select('*, friend:friend_id(id, email, display_name), user:user_id(id, email, display_name)')
    .or(
      `and(user_id.eq.${userId},status.eq.accepted),and(friend_id.eq.${userId},status.eq.accepted)`
    )

  if (error) throw error

  console.log('Raw friendship data for', userId, ':', data)

  // Normalize the data: if user_id is the current user, use friend; otherwise use user
  const normalizedData = data?.map(friendship => ({
    ...friendship,
    friend:
      friendship.user_id === userId
        ? friendship.friend
        : { id: friendship.user?.id, email: friendship.user?.email, display_name: friendship.user?.display_name }
  }))

  console.log('Normalized friends data:', normalizedData)
  normalizedData?.forEach(f => {
    console.log('Friend entry:', { user_id: f.user_id, friend_id: f.friend_id, friend: (f as any).friend })
  })

  return normalizedData as Friendship[]
}

export async function getOutgoingRequests(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select('*, friend:friend_id(id, email, display_name)')
    .eq('user_id', userId)
    .eq('status', 'pending')

  if (error) throw error

  return data as Friendship[]
}

export async function removeFriend(friendshipId: string) {
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)

  if (error) throw error
}

export async function cancelFriendRequest(friendshipId: string) {
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)

  if (error) throw error
}
