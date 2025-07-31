import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Factory, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import easternMillsLogo from '@assets/NEW EASTERN LOGO (transparent background))v copy_1752515571325.png';
import { useAuth } from '@/hooks/useAuth';
export function SidebarNavigation() {
    const [location] = useLocation();
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navItems = [
        {
            path: '/sampling',
            label: 'Sampling Department',
            icon: Factory,
        },
    ];
    // Admin functionality removed for simplification
    return (_jsxs("div", { className: `bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`, children: [_jsx("div", { className: "p-4 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [!isCollapsed && (_jsx(Link, { href: "/", children: _jsx("img", { src: easternMillsLogo, alt: "Eastern Mills", className: "h-16 w-auto" }) })), _jsx("button", { onClick: () => setIsCollapsed(!isCollapsed), className: "p-1 rounded-lg hover:bg-gray-100 transition-colors", children: isCollapsed ? (_jsx(ChevronRight, { className: "h-4 w-4 text-gray-600" })) : (_jsx(ChevronLeft, { className: "h-4 w-4 text-gray-600" })) })] }) }), _jsx("nav", { className: "flex-1 p-4", children: _jsx("div", { className: "space-y-2", children: navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.path;
                        return (_jsx(Link, { href: item.path, children: _jsxs(Button, { variant: isActive ? "default" : "ghost", className: `w-full justify-start gap-3 ${isCollapsed ? 'px-2' : 'px-3'}`, title: isCollapsed ? item.label : undefined, children: [_jsx(Icon, { className: "h-5 w-5 flex-shrink-0" }), !isCollapsed && (_jsx("span", { className: "text-sm font-medium", children: item.label }))] }) }, item.path));
                    }) }) }), !isCollapsed && user && (_jsxs("div", { className: "p-4 border-t border-gray-200", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-xs font-medium text-blue-600", children: user.email?.charAt(0).toUpperCase() }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: user.username || user.email }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: user.role })] })] }), _jsx("button", { onClick: () => window.location.href = '/api/auth/logout', className: "w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-left", children: "Sign Out" })] })), isCollapsed && user && (_jsx("div", { className: "p-4 border-t border-gray-200", children: _jsx("div", { className: "flex justify-center", children: _jsx("button", { onClick: () => window.location.href = '/api/auth/logout', className: "w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors", title: "Sign Out", children: _jsx("span", { className: "text-xs font-medium text-gray-600", children: user.email?.charAt(0).toUpperCase() }) }) }) }))] }));
}
