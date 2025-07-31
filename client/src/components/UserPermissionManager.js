import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, User, Shield, Eye, Edit, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const AVAILABLE_TABS = [
    { id: 'rugs', label: 'Rugs Management' },
    { id: 'buyers', label: 'Buyers Management' },
    { id: 'quotes', label: 'Quote History' },
    { id: 'quality', label: 'Quality Control' },
    { id: 'overview', label: 'Overview Dashboard' },
    { id: 'permissions', label: 'Permissions Management' },
    { id: 'pdocs', label: 'PDOC Management' },
    { id: 'materials', label: 'Materials Database' },
];
const PERMISSION_TYPES = [
    { value: 'view', label: 'View Only', icon: Eye, color: 'bg-blue-100 text-blue-800' },
    { value: 'edit', label: 'Edit Access', icon: Edit, color: 'bg-green-100 text-green-800' },
    { value: 'admin', label: 'Admin Access', icon: Settings, color: 'bg-red-100 text-red-800' },
];
const UserPermissionManager = ({ userId }) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedTabId, setSelectedTabId] = useState('');
    const [selectedPermission, setSelectedPermission] = useState('');
    const { toast } = useToast();
    // Fetch permissions on component mount and after changes
    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/users/${userId}/permissions`);
            setPermissions(response.data);
        }
        catch (error) {
            console.error('Error fetching permissions:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch user permissions',
                variant: 'destructive',
            });
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPermissions();
    }, [userId]);
    // Add new permission
    const handleAddPermission = async (e) => {
        e.preventDefault();
        if (!selectedTabId || !selectedPermission) {
            toast({
                title: 'Validation Error',
                description: 'Please select both tab and permission type',
                variant: 'destructive',
            });
            return;
        }
        // Check if permission already exists
        const existingPermission = permissions.find(p => p.tabId === selectedTabId && p.isActive);
        if (existingPermission) {
            toast({
                title: 'Permission Exists',
                description: 'This user already has permission for this tab',
                variant: 'destructive',
            });
            return;
        }
        try {
            setSubmitting(true);
            await axios.post(`/api/admin/users/${userId}/permissions`, {
                tabId: selectedTabId,
                permission: selectedPermission,
            });
            toast({
                title: 'Success',
                description: 'Permission added successfully',
            });
            // Reset form and refresh data
            setSelectedTabId('');
            setSelectedPermission('');
            fetchPermissions();
        }
        catch (error) {
            console.error('Error adding permission:', error);
            toast({
                title: 'Error',
                description: 'Failed to add permission',
                variant: 'destructive',
            });
        }
        finally {
            setSubmitting(false);
        }
    };
    // Remove permission
    const handleRemovePermission = async (tabId) => {
        try {
            await axios.delete(`/api/admin/users/${userId}/permissions/${tabId}`);
            toast({
                title: 'Success',
                description: 'Permission removed successfully',
            });
            fetchPermissions();
        }
        catch (error) {
            console.error('Error removing permission:', error);
            toast({
                title: 'Error',
                description: 'Failed to remove permission',
                variant: 'destructive',
            });
        }
    };
    // Get tab label by ID
    const getTabLabel = (tabId) => {
        const tab = AVAILABLE_TABS.find(t => t.id === tabId);
        return tab?.label || tabId;
    };
    // Get permission type details
    const getPermissionDetails = (permission) => {
        const permType = PERMISSION_TYPES.find(p => p.value === permission);
        return permType || PERMISSION_TYPES[0];
    };
    // Filter available tabs (exclude already assigned ones)
    const availableTabs = AVAILABLE_TABS.filter(tab => !permissions.some(p => p.tabId === tab.id && p.isActive));
    if (loading) {
        return (_jsx("div", { className: "p-6", children: _jsx("div", { className: "flex items-center justify-center h-32", children: _jsx("div", { className: "text-gray-500", children: "Loading user permissions..." }) }) }));
    }
    return (_jsxs("div", { className: "p-6 max-w-4xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx(User, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "User Permissions" }), _jsxs("p", { className: "text-gray-600", children: ["Manage tab access permissions for user ID: ", userId] })] })] }), _jsxs(Card, { className: "border-2 border-dashed border-gray-300 bg-gray-50", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [_jsx(Plus, { className: "h-5 w-5 text-green-600" }), "Add New Permission"] }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleAddPermission, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700 mb-2 block", children: "Select Tab" }), _jsxs(Select, { value: selectedTabId, onValueChange: setSelectedTabId, children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Choose a tab..." }) }), _jsx(SelectContent, { children: availableTabs.map((tab) => (_jsx(SelectItem, { value: tab.id, children: tab.label }, tab.id))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700 mb-2 block", children: "Permission Type" }), _jsxs(Select, { value: selectedPermission, onValueChange: setSelectedPermission, children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Choose permission level..." }) }), _jsx(SelectContent, { children: PERMISSION_TYPES.map((type) => (_jsx(SelectItem, { value: type.value, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(type.icon, { className: "h-4 w-4" }), type.label] }) }, type.value))) })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { type: "submit", disabled: submitting || !selectedTabId || !selectedPermission, className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), submitting ? 'Adding...' : 'Add Permission'] }) })] }) })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5 text-blue-600" }), "Current Permissions (", permissions.filter(p => p.isActive).length, ")"] }), permissions.filter(p => p.isActive).length === 0 ? (_jsx(Card, { className: "border border-gray-200", children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(Shield, { className: "h-8 w-8 text-gray-400" }) }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Permissions Assigned" }), _jsx("p", { className: "text-gray-600", children: "This user doesn't have any tab permissions yet. Use the form above to add permissions." })] }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: permissions
                            .filter(p => p.isActive)
                            .map((permission) => {
                            const permDetails = getPermissionDetails(permission.permission);
                            const IconComponent = permDetails.icon;
                            return (_jsx(Card, { className: "border border-gray-200 hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-1", children: getTabLabel(permission.tabId) }), _jsxs(Badge, { className: `${permDetails.color} flex items-center gap-1 w-fit`, children: [_jsx(IconComponent, { className: "h-3 w-3" }), permDetails.label] })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleRemovePermission(permission.tabId), className: "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "text-xs text-gray-500 space-y-1", children: [_jsxs("div", { children: ["Added: ", new Date(permission.createdAt).toLocaleDateString()] }), permission.updatedAt !== permission.createdAt && (_jsxs("div", { children: ["Updated: ", new Date(permission.updatedAt).toLocaleDateString()] }))] })] }) }, permission.id));
                        }) }))] }), availableTabs.length === 0 && (_jsx(Card, { className: "border border-green-200 bg-green-50", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-green-800", children: [_jsx(Shield, { className: "h-5 w-5" }), _jsx("span", { className: "font-medium", children: "All Available Tabs Assigned" })] }), _jsx("p", { className: "text-green-700 text-sm mt-1", children: "This user has been granted permissions for all available tabs." })] }) }))] }));
};
export default UserPermissionManager;
