import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, User, Edit, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
const userSchema = z.object({
    email: z.string().email('Invalid email address'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    departmentId: z.string().min(1, 'Department is required'),
});
export function PreAuthUserManagement() {
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    // Fetch departments
    const { data: departments = [] } = useQuery({
        queryKey: ['/api/admin/departments'],
    });
    // Fetch users for selected department
    const { data: users = [] } = useQuery({
        queryKey: ['/api/admin/users', selectedDepartment],
        queryFn: async () => {
            const url = selectedDepartment
                ? `/api/admin/users?departmentId=${selectedDepartment}`
                : '/api/admin/users';
            const response = await fetch(url);
            if (!response.ok)
                throw new Error('Failed to fetch users');
            return response.json();
        },
        enabled: true,
    });
    // Create user form
    const form = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            departmentId: selectedDepartment || '',
        },
    });
    // Update form when department changes
    useEffect(() => {
        if (selectedDepartment) {
            form.setValue('departmentId', selectedDepartment);
        }
    }, [selectedDepartment, form]);
    // Create user mutation
    const createUserMutation = useMutation({
        mutationFn: async (data) => {
            return apiRequest('POST', '/api/admin/users', data);
        },
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'User created successfully',
            });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
            setIsCreateUserOpen(false);
            form.reset();
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create user',
                variant: 'destructive',
            });
        },
    });
    const handleCreateUser = (data) => {
        createUserMutation.mutate(data);
    };
    return (_jsxs("div", { className: "container mx-auto p-6 max-w-7xl", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: "Pre-Authorization User Management" }), _jsx("p", { className: "text-muted-foreground", children: "Manage users and their department access with tab-level permissions" })] }), _jsx(Tabs, { value: selectedDepartment, onValueChange: setSelectedDepartment, className: "mb-6", children: _jsxs(TabsList, { className: "grid grid-cols-5 lg:grid-cols-10 gap-2", children: [_jsx(TabsTrigger, { value: "", className: "data-[state=active]:bg-primary", children: "All" }), departments.map((dept) => (_jsx(TabsTrigger, { value: dept.id, className: `data-[state=active]:${dept.color} data-[state=active]:text-white`, children: dept.name }, dept.id)))] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Users" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: users.length }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Active Users" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: users.filter(u => u.isActive).length }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Logged In Users" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: users.filter(u => u.hasLoggedIn).length }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Departments" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: departments.length }) })] })] }), _jsx("div", { className: "mb-6", children: _jsxs(Dialog, { open: isCreateUserOpen, onOpenChange: setIsCreateUserOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create New User"] }) }), _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create New User" }) }), _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(handleCreateUser), className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "user@example.com", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "firstName", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "First Name" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "John", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "lastName", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Last Name" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Doe", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "departmentId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Department" }), _jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select department" }) }) }), _jsx(SelectContent, { children: departments.map((dept) => (_jsx(SelectItem, { value: dept.id, children: dept.name }, dept.id))) })] }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setIsCreateUserOpen(false), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: createUserMutation.isPending, children: createUserMutation.isPending ? 'Creating...' : 'Create User' })] })] }) })] })] }) }), _jsxs("div", { className: "space-y-4", children: [users.map((user) => (_jsx(UserCard, { user: user, departments: departments }, user.id))), users.length === 0 && (_jsx(Card, { children: _jsx(CardContent, { className: "text-center py-8", children: _jsx("p", { className: "text-muted-foreground", children: selectedDepartment
                                    ? 'No users found in this department'
                                    : 'No users found' }) }) }))] })] }));
}
function UserCard({ user, departments }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const [tabs, setTabs] = useState([]);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const department = departments.find(d => d.id === user.departmentId);
    // Fetch tabs for the user's department
    useEffect(() => {
        if (isExpanded && user.departmentId) {
            fetch(`/api/admin/departments/${user.departmentId}/tabs`)
                .then(res => res.json())
                .then(setTabs)
                .catch(console.error);
        }
    }, [isExpanded, user.departmentId]);
    // Fetch user permissions
    useEffect(() => {
        if (isExpanded) {
            fetch(`/api/admin/users/${user.id}/permissions`)
                .then(res => res.json())
                .then(setPermissions)
                .catch(console.error);
        }
    }, [isExpanded, user.id]);
    const toggleUserStatus = useMutation({
        mutationFn: async () => {
            return apiRequest('PUT', `/api/admin/users/${user.id}`, { isActive: !user.isActive });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
            toast({
                title: 'Success',
                description: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
            });
        },
    });
    const updatePermission = useMutation({
        mutationFn: async ({ tabId, permission }) => {
            if (permission === null) {
                return apiRequest('DELETE', `/api/admin/users/${user.id}/permissions/${tabId}`);
            }
            else {
                return apiRequest('POST', `/api/admin/users/${user.id}/permissions`, {
                    departmentId: user.departmentId,
                    tabId,
                    permission,
                });
            }
        },
        onSuccess: () => {
            // Refetch permissions
            fetch(`/api/admin/users/${user.id}/permissions`)
                .then(res => res.json())
                .then(setPermissions)
                .catch(console.error);
            toast({
                title: 'Success',
                description: 'Permission updated successfully',
            });
        },
    });
    const getPermissionForTab = (tabId) => {
        const perm = permissions.find(p => p.tabId === tabId && p.isActive);
        return perm?.permission || null;
    };
    return (_jsx(Card, { className: !user.isActive ? 'opacity-60' : '', children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx(User, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold", children: [user.firstName, " ", user.lastName] }), _jsx("p", { className: "text-sm text-muted-foreground", children: user.email })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [department && (_jsx(Badge, { className: department.color, children: department.name })), _jsx(Badge, { variant: user.isActive ? 'default' : 'secondary', children: user.isActive ? 'Active' : 'Inactive' }), user.hasLoggedIn && (_jsx(Badge, { variant: "outline", children: "Logged In" })), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setIsExpanded(!isExpanded), children: [isExpanded ? 'Hide' : 'Show', " Permissions"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleUserStatus.mutate(), disabled: toggleUserStatus.isPending, children: user.isActive ? 'Deactivate' : 'Activate' })] })] }), isExpanded && (_jsxs("div", { className: "mt-4 pt-4 border-t", children: [_jsx("h4", { className: "font-medium mb-3", children: "Tab Permissions" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: tabs.map((tab) => {
                                const permission = getPermissionForTab(tab.tabId);
                                return (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded", children: [_jsx("span", { className: "text-sm font-medium", children: tab.tabName }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: permission === 'read' ? 'default' : 'outline', onClick: () => updatePermission.mutate({
                                                        tabId: tab.tabId,
                                                        permission: permission === 'read' ? null : 'read'
                                                    }), disabled: updatePermission.isPending, children: _jsx(Eye, { className: "h-3 w-3" }) }), _jsx(Button, { size: "sm", variant: permission === 'edit' ? 'default' : 'outline', onClick: () => updatePermission.mutate({
                                                        tabId: tab.tabId,
                                                        permission: permission === 'edit' ? null : 'edit'
                                                    }), disabled: updatePermission.isPending, children: _jsx(Edit, { className: "h-3 w-3" }) })] })] }, tab.id));
                            }) })] }))] }) }));
}
