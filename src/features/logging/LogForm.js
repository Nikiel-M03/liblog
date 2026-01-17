import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { calculateDurationMinutes } from '@/utils/time';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
function LogForm({ onSubmit, editingLog, onCancel }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (editingLog) {
            setDate(editingLog.date);
            setStartTime(editingLog.start_time);
            setEndTime(editingLog.end_time);
            setNotes(editingLog.notes || '');
        }
        else {
            setDate(new Date().toISOString().split('T')[0]);
            setStartTime('09:00');
            setEndTime('10:00');
            setNotes('');
        }
        setError('');
    }, [editingLog]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const durationMinutes = calculateDurationMinutes(startTime, endTime, date);
            await onSubmit({
                date,
                start_time: startTime,
                end_time: endTime,
                notes: notes || undefined,
                duration_minutes: durationMinutes,
            });
            if (!editingLog) {
                setDate(new Date().toISOString().split('T')[0]);
                setStartTime('09:00');
                setEndTime('10:00');
                setNotes('');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : `Failed to ${editingLog ? 'update' : 'add'} log`);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCancel = () => {
        setDate(new Date().toISOString().split('T')[0]);
        setStartTime('09:00');
        setEndTime('10:00');
        setNotes('');
        setError('');
        onCancel?.();
    };
    return (_jsxs(Card, { title: editingLog ? 'Edit Session' : 'Log Hours', children: [error && _jsx("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded-lg", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Date", type: "date", value: date, onChange: (e) => setDate(e.target.value), required: true }), _jsx(Input, { label: "Start Time", type: "time", value: startTime, onChange: (e) => setStartTime(e.target.value), required: true }), _jsx(Input, { label: "End Time", type: "time", value: endTime, onChange: (e) => setEndTime(e.target.value), required: true }), _jsx("textarea", { className: "input resize-none", placeholder: "Add notes (optional)", value: notes, onChange: (e) => setNotes(e.target.value), rows: 3 }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { isLoading: isLoading, className: "flex-1", children: editingLog ? 'Update Session' : 'Add Log' }), editingLog && (_jsx("button", { type: "button", onClick: handleCancel, className: "flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium disabled:opacity-50", disabled: isLoading, children: "Cancel" }))] })] })] }));
}
export default LogForm;
