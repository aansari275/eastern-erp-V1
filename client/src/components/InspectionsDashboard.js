import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLabInspections } from '@/hooks/useLabInspectionServer';
import { useAuth } from '@/hooks/useAuth';
import IncomingInspectionForm from './IncomingInspectionForm';
import { Plus, FileText, Eye, Calendar, User, Building2 } from 'lucide-react';
import { format } from 'date-fns';
export default function InspectionsDashboard({ selectedCompany }) {
    const [showForm, setShowForm] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState();
    const { data: inspections = [], isLoading: loading, error } = useLabInspections();
    const { user } = useAuth();
    // Filter inspections by status (company filtering removed since new interface doesn't have company field)
    const draftInspections = inspections.filter((inspection) => inspection.status === 'draft');
    const submittedInspections = inspections.filter((inspection) => inspection.status === 'submitted');
    const handleNewInspection = () => {
        setSelectedInspection(undefined);
        setShowForm(true);
    };
    const handleViewInspection = (inspection) => {
        setSelectedInspection(inspection);
        setShowForm(true);
    };
    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedInspection(undefined);
    };
    if (showForm) {
        return (_jsx(IncomingInspectionForm, { inspection: selectedInspection, onClose: handleCloseForm, selectedCompany: selectedCompany }));
    }
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center p-12", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "Loading inspections..." })] }));
    }
    if (error) {
        return (_jsxs("div", { className: "text-center p-8", children: [_jsxs("div", { className: "text-red-600 mb-4", children: ["Error loading inspections: ", error] }), _jsx(Button, { onClick: () => window.location.reload(), children: "Retry" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Incoming Inspection - Dyed Raw Materials" }), _jsx("p", { className: "text-gray-600 mt-1", children: selectedCompany === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.' })] }), _jsxs(Button, { onClick: handleNewInspection, className: "flex items-center gap-2 bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "h-4 w-4" }), "New Inspection"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Inspections" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: draftInspections.length + submittedInspections.length })] }), _jsx("div", { className: "h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx(FileText, { className: "h-4 w-4 text-blue-600" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Draft Reports" }), _jsx("p", { className: "text-2xl font-bold text-amber-600", children: draftInspections.length })] }), _jsx("div", { className: "h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center", children: _jsx(Calendar, { className: "h-4 w-4 text-amber-600" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Submitted Reports" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: submittedInspections.length })] }), _jsx("div", { className: "h-8 w-8 bg-green-100 rounded-full flex items-center justify-center", children: _jsx(Building2, { className: "h-4 w-4 text-green-600" }) })] }) }) })] }), draftInspections.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-amber-700", children: [_jsx(Calendar, { className: "h-5 w-5" }), "Draft Inspections (", draftInspections.length, ")"] }) }), _jsx(CardContent, { className: "space-y-3", children: draftInspections.map((inspection) => (_jsxs("div", { className: "flex items-center justify-between p-4 border border-amber-200 rounded-lg bg-amber-50", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900", children: inspection.supplierName || 'Unnamed Supplier' }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Challan: ", inspection.challanNumber || 'Not specified', " \u2022 Lot: ", inspection.lotNumber || 'Not specified'] })] }), _jsxs("div", { className: "text-sm text-gray-500", children: [_jsx("p", { children: inspection.updatedAt
                                                            ? `Last edited: ${format(new Date(inspection.updatedAt), 'MMM dd, yyyy HH:mm')}`
                                                            : 'Recently created' }), _jsxs("p", { className: "flex items-center gap-1", children: [_jsx(User, { className: "h-3 w-3" }), inspection.createdBy || user?.email] })] })] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded", children: "Draft" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleViewInspection(inspection), className: "flex items-center gap-1", children: [_jsx(Eye, { className: "h-3 w-3" }), "Continue"] })] })] }, inspection.id))) })] })), submittedInspections.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-green-700", children: [_jsx(Building2, { className: "h-5 w-5" }), "Previous Reports (", submittedInspections.length, ")"] }) }), _jsx(CardContent, { className: "space-y-3", children: submittedInspections.map((inspection) => (_jsxs("div", { className: "flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900", children: inspection.supplierName || 'Unnamed Supplier' }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Challan: ", inspection.challanNumber || 'Not specified', " \u2022 Lot: ", inspection.lotNumber || 'Not specified', " \u2022 Tag: ", inspection.tagNumber || 'Not specified'] })] }), _jsxs("div", { className: "text-sm text-gray-500", children: [_jsx("p", { children: inspection.submittedAt
                                                            ? `Submitted: ${format(new Date(inspection.submittedAt), 'MMM dd, yyyy HH:mm')}`
                                                            : 'Recently submitted' }), _jsxs("p", { className: "flex items-center gap-1", children: [_jsx(User, { className: "h-3 w-3" }), inspection.checkedBy || inspection.createdBy || user?.email] })] })] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded", children: "Submitted" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleViewInspection(inspection), className: "flex items-center gap-1", children: [_jsx(Eye, { className: "h-3 w-3" }), "View"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "flex items-center gap-1", onClick: () => {
                                                // TODO: Implement PDF download
                                                console.log('Download PDF for:', inspection.id);
                                            }, children: [_jsx(FileText, { className: "h-3 w-3" }), "PDF"] })] })] }, inspection.id))) })] })), inspections.length === 0 && (_jsx(Card, { className: "text-center py-12", children: _jsxs(CardContent, { children: [_jsx(FileText, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No inspections yet" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Get started by creating your first incoming inspection for dyed raw materials." }), _jsxs(Button, { onClick: handleNewInspection, className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create First Inspection"] })] }) }))] }));
}
