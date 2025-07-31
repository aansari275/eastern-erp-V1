import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAutoSave, useAutoSaveId } from '@/hooks/useAutoSave';
import { Clock, Lock, CheckCircle, Save, Shield, Upload, Camera } from 'lucide-react';
// Default check items based on inspection stage
const getDefaultCheckItems = (stage) => {
    const baseItems = [
        { id: '1', category: 'Visual Inspection', checkPoint: 'Overall appearance and finish quality', status: 'pending', severity: 'major', remarks: '', evidence: [] },
        { id: '2', category: 'Dimensions', checkPoint: 'Size accuracy within tolerance', status: 'pending', severity: 'critical', remarks: '', evidence: [] },
        { id: '3', category: 'Pattern', checkPoint: 'Design pattern alignment and consistency', status: 'pending', severity: 'major', remarks: '', evidence: [] },
    ];
    const stageSpecificItems = {
        bazaar: [
            ...baseItems,
            { id: '4', category: 'Yarn Quality', checkPoint: 'Yarn tension and uniformity', status: 'pending', severity: 'major', remarks: '', evidence: [] },
            { id: '5', category: 'Weaving', checkPoint: 'Proper knot formation and density', status: 'pending', severity: 'critical', remarks: '', evidence: [] },
        ],
        binding: [
            ...baseItems,
            { id: '4', category: 'Edge Binding', checkPoint: 'Binding attachment and alignment', status: 'pending', severity: 'critical', remarks: '', evidence: [] },
            { id: '5', category: 'Corner Finish', checkPoint: 'Corner binding neatness', status: 'pending', severity: 'major', remarks: '', evidence: [] },
        ],
        clipping_finishing: [
            ...baseItems,
            { id: '4', category: 'Pile Height', checkPoint: 'Uniform pile height across surface', status: 'pending', severity: 'major', remarks: '', evidence: [] },
            { id: '5', category: 'Surface Finish', checkPoint: 'Clean surface without loose fibers', status: 'pending', severity: 'major', remarks: '', evidence: [] },
            { id: '6', category: 'Washing Quality', checkPoint: 'Proper washing and drying results', status: 'pending', severity: 'major', remarks: '', evidence: [] },
        ],
        final_inspection: [
            ...baseItems,
            { id: '4', category: 'Final Quality', checkPoint: 'Overall product meets specifications', status: 'pending', severity: 'critical', remarks: '', evidence: [] },
            { id: '5', category: 'Packaging Ready', checkPoint: 'Product ready for packaging', status: 'pending', severity: 'major', remarks: '', evidence: [] },
        ],
    };
    return stageSpecificItems[stage] || baseItems;
};
export const QCChecklistWithAutoSave = ({ stage, onSave, onCancel, existingData }) => {
    const { toast } = useToast();
    const [isSubmitted, setIsSubmitted] = useState(false);
    // Generate unique document ID for this QC checklist
    const generateId = useAutoSaveId('qc_checklist');
    const [checklistId] = useState(() => generateId(stage));
    // Initialize form data
    const [qcData, setQcData] = useState({
        basicInfo: {
            opsNumber: '',
            carpetNumber: '',
            designName: '',
            construction: '',
            size: '',
            contractor: '',
            inspector: '',
            inspectionDate: new Date().toISOString().split('T')[0],
            stage,
        },
        checkItems: getDefaultCheckItems(stage),
        summary: {
            totalChecks: 0,
            passCount: 0,
            failCount: 0,
            naCount: 0,
            overallStatus: 'pending',
            qualityScore: 0,
        },
        attachments: [],
        ...existingData,
    });
    // Initialize auto-save
    const { saveData, loadDraft, markAsSubmitted, isDraft, lastSaved } = useAutoSave({
        collection: 'qc_checklists',
        documentId: checklistId,
        data: qcData,
        debounceMs: 800,
        enabled: !isSubmitted
    });
    // Load existing draft on component mount
    useEffect(() => {
        const loadExistingDraft = async () => {
            try {
                const draft = await loadDraft();
                if (draft) {
                    setQcData(draft.qcData || qcData);
                    setIsSubmitted(draft.status === 'submitted');
                    toast({
                        title: "Draft Loaded",
                        description: "Resuming your previous QC checklist",
                    });
                }
            }
            catch (error) {
                console.error('Failed to load draft:', error);
            }
        };
        loadExistingDraft();
    }, []);
    // Update basic info
    const updateBasicInfo = (field, value) => {
        if (isSubmitted)
            return;
        setQcData(prev => ({
            ...prev,
            basicInfo: { ...prev.basicInfo, [field]: value }
        }));
    };
    // Update check item
    const updateCheckItem = (id, updates) => {
        if (isSubmitted)
            return;
        setQcData(prev => ({
            ...prev,
            checkItems: prev.checkItems.map(item => item.id === id ? { ...item, ...updates } : item)
        }));
    };
    // Calculate summary statistics
    const calculateSummary = () => {
        const totalChecks = qcData.checkItems.length;
        const passCount = qcData.checkItems.filter(item => item.status === 'pass').length;
        const failCount = qcData.checkItems.filter(item => item.status === 'fail').length;
        const naCount = qcData.checkItems.filter(item => item.status === 'na').length;
        const applicableChecks = totalChecks - naCount;
        const qualityScore = applicableChecks > 0 ? Math.round((passCount / applicableChecks) * 100) : 0;
        const criticalFailures = qcData.checkItems.filter(item => item.status === 'fail' && item.severity === 'critical').length;
        const overallStatus = criticalFailures > 0 || qualityScore < 70 ? 'fail' :
            passCount === applicableChecks ? 'pass' : 'pending';
        return {
            totalChecks,
            passCount,
            failCount,
            naCount,
            overallStatus,
            qualityScore,
        };
    };
    // Submit QC checklist
    const submitChecklist = async () => {
        try {
            const summary = calculateSummary();
            const finalData = {
                ...qcData,
                summary,
                submittedAt: new Date(),
            };
            await markAsSubmitted();
            setIsSubmitted(true);
            if (onSave) {
                onSave(finalData);
            }
            toast({
                title: 'QC Checklist Submitted',
                description: 'Quality inspection has been saved and locked',
            });
        }
        catch (error) {
            console.error('Error submitting checklist:', error);
            toast({
                title: 'Submit Error',
                description: 'Failed to submit checklist. Please try again.',
                variant: 'destructive',
            });
        }
    };
    const handleFileUpload = (itemId, file) => {
        if (isSubmitted)
            return;
        setQcData(prev => ({
            ...prev,
            checkItems: prev.checkItems.map(item => item.id === itemId
                ? { ...item, evidence: [...item.evidence, file] }
                : item)
        }));
        toast({
            title: "Evidence Added",
            description: `${file.name} uploaded for check item`,
        });
    };
    const getStageTitle = (stage) => {
        const titles = {
            bazaar: 'Bazaar Inspection',
            binding: 'Binding Process',
            clipping_finishing: 'Clipping & Finishing',
            final_inspection: 'Final Inspection',
        };
        return titles[stage] || 'Quality Inspection';
    };
    const summary = calculateSummary();
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5 text-green-600" }), getStageTitle(stage), " - QC Checklist"] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Quality Control - #", checklistId.slice(-8)] })] }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("div", { className: "flex items-center gap-2 text-sm text-gray-500", children: isSubmitted ? (_jsxs(_Fragment, { children: [_jsx(Lock, { className: "h-4 w-4 text-red-500" }), _jsx("span", { className: "text-red-600", children: "Submitted & Locked" })] })) : isDraft ? (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "h-4 w-4 text-blue-500" }), _jsx("span", { children: "Auto-saving..." }), lastSaved && (_jsxs("span", { className: "text-xs", children: ["Last saved: ", lastSaved.toLocaleTimeString()] }))] })) : null }), _jsxs(Badge, { variant: summary.qualityScore >= 90 ? "default" : summary.qualityScore >= 70 ? "secondary" : "destructive", className: summary.qualityScore >= 90 ? 'bg-green-600' : '', children: ["Score: ", summary.qualityScore, "%"] }), !isSubmitted && (_jsxs(Button, { onClick: submitChecklist, className: "flex items-center gap-2 bg-green-600 hover:bg-green-700", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), "Submit Checklist"] }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-green-900", children: "Inspection Information" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "opsNumber", children: "OPS Number" }), _jsx(Input, { id: "opsNumber", value: qcData.basicInfo.opsNumber, onChange: (e) => updateBasicInfo('opsNumber', e.target.value), placeholder: "Enter OPS number", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "carpetNumber", children: "Carpet Number" }), _jsx(Input, { id: "carpetNumber", value: qcData.basicInfo.carpetNumber, onChange: (e) => updateBasicInfo('carpetNumber', e.target.value), placeholder: "Enter carpet number", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "designName", children: "Design Name" }), _jsx(Input, { id: "designName", value: qcData.basicInfo.designName, onChange: (e) => updateBasicInfo('designName', e.target.value), placeholder: "Enter design name", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "construction", children: "Construction" }), _jsx(Input, { id: "construction", value: qcData.basicInfo.construction, onChange: (e) => updateBasicInfo('construction', e.target.value), placeholder: "Enter construction type", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "size", children: "Size" }), _jsx(Input, { id: "size", value: qcData.basicInfo.size, onChange: (e) => updateBasicInfo('size', e.target.value), placeholder: "Enter size", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "contractor", children: "Contractor" }), _jsx(Input, { id: "contractor", value: qcData.basicInfo.contractor, onChange: (e) => updateBasicInfo('contractor', e.target.value), placeholder: "Enter contractor name", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "inspector", children: "Inspector" }), _jsx(Input, { id: "inspector", value: qcData.basicInfo.inspector, onChange: (e) => updateBasicInfo('inspector', e.target.value), placeholder: "Enter inspector name", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "inspectionDate", children: "Inspection Date" }), _jsx(Input, { id: "inspectionDate", type: "date", value: qcData.basicInfo.inspectionDate, onChange: (e) => updateBasicInfo('inspectionDate', e.target.value), disabled: isSubmitted })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-green-900", children: "Quality Check Points" }) }), _jsx(CardContent, { className: "space-y-4", children: qcData.checkItems.map((item) => (_jsxs("div", { className: "border rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(Badge, { variant: "outline", className: "mb-2", children: item.category }), _jsx("h4", { className: "font-medium", children: item.checkPoint })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Badge, { variant: item.severity === 'critical' ? 'destructive' : item.severity === 'major' ? 'secondary' : 'outline', children: item.severity.toUpperCase() }), _jsx(Badge, { variant: item.status === 'pass' ? 'default' : item.status === 'fail' ? 'destructive' : 'secondary', className: item.status === 'pass' ? 'bg-green-600' : '', children: item.status.toUpperCase() })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Status" }), _jsxs(Select, { value: item.status, onValueChange: (value) => updateCheckItem(item.id, { status: value }), disabled: isSubmitted, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "pass", children: "Pass" }), _jsx(SelectItem, { value: "fail", children: "Fail" }), _jsx(SelectItem, { value: "na", children: "N/A" }), _jsx(SelectItem, { value: "pending", children: "Pending" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Severity" }), _jsxs(Select, { value: item.severity, onValueChange: (value) => updateCheckItem(item.id, { severity: value }), disabled: isSubmitted, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "minor", children: "Minor" }), _jsx(SelectItem, { value: "major", children: "Major" }), _jsx(SelectItem, { value: "critical", children: "Critical" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Remarks" }), _jsx(Textarea, { value: item.remarks, onChange: (e) => updateCheckItem(item.id, { remarks: e.target.value }), placeholder: "Add detailed remarks", rows: 2, disabled: isSubmitted })] }), item.status === 'fail' && (_jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Corrective Action" }), _jsx(Textarea, { value: item.corrective_action || '', onChange: (e) => updateCheckItem(item.id, { corrective_action: e.target.value }), placeholder: "Describe corrective action required", rows: 2, disabled: isSubmitted })] })), _jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Evidence" }), _jsxs("div", { className: "flex gap-2 mt-1", children: [_jsx("input", { type: "file", accept: "image/*", onChange: (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file)
                                                            handleFileUpload(item.id, file);
                                                    }, className: "hidden", id: `evidence-${item.id}`, disabled: isSubmitted }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => document.getElementById(`evidence-${item.id}`)?.click(), className: "flex items-center gap-1", disabled: isSubmitted, children: [_jsx(Upload, { className: "h-3 w-3" }), "Upload"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
                                                        toast({ title: "Info", description: "Camera functionality coming soon" });
                                                    }, className: "flex items-center gap-1", disabled: isSubmitted, children: [_jsx(Camera, { className: "h-3 w-3" }), "Camera"] }), item.evidence.length > 0 && (_jsxs(Badge, { variant: "secondary", className: "text-green-700", children: ["\u2713 ", item.evidence.length, " file(s)"] }))] })] })] }, item.id))) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-green-900", children: "Inspection Summary" }) }), _jsxs(CardContent, { className: "grid grid-cols-2 md:grid-cols-5 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: summary.totalChecks }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Checks" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: summary.passCount }), _jsx("div", { className: "text-sm text-gray-600", children: "Passed" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: summary.failCount }), _jsx("div", { className: "text-sm text-gray-600", children: "Failed" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-gray-600", children: summary.naCount }), _jsx("div", { className: "text-sm text-gray-600", children: "N/A" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: `text-2xl font-bold ${summary.qualityScore >= 90 ? 'text-green-600' : summary.qualityScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`, children: [summary.qualityScore, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Quality Score" })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [onCancel && (_jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" })), !isSubmitted && (_jsxs(Button, { onClick: submitChecklist, className: "bg-green-600 hover:bg-green-700", children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Submit QC Checklist"] }))] })] }));
};
