import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { calculateDurationMinutes } from '@/utils/time';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
function LogForm({ onSubmit }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
            setDate(new Date().toISOString().split('T')[0]);
            setStartTime('09:00');
            setEndTime('10:00');
            setNotes('');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add log');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs(Card, { title: "Log Hours", children: [error && _jsx("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded-lg", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Date", type: "date", value: date, onChange: (e) => setDate(e.target.value), required: true }), _jsx(Input, { label: "Start Time", type: "time", value: startTime, onChange: (e) => setStartTime(e.target.value), required: true }), _jsx(Input, { label: "End Time", type: "time", value: endTime, onChange: (e) => setEndTime(e.target.value), required: true }), _jsx("textarea", { className: "input resize-none", placeholder: "Add notes (optional)", value: notes, onChange: (e) => setNotes(e.target.value), rows: 3 }), _jsx(Button, { isLoading: isLoading, className: "w-full", children: "Add Log" })] })] }));
}
export default LogForm;
