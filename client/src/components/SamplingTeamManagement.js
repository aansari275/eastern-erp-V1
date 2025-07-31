import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Check, X, Users, Factory } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const defaultSamplingPermissions = {
    canCreateRugs: true,
    canEditRugs: true,
    canDeleteRugs: false,
    canViewGallery: true,
    canManageCosting: false,
    canGenerateQuotes: false,
};
export const SamplingTeamManagement = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [newMember, setNewMember] = useState({
        email: '',
        name: '',
        role: 'Member',
        permissions: defaultSamplingPermissions
    });
    // Fetch all users from Firebase
    const { data: allUsers = [], isLoading } = useQuery({
        queryKey: ['/api/users'],
        queryFn: async () => {
            const response = await fetch('/api/users');
            if (!response.ok)
                throw new Error('Failed to fetch users');
            return response.json();
        },
    });
    // Filter to show only sampling team members (users with sampling department)
    const samplingTeamMembers = allUsers
        .filter((user) => user.departments && user.departments.includes('Sampling'))
        .map((user) => ({
        id: user.id,
        email: user.email,
        name: user.username || user.email.split('@')[0],
        role: user.role === 'Editor' ? 'Manager' : 'Member',
        samplingPermissions: user.samplingPermissions || defaultSamplingPermissions,
        isActive: user.isActive,
        addedDate: user.createdAt || new Date().toISOString()
    }));
    // Mutation to add team member
    const addMemberMutation = useMutation({
        mutationFn: async (memberData) => {
            const response = await fetch(`/api/users/${memberData.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    departments: ['Sampling'],
                    role: memberData.role === 'Manager' ? 'Editor' : 'Viewer',
                    samplingPermissions: memberData.permissions
                }),
            });
            if (!response.ok)
                throw new Error('Failed to add team member');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/users'] });
            toast({ title: "Success", description: "Team member added successfully" });
            setIsAddingMember(false);
            setNewMember({ email: '', name: '', role: 'Member', permissions: defaultSamplingPermissions });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to add team member", variant: "destructive" });
        }
    });
    // Mutation to update permissions
    const updatePermissionsMutation = useMutation({
        mutationFn: async ({ userId, permissions }) => {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ samplingPermissions: permissions }),
            });
            if (!response.ok)
                throw new Error('Failed to update permissions');
            return response.json();
        },
        onSuccess: (data, variables) => {
            // Update the cache directly with the new data
            queryClient.setQueryData(['/api/users'], (old) => {
                if (!old)
                    return old;
                return old.map((user) => user.id === variables.userId
                    ? { ...user, samplingPermissions: variables.permissions }
                    : user);
            });
            toast({ title: "Success", description: "Permissions updated successfully" });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update permissions", variant: "destructive" });
            // Refetch to get the correct state if update failed
            queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        },
    });
    const handleAddMember = () => {
        if (!newMember.email) {
            toast({ title: "Error", description: "Please select a user from the list", variant: "destructive" });
            return;
        }
        // Find user by email - should exist since we're using a dropdown
        const existingUser = allUsers.find((user) => user.email === newMember.email);
        if (!existingUser) {
            toast({ title: "Error", description: "Selected user not found. Please try again", variant: "destructive" });
            return;
        }
        // Check if user is already in Sampling team
        if (existingUser.departments && existingUser.departments.includes('Sampling')) {
            toast({ title: "Error", description: "User is already in the Sampling Team", variant: "destructive" });
            return;
        }
        addMemberMutation.mutate({
            id: existingUser.id,
            role: newMember.role,
            permissions: newMember.permissions
        });
    };
    const updatePermission = (userId, permission, value) => {
        const member = samplingTeamMembers.find(m => m.id === userId);
        if (member) {
            const updatedPermissions = {
                ...member.samplingPermissions,
                [permission]: value
            };
            updatePermissionsMutation.mutate({ userId, permissions: updatedPermissions });
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsx("div", { className: "w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(Factory, { className: "h-6 w-6 text-blue-600" }), "Sampling Team Management"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage team members who can access the Sampling Department with specific permissions" })] }), _jsxs(Button, { onClick: () => setIsAddingMember(true), className: "flex items-center gap-2", children: [_jsx(UserPlus, { className: "h-4 w-4" }), "Add Team Member"] })] }), isAddingMember && (_jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-blue-900", children: "Add New Sampling Team Member" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Select User from System *" }), _jsxs(Select, { value: newMember.email, onValueChange: (value) => {
                                                    const user = allUsers.find((u) => u.email === value);
                                                    setNewMember(prev => ({
                                                        ...prev,
                                                        email: value,
                                                        name: user ? (user.username || user.email.split('@')[0]) : ''
                                                    }));
                                                }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select a user to add to Sampling Team" }) }), _jsx(SelectContent, { children: allUsers
                                                            .filter((user) => !user.departments || !user.departments.includes('Sampling'))
                                                            .map((user) => (_jsxs(SelectItem, { value: user.email, children: [user.username || user.email.split('@')[0], " (", user.email, ")"] }, user.id))) })] }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Only showing users who are not already in the Sampling Team. Users must sign in to Google first to appear in this list." })] }), newMember.email && (_jsx("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded", children: _jsxs("p", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "Selected User:" }), " ", newMember.name || newMember.email.split('@')[0], " (", newMember.email, ")"] }) }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "role", children: "Role" }), _jsxs(Select, { value: newMember.role, onValueChange: (value) => setNewMember(prev => ({ ...prev, role: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Member", children: "Team Member" }), _jsx(SelectItem, { value: "Manager", children: "Team Manager" })] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: handleAddMember, disabled: addMemberMutation.isPending, children: [_jsx(Check, { className: "h-4 w-4 mr-2" }), "Add Member"] }), _jsxs(Button, { variant: "outline", onClick: () => setIsAddingMember(false), children: [_jsx(X, { className: "h-4 w-4 mr-2" }), "Cancel"] })] })] })] })), _jsxs("div", { className: "grid gap-4", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("h3", { className: "text-lg font-semibold flex items-center gap-2", children: [_jsx(Users, { className: "h-5 w-5" }), "Current Team Members (", samplingTeamMembers.length, ")"] }) }), samplingTeamMembers.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(Users, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Team Members" }), _jsx("p", { className: "text-gray-600", children: "Add team members to give them access to the Sampling Department" })] }) })) : (_jsx("div", { className: "space-y-4", children: samplingTeamMembers.map((member) => (_jsxs(Card, { className: "border-l-4 border-l-blue-500", children: [_jsx(CardHeader, { children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { children: [_jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [member.name, _jsx(Badge, { variant: member.role === 'Manager' ? 'default' : 'secondary', children: member.role }), _jsx(Badge, { variant: member.isActive ? 'default' : 'destructive', className: member.isActive ? 'bg-green-100 text-green-800' : '', children: member.isActive ? 'Active' : 'Inactive' })] }), _jsx("p", { className: "text-gray-600", children: member.email }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Added: ", new Date(member.addedDate).toLocaleDateString()] })] }) }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: "Sampling Permissions" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: Object.entries(member.samplingPermissions).map(([permission, value]) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsx(Label, { className: "text-sm", children: permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim() }), _jsx(Switch, { checked: value, onCheckedChange: (checked) => updatePermission(member.id, permission, checked), disabled: updatePermissionsMutation.isPending })] }, permission))) })] }) })] }, member.id))) }))] })] }));
};
export default SamplingTeamManagement;
