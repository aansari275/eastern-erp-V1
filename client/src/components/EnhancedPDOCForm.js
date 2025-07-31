import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Package, TestTube, Upload, File, X, Save, Plus, Edit, Loader, CheckCircle } from 'lucide-react';
const EnhancedPDOCForm = ({ pdoc, onSave }) => {
    const [activeTab, setActiveTab] = useState('requirements');
    const [formData, setFormData] = useState({
        pdocNumber: '',
        buyerId: '',
        buyerProductDesignCode: '',
        ted: '',
        productType: '',
        pdocStatus: 'draft',
        productTestRequirements: '',
        callouts: '',
        ctq: '',
        sizeTolerance: '',
        weightTolerance: '',
        buyerEmailCommunication: '',
        ppmNotes: '',
        communicationFiles: '',
        notesFiles: '',
    });
    const [communicationFiles, setCommunicationFiles] = useState([]);
    const [testReports, setTestReports] = useState([]);
    const [dwps, setDwps] = useState([]);
    const [editingTestReport, setEditingTestReport] = useState(null);
    const [editingDwp, setEditingDwp] = useState(null);
    const fileInputRef = useRef(null);
    const testFileInputRef = useRef(null);
    const { toast } = useToast();
    useEffect(() => {
        if (pdoc) {
            setFormData({
                pdocNumber: pdoc.pdocNumber || '',
                buyerId: pdoc.buyerId?.toString() || '',
                buyerProductDesignCode: pdoc.buyerProductDesignCode || '',
                ted: pdoc.ted || '',
                productType: pdoc.productType || '',
                pdocStatus: pdoc.pdocStatus || 'draft',
                productTestRequirements: pdoc.productTestRequirements || '',
                callouts: pdoc.callouts || '',
                ctq: pdoc.ctq || '',
                sizeTolerance: pdoc.sizeTolerance || '',
                weightTolerance: pdoc.weightTolerance || '',
                buyerEmailCommunication: pdoc.buyerEmailCommunication || '',
                ppmNotes: pdoc.ppmNotes || '',
                communicationFiles: pdoc.communicationFiles || '',
                notesFiles: pdoc.notesFiles || '',
            });
            // Load associated data
            if (pdoc.id) {
                fetchTestReports();
                fetchDwps();
            }
        }
    }, [pdoc]);
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
    // File upload function for communication files
    const uploadCommunicationFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload/communication', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('File upload failed');
        }
        const result = await response.json();
        return result.url;
    };
    // File upload function for test reports with OCR
    const uploadTestReportWithOCR = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload/test-report', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Test report upload failed');
        }
        const result = await response.json();
        return { url: result.url, ocrData: result.ocrData };
    };
    const handleFileUpload = async (files, type) => {
        if (!files || files.length === 0)
            return;
        const file = files[0];
        const newFile = {
            file,
            name: file.name,
            type: file.type,
            isUploading: true
        };
        if (type === 'communication') {
            setCommunicationFiles(prev => [...prev, newFile]);
        }
        try {
            if (type === 'communication') {
                const uploadedUrl = await uploadCommunicationFile(file);
                setCommunicationFiles(prev => prev.map(f => f.name === file.name ? { ...f, uploadedUrl, isUploading: false } : f));
                toast({
                    title: 'File Uploaded',
                    description: 'Communication file uploaded successfully.',
                });
            }
            else if (type === 'test') {
                // Handle test report with OCR
                const { url: uploadedUrl, ocrData } = await uploadTestReportWithOCR(file);
                const newTestReport = {
                    versionNo: `V${testReports.length + 1}.0`,
                    testReportNo: ocrData.reportNo,
                    issueDate: ocrData.issueDate,
                    testedByLab: ocrData.testedByLab,
                    testResult: ocrData.testResult,
                    testType: ocrData.testType,
                    uploadedFileUrl: uploadedUrl,
                    ocrExtractedData: ocrData,
                    isUploading: false
                };
                setTestReports(prev => [...prev, newTestReport]);
                toast({
                    title: 'Test Report Uploaded',
                    description: 'OCR processing completed. Fields auto-populated.',
                });
            }
        }
        catch (error) {
            toast({
                title: 'Upload Failed',
                description: 'Failed to upload file. Please try again.',
                variant: 'destructive',
            });
        }
    };
    const saveTestReport = async (testReport) => {
        try {
            const isEdit = testReport.id;
            const url = isEdit ? `/api/test-reports/${testReport.id}` : '/api/test-reports';
            const method = isEdit ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEdit ? testReport : {
                    ...testReport,
                    pdocId: pdoc?.id,
                    internalReviewStatus: 'under_review'
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
    const saveDwp = async (dwp) => {
        try {
            const isEdit = dwp.id;
            const url = isEdit ? `/api/dwp/${dwp.id}` : '/api/dwp';
            const method = isEdit ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEdit ? dwp : { ...dwp, pdocId: pdoc?.id }),
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = pdoc ? `/api/pdocs/${pdoc.id}` : '/api/pdocs';
            const method = pdoc ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    communicationFiles: communicationFiles.map(f => f.uploadedUrl).filter(Boolean).join(','),
                }),
            });
            if (response.ok) {
                toast({
                    title: `PDOC ${pdoc ? 'Updated' : 'Created'} Successfully`,
                    description: `PDOC has been ${pdoc ? 'updated' : 'created'}.`,
                });
                onSave?.();
            }
        }
        catch (error) {
            toast({
                title: 'Error',
                description: `Failed to ${pdoc ? 'update' : 'create'} PDOC.`,
                variant: 'destructive',
            });
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold", children: pdoc ? 'Edit PDOC' : 'Create New PDOC' }), _jsx(Badge, { variant: formData.pdocStatus === 'approved' ? 'default' : 'secondary', children: formData.pdocStatus })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsxs(TabsTrigger, { value: "requirements", className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), "Product Requirements"] }), _jsxs(TabsTrigger, { value: "testing", className: "flex items-center gap-2", children: [_jsx(TestTube, { className: "h-4 w-4" }), "Testing (CONNECT)"] }), _jsxs(TabsTrigger, { value: "dwp", className: "flex items-center gap-2", children: [_jsx(Package, { className: "h-4 w-4" }), "DWP"] })] }), _jsxs(TabsContent, { value: "requirements", className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Basic Information" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "pdocNumber", children: "PDOC Number *" }), _jsx(Input, { id: "pdocNumber", value: formData.pdocNumber, onChange: (e) => setFormData(prev => ({ ...prev, pdocNumber: e.target.value })), placeholder: "e.g., PDOC-2025-001", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerProductDesignCode", children: "Buyer Product Design Code" }), _jsx(Input, { id: "buyerProductDesignCode", value: formData.buyerProductDesignCode, onChange: (e) => setFormData(prev => ({ ...prev, buyerProductDesignCode: e.target.value })), placeholder: "e.g., A02/EM-25-MA-2502" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "productType", children: "Product Type" }), _jsxs(Select, { value: formData.productType, onValueChange: (value) => setFormData(prev => ({ ...prev, productType: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select product type..." }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "export", children: "Export" }), _jsx(SelectItem, { value: "domestic", children: "Domestic" }), _jsx(SelectItem, { value: "sample", children: "Sample" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "pdocStatus", children: "Status" }), _jsxs(Select, { value: formData.pdocStatus, onValueChange: (value) => setFormData(prev => ({ ...prev, pdocStatus: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "draft", children: "Draft" }), _jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "approved", children: "Approved" }), _jsx(SelectItem, { value: "rejected", children: "Rejected" })] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Technical Specifications" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "ted", children: "Technical Description (TED)" }), _jsx(Textarea, { id: "ted", value: formData.ted, onChange: (e) => setFormData(prev => ({ ...prev, ted: e.target.value })), placeholder: "Detailed technical description...", rows: 4 })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "sizeTolerance", children: "Size Tolerance" }), _jsx(Input, { id: "sizeTolerance", value: formData.sizeTolerance, onChange: (e) => setFormData(prev => ({ ...prev, sizeTolerance: e.target.value })), placeholder: "e.g., \u00B13%" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "weightTolerance", children: "Weight Tolerance" }), _jsx(Input, { id: "weightTolerance", value: formData.weightTolerance, onChange: (e) => setFormData(prev => ({ ...prev, weightTolerance: e.target.value })), placeholder: "e.g., \u00B15%" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "ctq", children: "Critical to Quality (CTQ)" }), _jsx(Textarea, { id: "ctq", value: formData.ctq, onChange: (e) => setFormData(prev => ({ ...prev, ctq: e.target.value })), placeholder: "Critical quality parameters...", rows: 3 })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Communication & Notes" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "buyerEmailCommunication", children: "Buyer Email Communication" }), _jsx(Textarea, { id: "buyerEmailCommunication", value: formData.buyerEmailCommunication, onChange: (e) => setFormData(prev => ({ ...prev, buyerEmailCommunication: e.target.value })), placeholder: "Key email communications...", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "ppmNotes", children: "PPM Notes" }), _jsx(Textarea, { id: "ppmNotes", value: formData.ppmNotes, onChange: (e) => setFormData(prev => ({ ...prev, ppmNotes: e.target.value })), placeholder: "Pre-production meeting notes...", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { children: "Communication Files" }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: () => fileInputRef.current?.click(), className: "w-full", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Upload Communication Files"] }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: ".pdf,.doc,.docx,.txt", onChange: (e) => handleFileUpload(e.target.files, 'communication'), className: "hidden" }), communicationFiles.map((file, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(File, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm", children: file.name }), file.isUploading && _jsx(Loader, { className: "h-4 w-4 animate-spin" }), file.uploadedUrl && _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })] }), _jsx(Button, { type: "button", size: "sm", variant: "ghost", onClick: () => setCommunicationFiles(prev => prev.filter((_, i) => i !== index)), children: _jsx(X, { className: "h-4 w-4" }) })] }, index)))] })] })] })] })] }), _jsx(TabsContent, { value: "testing", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Test Reports" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: () => testFileInputRef.current?.click(), children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Upload Test Report"] }), _jsxs(Button, { type: "button", onClick: () => setEditingTestReport({ versionNo: '' }), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Manual"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("input", { ref: testFileInputRef, type: "file", accept: ".pdf", onChange: (e) => handleFileUpload(e.target.files, 'test'), className: "hidden" }), editingTestReport && (_jsxs(Card, { className: "mb-4", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: editingTestReport.id ? 'Edit Test Report' : 'New Test Report' }) }), _jsxs(CardContent, { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Version Number *" }), _jsx(Input, { value: editingTestReport.versionNo, onChange: (e) => setEditingTestReport({ ...editingTestReport, versionNo: e.target.value }), placeholder: "e.g., V1.0" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Test Report Number" }), _jsx(Input, { value: editingTestReport.testReportNo || '', onChange: (e) => setEditingTestReport({ ...editingTestReport, testReportNo: e.target.value }), placeholder: "e.g., GR:TX:1641043086-A" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Issue Date" }), _jsx(Input, { type: "date", value: editingTestReport.issueDate || '', onChange: (e) => setEditingTestReport({ ...editingTestReport, issueDate: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Tested By Lab" }), _jsx(Input, { value: editingTestReport.testedByLab || '', onChange: (e) => setEditingTestReport({ ...editingTestReport, testedByLab: e.target.value }), placeholder: "e.g., SGS India Pvt. Ltd." })] }), _jsxs("div", { children: [_jsx(Label, { children: "Test Type" }), _jsxs(Select, { value: editingTestReport.testType || '', onValueChange: (value) => setEditingTestReport({ ...editingTestReport, testType: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select test type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "physical", children: "Physical Tests" }), _jsx(SelectItem, { value: "flammability", children: "Flammability" }), _jsx(SelectItem, { value: "colorfastness", children: "Colorfastness" }), _jsx(SelectItem, { value: "chemical", children: "Chemical" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Test Result" }), _jsxs(Select, { value: editingTestReport.testResult || '', onValueChange: (value) => setEditingTestReport({ ...editingTestReport, testResult: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select result" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Pass", children: "Pass" }), _jsx(SelectItem, { value: "Fail", children: "Fail" }), _jsx(SelectItem, { value: "Conditional Pass", children: "Conditional Pass" })] })] })] }), _jsxs("div", { className: "col-span-2 flex gap-2", children: [_jsxs(Button, { type: "button", onClick: () => saveTestReport(editingTestReport), children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save"] }), _jsx(Button, { type: "button", variant: "outline", onClick: () => setEditingTestReport(null), children: "Cancel" })] })] })] })), _jsxs("div", { className: "space-y-3", children: [testReports.map((report, index) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium", children: [report.versionNo, " - ", report.testType] }), _jsx("p", { className: "text-sm text-gray-600", children: report.testReportNo }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Lab: ", report.testedByLab] }), _jsx(Badge, { variant: report.testResult === 'Pass' ? 'default' : 'destructive', children: report.testResult }), report.ocrExtractedData && (_jsx("div", { className: "mt-2 text-xs text-green-600", children: "\u2713 OCR Data: Auto-populated from uploaded file" }))] }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { size: "sm", variant: "outline", onClick: () => setEditingTestReport(report), children: _jsx(Edit, { className: "h-4 w-4" }) }) })] }) }) }, index))), testReports.length === 0 && (_jsx("div", { className: "text-center text-gray-500 py-8", children: "No test reports yet. Upload a PDF or add manually." }))] })] })] }) }), _jsx(TabsContent, { value: "dwp", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Detail Working Procedure (DWP)" }), _jsxs(Button, { type: "button", onClick: () => setEditingDwp({ dwpVersion: '' }), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add DWP"] })] }) }), _jsxs(CardContent, { children: [editingDwp && (_jsxs(Card, { className: "mb-4", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: editingDwp.id ? 'Edit DWP' : 'New DWP' }) }), _jsxs(CardContent, { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "DWP Version *" }), _jsx(Input, { value: editingDwp.dwpVersion, onChange: (e) => setEditingDwp({ ...editingDwp, dwpVersion: e.target.value }), placeholder: "e.g., v1.0" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Primary Packaging Type" }), _jsx(Input, { value: editingDwp.primaryPackagingType || '', onChange: (e) => setEditingDwp({ ...editingDwp, primaryPackagingType: e.target.value }), placeholder: "e.g., Box, Bag" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Primary Packaging Dimensions" }), _jsx(Input, { value: editingDwp.primaryPackagingDimensions || '', onChange: (e) => setEditingDwp({ ...editingDwp, primaryPackagingDimensions: e.target.value }), placeholder: "L x W x H (cm)" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Unit Weight Product (kg)" }), _jsx(Input, { type: "number", step: "0.01", value: editingDwp.unitWeightProduct || '', onChange: (e) => setEditingDwp({ ...editingDwp, unitWeightProduct: parseFloat(e.target.value) }) })] }), _jsxs("div", { className: "col-span-2", children: [_jsx(Label, { children: "Palletization Information" }), _jsx(Textarea, { value: editingDwp.palletizationInfo || '', onChange: (e) => setEditingDwp({ ...editingDwp, palletizationInfo: e.target.value }), placeholder: "Pallet specifications...", rows: 3 })] }), _jsxs("div", { className: "col-span-2 flex gap-2", children: [_jsxs(Button, { type: "button", onClick: () => saveDwp(editingDwp), children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save"] }), _jsx(Button, { type: "button", variant: "outline", onClick: () => setEditingDwp(null), children: "Cancel" })] })] })] })), _jsxs("div", { className: "space-y-3", children: [dwps.map((dwp, index) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: dwp.dwpVersion }), _jsx("p", { className: "text-sm text-gray-600", children: dwp.primaryPackagingType }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Weight: ", dwp.unitWeightProduct, " kg"] })] }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { size: "sm", variant: "outline", onClick: () => setEditingDwp(dwp), children: _jsx(Edit, { className: "h-4 w-4" }) }) })] }) }) }, index))), dwps.length === 0 && (_jsx("div", { className: "text-center text-gray-500 py-8", children: "No DWP records yet. Click \"Add DWP\" to create one." }))] })] })] }) })] }), _jsx("div", { className: "flex justify-end gap-2", children: _jsxs(Button, { type: "submit", children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), pdoc ? 'Update PDOC' : 'Create PDOC'] }) })] }));
};
export default EnhancedPDOCForm;
