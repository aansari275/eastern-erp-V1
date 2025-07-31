import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
const LogoutAndRedirect = () => {
    const { logout } = useAuth();
    useEffect(() => {
        const performLogout = async () => {
            try {
                // Clear Firebase auth
                await signOut(auth);
                // Clear local storage
                localStorage.removeItem('currentUser');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userDepartment');
                localStorage.removeItem('qualityCompany');
                // Clear session storage
                sessionStorage.clear();
                // Call auth hook logout if available
                if (logout) {
                    logout();
                }
                console.log('User logged out successfully');
                // Force redirect to home page with reload
                window.location.replace('/');
            }
            catch (error) {
                console.error('Logout error:', error);
                // Still redirect even if logout fails
                window.location.replace('/');
            }
        };
        performLogout();
    }, [logout]);
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Signing out..." })] }) }));
};
export default LogoutAndRedirect;
