import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLogs, useTotalHours } from '@/hooks/useLogs';
import { calculateStreak } from '@/utils/streak';
import { addLog, updateLog, deleteLog } from '@/services/logs';
import { getProfile } from '@/services/auth';
import LogForm from '@/features/logging/LogForm';
import LogList from '@/features/logging/LogList';
import Card from '@/components/Card';
function DashboardPage() {
    const { user } = useAuth();
    const { logs, setLogs } = useLogs(user?.id);
    const { hours } = useTotalHours(user?.id);
    const [profile, setProfile] = useState(null);
    const [streak, setStreak] = useState(0);
    const [editingLog, setEditingLog] = useState(null);
    useEffect(() => {
        if (!user?.id)
            return;
        const fetchProfile = async () => {
            try {
                const data = await getProfile(user.id);
                setProfile(data);
            }
            catch (err) {
                console.error('Failed to fetch profile:', err);
            }
        };
        fetchProfile();
    }, [user?.id]);
    useEffect(() => {
        setStreak(calculateStreak(logs));
    }, [logs]);
    const handleAddLog = async (logData) => {
        try {
            if (editingLog) {
                // Update existing log
                await updateLog(editingLog.id, logData);
                setLogs(logs.map((log) => (log.id === editingLog.id ? { ...log, ...logData } : log)));
                setEditingLog(null);
            }
            else {
                // Add new log
                const newLog = await addLog(user.id, logData);
                setLogs([newLog, ...logs]);
            }
        }
        catch (err) {
            console.error('Failed to save log:', err);
            throw err;
        }
    };
    const handleEdit = (log) => {
        setEditingLog(log);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleDelete = async (logId) => {
        try {
            await deleteLog(logId);
            setLogs(logs.filter((log) => log.id !== logId));
        }
        catch (err) {
            console.error('Failed to delete log:', err);
            throw err;
        }
    };
    const handleCancelEdit = () => {
        setEditingLog(null);
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-100 py-8 px-4", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900", children: "Dashboard" }), _jsxs("p", { className: "text-lg text-gray-600", children: ["Welcome, ", profile?.display_name ? profile.display_name : user?.email, "!"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { title: "Total Hours", children: _jsxs("p", { className: "text-3xl font-bold text-blue-600", children: [hours.totalHours, _jsxs("span", { className: "text-lg text-gray-600 ml-2", children: ["h ", hours.remainingMinutes, "m"] })] }) }), _jsxs(Card, { title: "Current Streak", children: [_jsx("p", { className: "text-3xl font-bold text-purple-600", children: streak }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: "days" })] }), _jsxs(Card, { title: "Sessions", children: [_jsx("p", { className: "text-3xl font-bold text-green-600", children: logs.length }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: "total logged" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx(LogForm, { onSubmit: handleAddLog, editingLog: editingLog, onCancel: handleCancelEdit }), _jsx("div", { className: "lg:col-span-2", children: _jsx(LogList, { logs: logs, onEdit: handleEdit, onDelete: handleDelete }) })] })] }) }));
}
export default DashboardPage;
