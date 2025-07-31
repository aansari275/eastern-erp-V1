import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCreateLabInspection, useUpdateLabInspection } from '@/hooks/useLabInspectionServer';
import { LabInspectionSchema } from '@shared/schema';
import { Save, Send, Plus, Trash2, Upload, ArrowLeft } from 'lucide-react';
// Predefined testing parameters with official standards and tolerances
const defaultTestingParameters = [
    { testName: 'Color Fastness to Rubbing (Dry)', result: '', hankResults: [] },
    { testName: 'Color Fastness to Rubbing (Wet)', result: '', hankResults: [] },
    { testName: 'Shade Matching', result: '', hankResults: [] },
    { testName: 'Hank Variations', result: '', hankResults: [] },
    { testName: 'Cleanliness of Hanks', result: '', hankResults: [] },
    { testName: 'Strength', result: '', hankResults: [] },
    { testName: 'Stain/Dust', result: '', hankResults: [] }
];
// Standards and tolerances reference (from attachments)
const testingStandards = {
    'Color Fastness to Rubbing (Dry)': { standard: 'Wool: ≥4\nCotton: ≥3-4', tolerance: 'Wool: ≥4\nCotton: ≥3-4' },
    'Color Fastness to Rubbing (Wet)': { standard: 'Wool: ≥3\nCotton: ≥3', tolerance: 'Wool: ≥3\nCotton: ≥3' },
    'Shade Matching': { standard: 'As per approved sample', tolerance: 'As per approved sample' },
    'Hank Variations': { standard: 'As per approved sample', tolerance: 'As per approved sample' },
    'Cleanliness of Hanks': { standard: 'Proper neat & Clean', tolerance: 'Proper neat & Clean' },
    'Strength': { standard: 'OK', tolerance: 'OK' },
    'Stain/Dust': { standard: 'NO', tolerance: 'NO' }
};
export default function IncomingInspectionForm({ inspection, onClose, selectedCompany }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const createMutation = useCreateLabInspection();
    const updateMutation = useUpdateLabInspection();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm({
        resolver: zodResolver(LabInspectionSchema.omit({ id: true, createdAt: true, updatedAt: true })),
        defaultValues: {
            materialIncomingDate: inspection?.materialIncomingDate || new Date().toISOString().split('T')[0],
            challanNumber: inspection?.challanNumber || '',
            supplierName: inspection?.supplierName || '',
            transportCondition: inspection?.transportCondition || 'Ok',
            lotNumber: inspection?.lotNumber || '',
            tagNumber: inspection?.tagNumber || '',
            shadeNumber: inspection?.shadeNumber || '',
            processRemarks: inspection?.processRemarks || '',
            testingParameters: inspection?.testingParameters || defaultTestingParameters,
            testingParametersRemarks: inspection?.testingParametersRemarks || '',
            moistureContentTolerance: inspection?.moistureContentTolerance || 'Ok',
            checkedBy: inspection?.checkedBy || user?.email || '',
            verifiedBy: inspection?.verifiedBy || '',
            attachments: inspection?.attachments || [],
            status: inspection?.status || 'draft',
            company: selectedCompany,
            materialType: 'dyed',
            createdBy: user?.email || ''
        }
    });
    // Add hank result to ALL testing parameters
    const addHankToAll = () => {
        const currentParams = form.getValues('testingParameters');
        const updatedParams = currentParams.map(param => ({
            ...param,
            hankResults: [...(param.hankResults || []), '']
        }));
        form.setValue('testingParameters', updatedParams);
    };
    // Remove specific hank result from a testing parameter
    const removeHankResult = (paramIndex, hankIndex) => {
        const currentParams = form.getValues('testingParameters');
        const updatedParams = [...currentParams];
        updatedParams[paramIndex].hankResults?.splice(hankIndex, 1);
        form.setValue('testingParameters', updatedParams);
    };
    // Update hank result value
    const updateHankResult = (paramIndex, hankIndex, value) => {
        const currentParams = form.getValues('testingParameters');
        const updatedParams = [...currentParams];
        if (updatedParams[paramIndex].hankResults) {
            updatedParams[paramIndex].hankResults[hankIndex] = value;
            form.setValue('testingParameters', updatedParams);
        }
    };
    // Save as draft
    const handleSaveDraft = async (data) => {
        try {
            const draftData = { ...data, status: 'draft' };
            if (inspection?.id) {
                await updateMutation.mutateAsync({ id: inspection.id, ...draftData });
                toast({
                    title: "✅ Draft Saved Successfully",
                    description: `Lab inspection draft has been saved. You can continue editing anytime.`,
                    duration: 4000
                });
            }
            else {
                await createMutation.mutateAsync(draftData);
                toast({
                    title: "✅ Draft Created Successfully",
                    description: `New lab inspection draft has been created. You can continue editing anytime.`,
                    duration: 4000
                });
            }
        }
        catch (error) {
            toast({
                title: "❌ Error Saving Draft",
                description: error instanceof Error ? error.message : "Failed to save draft. Please try again.",
                variant: "destructive",
                duration: 5000
            });
        }
    };
    // Submit inspection
    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const submittedData = {
                ...data,
                status: 'submitted',
                submittedAt: new Date().toISOString()
            };
            if (inspection?.id) {
                await updateMutation.mutateAsync({ id: inspection.id, ...submittedData });
                toast({
                    title: "🎉 Lab Inspection Submitted Successfully!",
                    description: `Lab inspection has been officially submitted and is now locked for editing. PDF report is available for download.`,
                    duration: 6000
                });
            }
            else {
                await createMutation.mutateAsync(submittedData);
                toast({
                    title: "🎉 Lab Inspection Submitted Successfully!",
                    description: `New lab inspection has been officially submitted and is now locked for editing. PDF report is available for download.`,
                    duration: 6000
                });
            }
            onClose?.();
        }
        catch (error) {
            toast({
                title: "❌ Error Submitting Inspection",
                description: error instanceof Error ? error.message : "Failed to submit inspection. Please check all required fields and try again.",
                variant: "destructive",
                duration: 5000
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const isReadOnly = inspection?.status === 'submitted';
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(Button, { variant: "outline", onClick: onClose, children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Dashboard"] }), _jsx("h1", { className: "text-2xl font-bold", children: "Incoming Inspection - Dyed Raw Materials" })] }), _jsxs("div", { className: "text-sm text-gray-500", children: [selectedCompany, " - ", inspection?.status === 'submitted' ? 'SUBMITTED' : 'DRAFT'] })] }), _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(handleSubmit), className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "1. Material Incoming & Supplier Information" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(FormField, { control: form.control, name: "materialIncomingDate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Material Incoming Date" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", disabled: isReadOnly, ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "challanNumber", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Challan No. / Invoice No." }), _jsx(FormControl, { children: _jsx(Input, { disabled: isReadOnly, ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "supplierName", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Name of Supplier" }), _jsx(FormControl, { children: _jsx(Input, { disabled: isReadOnly, ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "transportCondition", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Condition of Transport / Incoming Truck" }), _jsxs(Select, { disabled: isReadOnly, onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select condition" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Ok", children: "\u2713 Ok" }), _jsx(SelectItem, { value: "Not Ok", children: "\u2717 Not Ok" })] })] }), _jsx(FormMessage, {})] })) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "2. Drying Details" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(FormField, { control: form.control, name: "lotNumber", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Lot No" }), _jsx(FormControl, { children: _jsx(Input, { disabled: isReadOnly, ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "tagNumber", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Tag No" }), _jsx(FormControl, { children: _jsx(Input, { disabled: isReadOnly, ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "shadeNumber", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Shade No" }), _jsx(FormControl, { children: _jsx(Input, { disabled: isReadOnly, ...field }) }), _jsx(FormMessage, {})] })) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "3. Verification on FMEA & CTQ Parameter" }) }), _jsx(CardContent, { children: _jsx(FormField, { control: form.control, name: "processRemarks", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Remarks" }), _jsx(FormControl, { children: _jsx(Textarea, { disabled: isReadOnly, rows: 3, placeholder: "Enter process verification remarks...", ...field }) }), _jsx(FormMessage, {})] })) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { children: ["4. Testing Parameters", _jsx("span", { className: "text-sm text-gray-500 block", children: "(Standard and Tolerance from Attachments)" })] }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: isReadOnly, onClick: addHankToAll, children: [_jsx(Plus, { className: "h-3 w-3 mr-1" }), "Add Hank"] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-4 gap-3 mb-4 text-sm font-medium text-gray-700 border-b pb-2", children: [_jsx("div", { children: "Testing Parameters" }), _jsx("div", { children: "Standard" }), _jsx("div", { children: "Tolerance" }), _jsx("div", { children: "Result" })] }), form.watch('testingParameters').map((param, paramIndex) => (_jsx(React.Fragment, { children: _jsxs("div", { className: "grid grid-cols-4 gap-3 items-start border-b pb-3", children: [_jsx("div", { className: "font-medium", children: param.testName }), _jsx("div", { className: "text-sm text-gray-600 whitespace-pre-line", children: testingStandards[param.testName]?.standard || 'As per attachment' }), _jsx("div", { className: "text-sm text-gray-600 whitespace-pre-line", children: testingStandards[param.testName]?.tolerance || 'As per attachment' }), _jsxs("div", { className: "space-y-2", children: [_jsx(Input, { disabled: isReadOnly, value: param.result, placeholder: "1st hank result", onChange: (e) => {
                                                                    const currentParams = form.getValues('testingParameters');
                                                                    const updatedParams = [...currentParams];
                                                                    updatedParams[paramIndex].result = e.target.value;
                                                                    form.setValue('testingParameters', updatedParams);
                                                                } }), param.hankResults?.map((hankResult, hankIndex) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Input, { disabled: isReadOnly, value: hankResult, placeholder: `${hankIndex + 2}${hankIndex === 0 ? 'nd' : hankIndex === 1 ? 'rd' : 'th'} hank result`, onChange: (e) => updateHankResult(paramIndex, hankIndex, e.target.value) }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", disabled: isReadOnly, onClick: () => removeHankResult(paramIndex, hankIndex), children: _jsx(Trash2, { className: "h-3 w-3" }) })] }, hankIndex)))] })] }) }, paramIndex)))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "5. Moisture Content Tolerance" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "moistureContentTolerance", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Moisture Content Tolerance Status" }), _jsx("div", { className: "text-sm text-gray-600 mb-2", children: "Reference Guidelines: Summer 16%, Winter 12%" }), _jsxs(Select, { disabled: isReadOnly, onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "w-full md:w-48", children: _jsx(SelectValue, { placeholder: "Select status" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Ok", children: "\u2713 Ok" }), _jsx(SelectItem, { value: "Not Ok", children: "\u2717 Not Ok" })] })] }), _jsx(FormMessage, {})] })) }), _jsx("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200", children: _jsx(FormField, { control: form.control, name: "testingParametersRemarks", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-blue-700 font-medium", children: "Testing Parameters Remarks" }), _jsx(FormControl, { children: _jsx(Textarea, { disabled: isReadOnly, rows: 3, placeholder: "Enter remarks for testing parameters...", className: "bg-white", ...field }) }), _jsx(FormMessage, {})] })) }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "6. Sign-off" }) }), _jsxs(CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(FormField, { control: form.control, name: "checkedBy", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Checked By" }), _jsx(FormControl, { children: _jsx(Input, { disabled: isReadOnly, ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "verifiedBy", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Verified By" }), _jsx(FormControl, { children: _jsx(Input, { disabled: isReadOnly, ...field }) }), _jsx(FormMessage, {})] })) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "7. Attachments (Standards & Tolerances)" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-sm text-gray-600 mb-4", children: "Upload documents containing standards and tolerance specifications for testing parameters." }), _jsxs(Button, { type: "button", variant: "outline", disabled: isReadOnly, children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Upload Files"] })] })] }), !isReadOnly && (_jsxs("div", { className: "flex justify-end space-x-4", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: () => handleSaveDraft(form.getValues()), disabled: createMutation.isPending || updateMutation.isPending, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save as Draft"] }), _jsxs(Button, { type: "submit", disabled: isSubmitting || createMutation.isPending || updateMutation.isPending, children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), isSubmitting ? 'Submitting...' : 'Submit Inspection'] })] })), isReadOnly && (_jsx("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: _jsx("div", { className: "text-green-800 font-medium", children: "\u2713 This inspection has been submitted and is now read-only" }) }))] }) })] }));
}
