import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useAccessControl } from '../hooks/useAccessControl';
import { Home, Beaker, Package, ShoppingCart, LogOut } from 'lucide-react';
export default function NavigationBar() {
    const { user, logout } = useAuth();
    const { canAccessDepartment, getUserDepartmentInfo } = useAccessControl();
    const [location] = useLocation();
    const departmentInfo = getUserDepartmentInfo();
    const navItems = [
        {
            path: '/',
            label: 'Home',
            icon: Home,
            department: null,
        },
        {
            path: '/quality',
            label: 'Quality',
            icon: Beaker,
            department: 'quality',
        },
        {
            path: '/sampling',
            label: 'Sampling',
            icon: Package,
            department: 'sampling',
        },
        {
            path: '/merchandising',
            label: 'Merchandising',
            icon: ShoppingCart,
            department: 'merchandising',
        },
    ];
    const handleSignOut = async () => {
        try {
            await logout();
        }
        catch (error) {
            console.error('Sign out error:', error);
        }
    };
    return (_jsx("header", { className: "bg-white shadow-sm border-b", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsx("div", { className: "flex items-center", children: _jsx("h1", { className: "text-xl font-semibold text-gray-900", children: "Eastern Mills" }) }), _jsx("nav", { className: "flex-1 max-w-md mx-8", children: _jsx("div", { className: "flex space-x-8 justify-center", children: navItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = location === item.path;
                                // Check access for department pages
                                if (item.department && !canAccessDepartment(item.department)) {
                                    return null;
                                }
                                return (_jsxs(Link, { to: item.path, className: `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`, children: [_jsx(IconComponent, { className: "h-4 w-4" }), _jsx("span", { children: item.label })] }, item.path));
                            }) }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: user?.email }), departmentInfo && (_jsxs("div", { className: "text-xs text-gray-500", children: [departmentInfo.department, " \u2022 ", departmentInfo.role, departmentInfo.subDepartment && ` • ${departmentInfo.subDepartment}`] }))] }), _jsx("button", { onClick: handleSignOut, className: "p-2 text-gray-400 hover:text-gray-600 transition-colors", title: "Sign Out", children: _jsx(LogOut, { className: "h-5 w-5" }) })] })] }) }) }));
}
