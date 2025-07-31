import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, Users } from 'lucide-react';
const ALL_INSPECTION_STAGES = [
    'Lab', 'On Loom', 'Bazaar', 'Washing',
    'Stretching', 'Binding', '100% Finished QC', 'Final Inspection'
];
const QCPermissionsManager = () => {
    const [qcPermissions, setQcPermissions] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({ email: '', name: '' });
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    // Fetch QC permissions on mount
    useEffect(() => {
        fetchQCPermissions();
    }, []);
    const fetchQCPermissions = async () => {
        try {
            const response = await fetch('/api/qc-permissions');
            if (response.ok) {
                const permissions = await response.json();
                setQcPermissions(permissions);
            }
        }
        catch (error) {
            console.error('Error fetching QC permissions:', error);
            toast({
                title: "Error",
                description: "Failed to fetch QC permissions",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const saveQCPermissions = async (updatedPermissions) => {
        try {
            const response = await fetch('/api/qc-permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPermissions)
            });
            if (response.ok) {
                setQcPermissions(updatedPermissions);
                toast({
                    title: "Success",
                    description: "QC permissions updated successfully",
                });
            }
            else {
                throw new Error('Failed to save permissions');
            }
        }
        catch (error) {
            console.error('Error saving QC permissions:', error);
            toast({
                title: "Error",
                description: "Failed to save QC permissions",
                variant: "destructive",
            });
        }
    };
    const toggleStageAssignment = (userId, stage) => {
        setQcPermissions(prev => prev.map(user => {
            if (user.userId === userId) {
                const assignedStages = user.assignedStages.includes(stage)
                    ? user.assignedStages.filter(s => s !== stage)
                    : [...user.assignedStages, stage];
                return { ...user, assignedStages };
            }
            return user;
        }));
    };
    const toggleUserStatus = (userId) => {
        setQcPermissions(prev => prev.map(user => {
            if (user.userId === userId) {
                return { ...user, isActive: !user.isActive };
            }
            return user;
        }));
    };
    const addNewQCUser = () => {
        if (!newUser.email || !newUser.name) {
            toast({
                title: "Validation Error",
                description: "Please fill in both email and name",
                variant: "destructive",
            });
            return;
        }
        const newQCUser = {
            userId: `qc_${Date.now()}`,
            email: newUser.email,
            name: newUser.name,
            assignedStages: [],
            isActive: true
        };
        setQcPermissions(prev => [...prev, newQCUser]);
        setNewUser({ email: '', name: '' });
        setIsAddingUser(false);
        toast({
            title: "Success",
            description: `QC Inspector ${newUser.name} added successfully`,
        });
    };
    const removeQCUser = (userId) => {
        setQcPermissions(prev => prev.filter(user => user.userId !== userId));
        toast({
            title: "Success",
            description: "QC Inspector removed successfully",
        });
    };
    const saveAllChanges = () => {
        saveQCPermissions(qcPermissions);
    };
    if (loading) {
        return _jsx("div", { className: "p-6", children: "Loading QC permissions..." });
    }
    return (_jsxs("div", { className: "container mx-auto p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "QC Inspector Permissions" }), _jsx("p", { className: "text-gray-600", children: "Manage QC inspector stage assignments and access control" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total QC Inspectors" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: qcPermissions.length }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Active Inspectors" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-green-600", children: qcPermissions.filter(user => user.isActive).length }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Inactive Inspectors" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-red-600", children: qcPermissions.filter(user => !user.isActive).length }) })] })] }), _jsxs("div", { className: "flex flex-wrap gap-3 mb-6", children: [_jsxs(Button, { onClick: () => setIsAddingUser(true), className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add QC Inspector"] }), _jsxs(Button, { onClick: saveAllChanges, variant: "outline", className: "border-green-600 text-green-600 hover:bg-green-50", children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save All Changes"] })] }), isAddingUser && (_jsxs(Card, { className: "mb-6 border-blue-200", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Add New QC Inspector" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email Address" }), _jsx(Input, { id: "email", type: "email", value: newUser.email, onChange: (e) => setNewUser(prev => ({ ...prev, email: e.target.value })), placeholder: "inspector@easternmills.com" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "Full Name" }), _jsx(Input, { id: "name", value: newUser.name, onChange: (e) => setNewUser(prev => ({ ...prev, name: e.target.value })), placeholder: "Inspector Name" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: addNewQCUser, className: "bg-green-600 hover:bg-green-700", children: "Add Inspector" }), _jsx(Button, { variant: "outline", onClick: () => setIsAddingUser(false), children: "Cancel" })] })] })] })), _jsx("div", { className: "space-y-4", children: qcPermissions.map((user) => (_jsxs(Card, { className: `${!user.isActive ? 'opacity-60 border-gray-300' : 'border-gray-200'}`, children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: user.name }), _jsx("p", { className: "text-sm text-gray-600", children: user.email })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: user.isActive ? "default" : "secondary", children: user.isActive ? 'Active' : 'Inactive' }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => toggleUserStatus(user.userId), className: user.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50", children: user.isActive ? 'Deactivate' : 'Activate' }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => removeQCUser(user.userId), className: "text-red-600 hover:bg-red-50", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium mb-3 block", children: "Assigned Inspection Stages" }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: ALL_INSPECTION_STAGES.map((stage) => (_jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: user.assignedStages.includes(stage), onChange: () => toggleStageAssignment(user.userId, stage), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500", disabled: !user.isActive }), _jsx("span", { className: `text-sm ${!user.isActive ? 'text-gray-400' : 'text-gray-700'}`, children: stage })] }, stage))) }), _jsx("div", { className: "mt-3", children: _jsxs(Badge, { variant: "outline", className: "text-xs", children: [user.assignedStages.length, " stages assigned"] }) })] }) })] }, user.userId))) }), qcPermissions.length === 0 && (_jsx(Card, { className: "text-center py-8", children: _jsxs(CardContent, { children: [_jsx(Users, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No QC Inspectors" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Get started by adding your first QC inspector" }), _jsxs(Button, { onClick: () => setIsAddingUser(true), className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add QC Inspector"] })] }) }))] }));
};
export default QCPermissionsManager;
