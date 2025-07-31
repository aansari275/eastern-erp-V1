import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Package, Calculator, History, FileText, Users, Settings, ChevronLeft, ChevronRight, LogOut, Home } from 'lucide-react';
import easternMillsLogo from '@assets/NEW EASTERN LOGO (transparent background))v copy_1752515571325.png';
export default function SimplifiedNavigation() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [location] = useLocation();
    const { user, logout } = useAuth();
    const navItems = [
        {
            path: '/',
            label: 'Dashboard',
            icon: Home,
            accessLevels: ['admin', 'account_manager', 'viewer']
        },
        {
            path: '/products',
            label: 'Product Management',
            icon: Package,
            accessLevels: ['admin', 'account_manager']
        },
        {
            path: '/costing',
            label: 'Costing Review',
            icon: Calculator,
            accessLevels: ['admin', 'account_manager']
        },
        {
            path: '/quotes',
            label: 'Quote History',
            icon: History,
            accessLevels: ['admin', 'account_manager', 'viewer']
        },
        {
            path: '/pdocs',
            label: 'PDOC Management',
            icon: FileText,
            accessLevels: ['admin', 'account_manager']
        },
        {
            path: '/buyers',
            label: 'Buyer Management',
            icon: Users,
            accessLevels: ['admin']
        },
        {
            path: '/admin',
            label: 'System Settings',
            icon: Settings,
            accessLevels: ['admin']
        }
    ];
    // Filter navigation items based on user's access level
    const visibleNavItems = navItems.filter(item => {
        if (!user?.accessLevel)
            return false;
        return item.accessLevels.includes(user.accessLevel);
    });
    const getUserBadgeColor = (accessLevel) => {
        switch (accessLevel) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'account_manager': return 'bg-blue-100 text-blue-800';
            case 'viewer': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getAccessLevelLabel = (accessLevel) => {
        switch (accessLevel) {
            case 'admin': return 'Administrator';
            case 'account_manager': return 'Account Manager';
            case 'viewer': return 'Viewer';
            default: return 'User';
        }
    };
    return (_jsxs("div", { className: `bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`, children: [_jsx("div", { className: "p-4 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [!isCollapsed && (_jsx(Link, { href: "/", children: _jsx("img", { src: easternMillsLogo, alt: "Eastern Mills", className: "h-16 w-auto" }) })), _jsx("button", { onClick: () => setIsCollapsed(!isCollapsed), className: "p-1 rounded-lg hover:bg-gray-100 transition-colors", children: isCollapsed ? (_jsx(ChevronRight, { className: "h-4 w-4 text-gray-600" })) : (_jsx(ChevronLeft, { className: "h-4 w-4 text-gray-600" })) })] }) }), _jsx("nav", { className: "flex-1 px-4 py-4 space-y-2", children: visibleNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    return (_jsx(Link, { href: item.path, children: _jsxs("div", { className: `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'text-gray-700 hover:bg-gray-100'} ${isCollapsed ? 'justify-center' : ''}`, title: isCollapsed ? item.label : '', children: [_jsx(Icon, { className: "h-5 w-5 flex-shrink-0" }), !isCollapsed && _jsx("span", { className: "ml-3", children: item.label })] }) }, item.path));
                }) }), _jsx("div", { className: "p-4 border-t border-gray-200", children: !isCollapsed ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold", children: user?.username?.charAt(0).toUpperCase() || 'U' }), _jsxs("div", { className: "ml-3 flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: user?.username || 'User' }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: user?.email })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserBadgeColor(user?.accessLevel || 'viewer')}`, children: getAccessLevelLabel(user?.accessLevel || 'viewer') }), _jsx("button", { onClick: logout, className: "p-1 text-gray-400 hover:text-gray-600 transition-colors", title: "Sign out", children: _jsx(LogOut, { className: "h-4 w-4" }) })] }), user?.accessLevel === 'account_manager' && user?.assignedBuyers?.length > 0 && (_jsxs("div", { className: "text-xs text-gray-500", children: [_jsx("span", { className: "font-medium", children: "Assigned Buyers:" }), _jsxs("div", { className: "mt-1", children: [user.assignedBuyers.slice(0, 2).map((buyerId) => (_jsx("span", { className: "inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1", children: buyerId }, buyerId))), user.assignedBuyers.length > 2 && (_jsxs("span", { className: "text-gray-500", children: ["+", user.assignedBuyers.length - 2, " more"] }))] })] }))] })) : (_jsxs("div", { className: "flex flex-col items-center space-y-2", children: [_jsx("div", { className: "w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold", children: user?.username?.charAt(0).toUpperCase() || 'U' }), _jsx("button", { onClick: logout, className: "p-1 text-gray-400 hover:text-gray-600 transition-colors", title: "Sign out", children: _jsx(LogOut, { className: "h-4 w-4" }) })] })) })] }));
}
