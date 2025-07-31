import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Lock, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions, useHasPermission, useCanAccessDepartment } from '@/hooks/usePermissions';
import { PERMISSIONS } from '../../shared/permissions';
const TeamBasedNavigation = () => {
    const { user, logout } = useAuth();
    const { role, permissions, isLoading } = usePermissions();
    const [currentView, setCurrentView] = useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Permission checks
    const canViewQuality = useHasPermission(PERMISSIONS.VIEW_QUALITY) || useHasPermission(PERMISSIONS.VIEW_LAB) || useHasPermission(PERMISSIONS.VIEW_COMPLIANCE);
    const canViewAdmin = useHasPermission(PERMISSIONS.MANAGE_USERS) || useHasPermission(PERMISSIONS.MANAGE_PERMISSIONS);
    const canAccessQualityDept = useCanAccessDepartment('quality');
    const canAccessAdminDept = useCanAccessDepartment('admin');
    const handleLogout = async () => {
        await logout();
    };
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading your permissions..." })] }) }));
    }
    // Show loading state while fetching user data
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading your dashboard..." })] }) }));
    }
    // If no user data found, show error message
    if (!userData) {
        return (_jsx(Card, { className: "border-yellow-200 bg-yellow-50 max-w-2xl mx-auto mt-8", children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(User, { className: "h-16 w-16 text-yellow-500 mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-bold text-yellow-800 mb-2", children: "Account Setup Required" }), _jsx("p", { className: "text-yellow-600 mb-4", children: "Your account is not yet set up in the system. Please contact your administrator to complete your account setup." }), _jsxs("p", { className: "text-sm text-yellow-600", children: ["Signed in as: ", user?.email] })] }) }));
    }
    // Check if user has admin role
    const isAdmin = userData.Role === 'admin' || userData.role === 'admin';
    // Determine team memberships
    const teamMembership = {
        isSamplingTeam: userData.departments?.includes('Sampling') || isAdmin,
        isQualityTeam: userData.departments?.includes('Quality') || isAdmin,
        qualityCompany: userData.qualityCompany || 'EHI',
        samplingRole: userData.role === 'Editor' || isAdmin ? 'Manager' : 'Member',
        qualityRole: userData.qualityRole || 'Inspector',
        qualityPermissions: userData.qualityPermissions || {},
        samplingPermissions: userData.samplingPermissions || {},
    };
    // If user is not admin and not in any team, show access denied with logout option
    if (!isAdmin && !teamMembership.isSamplingTeam && !teamMembership.isQualityTeam) {
        return (_jsx(Card, { className: "border-red-200 bg-red-50 max-w-2xl mx-auto mt-8", children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(Lock, { className: "h-16 w-16 text-red-500 mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-bold text-red-800 mb-2", children: "Access Restricted" }), _jsx("p", { className: "text-red-600 mb-4", children: "You are not assigned to any team. Please contact your administrator to get access to Sampling Team or Quality Team." }), _jsxs("div", { className: "flex items-center justify-center gap-2 text-sm text-red-700 mb-4", children: [_jsx(User, { className: "h-4 w-4" }), user?.email || 'Unknown user'] }), _jsx(Button, { onClick: () => window.location.href = '/', className: "bg-blue-600 hover:bg-blue-700 text-white", children: "Return to Home" })] }) }));
    }
    // Available department options based on team membership
    const availableDepartments = [];
    if (teamMembership.isSamplingTeam) {
        availableDepartments.push({
            id: 'sampling',
            name: 'Sampling Department',
            description: 'Rug creation, materials, and costing',
            icon: _jsx(Factory, { className: "h-8 w-8" }),
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            route: '/sampling',
            tabs: getFilteredSamplingTabs(teamMembership.samplingPermissions),
        });
    }
    if (teamMembership.isQualityTeam) {
        availableDepartments.push({
            id: 'quality',
            name: 'Quality Control',
            description: `Quality inspections for ${teamMembership.qualityCompany} (${teamMembership.qualityCompany === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.'})`,
            icon: _jsx(CheckCircle, { className: "h-8 w-8" }),
            color: 'bg-green-100 text-green-800 border-green-200',
            route: '/quality',
            tabs: getFilteredQualityTabs(teamMembership.qualityPermissions),
            company: teamMembership.qualityCompany,
        });
    }
    // Add admin department if user is admin
    if (isAdmin) {
        availableDepartments.push({
            id: 'admin',
            name: 'System Administration',
            description: 'User management, permissions, and system settings',
            icon: _jsx(Shield, { className: "h-8 w-8" }),
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            route: '/admin',
            tabs: [
                { id: 'user-management', name: 'User Management', permissions: [] },
                { id: 'team-management', name: 'Team Management', permissions: [] },
                { id: 'system-settings', name: 'System Settings', permissions: [] }
            ],
        });
    }
    return (_jsxs("div", { className: "max-w-6xl mx-auto space-y-6", children: [_jsx(Card, { className: "border-blue-200 bg-blue-50", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-lg", children: userData.email?.charAt(0).toUpperCase() }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-blue-900", children: userData.username || userData.email?.split('@')[0] }), _jsx("p", { className: "text-blue-700", children: userData.email })] })] }), _jsxs("div", { className: "flex gap-2 items-center", children: [teamMembership.isSamplingTeam && (_jsxs(Badge, { className: "bg-blue-100 text-blue-800", children: [_jsx(Factory, { className: "h-3 w-3 mr-1" }), "Sampling Team (", teamMembership.samplingRole, ")"] })), teamMembership.isQualityTeam && (_jsxs(Badge, { className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "Quality Team (", teamMembership.qualityCompany, ")"] })), _jsxs(Button, { onClick: () => {
                                            window.location.href = '/logout';
                                        }, variant: "outline", size: "sm", className: "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 ml-2", children: [_jsx(LogOut, { className: "h-4 w-4 mr-2" }), "Log Out"] })] })] }) }) }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900", children: "Select Your Department" }), _jsx("div", { className: "grid gap-6 md:grid-cols-2", children: availableDepartments.map((dept) => (_jsx(Link, { href: dept.route, children: _jsx(Card, { className: `cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${dept.color} hover:scale-105`, children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "text-current", children: dept.icon }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-xl font-bold mb-2", children: dept.name }), _jsx("p", { className: "text-sm opacity-80 mb-4", children: dept.description }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-xs font-semibold opacity-90", children: "Available Features:" }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [dept.tabs.slice(0, 4).map((tab) => (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: [tab.icon, " ", tab.name] }, tab.name))), dept.tabs.length > 4 && (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: ["+", dept.tabs.length - 4, " more"] }))] })] }), dept.company && (_jsx("div", { className: "mt-3 pt-3 border-t border-current border-opacity-20", children: _jsxs("div", { className: "flex items-center gap-2 text-xs opacity-90", children: [_jsx(Building, { className: "h-3 w-3" }), _jsx("span", { children: dept.company === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.' })] }) }))] })] }) }) }) }, dept.id))) })] }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("h4", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5" }), "Your Permissions Summary"] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [teamMembership.isSamplingTeam && (_jsxs("div", { className: "space-y-2", children: [_jsx("h5", { className: "font-semibold text-blue-900", children: "Sampling Department" }), _jsx("div", { className: "space-y-1 text-sm", children: Object.entries(teamMembership.samplingPermissions || {}).map(([perm, value]) => (_jsxs("div", { className: "flex items-center gap-2", children: [value ? (_jsx(CheckCircle, { className: "h-3 w-3 text-green-600" })) : (_jsx(Eye, { className: "h-3 w-3 text-gray-400" })), _jsx("span", { className: value ? 'text-green-700' : 'text-gray-500', children: perm.replace('can', '').replace(/([A-Z])/g, ' $1').trim() })] }, perm))) })] })), teamMembership.isQualityTeam && (_jsxs("div", { className: "space-y-2", children: [_jsxs("h5", { className: "font-semibold text-green-900", children: ["Quality Control (", teamMembership.qualityCompany, ")"] }), _jsx("div", { className: "space-y-1 text-sm", children: Object.entries(teamMembership.qualityPermissions || {}).map(([perm, value]) => (_jsxs("div", { className: "flex items-center gap-2", children: [value ? (_jsx(CheckCircle, { className: "h-3 w-3 text-green-600" })) : (_jsx(Eye, { className: "h-3 w-3 text-gray-400" })), _jsx("span", { className: value ? 'text-green-700' : 'text-gray-500', children: perm.replace('can', '').replace(/([A-Z])/g, ' $1').trim() })] }, perm))) })] }))] })] }) })] }));
};
// Helper function to filter sampling tabs based on permissions
function getFilteredSamplingTabs(permissions) {
    const allTabs = [
        { name: 'Create Rugs', icon: '➕', permission: 'canCreateRugs' },
        { name: 'Rug Gallery', icon: '🖼️', permission: 'canViewGallery' },
        { name: 'Edit Rugs', icon: '✏️', permission: 'canEditRugs' },
        { name: 'Costing', icon: '💰', permission: 'canManageCosting' },
        { name: 'Quotes', icon: '📋', permission: 'canGenerateQuotes' },
    ];
    return allTabs.filter(tab => permissions?.[tab.permission]);
}
// Helper function to filter quality tabs based on permissions
function getFilteredQualityTabs(permissions) {
    const allTabs = [
        { name: 'Lab Tests', icon: '🧪', permission: 'canAccessLab' },
        { name: 'Bazaar Inspection', icon: '🏪', permission: 'canAccessBazaar' },
        { name: 'Binding Process', icon: '🔗', permission: 'canAccessBinding' },
        { name: 'Clipping & Finishing', icon: '✂️', permission: 'canAccessClipping' },
        { name: 'Final Inspection', icon: '✅', permission: 'canAccessFinalInspection' },
        { name: 'Create Inspections', icon: '📝', permission: 'canCreateInspections' },
        { name: 'Reports', icon: '📊', permission: 'canGenerateReports' },
        { name: 'Escalations', icon: '⚠️', permission: 'canManageEscalations' },
    ];
    return allTabs.filter(tab => permissions?.[tab.permission]);
}
export default TeamBasedNavigation;
