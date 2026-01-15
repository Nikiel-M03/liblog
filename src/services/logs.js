import { supabase } from './supabase';
export async function addLog(userId, log) {
    const { data, error } = await supabase
        .from('logs')
        .insert([{ ...log, user_id: userId }])
        .select();
    if (error)
        throw error;
    return data[0];
}
export async function getUserLogs(userId, startDate, endDate) {
    let query = supabase
        .from('logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
    if (startDate) {
        query = query.gte('date', startDate);
    }
    if (endDate) {
        query = query.lte('date', endDate);
    }
    const { data, error } = await query;
    if (error)
        throw error;
    return data;
}
export async function updateLog(logId, updates) {
    const { data, error } = await supabase
        .from('logs')
        .update(updates)
        .eq('id', logId)
        .select();
    if (error)
        throw error;
    return data[0];
}
export async function deleteLog(logId) {
    const { error } = await supabase.from('logs').delete().eq('id', logId);
    if (error)
        throw error;
}
export async function getTotalHoursByUser(userId) {
    const { data, error } = await supabase
        .from('logs')
        .select('duration_minutes')
        .eq('user_id', userId);
    if (error)
        throw error;
    const totalMinutes = data.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
    return {
        totalMinutes,
        totalHours: Math.floor(totalMinutes / 60),
        remainingMinutes: totalMinutes % 60,
    };
}
