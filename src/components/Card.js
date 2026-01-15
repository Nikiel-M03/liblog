import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
function Card({ children, className, title }) {
    return (_jsxs("div", { className: clsx('bg-white dark:bg-gray-800 rounded-lg shadow-md p-6', className), children: [title && _jsx("h2", { className: "text-xl font-bold mb-4 text-gray-900 dark:text-white", children: title }), children] }));
}
export default Card;
