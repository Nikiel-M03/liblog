import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '@/services/auth';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await signIn(email, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-100", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsx("h1", { className: "text-3xl font-bold mb-6 text-center", children: "LibLog" }), error && _jsx("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded-lg", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "your@email.com", required: true }), _jsx(Input, { label: "Password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true }), _jsx(Button, { isLoading: isLoading, className: "w-full", children: "Login" })] }), _jsxs("p", { className: "mt-6 text-center text-gray-600", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/signup", className: "text-blue-600 hover:underline font-medium", children: "Sign up" })] })] }) }));
}
export default LoginPage;
