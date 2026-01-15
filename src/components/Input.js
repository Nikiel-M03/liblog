import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import clsx from 'clsx';
const Input = forwardRef(({ label, error, className, type = 'text', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    return (_jsxs("div", { className: "flex flex-col gap-2", children: [label && _jsx("label", { htmlFor: inputId, className: "block text-sm font-medium text-gray-700", children: label }), _jsx("input", { ref: ref, id: inputId, type: type, className: clsx('w-full px-3 py-2 border border-gray-300 rounded-lg', 'focus:outline-none focus:ring-2 focus:ring-blue-500', 'dark:bg-gray-700 dark:border-gray-600 dark:text-white', error && 'border-red-500 focus:ring-red-500', className), ...props }), error && _jsx("span", { className: "text-sm text-red-500", children: error })] }));
});
Input.displayName = 'Input';
export default Input;
