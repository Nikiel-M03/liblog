import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLogs } from '@/hooks/useLogs';
import { getStartOfMonth, getStartOfWeek } from '@/utils/time';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, } from 'recharts';
import Card from '@/components/Card';
function StatisticsPage() {
    const { user } = useAuth();
    const { logs } = useLogs(user?.id);
    const weeklyData = useMemo(() => {
        const data = {};
        const today = new Date();
        const weekStart = getStartOfWeek(today);
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            data[dateStr] = 0;
        }
        logs.forEach((log) => {
            if (new Date(log.date) >= weekStart) {
                data[log.date] = (data[log.date] || 0) + (log.duration_minutes || 0);
            }
        });
        return Object.entries(data)
            .map(([date, minutes]) => ({
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            hours: Math.round((minutes / 60) * 10) / 10,
            minutes,
        }))
            .slice(0, 7);
    }, [logs]);
    const monthlyData = useMemo(() => {
        const data = {};
        const today = new Date();
        const monthStart = getStartOfMonth(today);
        logs.forEach((log) => {
            const logDate = new Date(log.date);
            if (logDate >= monthStart) {
                const week = Math.ceil(logDate.getDate() / 7);
                const key = `Week ${week}`;
                data[key] = (data[key] || 0) + (log.duration_minutes || 0);
            }
        });
        return Object.entries(data)
            .map(([week, minutes]) => ({
            week,
            hours: Math.round((minutes / 60) * 10) / 10,
        }));
    }, [logs]);
    const dailyStats = useMemo(() => {
        const stats = {};
        logs.forEach((log) => {
            if (!stats[log.date]) {
                stats[log.date] = { minutes: 0, count: 0 };
            }
            stats[log.date].minutes += log.duration_minutes || 0;
            stats[log.date].count += 1;
        });
        return Object.entries(stats)
            .map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            hours: Math.round((data.minutes / 60) * 10) / 10,
            sessions: data.count,
        }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-30);
    }, [logs]);
    return (_jsx("div", { className: "min-h-screen bg-gray-100 py-8 px-4", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900", children: "Statistics" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(Card, { title: "This Week", children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: weeklyData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "hours", fill: "#3b82f6" })] }) }) }), _jsx(Card, { title: "This Month (Weekly)", children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: monthlyData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "week" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "hours", fill: "#8b5cf6" })] }) }) })] }), _jsx(Card, { title: "Last 30 Days", children: _jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(LineChart, { data: dailyStats, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, { yAxisId: "left" }), _jsx(YAxis, { yAxisId: "right", orientation: "right" }), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "hours", stroke: "#3b82f6", name: "Hours" }), _jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "sessions", stroke: "#10b981", name: "Sessions" })] }) }) })] }) }));
}
export default StatisticsPage;
