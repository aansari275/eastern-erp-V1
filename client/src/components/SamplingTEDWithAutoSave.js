import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAutoSave, useAutoSaveId } from '@/hooks/useAutoSave';
import { Clock, Lock, CheckCircle, Save, Palette, Plus, Minus } from 'lucide-react';
export const SamplingTEDWithAutoSave = ({ onSave, onCancel, existingData }) => {
    const { toast } = useToast();
    const [isSubmitted, setIsSubmitted] = useState(false);
    // Generate unique document ID for this TED
    const generateId = useAutoSaveId('sampling_ted');
    const [tedId] = useState(() => generateId());
    // Initialize form data
    const [tedData, setTedData] = useState({
        basicInfo: {
            designName: '',
            construction: '',
            buyer: '',
            carpetNumber: '',
            finishedSize: '',
            finishedGSM: '',
            unfinishedGSM: '',
            createdBy: '',
        },
        materialSpecs: [
            { id: '1', name: '', type: 'warp', gsm: '', rate: '', total: '' },
        ],
        processCosts: [
            { id: '1', name: 'Weaving', cost: '' },
            { id: '2', name: 'Finishing', cost: '' },
        ],
        finishingDetails: {
            washType: '',
            shadeCard: '',
            specialInstructions: '',
        },
        costCalculation: {
            overhead: '5',
            profit: '15',
            finalCostPSM: '',
            currency: 'INR',
        },
        attachments: [],
        ...existingData,
    });
    // Initialize auto-save
    const { saveData, loadDraft, markAsSubmitted, isDraft, lastSaved } = useAutoSave({
        collection: 'sampling_teds',
        documentId: tedId,
        data: tedData,
        debounceMs: 800,
        enabled: !isSubmitted
    });
    // Load existing draft on component mount
    useEffect(() => {
        const loadExistingDraft = async () => {
            try {
                const draft = await loadDraft();
                if (draft) {
                    setTedData(draft.tedData || tedData);
                    setIsSubmitted(draft.status === 'submitted');
                    toast({
                        title: "Draft Loaded",
                        description: "Resuming your previous TED form",
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
        setTedData(prev => ({
            ...prev,
            basicInfo: { ...prev.basicInfo, [field]: value }
        }));
    };
    // Update material spec
    const updateMaterialSpec = (id, updates) => {
        if (isSubmitted)
            return;
        setTedData(prev => ({
            ...prev,
            materialSpecs: prev.materialSpecs.map(spec => spec.id === id ? { ...spec, ...updates } : spec)
        }));
    };
    // Add material spec
    const addMaterialSpec = () => {
        if (isSubmitted)
            return;
        const newId = (tedData.materialSpecs.length + 1).toString();
        setTedData(prev => ({
            ...prev,
            materialSpecs: [...prev.materialSpecs, {
                    id: newId,
                    name: '',
                    type: 'warp',
                    gsm: '',
                    rate: '',
                    total: ''
                }]
        }));
    };
    // Remove material spec
    const removeMaterialSpec = (id) => {
        if (isSubmitted || tedData.materialSpecs.length <= 1)
            return;
        setTedData(prev => ({
            ...prev,
            materialSpecs: prev.materialSpecs.filter(spec => spec.id !== id)
        }));
    };
    // Update process cost
    const updateProcessCost = (id, updates) => {
        if (isSubmitted)
            return;
        setTedData(prev => ({
            ...prev,
            processCosts: prev.processCosts.map(cost => cost.id === id ? { ...cost, ...updates } : cost)
        }));
    };
    // Update finishing details
    const updateFinishingDetails = (field, value) => {
        if (isSubmitted)
            return;
        setTedData(prev => ({
            ...prev,
            finishingDetails: { ...prev.finishingDetails, [field]: value }
        }));
    };
    // Update cost calculation
    const updateCostCalculation = (field, value) => {
        if (isSubmitted)
            return;
        setTedData(prev => ({
            ...prev,
            costCalculation: { ...prev.costCalculation, [field]: value }
        }));
    };
    // Calculate final cost
    const calculateFinalCost = () => {
        const materialTotal = tedData.materialSpecs.reduce((sum, spec) => sum + (parseFloat(spec.total) || 0), 0);
        const processTotal = tedData.processCosts.reduce((sum, cost) => sum + (parseFloat(cost.cost) || 0), 0);
        const subtotal = materialTotal + processTotal;
        const overhead = subtotal * (parseFloat(tedData.costCalculation.overhead) / 100);
        const profit = (subtotal + overhead) * (parseFloat(tedData.costCalculation.profit) / 100);
        return subtotal + overhead + profit;
    };
    // Submit TED form
    const submitTED = async () => {
        try {
            const finalCost = calculateFinalCost();
            const finalData = {
                ...tedData,
                costCalculation: {
                    ...tedData.costCalculation,
                    finalCostPSM: finalCost.toFixed(2),
                },
                submittedAt: new Date(),
            };
            await markAsSubmitted();
            setIsSubmitted(true);
            if (onSave) {
                onSave(finalData);
            }
            toast({
                title: 'TED Submitted',
                description: 'Technical Engineering Document has been saved and locked',
            });
        }
        catch (error) {
            console.error('Error submitting TED:', error);
            toast({
                title: 'Submit Error',
                description: 'Failed to submit TED. Please try again.',
                variant: 'destructive',
            });
        }
    };
    const handleFileUpload = (file) => {
        if (isSubmitted)
            return;
        setTedData(prev => ({
            ...prev,
            attachments: [...prev.attachments, file]
        }));
        toast({
            title: "File Added",
            description: `${file.name} uploaded successfully`,
        });
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold flex items-center gap-2", children: [_jsx(Palette, { className: "h-5 w-5 text-purple-600" }), "Technical Engineering Document (TED)"] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Sampling Department - TED #", tedId.slice(-8)] })] }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("div", { className: "flex items-center gap-2 text-sm text-gray-500", children: isSubmitted ? (_jsxs(_Fragment, { children: [_jsx(Lock, { className: "h-4 w-4 text-red-500" }), _jsx("span", { className: "text-red-600", children: "Submitted & Locked" })] })) : isDraft ? (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "h-4 w-4 text-blue-500" }), _jsx("span", { children: "Auto-saving..." }), lastSaved && (_jsxs("span", { className: "text-xs", children: ["Last saved: ", lastSaved.toLocaleTimeString()] }))] })) : null }), !isSubmitted && (_jsxs(Button, { onClick: submitTED, className: "flex items-center gap-2 bg-green-600 hover:bg-green-700", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), "Submit TED"] }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-purple-900", children: "Basic Information" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "designName", children: "Design Name" }), _jsx(Input, { id: "designName", value: tedData.basicInfo.designName, onChange: (e) => updateBasicInfo('designName', e.target.value), placeholder: "Enter design name", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "construction", children: "Construction" }), _jsxs(Select, { value: tedData.basicInfo.construction, onValueChange: (value) => updateBasicInfo('construction', value), disabled: isSubmitted, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select construction" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Hand Knotted", children: "Hand Knotted" }), _jsx(SelectItem, { value: "Hand Woven", children: "Hand Woven" }), _jsx(SelectItem, { value: "Hand Tufted", children: "Hand Tufted" }), _jsx(SelectItem, { value: "Handloom", children: "Handloom" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "buyer", children: "Buyer" }), _jsx(Input, { id: "buyer", value: tedData.basicInfo.buyer, onChange: (e) => updateBasicInfo('buyer', e.target.value), placeholder: "Enter buyer name", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "carpetNumber", children: "Carpet Number" }), _jsx(Input, { id: "carpetNumber", value: tedData.basicInfo.carpetNumber, onChange: (e) => updateBasicInfo('carpetNumber', e.target.value), placeholder: "Enter carpet number", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "finishedSize", children: "Finished Size" }), _jsx(Input, { id: "finishedSize", value: tedData.basicInfo.finishedSize, onChange: (e) => updateBasicInfo('finishedSize', e.target.value), placeholder: "e.g., 6x9 ft", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "createdBy", children: "Created By" }), _jsx(Input, { id: "createdBy", value: tedData.basicInfo.createdBy, onChange: (e) => updateBasicInfo('createdBy', e.target.value), placeholder: "Enter creator name", disabled: isSubmitted })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { className: "text-purple-900", children: "Material Specifications" }), !isSubmitted && (_jsxs(Button, { onClick: addMaterialSpec, size: "sm", variant: "outline", children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), "Add Material"] }))] }) }), _jsx(CardContent, { className: "space-y-4", children: tedData.materialSpecs.map((spec) => (_jsxs("div", { className: "border rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("h4", { className: "font-medium", children: ["Material ", spec.id] }), tedData.materialSpecs.length > 1 && !isSubmitted && (_jsx(Button, { onClick: () => removeMaterialSpec(spec.id), size: "sm", variant: "outline", children: _jsx(Minus, { className: "h-4 w-4" }) }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Material Name" }), _jsx(Input, { value: spec.name, onChange: (e) => updateMaterialSpec(spec.id, { name: e.target.value }), placeholder: "Enter material name", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Type" }), _jsxs(Select, { value: spec.type, onValueChange: (value) => updateMaterialSpec(spec.id, { type: value }), disabled: isSubmitted, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "warp", children: "Warp" }), _jsx(SelectItem, { value: "weft", children: "Weft" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "GSM" }), _jsx(Input, { value: spec.gsm, onChange: (e) => updateMaterialSpec(spec.id, { gsm: e.target.value }), placeholder: "Enter GSM", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Rate (\u20B9)" }), _jsx(Input, { value: spec.rate, onChange: (e) => updateMaterialSpec(spec.id, { rate: e.target.value }), placeholder: "Enter rate", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Total (\u20B9)" }), _jsx(Input, { value: spec.total, onChange: (e) => updateMaterialSpec(spec.id, { total: e.target.value }), placeholder: "Enter total", disabled: isSubmitted })] })] })] }, spec.id))) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-purple-900", children: "Process Costs" }) }), _jsx(CardContent, { className: "space-y-4", children: tedData.processCosts.map((cost) => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Process Name" }), _jsx(Input, { value: cost.name, onChange: (e) => updateProcessCost(cost.id, { name: e.target.value }), placeholder: "Enter process name", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Cost (\u20B9)" }), _jsx(Input, { value: cost.cost, onChange: (e) => updateProcessCost(cost.id, { cost: e.target.value }), placeholder: "Enter cost", disabled: isSubmitted })] })] }, cost.id))) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-purple-900", children: "Cost Calculation" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Overhead (%)" }), _jsx(Input, { value: tedData.costCalculation.overhead, onChange: (e) => updateCostCalculation('overhead', e.target.value), placeholder: "Enter overhead %", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Profit (%)" }), _jsx(Input, { value: tedData.costCalculation.profit, onChange: (e) => updateCostCalculation('profit', e.target.value), placeholder: "Enter profit %", disabled: isSubmitted })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Currency" }), _jsxs(Select, { value: tedData.costCalculation.currency, onValueChange: (value) => updateCostCalculation('currency', value), disabled: isSubmitted, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "INR", children: "INR (\u20B9)" }), _jsx(SelectItem, { value: "USD", children: "USD ($)" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm", children: "Final Cost PSM" }), _jsxs("div", { className: "p-2 bg-gray-50 rounded border font-medium", children: [tedData.costCalculation.currency === 'INR' ? '₹' : '$', calculateFinalCost().toFixed(2)] })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [onCancel && (_jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" })), !isSubmitted && (_jsxs(Button, { onClick: submitTED, className: "bg-green-600 hover:bg-green-700", children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Submit TED"] }))] })] }));
};
