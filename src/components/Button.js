import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import clsx from 'clsx';
const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
};
const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
};
const Button = forwardRef(({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (_jsxs("button", { ref: ref, className: clsx('rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed', variantStyles[variant], sizeStyles[size], className), disabled: disabled || isLoading, ...props, children: [isLoading ? _jsx("span", { className: "inline-block animate-spin mr-2", children: "\u2699\uFE0F" }) : null, children] }));
});
Button.displayName = 'Button';
export default Button;
