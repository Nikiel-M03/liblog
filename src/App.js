import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import StatisticsPage from '@/pages/StatisticsPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import FriendsPage from '@/pages/FriendsPage';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                setUser(data?.session?.user || null);
            }
            catch (err) {
                console.error('Failed to check user:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        checkUser();
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });
        return () => subscription?.unsubscribe();
    }, []);
    if (isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    return (_jsxs(Router, { children: [user && _jsx(Navbar, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: user ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: user ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(SignupPage, {}) }), _jsx(Route, { path: "/dashboard", element: user ? _jsx(DashboardPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/statistics", element: user ? _jsx(StatisticsPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/leaderboard", element: user ? _jsx(LeaderboardPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/friends", element: user ? _jsx(FriendsPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "*", element: user ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(Navigate, { to: "/login", replace: true }) })] })] }));
}
export default App;
