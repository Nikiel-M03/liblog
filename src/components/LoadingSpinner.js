import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function LoadingSpinner() {
    return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "inline-block animate-spin text-4xl mb-4", children: "\u2699\uFE0F" }), _jsx("p", { className: "text-gray-600", children: "Loading..." })] }) }));
}
export default LoadingSpinner;
