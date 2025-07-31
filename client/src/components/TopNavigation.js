import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Factory, Settings, Users, Home, ClipboardCheck, Menu } from 'lucide-react';
// Simple placeholder for logo
const easternMillsLogo = '/assets/NEW EASTERN LOGO (transparent background) copy_1753240686257.png';
import { useAuth } from '@/hooks/useAuth';
export function TopNavigation() {
    const [location] = useLocation();
    const { user, logout, signInWithGoogle } = useAuth();
    // Define navigation items with access control
    const allNavItems = [
        {
            path: '/',
            label: 'Home',
            icon: Home,
            public: true,
        },
        {
            path: '/sampling',
            label: 'Sampling',
            icon: Factory,
            public: true,
        },
        {
            path: '/quality',
            label: 'Quality',
            icon: ClipboardCheck,
            public: true,
        },
        {
            path: '/admin',
            label: 'Admin',
            icon: Users,
            public: false,
            adminOnly: true,
        },
        {
            path: '/admin/usermanagement',
            label: 'User Management',
            icon: Settings,
            public: false,
            adminOnly: true,
        },
    ];
    // Filter navigation items based on user access
    const navItems = allNavItems.filter(item => {
        // Show public items to everyone
        if (item.public)
            return true;
        // Admin-only items: only show to specific admin users
        if (item.adminOnly) {
            // For now, always show admin since authentication is disabled
            // Will be properly gated in the admin component itself
            return true;
        }
        return false;
    });
    return (_jsx("div", { className: "bg-white border-b border-gray-200 sticky top-0 z-50", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(Link, { href: "/", children: _jsx("img", { src: easternMillsLogo, alt: "Eastern Mills", className: "h-14 w-auto" }) }) }), _jsx("div", { className: "hidden md:flex flex-1 justify-center", children: _jsx("nav", { className: "flex items-center space-x-8", children: navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (_jsxs(Link, { href: item.path, className: `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`, children: [_jsx(Icon, { className: "h-4 w-4" }), item.label] }, item.path));
                            }) }) }), _jsx("div", { className: "md:hidden flex-1" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "md:hidden", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", className: "p-2", children: _jsx(Menu, { className: "h-5 w-5" }) }) }), _jsx(DropdownMenuContent, { align: "center", className: "w-48", children: navItems.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = location.pathname === item.path;
                                                return (_jsx(DropdownMenuItem, { asChild: true, children: _jsx(Link, { href: item.path, className: "w-full", children: _jsxs("div", { className: `flex items-center gap-3 w-full px-2 py-1 ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`, children: [_jsx(Icon, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm font-medium", children: item.label })] }) }) }, item.path));
                                            }) })] }) }), user ? (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "hidden sm:block text-sm text-gray-700", children: user.displayName || user.email }), _jsx(Button, { onClick: () => {
                                            window.location.href = '/logout';
                                        }, variant: "outline", size: "sm", className: "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700", children: "Log Out" })] })) : (
                            /* Google Authentication Button */
                            _jsx("div", { className: "flex items-center", children: _jsxs(Button, { onClick: () => {
                                        if (signInWithGoogle) {
                                            signInWithGoogle().catch(console.error);
                                        }
                                    }, className: "bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2", children: [_jsxs("svg", { className: "w-4 h-4 mr-2", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "currentColor", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "currentColor", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "currentColor", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "currentColor", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }), "Sign in with Google"] }) }))] })] }) }) }));
}
