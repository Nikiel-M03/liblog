import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import Button from '@/components/Button';
import clsx from 'clsx';
function Navbar() {
    const location = useLocation();
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };
    const navItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/statistics', label: 'Statistics' },
        { path: '/leaderboard', label: 'Leaderboard' },
        { path: '/friends', label: 'Friends' },
    ];
    return (_jsx("nav", { className: "bg-white dark:bg-gray-800 shadow-md", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-4 flex justify-between items-center", children: [_jsx(Link, { to: "/dashboard", className: "text-2xl font-bold text-blue-600", children: "LibLog" }), _jsx("div", { className: "hidden md:flex gap-6", children: navItems.map((item) => (_jsx(Link, { to: item.path, className: clsx('transition-colors duration-200', location.pathname === item.path
                            ? 'text-blue-600 font-medium'
                            : 'text-gray-600 hover:text-blue-600'), children: item.label }, item.path))) }), _jsx(Button, { variant: "secondary", size: "sm", onClick: handleLogout, children: "Logout" })] }) }));
}
export default Navbar;
