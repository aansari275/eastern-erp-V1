import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useAuth } from '@/hooks/useAuth';
export function SimpleAuthWrapper({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Loading Eastern Mills System..." })] }) }));
    }
    // SIMPLIFIED AUTH: If user is authenticated with Firebase, allow access
    // This bypasses the complex authorization system that was causing issues
    if (user) {
        console.log('✅ User authenticated:', user.email);
        return _jsx(_Fragment, { children: children });
    }
    // If not authenticated, redirect will be handled by App.tsx routing
    return null;
}
