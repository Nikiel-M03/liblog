import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatDuration } from '@/utils/time';
import Card from '@/components/Card';
function LogList({ logs, onEdit, onDelete }) {
    const handleDelete = async (logId) => {
        if (!onDelete)
            return;
        if (confirm('Are you sure you want to delete this session?')) {
            try {
                await onDelete(logId);
            }
            catch (err) {
                console.error('Failed to delete log:', err);
            }
        }
    };
    if (logs.length === 0) {
        return (_jsx(Card, { title: "Recent Sessions", children: _jsx("p", { className: "text-center text-gray-600", children: "No sessions logged yet" }) }));
    }
    return (_jsx(Card, { title: "Recent Sessions", children: _jsx("div", { className: "space-y-3", children: logs.map((log) => (_jsx("div", { className: "border-l-4 border-blue-600 p-4 bg-gray-50 rounded", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold text-gray-900", children: new Date(log.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                    }) }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [log.start_time, " - ", log.end_time] }), log.notes && _jsx("p", { className: "text-sm text-gray-700 mt-2", children: log.notes })] }), _jsxs("div", { className: "flex items-center gap-4 ml-4", children: [_jsx("p", { className: "text-lg font-bold text-blue-600", children: formatDuration(log.duration_minutes || 0) }), (onEdit || onDelete) && (_jsxs("div", { className: "flex gap-2", children: [onEdit && (_jsx("button", { onClick: () => onEdit(log), className: "px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition", children: "Edit" })), onDelete && (_jsx("button", { onClick: () => handleDelete(log.id), className: "px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition", children: "Delete" }))] }))] })] }) }, log.id))) }) }));
}
export default LogList;
