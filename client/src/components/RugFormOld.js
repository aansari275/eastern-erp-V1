import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { CONSTRUCTION_OPTIONS, ORDER_TYPE_OPTIONS, DYEING_TYPE_OPTIONS, CONSTRUCTION_QUALITY_MAP, PROCESS_NAMES } from '@/types/rug';
import { useSqlMaterials } from '@/hooks/useSqlMaterials';
import BarcodeScanner from './BarcodeScanner';
import CustomModal from './CustomModal';
const RugForm = ({ rug, onSave, onReset }) => {
    const { materials: materialDatabase, loading: materialsLoading } = useSqlMaterials();
    const [formData, setFormData] = useState({
        designName: '',
        construction: '',
        quality: '',
        color: '',
        orderType: '',
        buyerName: '',
        opsNo: '',
        carpetNo: '',
        finishedGSM: 0,
        unfinishedGSM: 0,
        size: '',
        typeOfDyeing: '',
        contractorType: 'contractor',
        contractorName: '',
        weaverName: '',
        submittedBy: '',
        washingContractor: '',
        reedNoQuality: '',
        hasWashing: 'no',
        materials: [],
        weavingCost: 0,
        finishingCost: 0,
        packingCost: 0,
        overheadPercentage: 0,
        profitPercentage: 0,
        processFlow: [],
        images: {},
        totalMaterialCost: 0,
        totalDirectCost: 0,
        finalCostPSM: 0,
        totalRugCost: 0,
        area: 0,
    });
    const [activeTab, setActiveTab] = useState('basic');
    const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
    const [modal, setModal] = useState({
        show: false, type: '', title: '', message: ''
    });
    useEffect(() => {
        if (rug) {
            setFormData(rug);
        }
    }, [rug]);
    useEffect(() => {
        calculateCosts();
    }, [formData.materials, formData.weavingCost, formData.finishingCost, formData.packingCost, formData.overheadPercentage, formData.profitPercentage, formData.size]);
    const calculateCosts = () => {
        const materials = formData.materials || [];
        const totalMaterialCost = materials.reduce((sum, material) => sum + material.costPerSqM, 0);
        const weavingCost = formData.weavingCost || 0;
        const finishingCost = formData.finishingCost || 0;
        const packingCost = formData.packingCost || 0;
        const totalDirectCost = totalMaterialCost + weavingCost + finishingCost + packingCost;
        const overheadAmount = (totalDirectCost * (formData.overheadPercentage || 0)) / 100;
        const costWithOverhead = totalDirectCost + overheadAmount;
        const profitAmount = (costWithOverhead * (formData.profitPercentage || 0)) / 100;
        const finalCostPSM = costWithOverhead + profitAmount;
        // Calculate area from size (simple parsing for demo)
        const area = calculateAreaFromSize(formData.size || '');
        const totalRugCost = finalCostPSM * area;
        setFormData(prev => ({
            ...prev,
            totalMaterialCost,
            totalDirectCost,
            finalCostPSM,
            totalRugCost,
            area
        }));
    };
    const calculateAreaFromSize = (size) => {
        const match = size.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)/);
        if (match) {
            const width = parseFloat(match[1]);
            const height = parseFloat(match[2]);
            // Convert to square meters (assuming input is in feet by default)
            return (width * height) * 0.092903; // 1 sq ft = 0.092903 sq m
        }
        return 0;
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Reset quality when construction changes
        if (field === 'construction') {
            setFormData(prev => ({ ...prev, quality: '' }));
        }
    };
    const getQualityOptions = () => {
        return formData.construction ? CONSTRUCTION_QUALITY_MAP[formData.construction] || [] : [];
    };
    const addMaterial = () => {
        const newMaterial = {
            id: Date.now().toString(),
            name: '',
            type: 'warp',
            consumption: 0,
            rate: 0,
            dyeingCost: 0,
            costPerSqM: 0
        };
        setFormData(prev => ({
            ...prev,
            materials: [...(prev.materials || []), newMaterial]
        }));
    };
    const updateMaterial = (index, field, value) => {
        const materials = [...(formData.materials || [])];
        materials[index] = { ...materials[index], [field]: value };
        // Recalculate cost per sqm
        const material = materials[index];
        if (field === 'consumption' || field === 'rate' || field === 'dyeingCost') {
            material.costPerSqM = material.consumption * (material.rate + material.dyeingCost);
        }
        setFormData(prev => ({ ...prev, materials }));
    };
    const removeMaterial = (index) => {
        const materials = [...(formData.materials || [])];
        materials.splice(index, 1);
        setFormData(prev => ({ ...prev, materials }));
    };
    const autoFillMaterialRates = (materialId, materialIndex) => {
        const material = materialDatabase.find(m => m.id === materialId);
        if (material) {
            updateMaterial(materialIndex, 'name', material.name);
            updateMaterial(materialIndex, 'type', material.type);
            updateMaterial(materialIndex, 'rate', material.rate);
            updateMaterial(materialIndex, 'dyeingCost', material.dyeingCost);
        }
    };
    const getFilteredMaterials = (type) => {
        return materialDatabase.filter(m => m.type === type);
    };
    const handleProcessFlowChange = (processName, step) => {
        const processFlow = [...(formData.processFlow || [])];
        const existingIndex = processFlow.findIndex(p => p.process === processName);
        if (step === 0) {
            // Remove process if step is 0
            if (existingIndex >= 0) {
                processFlow.splice(existingIndex, 1);
            }
        }
        else {
            if (existingIndex >= 0) {
                processFlow[existingIndex].step = step;
            }
            else {
                processFlow.push({ process: processName, step });
            }
        }
        setFormData(prev => ({ ...prev, processFlow }));
    };
    const handleImageUpload = (imageType, file) => {
        if (file.size > 750 * 1024) { // 750KB limit
            setModal({
                show: true,
                type: 'error',
                title: 'File Too Large',
                message: 'Image size must be less than 750KB to prevent Firestore document size limits.'
            });
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result;
            setFormData(prev => ({
                ...prev,
                images: { ...prev.images, [imageType]: base64 }
            }));
        };
        reader.readAsDataURL(file);
    };
    const handleSave = async () => {
        if (!formData.designName || !formData.construction) {
            setModal({
                show: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Please fill in required fields: Design Name and Construction.'
            });
            return;
        }
        try {
            await onSave(formData);
            setModal({
                show: true,
                type: 'info',
                title: 'Success',
                message: 'Rug saved successfully!'
            });
        }
        catch (error) {
            setModal({
                show: true,
                type: 'error',
                title: 'Save Error',
                message: 'Failed to save rug. Please try again.'
            });
        }
    };
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-medium text-gray-900", children: "Rug Creation Form" }), _jsxs("div", { className: "flex space-x-3", children: [_jsxs("button", { className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors", onClick: handleSave, children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "save" }), "Save Rug"] }), _jsxs("button", { className: "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors", onClick: onReset, children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "refresh" }), "Reset Form"] })] })] }), _jsxs("form", { className: "space-y-8", children: [_jsxs("div", { className: "border border-gray-200 rounded-lg p-6", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx("i", { className: "material-icons text-xl mr-2 text-blue-600", children: "info" }), "Basic Details"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Design Name *" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter design name", value: formData.designName || '', onChange: (e) => handleInputChange('designName', e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Construction *" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.construction || '', onChange: (e) => handleInputChange('construction', e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select Construction" }), CONSTRUCTION_OPTIONS.map(option => (_jsx("option", { value: option, children: option }, option)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Quality *" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.quality || '', onChange: (e) => handleInputChange('quality', e.target.value), required: true, disabled: !formData.construction, children: [_jsx("option", { value: "", children: "Select Quality" }), getQualityOptions().map(option => (_jsx("option", { value: option, children: option }, option)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Color" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter color description", value: formData.color || '', onChange: (e) => handleInputChange('color', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Order Type" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.orderType || '', onChange: (e) => handleInputChange('orderType', e.target.value), children: [_jsx("option", { value: "", children: "Select Order Type" }), ORDER_TYPE_OPTIONS.map(option => (_jsx("option", { value: option, children: option }, option)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Buyer Name" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter buyer name", value: formData.buyerName || '', onChange: (e) => handleInputChange('buyerName', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "OPS No." }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter OPS number", value: formData.opsNo || '', onChange: (e) => handleInputChange('opsNo', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Carpet No." }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("input", { type: "text", className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter carpet number", value: formData.carpetNo || '', onChange: (e) => handleInputChange('carpetNo', e.target.value) }), _jsx("button", { type: "button", className: "bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors", onClick: () => setShowBarcodeScanner(true), children: _jsx("i", { className: "material-icons text-sm", children: "qr_code_scanner" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Size" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "e.g., 8x10 ft or 2x3 m", value: formData.size || '', onChange: (e) => handleInputChange('size', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Finished GSM" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter finished GSM", value: formData.finishedGSM || '', onChange: (e) => handleInputChange('finishedGSM', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Unfinished GSM" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter unfinished GSM", value: formData.unfinishedGSM || '', onChange: (e) => handleInputChange('unfinishedGSM', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Type of Dyeing" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.typeOfDyeing || '', onChange: (e) => handleInputChange('typeOfDyeing', e.target.value), children: [_jsx("option", { value: "", children: "Select Dyeing Type" }), DYEING_TYPE_OPTIONS.map(option => (_jsx("option", { value: option, children: option }, option)))] })] })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-gray-200", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-4", children: "Work Assignment" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex space-x-6", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "contractorType", value: "contractor", className: "text-blue-600 focus:ring-blue-600", checked: formData.contractorType === 'contractor', onChange: (e) => handleInputChange('contractorType', e.target.value) }), _jsx("span", { className: "ml-2 text-sm font-medium text-gray-700", children: "Contractor" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "contractorType", value: "inhouse", className: "text-blue-600 focus:ring-blue-600", checked: formData.contractorType === 'inhouse', onChange: (e) => handleInputChange('contractorType', e.target.value) }), _jsx("span", { className: "ml-2 text-sm font-medium text-gray-700", children: "In-house" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [formData.contractorType === 'contractor' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Contractor Name" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter contractor name", value: formData.contractorName || '', onChange: (e) => handleInputChange('contractorName', e.target.value) })] })), formData.contractorType === 'inhouse' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Weaver Name" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter weaver name", value: formData.weaverName || '', onChange: (e) => handleInputChange('weaverName', e.target.value) })] }))] })] })] }), _jsx("div", { className: "mt-6 pt-6 border-t border-gray-200", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Submitted By" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter submitter name", value: formData.submittedBy || '', onChange: (e) => handleInputChange('submittedBy', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Reed No./Quality" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter reed number/quality", value: formData.reedNoQuality || '', onChange: (e) => handleInputChange('reedNoQuality', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Washing?" }), _jsxs("div", { className: "flex space-x-4 mb-3", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "hasWashing", value: "yes", className: "text-blue-600 focus:ring-blue-600", checked: formData.hasWashing === 'yes', onChange: (e) => handleInputChange('hasWashing', e.target.value) }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Yes" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "hasWashing", value: "no", className: "text-blue-600 focus:ring-blue-600", checked: formData.hasWashing === 'no', onChange: (e) => handleInputChange('hasWashing', e.target.value) }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "No" })] })] }), formData.hasWashing === 'yes' && (_jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter washing contractor name", value: formData.washingContractor || '', onChange: (e) => handleInputChange('washingContractor', e.target.value) }))] })] }) })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-6", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx("i", { className: "material-icons text-xl mr-2 text-orange-600", children: "calculate" }), "Cost Calculation"] }), _jsxs("div", { className: "mb-6 p-4 bg-blue-50 rounded-lg", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-3", children: "Material Selection" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Warp/Weft" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: selectedMaterialType, onChange: (e) => setSelectedMaterialType(e.target.value), children: [_jsx("option", { value: "", children: "Select Type" }), _jsx("option", { value: "warp", children: "Warp" }), _jsx("option", { value: "weft", children: "Weft" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Material" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", disabled: !selectedMaterialType, children: [_jsx("option", { value: "", children: "Select Material" }), getFilteredMaterials().map(material => (_jsx("option", { value: material.id, children: material.name }, material.id)))] })] }), _jsx("div", { children: _jsxs("button", { type: "button", className: "mt-7 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors", onClick: addMaterial, children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "add" }), "Add Material"] }) })] })] }), _jsxs("div", { className: "space-y-4 mb-6", children: [(formData.materials || []).map((material, index) => (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsxs("h5", { className: "text-sm font-medium text-gray-900", children: ["Material #", index + 1] }), _jsx("button", { type: "button", className: "text-red-600 hover:text-red-700", onClick: () => removeMaterial(index), children: _jsx("i", { className: "material-icons text-sm", children: "delete" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Material Name" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter material name", value: material.name, onChange: (e) => updateMaterial(index, 'name', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Consumption (per SqM)" }), _jsx("input", { type: "number", step: "0.001", className: "w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.000", value: material.consumption, onChange: (e) => updateMaterial(index, 'consumption', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Material Rate (per KG)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: material.rate, onChange: (e) => updateMaterial(index, 'rate', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Dyeing Cost (per KG)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: material.dyeingCost, onChange: (e) => updateMaterial(index, 'dyeingCost', parseFloat(e.target.value) || 0) })] })] }), _jsx("div", { className: "mt-2 text-right", children: _jsxs("span", { className: "text-sm font-medium text-gray-700", children: ["Material Cost per SqM: \u20B9", material.costPerSqM.toFixed(2)] }) })] }, material.id))), (!formData.materials || formData.materials.length === 0) && (_jsxs("div", { className: "text-center py-8 border-2 border-dashed border-gray-300 rounded-lg", children: [_jsx("i", { className: "material-icons text-4xl text-gray-400 mb-2", children: "add_circle_outline" }), _jsx("p", { className: "text-gray-500 mb-4", children: "No materials added yet" }), _jsxs("button", { type: "button", className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto transition-colors", onClick: addMaterial, children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "add" }), "Add First Material"] })] }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Weaving Cost (per SqM)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: formData.weavingCost || '', onChange: (e) => handleInputChange('weavingCost', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Finishing Cost (per SqM)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: formData.finishingCost || '', onChange: (e) => handleInputChange('finishingCost', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Packing/Forwarding (per SqM)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: formData.packingCost || '', onChange: (e) => handleInputChange('packingCost', parseFloat(e.target.value) || 0) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Overhead Percentage (%)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: formData.overheadPercentage || '', onChange: (e) => handleInputChange('overheadPercentage', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Profit Percentage (%)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: formData.profitPercentage || '', onChange: (e) => handleInputChange('profitPercentage', parseFloat(e.target.value) || 0) })] })] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-3", children: "Cost Summary" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "block text-gray-600", children: "Total Material Cost (per SqM)" }), _jsxs("span", { className: "text-lg font-bold text-blue-600", children: ["\u20B9", (formData.totalMaterialCost || 0).toFixed(2)] })] }), _jsxs("div", { children: [_jsx("span", { className: "block text-gray-600", children: "Total Direct Cost (per SqM)" }), _jsxs("span", { className: "text-lg font-bold text-blue-600", children: ["\u20B9", (formData.totalDirectCost || 0).toFixed(2)] })] }), _jsxs("div", { children: [_jsx("span", { className: "block text-gray-600", children: "Final Cost (PSM)" }), _jsxs("span", { className: "text-lg font-bold text-green-600", children: ["\u20B9", (formData.finalCostPSM || 0).toFixed(2)] })] }), _jsxs("div", { children: [_jsx("span", { className: "block text-gray-600", children: "Total Rug Cost" }), _jsxs("span", { className: "text-xl font-bold text-orange-600", children: ["\u20B9", (formData.totalRugCost || 0).toFixed(2)] })] })] })] })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-6", children: [_jsxs("button", { type: "button", className: "w-full flex justify-between items-center text-lg font-medium text-gray-900 mb-4", onClick: () => setShowProcessFlow(!showProcessFlow), children: [_jsxs("span", { className: "flex items-center", children: [_jsx("i", { className: "material-icons text-xl mr-2 text-blue-600", children: "timeline" }), "Process Flow Details"] }), _jsx("i", { className: "material-icons text-gray-400", children: showProcessFlow ? 'expand_less' : 'expand_more' })] }), showProcessFlow && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Enter the step order for each process (1, 2, 3...)" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: PROCESS_NAMES.map(processName => {
                                            const process = (formData.processFlow || []).find(p => p.process === processName);
                                            return (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-sm font-medium text-gray-700 flex-1", children: processName }), _jsx("input", { type: "number", min: "0", className: "w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0", value: process?.step || '', onChange: (e) => handleProcessFlowChange(processName, parseInt(e.target.value) || 0) })] }, processName));
                                        }) })] }))] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-6", children: [_jsxs("button", { type: "button", className: "w-full flex justify-between items-center text-lg font-medium text-gray-900 mb-4", onClick: () => setShowImageUpload(!showImageUpload), children: [_jsxs("span", { className: "flex items-center", children: [_jsx("i", { className: "material-icons text-xl mr-2 text-blue-600", children: "photo_camera" }), "Image Details"] }), _jsx("i", { className: "material-icons text-gray-400", children: showImageUpload ? 'expand_less' : 'expand_more' })] }), showImageUpload && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Upload images (max 750KB each). Images will be converted to Base64 and stored." }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
                                            { key: 'rugPhoto', label: 'Rug Photo', icon: 'add_photo_alternate' },
                                            { key: 'shadeCard', label: 'Shade Card Photo', icon: 'palette' },
                                            { key: 'backPhoto', label: 'Back Photo', icon: 'flip_to_back' },
                                            { key: 'masterHank', label: 'Master Hank Photo', icon: 'gesture' },
                                            { key: 'masterSample', label: 'Photo with Master Sample', icon: 'compare' }
                                        ].map(({ key, label, icon }) => (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: label }), _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-600 transition-colors cursor-pointer", children: [_jsx("i", { className: "material-icons text-3xl text-gray-400 mb-2", children: icon }), _jsx("p", { className: "text-sm text-gray-500", children: "Click to upload" }), _jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file)
                                                                    handleImageUpload(key, file);
                                                            } })] })] }, key))) })] }))] })] }), _jsx(BarcodeScanner, { isOpen: showBarcodeScanner, onClose: () => setShowBarcodeScanner(false), onScan: (barcode) => {
                    handleInputChange('carpetNo', barcode);
                    setShowBarcodeScanner(false);
                } }), _jsx(CustomModal, { isOpen: modal.show, title: modal.title, message: modal.message, type: modal.type, onCancel: () => setModal({ show: false, type: '', title: '', message: '' }), onConfirm: () => setModal({ show: false, type: '', title: '', message: '' }) })] }));
};
export default RugForm;
