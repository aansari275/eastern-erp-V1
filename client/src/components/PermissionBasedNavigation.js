import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Shield, LogOut, Lock, AlertCircle, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions, useHasPermission, useCanAccessDepartment } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';
import SimpleQuality from '@/pages/SimpleQuality';
import RoleBasedUserManagement from '@/components/RoleBasedUserManagement';
import ProtectedRoute from '@/components/ProtectedRoute';
// Updated Eastern logo
import easternMillsLogo from '@assets/NEW EASTERN LOGO (transparent background))v copy_1753276310100.png';
const PermissionBasedNavigation = () => {
    const { user, logout } = useAuth();
    const { role, permissions, isLoading, error } = usePermissions();
    const [currentView, setCurrentView] = useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Permission checks
    const canViewQuality = useHasPermission(PERMISSIONS.VIEW_QUALITY) || useHasPermission(PERMISSIONS.VIEW_LAB);
    const canViewAdmin = useHasPermission(PERMISSIONS.MANAGE_USERS);
    const canAccessQualityDept = useCanAccessDepartment('quality');
    const canAccessAdminDept = useCanAccessDepartment('admin');
    const handleLogout = async () => {
        await logout();
    };
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading your permissions..." })] }) }));
    }
    const availableViews = [];
    // Check what user can access
    if (canViewQuality && canAccessQualityDept) {
        availableViews.push({
            id: 'quality',
            name: 'Quality Control',
            description: 'Lab inspections and compliance audits',
            icon: _jsx(FlaskConical, { className: "h-6 w-6" }),
            component: SimpleQuality,
        });
    }
    if (canViewAdmin && canAccessAdminDept) {
        availableViews.push({
            id: 'admin',
            name: 'Administration',
            description: 'User management and permissions',
            icon: _jsx(Shield, { className: "h-6 w-6" }),
            component: RoleBasedUserManagement,
        });
    }
    // If user has no access to any features, show restricted access
    if (availableViews.length === 0) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md mx-auto", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(Lock, { className: "w-8 h-8 text-red-600" }) }), _jsx(CardTitle, { className: "text-xl font-bold text-gray-900", children: "Access Restricted" })] }), _jsxs(CardContent, { className: "text-center space-y-4", children: [_jsx("p", { className: "text-gray-600", children: "You don't have permission to access any features in the system." }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Your Role:" }), _jsx(Badge, { variant: "outline", children: role.name })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Email:" }), _jsx("span", { className: "text-sm text-gray-600", children: user?.email })] })] }), error && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Contact your administrator if you believe this is an error." }), _jsxs(Button, { onClick: handleLogout, variant: "outline", size: "sm", className: "flex items-center gap-2", children: [_jsx(LogOut, { className: "w-4 h-4" }), "Sign Out"] })] })] })] }) }));
    }
    // Show main navigation for users with access
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsxs("header", { className: "bg-white border-b border-gray-200 px-4 py-3", children: [_jsxs("div", { className: "max-w-7xl mx-auto flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: easternMillsLogo, alt: "Eastern Mills", className: "h-10 w-auto" }), _jsxs("div", { className: "hidden sm:block", children: [_jsx("h1", { className: "text-lg font-bold text-gray-900", children: "Eastern Mills" }), _jsx("p", { className: "text-xs text-gray-600", children: "Quality Management System" })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "hidden md:flex items-center gap-2", children: availableViews.map((view) => (_jsxs(Button, { onClick: () => setCurrentView(view.id), variant: currentView === view.id ? "default" : "ghost", size: "sm", className: "flex items-center gap-2", children: [view.icon, view.name] }, view.id))) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "hidden sm:block text-right", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: user?.displayName || user?.email }), _jsx("p", { className: "text-xs text-gray-600", children: role.name })] }), _jsx(Button, { onClick: () => setIsMenuOpen(!isMenuOpen), variant: "ghost", size: "sm", className: "md:hidden", children: isMenuOpen ? _jsx(X, { className: "w-4 h-4" }) : _jsx(Menu, { className: "w-4 h-4" }) }), _jsxs(Button, { onClick: handleLogout, variant: "ghost", size: "sm", className: "flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50", children: [_jsx(LogOut, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: "Sign Out" })] })] })] })] }), isMenuOpen && (_jsx("div", { className: "md:hidden mt-4 border-t border-gray-200 pt-4", children: _jsx("div", { className: "space-y-2", children: availableViews.map((view) => (_jsxs(Button, { onClick: () => {
                                    setCurrentView(view.id);
                                    setIsMenuOpen(false);
                                }, variant: currentView === view.id ? "default" : "ghost", className: "w-full justify-start flex items-center gap-2", children: [view.icon, _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: view.name }), _jsx("div", { className: "text-xs text-gray-500", children: view.description })] })] }, view.id))) }) }))] }), _jsxs("main", { className: "max-w-7xl mx-auto py-6 px-4", children: [currentView === 'home' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Welcome to Eastern Mills" }), _jsx("p", { className: "text-gray-600", children: "Select a department from the navigation above to get started." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: availableViews.map((view) => (_jsx(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer", onClick: () => setCurrentView(view.id), children: _jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: view.icon }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: view.name }), _jsx("p", { className: "text-sm text-gray-600", children: view.description })] })] }) }) }, view.id))) })] })), currentView === 'quality' && canViewQuality && (_jsx(ProtectedRoute, { requiredDepartment: "quality", requiredPermission: PERMISSIONS.VIEW_QUALITY, children: _jsx(SimpleQuality, {}) })), currentView === 'admin' && canViewAdmin && (_jsx(ProtectedRoute, { requiredDepartment: "admin", requiredPermission: PERMISSIONS.MANAGE_USERS, children: _jsx(RoleBasedUserManagement, {}) }))] })] }));
};
export default PermissionBasedNavigation;
