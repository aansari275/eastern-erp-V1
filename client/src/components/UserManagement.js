import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { USER_ROLES, DEPARTMENTS } from '@shared/schema';
import { Edit2, Trash2, Plus, Users } from 'lucide-react';
const UserManagement = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: USER_ROLES.USER,
        department: '',
        permissions: [],
        isActive: true
    });
    const queryClient = useQueryClient();
    // Fetch users who have logged in
    const { data: allUsers = [], isLoading } = useQuery({
        queryKey: ['/api/users'],
        queryFn: async () => {
            const response = await apiRequest('GET', '/api/users');
            return response.json();
        },
    });
    // Show all users (both logged in and not logged in)
    const users = allUsers;
    // Fetch roles and permissions
    const { data: roles = {} } = useQuery({
        queryKey: ['/api/roles'],
        queryFn: async () => {
            const response = await apiRequest('GET', '/api/roles');
            return response.json();
        },
    });
    const { data: departments = {} } = useQuery({
        queryKey: ['/api/departments'],
        queryFn: async () => {
            const response = await apiRequest('GET', '/api/departments');
            return response.json();
        },
    });
    const { data: permissions = {} } = useQuery({
        queryKey: ['/api/permissions'],
        queryFn: async () => {
            const response = await apiRequest('GET', '/api/permissions');
            return response.json();
        },
    });
    const { data: rolePermissions = {} } = useQuery({
        queryKey: ['/api/role-permissions'],
        queryFn: async () => {
            const response = await apiRequest('GET', '/api/role-permissions');
            return response.json();
        },
    });
    // Create user mutation
    const createUserMutation = useMutation({
        mutationFn: async (userData) => {
            const response = await apiRequest('POST', '/api/users', userData);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/users'] });
            setIsCreateDialogOpen(false);
            resetForm();
        },
    });
    // Update user mutation
    const updateUserMutation = useMutation({
        mutationFn: async ({ id, userData }) => {
            const response = await apiRequest('PUT', `/api/users/${id}`, userData);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/users'] });
            setEditingUser(null);
            resetForm();
        },
    });
    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (id) => {
            await apiRequest('DELETE', `/api/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        },
    });
    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            email: '',
            role: USER_ROLES.USER,
            department: '',
            permissions: [],
            isActive: true
        });
    };
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '', // Don't populate password for security
            email: user.email || '',
            role: user.role,
            department: user.department || '',
            permissions: user.permissions || [],
            isActive: user.isActive
        });
    };
    const handleSave = () => {
        if (editingUser) {
            const { password, ...updateData } = formData;
            const finalData = password ? formData : updateData;
            updateUserMutation.mutate({ id: editingUser.id, userData: finalData });
        }
        else {
            createUserMutation.mutate(formData);
        }
    };
    const handleRoleChange = (role) => {
        setFormData(prev => ({
            ...prev,
            role,
            permissions: rolePermissions[role] || []
        }));
    };
    const handlePermissionToggle = (permission, checked) => {
        setFormData(prev => ({
            ...prev,
            permissions: checked
                ? [...prev.permissions, permission]
                : prev.permissions.filter(p => p !== permission)
        }));
    };
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case USER_ROLES.ADMIN: return 'bg-red-100 text-red-800';
            case USER_ROLES.SAMPLING_MANAGER: return 'bg-blue-100 text-blue-800';
            case USER_ROLES.MERCHANDISING_MANAGER: return 'bg-green-100 text-green-800';
            case USER_ROLES.SAMPLING_USER: return 'bg-blue-50 text-blue-600';
            case USER_ROLES.MERCHANDISING_USER: return 'bg-green-50 text-green-600';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getDepartmentBadgeColor = (department) => {
        switch (department) {
            case DEPARTMENTS.ADMIN: return 'bg-purple-100 text-purple-800';
            case DEPARTMENTS.SAMPLING: return 'bg-indigo-100 text-indigo-800';
            case DEPARTMENTS.MERCHANDISING: return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "p-6", children: _jsx("div", { className: "text-center", children: "Loading users..." }) }));
    }
    return (_jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(Users, { className: "h-6 w-6" }), "User Management"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage user accounts, roles, and permissions" })] }), _jsxs(Dialog, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { onClick: () => { resetForm(); setEditingUser(null); }, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add User"] }) }), _jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editingUser ? 'Edit User' : 'Create New User' }), _jsx(DialogDescription, { children: editingUser ? 'Update user information and permissions' : 'Add a new user to the system' })] }), _jsxs(Tabs, { defaultValue: "basic", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "basic", children: "Basic Info" }), _jsx(TabsTrigger, { value: "permissions", children: "Permissions" })] }), _jsxs(TabsContent, { value: "basic", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "username", children: "Username" }), _jsx(Input, { id: "username", value: formData.username, onChange: (e) => setFormData(prev => ({ ...prev, username: e.target.value })), placeholder: "Enter username" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })), placeholder: "Enter email" })] })] }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "password", children: ["Password ", editingUser && '(leave blank to keep current)'] }), _jsx(Input, { id: "password", type: "password", value: formData.password, onChange: (e) => setFormData(prev => ({ ...prev, password: e.target.value })), placeholder: editingUser ? "Leave blank to keep current password" : "Enter password" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "role", children: "Role" }), _jsxs(Select, { value: formData.role, onValueChange: handleRoleChange, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select role" }) }), _jsx(SelectContent, { children: Object.entries(roles).map(([key, value]) => (_jsx(SelectItem, { value: value, children: key.replace('_', ' ') }, key))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "department", children: "Department" }), _jsxs(Select, { value: formData.department, onValueChange: (value) => setFormData(prev => ({ ...prev, department: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select department" }) }), _jsx(SelectContent, { children: Object.entries(departments).map(([key, value]) => (_jsx(SelectItem, { value: value, children: key.replace('_', ' ') }, key))) })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "isActive", checked: formData.isActive, onCheckedChange: (checked) => setFormData(prev => ({ ...prev, isActive: checked })) }), _jsx(Label, { htmlFor: "isActive", children: "Active User" })] })] }), _jsxs(TabsContent, { value: "permissions", className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Role-based Permissions" }), _jsxs("div", { className: "bg-gray-50 p-3 rounded-lg", children: [_jsxs("p", { className: "text-sm text-gray-600 mb-2", children: ["Role: ", _jsx(Badge, { className: getRoleBadgeColor(formData.role), children: formData.role })] }), _jsx("div", { className: "flex flex-wrap gap-1", children: (rolePermissions[formData.role] || []).map((permission) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: permission.replace('_', ' ') }, permission))) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Additional Permissions" }), _jsx("div", { className: "grid grid-cols-2 gap-2 max-h-40 overflow-y-auto", children: Object.entries(permissions).map(([key, value]) => {
                                                                    const isRolePermission = (rolePermissions[formData.role] || []).includes(value);
                                                                    const isCustomPermission = formData.permissions.includes(value);
                                                                    return (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: key, checked: isRolePermission || isCustomPermission, disabled: isRolePermission, onCheckedChange: (checked) => handlePermissionToggle(value, checked) }), _jsxs(Label, { htmlFor: key, className: `text-sm ${isRolePermission ? 'text-gray-500' : ''}`, children: [key.replace('_', ' '), isRolePermission && _jsx("span", { className: "text-xs text-gray-400 ml-1", children: "(role)" })] })] }, key));
                                                                }) })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => {
                                                    setIsCreateDialogOpen(false);
                                                    setEditingUser(null);
                                                    resetForm();
                                                }, children: "Cancel" }), _jsx(Button, { onClick: handleSave, disabled: createUserMutation.isPending || updateUserMutation.isPending, children: createUserMutation.isPending || updateUserMutation.isPending ? 'Saving...' : (editingUser ? 'Update' : 'Create') })] })] })] })] }), _jsx("div", { className: "grid gap-4", children: users.map((user) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "font-semibold text-lg", children: user.username }), _jsx(Badge, { className: getRoleBadgeColor(user.role), children: user.role.replace('_', ' ') }), user.department && (_jsx(Badge, { className: getDepartmentBadgeColor(user.department), children: user.department })), _jsx(Badge, { variant: user.isActive ? "default" : "destructive", children: user.isActive ? 'Active' : 'Inactive' })] }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [user.email && _jsxs("p", { children: ["Email: ", user.email] }), _jsxs("p", { children: ["Created: ", new Date(user.createdAt).toLocaleDateString()] }), user.lastLogin && _jsxs("p", { children: ["Last Login: ", new Date(user.lastLogin).toLocaleDateString()] })] }), _jsxs("div", { className: "mt-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-700 mb-1", children: "Permissions:" }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [user.permissions?.slice(0, 5).map((permission) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: permission.replace('_', ' ') }, permission))), user.permissions?.length > 5 && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["+", user.permissions.length - 5, " more"] }))] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                handleEdit(user);
                                                setIsCreateDialogOpen(true);
                                            }, children: _jsx(Edit2, { className: "h-4 w-4" }) }), _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsx(Button, { variant: "outline", size: "sm", children: _jsx(Trash2, { className: "h-4 w-4" }) }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Delete User" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to delete user \"", user.username, "\"? This action cannot be undone."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { onClick: () => deleteUserMutation.mutate(user.id), className: "bg-red-600 hover:bg-red-700", children: "Delete" })] })] })] })] })] }) }) }, user.id))) }), users.length === 0 && (_jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(Users, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Users Found" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Get started by creating your first user account." }), _jsxs(Button, { onClick: () => setIsCreateDialogOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create First User"] })] }) }))] }));
};
export default UserManagement;
