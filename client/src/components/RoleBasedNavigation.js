import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { AuthButton } from './AuthButton';
import { Home, Factory, ShoppingCart, Settings } from 'lucide-react';
import easternMillsLogo from '@assets/NEW EASTERN LOGO (transparent background))v copy_1752515571325.png';
import { usePermissions } from '@/hooks/usePermissions';
export function RoleBasedNavigation() {
    const [location] = useLocation();
    const { user, canManageUsers } = usePermissions();
    const navItems = [
        {
            path: '/',
            label: 'Home',
            icon: Home,
        },
        {
            path: '/sampling',
            label: 'Sampling Department',
            icon: Factory,
        },
        {
            path: '/merchandising',
            label: 'Merchandising Department',
            icon: ShoppingCart,
        },
    ];
    // Add Admin tab only for users with admin access
    if (canManageUsers() || user?.role === 'admin') {
        navItems.push({
            path: '/admin',
            label: 'Admin Dashboard',
            icon: Settings,
        });
    }
    return (_jsx("nav", { className: "bg-white shadow-sm border-b", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between h-16", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Link, { href: "/", children: _jsx("img", { src: easternMillsLogo, alt: "Eastern Mills", className: "h-[130px] w-auto mr-6" }) }), _jsx("div", { className: "hidden md:block", children: _jsx("div", { className: "ml-10 flex items-baseline space-x-4", children: navItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = location === item.path;
                                        return (_jsx(Link, { href: item.path, children: _jsxs(Button, { variant: isActive ? "default" : "ghost", className: "flex items-center gap-2", children: [_jsx(Icon, { className: "h-4 w-4" }), item.label] }) }, item.path));
                                    }) }) })] }), _jsx("div", { className: "flex items-center", children: _jsx(AuthButton, {}) })] }) }) }));
}
