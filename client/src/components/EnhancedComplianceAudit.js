import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Save, Send, CheckCircle, XCircle, AlertCircle, Clock, Lock, ArrowLeft, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useComplianceAudit } from '@/hooks/useComplianceAudit';
import { MultiImageUpload } from './MultiImageUpload';
// ISO 9001:2015 Compliance Checklist Data
const compliancePartsData = [
    {
        id: 'part1',
        title: 'Design Control (C1-C7)',
        weight: 10,
        maxPoints: 7,
        items: [
            { id: 'C1', question: 'Are design and development procedures established?', response: '', remark: '', evidenceImages: [] },
            { id: 'C2', question: 'Are design and development inputs defined and recorded?', response: '', remark: '', evidenceImages: [] },
            { id: 'C3', question: 'Are design and development outputs documented?', response: '', remark: '', evidenceImages: [] },
            { id: 'C4', question: 'Is design and development review conducted at suitable stages?', response: '', remark: '', evidenceImages: [] },
            { id: 'C5', question: 'Is design and development verification performed?', response: '', remark: '', evidenceImages: [] },
            { id: 'C6', question: 'Is design and development validation performed?', response: '', remark: '', evidenceImages: [] },
            { id: 'C7', question: 'Are design and development changes controlled?', response: '', remark: '', evidenceImages: [] },
        ]
    },
    {
        id: 'part2',
        title: 'Purchasing Control (C8-C15)',
        weight: 12,
        maxPoints: 8,
        items: [
            { id: 'C8', question: 'Are purchasing procedures established?', response: '', remark: '', evidenceImages: [] },
            { id: 'C9', question: 'Are suppliers evaluated and selected based on defined criteria?', response: '', remark: '', evidenceImages: [] },
            { id: 'C10', question: 'Are supplier evaluation records maintained?', response: '', remark: '', evidenceImages: [] },
            { id: 'C11', question: 'Are purchasing documents reviewed and approved?', response: '', remark: '', evidenceImages: [] },
            { id: 'C12', question: 'Do purchasing documents contain clear product specifications?', response: '', remark: '', evidenceImages: [] },
            { id: 'C13', question: 'Are purchased products verified upon receipt?', response: '', remark: '', evidenceImages: [] },
            { id: 'C14', question: 'Are non-conforming purchased products identified and controlled?', response: '', remark: '', evidenceImages: [] },
            { id: 'C15', question: 'Is supplier performance monitored and reviewed?', response: '', remark: '', evidenceImages: [] },
        ]
    },
    {
        id: 'part3',
        title: 'Storage Management (C16-C22)',
        weight: 10,
        maxPoints: 7,
        items: [
            { id: 'C16', question: 'Are storage areas properly identified and organized?', response: '', remark: '', evidenceImages: [] },
            { id: 'C17', question: 'Are storage conditions appropriate for materials?', response: '', remark: '', evidenceImages: [] },
            { id: 'C18', question: 'Is FIFO (First In, First Out) system implemented?', response: '', remark: '', evidenceImages: [] },
            { id: 'C19', question: 'Are materials properly protected during storage?', response: '', remark: '', evidenceImages: [] },
            { id: 'C20', question: 'Are inventory records maintained and accurate?', response: '', remark: '', evidenceImages: [] },
            { id: 'C21', question: 'Are damaged or deteriorated materials identified?', response: '', remark: '', evidenceImages: [] },
            { id: 'C22', question: 'Is access to storage areas controlled?', response: '', remark: '', evidenceImages: [] },
        ]
    },
    // Continue with remaining parts...
    {
        id: 'part4',
        title: 'Incoming Inspection (C23-C30)',
        weight: 12,
        maxPoints: 8,
        items: [
            { id: 'C23', question: 'Are incoming inspection procedures documented?', response: '', remark: '', evidenceImages: [] },
            { id: 'C24', question: 'Are inspection criteria and methods defined?', response: '', remark: '', evidenceImages: [] },
            { id: 'C25', question: 'Are inspection records maintained?', response: '', remark: '', evidenceImages: [] },
            { id: 'C26', question: 'Are sampling plans appropriate and documented?', response: '', remark: '', evidenceImages: [] },
            { id: 'C27', question: 'Are measuring equipment calibrated and controlled?', response: '', remark: '', evidenceImages: [] },
            { id: 'C28', question: 'Are non-conforming materials identified and segregated?', response: '', remark: '', evidenceImages: [] },
            { id: 'C29', question: 'Are inspection results communicated to relevant parties?', response: '', remark: '', evidenceImages: [] },
            { id: 'C30', question: 'Are corrective actions taken for recurring issues?', response: '', remark: '', evidenceImages: [] },
        ]
    }
    // Add remaining parts 5-10 as needed...
];
export function EnhancedComplianceAudit({ auditId, onClose }) {
    const { toast } = useToast();
    const { createAudit, updateAudit, submitAudit, getAudit, autoSave, isCreating, isUpdating, isSubmitting } = useComplianceAudit();
    const [audit, setAudit] = useState({
        auditDate: new Date().toISOString().split('T')[0],
        auditorName: '',
        company: 'EHI',
        location: '',
        auditScope: 'ISO 9001:2015 Compliance Verification',
        parts: compliancePartsData,
        status: 'draft',
    });
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [lastSaved, setLastSaved] = useState(null);
    const [autoSaveTimer, setAutoSaveTimer] = useState(null);
    // Load existing audit if auditId provided
    useEffect(() => {
        if (auditId) {
            loadAudit(auditId);
        }
    }, [auditId]);
    const loadAudit = async (id) => {
        const existingAudit = await getAudit(id);
        if (existingAudit) {
            setAudit(existingAudit);
        }
    };
    // Auto-save functionality
    const triggerAutoSave = useCallback(() => {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }
        const timer = setTimeout(async () => {
            if (audit.id && audit.status === 'draft') {
                try {
                    await autoSave(audit.id, audit);
                    setLastSaved(new Date());
                }
                catch (error) {
                    console.error('Auto-save failed:', error);
                }
            }
        }, 2000); // Auto-save after 2 seconds of inactivity
        setAutoSaveTimer(timer);
    }, [audit, autoSave, autoSaveTimer]);
    // Trigger auto-save when audit data changes
    useEffect(() => {
        if (audit.id) {
            triggerAutoSave();
        }
        return () => {
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }
        };
    }, [audit, triggerAutoSave]);
    const handleBasicInfoChange = (field, value) => {
        setAudit(prev => ({
            ...prev,
            [field]: value,
        }));
    };
    const handleItemResponse = (partId, itemId, response) => {
        setAudit(prev => ({
            ...prev,
            parts: prev.parts?.map(part => part.id === partId
                ? {
                    ...part,
                    items: part.items.map(item => item.id === itemId ? { ...item, response } : item)
                }
                : part) || [],
        }));
    };
    const handleItemRemark = (partId, itemId, remark) => {
        setAudit(prev => ({
            ...prev,
            parts: prev.parts?.map(part => part.id === partId
                ? {
                    ...part,
                    items: part.items.map(item => item.id === itemId ? { ...item, remark } : item)
                }
                : part) || [],
        }));
    };
    const handleItemImages = (partId, itemId, images) => {
        setAudit(prev => ({
            ...prev,
            parts: prev.parts?.map(part => part.id === partId
                ? {
                    ...part,
                    items: part.items.map(item => item.id === itemId ? { ...item, evidenceImages: images } : item)
                }
                : part) || [],
        }));
    };
    const calculateScore = () => {
        if (!audit.parts)
            return { totalItems: 0, yesCount: 0, noCount: 0, naCount: 0, applicableItems: 0, score: 0 };
        let totalItems = 0;
        let yesCount = 0;
        let noCount = 0;
        let naCount = 0;
        audit.parts.forEach(part => {
            part.items.forEach(item => {
                totalItems++;
                if (item.response === 'Yes')
                    yesCount++;
                else if (item.response === 'No')
                    noCount++;
                else if (item.response === 'NA')
                    naCount++;
            });
        });
        const applicableItems = totalItems - naCount;
        const score = applicableItems > 0 ? Math.round((yesCount / applicableItems) * 100) : 0;
        return { totalItems, yesCount, noCount, naCount, applicableItems, score };
    };
    const handleSaveDraft = async () => {
        try {
            const scoreData = calculateScore();
            const auditData = { ...audit, scoreData };
            if (audit.id) {
                await updateAudit({ id: audit.id, data: auditData });
            }
            else {
                const newId = await createAudit(auditData);
                setAudit(prev => ({ ...prev, id: newId }));
            }
            setLastSaved(new Date());
            toast({
                title: "Draft saved",
                description: "Audit draft saved successfully.",
            });
        }
        catch (error) {
            console.error('Save failed:', error);
        }
    };
    const handleSubmitAudit = async () => {
        try {
            let auditIdToSubmit = audit.id;
            // If audit hasn't been saved yet, save it first
            if (!auditIdToSubmit) {
                const scoreData = calculateScore();
                const auditData = { ...audit, scoreData };
                auditIdToSubmit = await createAudit(auditData);
                setAudit(prev => ({ ...prev, id: auditIdToSubmit }));
            }
            // Submit the audit (no field validation required)
            await submitAudit(auditIdToSubmit);
            setAudit(prev => ({ ...prev, status: 'submitted', submittedAt: new Date() }));
            toast({
                title: "Audit submitted",
                description: "Compliance audit submitted successfully.",
            });
            if (onClose) {
                onClose();
            }
        }
        catch (error) {
            console.error('Submit failed:', error);
            toast({
                title: "Submission failed",
                description: "Failed to submit audit. Please try again.",
                variant: "destructive",
            });
        }
    };
    const generatePDF = async () => {
        if (!audit.id) {
            toast({
                title: "Save required",
                description: "Please save the audit first to generate PDF.",
                variant: "destructive",
            });
            return;
        }
        try {
            // Use the audit-specific PDF generation endpoint
            const response = await fetch(`/api/audits/${audit.id}/generate-pdf`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('PDF generation failed');
            }
            const result = await response.json();
            if (result.success) {
                // Download the PDF
                const link = document.createElement('a');
                link.href = result.downloadUrl || result.pdfUrl;
                link.download = result.fileName || `audit-${audit.id}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast({
                    title: "PDF generated",
                    description: "Audit report downloaded successfully with Eastern Mills branding.",
                });
            }
        }
        catch (error) {
            console.error('PDF generation failed:', error);
            toast({
                title: "PDF generation failed",
                description: "Failed to generate PDF report. Please try again.",
                variant: "destructive",
            });
        }
    };
    const scoreData = calculateScore();
    const currentPart = audit.parts?.[currentPartIndex];
    const isReadOnly = audit.status === 'submitted';
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [onClose && (_jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: _jsx(ArrowLeft, { className: "h-4 w-4" }) })), _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5" }), "ISO 9001:2015 Compliance Audit", isReadOnly && _jsx(Lock, { className: "h-4 w-4 text-muted-foreground" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [lastSaved && (_jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [_jsx(Clock, { className: "h-3 w-3" }), "Saved ", lastSaved.toLocaleTimeString()] })), _jsx(Badge, { variant: audit.status === 'submitted' ? 'default' : 'secondary', children: audit.status === 'submitted' ? 'Submitted' : 'Draft' })] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "auditDate", children: "Audit Date" }), _jsx(Input, { id: "auditDate", type: "date", value: audit.auditDate, onChange: (e) => handleBasicInfoChange('auditDate', e.target.value), disabled: isReadOnly })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "auditorName", children: "Auditor Name" }), _jsx(Input, { id: "auditorName", value: audit.auditorName, onChange: (e) => handleBasicInfoChange('auditorName', e.target.value), placeholder: "Enter auditor name", disabled: isReadOnly })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "company", children: "Company" }), _jsxs(Select, { value: audit.company, onValueChange: (value) => handleBasicInfoChange('company', value), disabled: isReadOnly, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "EHI", children: "Eastern Home Industries (EHI)" }), _jsx(SelectItem, { value: "EMPL", children: "Eastern Mills Pvt. Ltd. (EMPL)" })] })] })] })] }), scoreData.totalItems > 0 && (_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4 mb-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: scoreData.yesCount }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Yes" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: scoreData.noCount }), _jsx("div", { className: "text-xs text-muted-foreground", children: "No" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-gray-600", children: scoreData.naCount }), _jsx("div", { className: "text-xs text-muted-foreground", children: "N/A" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold", children: scoreData.applicableItems }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Applicable" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: `text-2xl font-bold ${scoreData.score >= 90 ? 'text-green-600' :
                                                    scoreData.score >= 70 ? 'text-yellow-600' : 'text-red-600'}`, children: [scoreData.score, "%"] }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Score" })] })] }))] })] }), currentPart && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsx("span", { children: currentPart.title }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["Part ", currentPartIndex + 1, " of ", audit.parts?.length || 0] })] }) }), _jsxs(CardContent, { className: "space-y-6", children: [currentPart.items.map((item, itemIndex) => (_jsx("div", { className: "border rounded-lg p-4 space-y-4", children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("h4", { className: "font-medium mb-2", children: [item.id, ": ", item.question] }), _jsx("div", { className: "flex gap-2 mb-3", children: ['Yes', 'No', 'NA'].map((response) => (_jsxs(Button, { size: "sm", variant: item.response === response ? 'default' : 'outline', className: item.response === response
                                                        ? response === 'Yes' ? 'bg-green-600 hover:bg-green-700' :
                                                            response === 'No' ? 'bg-red-600 hover:bg-red-700' :
                                                                'bg-gray-600 hover:bg-gray-700'
                                                        : '', onClick: () => !isReadOnly && handleItemResponse(currentPart.id, item.id, response), disabled: isReadOnly, children: [response === 'Yes' && _jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), response === 'No' && _jsx(XCircle, { className: "h-3 w-3 mr-1" }), response === 'NA' && _jsx(AlertCircle, { className: "h-3 w-3 mr-1" }), response] }, response))) }), _jsxs("div", { className: "mb-3", children: [_jsx(Label, { htmlFor: `remark-${item.id}`, className: "text-xs", children: "Remarks" }), _jsx(Textarea, { id: `remark-${item.id}`, value: item.remark, onChange: (e) => !isReadOnly && handleItemRemark(currentPart.id, item.id, e.target.value), placeholder: "Add any remarks or observations...", rows: 2, disabled: isReadOnly })] }), _jsx(MultiImageUpload, { images: item.evidenceImages, onImagesChange: (images) => !isReadOnly && handleItemImages(currentPart.id, item.id, images), maxImages: 5, title: `Evidence for ${item.id}`, className: isReadOnly ? 'opacity-60 pointer-events-none' : '' })] }) }) }, item.id))), _jsxs("div", { className: "flex items-center justify-between pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setCurrentPartIndex(Math.max(0, currentPartIndex - 1)), disabled: currentPartIndex === 0, children: "Previous Part" }), _jsxs("div", { className: "flex gap-2", children: [!isReadOnly && (_jsxs(Button, { onClick: handleSaveDraft, disabled: isUpdating || isCreating, variant: "outline", children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save Draft"] })), currentPartIndex === (audit.parts?.length || 1) - 1 ? (isReadOnly ? (_jsxs(Button, { onClick: generatePDF, variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download PDF"] })) : (_jsxs(Button, { onClick: handleSubmitAudit, disabled: isSubmitting || !audit.id, className: "bg-green-600 hover:bg-green-700", children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Submit Report"] }))) : (_jsx(Button, { onClick: () => setCurrentPartIndex(currentPartIndex + 1), disabled: currentPartIndex >= (audit.parts?.length || 1) - 1, children: "Next Part" }))] })] })] })] }))] }));
}
