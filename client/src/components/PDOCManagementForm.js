import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Package, TestTube, Tag, Plus, Edit, Trash2, Save, X } from 'lucide-react';
const PDOCManagementForm = ({ pdoc }) => {
    const [dwps, setDwps] = useState([]);
    const [testReports, setTestReports] = useState([]);
    const [labels, setLabels] = useState([]);
    const [editingDwp, setEditingDwp] = useState(null);
    const [editingTestReport, setEditingTestReport] = useState(null);
    const [editingLabel, setEditingLabel] = useState(null);
    const { toast } = useToast();
    // Fetch data when pdoc changes
    useEffect(() => {
        if (pdoc?.id) {
            fetchDwps();
            fetchTestReports();
            fetchLabels();
        }
    }, [pdoc?.id]);
    const fetchDwps = async () => {
        try {
            const response = await fetch(`/api/pdocs/${pdoc.id}/dwp`);
            if (response.ok) {
                const data = await response.json();
                setDwps(data);
            }
        }
        catch (error) {
            console.error('Error fetching DWPs:', error);
        }
    };
    const fetchTestReports = async () => {
        try {
            const response = await fetch(`/api/pdocs/${pdoc.id}/test-reports`);
            if (response.ok) {
                const data = await response.json();
                setTestReports(data);
            }
        }
        catch (error) {
            console.error('Error fetching test reports:', error);
        }
    };
    const fetchLabels = async () => {
        try {
            const response = await fetch(`/api/pdocs/${pdoc.id}/labels`);
            if (response.ok) {
                const data = await response.json();
                setLabels(data);
            }
        }
        catch (error) {
            console.error('Error fetching labels:', error);
        }
    };
    const saveDwp = async (dwpData) => {
        try {
            const isEdit = dwpData.id;
            const url = isEdit ? `/api/dwp/${dwpData.id}` : '/api/dwp';
            const method = isEdit ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEdit ? dwpData : { ...dwpData, pdocId: pdoc.id }),
            });
            if (response.ok) {
                await fetchDwps();
                setEditingDwp(null);
                toast({ title: `DWP ${isEdit ? 'updated' : 'created'} successfully` });
            }
        }
        catch (error) {
            toast({ title: 'Error saving DWP', variant: 'destructive' });
        }
    };
    const saveTestReport = async (reportData) => {
        try {
            const isEdit = reportData.id;
            const url = isEdit ? `/api/test-reports/${reportData.id}` : '/api/test-reports';
            const method = isEdit ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEdit ? reportData : {
                    ...reportData,
                    pdocId: pdoc.id,
                    internalReviewStatus: 'under_review',
                    reminderStatus: 'none'
                }),
            });
            if (response.ok) {
                await fetchTestReports();
                setEditingTestReport(null);
                toast({ title: `Test report ${isEdit ? 'updated' : 'created'} successfully` });
            }
        }
        catch (error) {
            toast({ title: 'Error saving test report', variant: 'destructive' });
        }
    };
    const saveLabel = async (labelData) => {
        try {
            const isEdit = labelData.id;
            const url = isEdit ? `/api/labels/${labelData.id}` : '/api/labels';
            const method = isEdit ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEdit ? labelData : {
                    ...labelData,
                    pdocId: pdoc.id,
                    approvalStatus: 'pending'
                }),
            });
            if (response.ok) {
                await fetchLabels();
                setEditingLabel(null);
                toast({ title: `Label ${isEdit ? 'updated' : 'created'} successfully` });
            }
        }
        catch (error) {
            toast({ title: 'Error saving label', variant: 'destructive' });
        }
    };
    const deleteItem = async (type, id) => {
        try {
            const endpoints = {
                'dwp': `/api/dwp/${id}`,
                'test-report': `/api/test-reports/${id}`,
                'label': `/api/labels/${id}`
            };
            const response = await fetch(endpoints[type], { method: 'DELETE' });
            if (response.ok) {
                if (type === 'dwp')
                    await fetchDwps();
                else if (type === 'test-report')
                    await fetchTestReports();
                else
                    await fetchLabels();
                toast({ title: `${type.replace('-', ' ')} deleted successfully` });
            }
        }
        catch (error) {
            toast({ title: `Error deleting ${type.replace('-', ' ')}`, variant: 'destructive' });
        }
    };
    if (!pdoc) {
        return (_jsx("div", { className: "text-center text-gray-500 p-8", children: "Select a PDOC from the list to view its management details" }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold", children: "PDOC Management" }), _jsx(Badge, { variant: pdoc.pdocStatus === 'approved' ? 'default' : 'secondary', children: pdoc.pdocStatus })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5" }), "Basic Information"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "PDOC Number" }), _jsx("p", { className: "mt-1 text-sm text-gray-900", children: pdoc.pdocNumber })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Buyer Product Design Code" }), _jsx("p", { className: "mt-1 text-sm text-gray-900", children: pdoc.buyerProductDesignCode })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "TED" }), _jsx("p", { className: "mt-1 text-sm text-gray-900", children: pdoc.ted })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Product Type" }), _jsx("p", { className: "mt-1 text-sm text-gray-900", children: pdoc.productType })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Created Date" }), _jsx("p", { className: "mt-1 text-sm text-gray-900", children: new Date(pdoc.createdAt).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Last Updated" }), _jsx("p", { className: "mt-1 text-sm text-gray-900", children: new Date(pdoc.updatedAt).toLocaleDateString() })] })] }) })] }), _jsxs(Tabs, { defaultValue: "dwp", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-gray-100 rounded-lg h-auto", children: [_jsxs(TabsTrigger, { value: "dwp", className: "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 hover:bg-gray-50 transition-all duration-200", children: [_jsx(Package, { className: "h-4 w-4" }), "DWP (", dwps.length, ")"] }), _jsxs(TabsTrigger, { value: "test-reports", className: "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 hover:bg-gray-50 transition-all duration-200", children: [_jsx(TestTube, { className: "h-4 w-4" }), "Test Reports (", testReports.length, ")"] }), _jsxs(TabsTrigger, { value: "labels", className: "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 hover:bg-gray-50 transition-all duration-200", children: [_jsx(Tag, { className: "h-4 w-4" }), "Labels (", labels.length, ")"] })] }), _jsxs(TabsContent, { value: "dwp", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Detail Working Procedure (DWP)" }), _jsxs(Button, { onClick: () => setEditingDwp({ dwpVersion: '' }), className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), "Add DWP"] })] }), editingDwp && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: editingDwp.id ? 'Edit DWP' : 'New DWP' }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "dwpVersion", children: "DWP Version *" }), _jsx(Input, { id: "dwpVersion", value: editingDwp.dwpVersion || '', onChange: (e) => setEditingDwp({ ...editingDwp, dwpVersion: e.target.value }), placeholder: "e.g., v1.0", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "primaryPackagingType", children: "Primary Packaging Type" }), _jsx(Input, { id: "primaryPackagingType", value: editingDwp.primaryPackagingType || '', onChange: (e) => setEditingDwp({ ...editingDwp, primaryPackagingType: e.target.value }), placeholder: "e.g., Box, Bag, Vacuum Packed" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "primaryPackagingDimensions", children: "Primary Packaging Dimensions" }), _jsx(Input, { id: "primaryPackagingDimensions", value: editingDwp.primaryPackagingDimensions || '', onChange: (e) => setEditingDwp({ ...editingDwp, primaryPackagingDimensions: e.target.value }), placeholder: "L x W x H (cm)" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "primaryPackagingMaterial", children: "Primary Packaging Material" }), _jsx(Input, { id: "primaryPackagingMaterial", value: editingDwp.primaryPackagingMaterial || '', onChange: (e) => setEditingDwp({ ...editingDwp, primaryPackagingMaterial: e.target.value }), placeholder: "e.g., Cardboard, Plastic" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "masterCartonType", children: "Master Carton Type" }), _jsx(Input, { id: "masterCartonType", value: editingDwp.masterCartonType || '', onChange: (e) => setEditingDwp({ ...editingDwp, masterCartonType: e.target.value }), placeholder: "e.g., Single Wall, Double Wall" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "masterCartonDimensions", children: "Master Carton Dimensions" }), _jsx(Input, { id: "masterCartonDimensions", value: editingDwp.masterCartonDimensions || '', onChange: (e) => setEditingDwp({ ...editingDwp, masterCartonDimensions: e.target.value }), placeholder: "L x W x H (cm)" })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "unitWeightProduct", children: "Unit Weight Product (kg)" }), _jsx(Input, { id: "unitWeightProduct", type: "number", step: "0.01", value: editingDwp.unitWeightProduct || '', onChange: (e) => setEditingDwp({ ...editingDwp, unitWeightProduct: parseFloat(e.target.value) }), placeholder: "0.00" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "unitWeightPackaged", children: "Unit Weight Packaged (kg)" }), _jsx(Input, { id: "unitWeightPackaged", type: "number", step: "0.01", value: editingDwp.unitWeightPackaged || '', onChange: (e) => setEditingDwp({ ...editingDwp, unitWeightPackaged: parseFloat(e.target.value) }), placeholder: "0.00" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "masterCartonWeightGross", children: "Master Carton Weight Gross (kg)" }), _jsx(Input, { id: "masterCartonWeightGross", type: "number", step: "0.01", value: editingDwp.masterCartonWeightGross || '', onChange: (e) => setEditingDwp({ ...editingDwp, masterCartonWeightGross: parseFloat(e.target.value) }), placeholder: "0.00" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "palletizationInfo", children: "Palletization Information" }), _jsx(Textarea, { id: "palletizationInfo", value: editingDwp.palletizationInfo || '', onChange: (e) => setEditingDwp({ ...editingDwp, palletizationInfo: e.target.value }), placeholder: "Pallet specifications, stacking information, etc.", rows: 3 })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: () => saveDwp(editingDwp), className: "flex items-center gap-2", children: [_jsx(Save, { className: "h-4 w-4" }), "Save"] }), _jsxs(Button, { variant: "outline", onClick: () => setEditingDwp(null), className: "flex items-center gap-2", children: [_jsx(X, { className: "h-4 w-4" }), "Cancel"] })] })] })] })), _jsxs("div", { className: "space-y-2", children: [dwps.map((dwp) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: dwp.dwpVersion }), _jsx("p", { className: "text-sm text-gray-600", children: dwp.primaryPackagingType }), _jsxs("p", { className: "text-xs text-gray-400", children: ["Created: ", new Date(dwp.createdAt).toLocaleDateString()] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => setEditingDwp(dwp), children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "destructive", onClick: () => deleteItem('dwp', dwp.id), children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }) }, dwp.id))), dwps.length === 0 && (_jsx("div", { className: "text-center text-gray-500 py-8", children: "No DWP records found. Click \"Add DWP\" to create the first one." }))] })] }), _jsxs(TabsContent, { value: "test-reports", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Test Reports" }), _jsxs(Button, { onClick: () => setEditingTestReport({ versionNo: '' }), className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), "Add Test Report"] })] }), editingTestReport && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: editingTestReport.id ? 'Edit Test Report' : 'New Test Report' }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "versionNo", children: "Version Number *" }), _jsx(Input, { id: "versionNo", value: editingTestReport.versionNo || '', onChange: (e) => setEditingTestReport({ ...editingTestReport, versionNo: e.target.value }), placeholder: "e.g., V1.0", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "testType", children: "Test Type" }), _jsxs(Select, { value: editingTestReport.testType || '', onValueChange: (value) => setEditingTestReport({ ...editingTestReport, testType: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select test type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "flammability", children: "Flammability" }), _jsx(SelectItem, { value: "colorfastness", children: "Colorfastness" }), _jsx(SelectItem, { value: "physical", children: "Physical Properties" }), _jsx(SelectItem, { value: "chemical", children: "Chemical" }), _jsx(SelectItem, { value: "dimensional", children: "Dimensional Stability" }), _jsx(SelectItem, { value: "other", children: "Other" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "testReportNo", children: "Test Report Number" }), _jsx(Input, { id: "testReportNo", value: editingTestReport.testReportNo || '', onChange: (e) => setEditingTestReport({ ...editingTestReport, testReportNo: e.target.value }), placeholder: "e.g., TR-2025-001" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "testedByLab", children: "Tested By Lab" }), _jsx(Input, { id: "testedByLab", value: editingTestReport.testedByLab || '', onChange: (e) => setEditingTestReport({ ...editingTestReport, testedByLab: e.target.value }), placeholder: "e.g., SGS, Intertek, BV" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "issueDate", children: "Issue Date" }), _jsx(Input, { id: "issueDate", type: "date", value: editingTestReport.issueDate || '', onChange: (e) => setEditingTestReport({ ...editingTestReport, issueDate: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "expirationDate", children: "Expiration Date" }), _jsx(Input, { id: "expirationDate", type: "date", value: editingTestReport.expirationDate || '', onChange: (e) => setEditingTestReport({ ...editingTestReport, expirationDate: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "testResult", children: "Test Result" }), _jsxs(Select, { value: editingTestReport.testResult || '', onValueChange: (value) => setEditingTestReport({ ...editingTestReport, testResult: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select result" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "pass", children: "Pass" }), _jsx(SelectItem, { value: "fail", children: "Fail" }), _jsx(SelectItem, { value: "conditional_pass", children: "Conditional Pass" }), _jsx(SelectItem, { value: "pending", children: "Pending" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "internalReviewStatus", children: "Internal Review Status" }), _jsxs(Select, { value: editingTestReport.internalReviewStatus || 'under_review', onValueChange: (value) => setEditingTestReport({ ...editingTestReport, internalReviewStatus: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "under_review", children: "Under Review" }), _jsx(SelectItem, { value: "approved", children: "Approved" }), _jsx(SelectItem, { value: "rejected", children: "Rejected" }), _jsx(SelectItem, { value: "needs_revision", children: "Needs Revision" })] })] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: () => saveTestReport(editingTestReport), className: "flex items-center gap-2", children: [_jsx(Save, { className: "h-4 w-4" }), "Save"] }), _jsxs(Button, { variant: "outline", onClick: () => setEditingTestReport(null), className: "flex items-center gap-2", children: [_jsx(X, { className: "h-4 w-4" }), "Cancel"] })] })] })] })), _jsxs("div", { className: "space-y-2", children: [testReports.map((report) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium", children: [report.versionNo, " - ", report.testType] }), _jsx("p", { className: "text-sm text-gray-600", children: report.testReportNo }), _jsxs("div", { className: "flex gap-2 mt-1", children: [_jsx(Badge, { variant: report.testResult === 'pass' ? 'default' : 'destructive', children: report.testResult }), _jsx(Badge, { variant: "outline", children: report.internalReviewStatus })] }), _jsxs("p", { className: "text-xs text-gray-400", children: ["Created: ", new Date(report.createdAt).toLocaleDateString()] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => setEditingTestReport(report), children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "destructive", onClick: () => deleteItem('test-report', report.id), children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }) }, report.id))), testReports.length === 0 && (_jsx("div", { className: "text-center text-gray-500 py-8", children: "No test reports found. Click \"Add Test Report\" to create the first one." }))] })] }), _jsxs(TabsContent, { value: "labels", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Labels" }), _jsxs(Button, { onClick: () => setEditingLabel({ labelName: '' }), className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), "Add Label"] })] }), editingLabel && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: editingLabel.id ? 'Edit Label' : 'New Label' }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "labelName", children: "Label Name *" }), _jsx(Input, { id: "labelName", value: editingLabel.labelName || '', onChange: (e) => setEditingLabel({ ...editingLabel, labelName: e.target.value }), placeholder: "e.g., Care Label, Brand Label", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "labelType", children: "Label Type" }), _jsxs(Select, { value: editingLabel.labelType || '', onValueChange: (value) => setEditingLabel({ ...editingLabel, labelType: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select label type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "care_label", children: "Care Label" }), _jsx(SelectItem, { value: "brand_label", children: "Brand Label" }), _jsx(SelectItem, { value: "composition_label", children: "Composition Label" }), _jsx(SelectItem, { value: "size_label", children: "Size Label" }), _jsx(SelectItem, { value: "other", children: "Other" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "labelSupplierName", children: "Supplier Name" }), _jsx(Input, { id: "labelSupplierName", value: editingLabel.labelSupplierName || '', onChange: (e) => setEditingLabel({ ...editingLabel, labelSupplierName: e.target.value }), placeholder: "Label supplier name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "approvalStatus", children: "Approval Status" }), _jsxs(Select, { value: editingLabel.approvalStatus || 'pending', onValueChange: (value) => setEditingLabel({ ...editingLabel, approvalStatus: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "approved", children: "Approved" }), _jsx(SelectItem, { value: "rejected", children: "Rejected" }), _jsx(SelectItem, { value: "needs_revision", children: "Needs Revision" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "labelArtwork", children: "Label Artwork Details" }), _jsx(Textarea, { id: "labelArtwork", value: editingLabel.labelArtwork || '', onChange: (e) => setEditingLabel({ ...editingLabel, labelArtwork: e.target.value }), placeholder: "Artwork specifications, colors, dimensions, etc.", rows: 3 })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: () => saveLabel(editingLabel), className: "flex items-center gap-2", children: [_jsx(Save, { className: "h-4 w-4" }), "Save"] }), _jsxs(Button, { variant: "outline", onClick: () => setEditingLabel(null), className: "flex items-center gap-2", children: [_jsx(X, { className: "h-4 w-4" }), "Cancel"] })] })] })] })), _jsxs("div", { className: "space-y-2", children: [labels.map((label) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: label.labelName }), _jsx("p", { className: "text-sm text-gray-600", children: label.labelType }), _jsx("p", { className: "text-sm text-gray-500", children: label.labelSupplierName }), _jsx(Badge, { variant: label.approvalStatus === 'approved' ? 'default' : 'secondary', className: "mt-1", children: label.approvalStatus }), _jsxs("p", { className: "text-xs text-gray-400", children: ["Created: ", new Date(label.createdAt).toLocaleDateString()] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => setEditingLabel(label), children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "destructive", onClick: () => deleteItem('label', label.id), children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }) }, label.id))), labels.length === 0 && (_jsx("div", { className: "text-center text-gray-500 py-8", children: "No labels found. Click \"Add Label\" to create the first one." }))] })] })] })] }));
};
export default PDOCManagementForm;
