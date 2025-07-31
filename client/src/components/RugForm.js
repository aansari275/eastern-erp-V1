import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { CONSTRUCTION_OPTIONS, ORDER_TYPE_OPTIONS, DYEING_TYPE_OPTIONS, CONSTRUCTION_QUALITY_MAP, PROCESS_NAMES, EDGE_LONGER_SIDE_OPTIONS, EDGE_SHORT_SIDE_OPTIONS, COLOR_PALETTE } from '@/types/rug';
import { useSqlMaterials } from '@/hooks/useSqlMaterials';
import { useBuyers } from '@/hooks/useBuyers';
import { toast } from "@/hooks/use-toast";
import BarcodeScanner from './BarcodeScanner';
import CustomModal from './CustomModal';
import MaterialSearchDropdown from './MaterialSearchDropdown';
const RugForm = ({ rug, onSave, onReset, onBack }) => {
    const { materials: materialDatabase, loading: materialsLoading } = useSqlMaterials();
    // Fetch buyers for dropdown
    const { buyers, isLoading: buyersLoading } = useBuyers();
    const [activeTab, setActiveTab] = useState('unfinished');
    const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [modal, setModal] = useState({
        show: false, type: '', title: '', message: ''
    });
    const [formData, setFormData] = useState({
        designName: '',
        construction: '',
        quality: '',
        color: '',
        primaryColor: '',
        secondaryColor: '',
        selectedColors: [],
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
        hasWashing: 'no',
        // New specification fields
        warpIn6Inches: undefined,
        weftIn6Inches: undefined,
        pileHeightMM: undefined,
        totalThicknessMM: undefined,
        edgeLongerSide: undefined,
        edgeShortSide: undefined,
        fringesHemLength: '',
        fringesHemMaterial: '',
        shadeCardNo: '',
        materials: [],
        weavingCost: 0,
        finishingCost: 0,
        packingCost: 125,
        overheadPercentage: 5,
        profitPercentage: 0,
        processFlow: [],
        images: {},
        totalMaterialCost: 0,
        totalDirectCost: 0,
        finalCostPSM: 0,
        area: 0,
        unit: 'PSM',
        currency: 'INR',
        exchangeRate: 83,
    });
    useEffect(() => {
        if (rug) {
            // Migrate existing materials to new structure and handle colors
            const migratedRug = {
                ...rug,
                selectedColors: rug.color ? rug.color.split(' + ') : [],
                shadeCardNo: rug.shadeCardNo || '', // Ensure shadeCardNo is preserved
                materials: (rug.materials || []).map(material => ({
                    ...material,
                    handSpinningCost: material.handSpinningCost || 0,
                    isDyed: material.isDyed || false,
                    hasHandSpinning: material.hasHandSpinning || false,
                    plyCount: material.plyCount || undefined
                }))
            };
            setFormData(migratedRug);
        }
    }, [rug]);
    useEffect(() => {
        calculateCosts();
    }, [formData.materials, formData.weavingCost, formData.finishingCost, formData.packingCost, formData.overheadPercentage, formData.profitPercentage, formData.size, formData.finishedGSM, formData.unit, formData.currency, formData.exchangeRate]);
    const calculateCosts = () => {
        const materials = formData.materials || [];
        let totalMaterialCost = materials.reduce((sum, material) => sum + material.costPerSqM, 0);
        let weavingCost = formData.weavingCost || 0;
        let finishingCost = formData.finishingCost || 0;
        let packingCost = formData.packingCost || 0;
        // Unit conversion factor (PSF to PSM)
        const unitConversionFactor = formData.unit === 'PSF' ? 10.764 : 1;
        // Convert process costs to PSM if needed
        if (formData.unit === 'PSF') {
            weavingCost = weavingCost * unitConversionFactor;
            finishingCost = finishingCost * unitConversionFactor;
            packingCost = packingCost * unitConversionFactor;
        }
        const totalDirectCost = totalMaterialCost + weavingCost + finishingCost + packingCost;
        const overheadAmount = (totalDirectCost * (formData.overheadPercentage || 0)) / 100;
        const costWithOverhead = totalDirectCost + overheadAmount;
        const profitAmount = (costWithOverhead * (formData.profitPercentage || 0)) / 100;
        let finalCostPSM = costWithOverhead + profitAmount;
        // Currency conversion
        if (formData.currency === 'USD') {
            finalCostPSM = finalCostPSM / (formData.exchangeRate || 83);
            totalMaterialCost = totalMaterialCost / (formData.exchangeRate || 83);
            const totalDirectCostUSD = totalDirectCost / (formData.exchangeRate || 83);
        }
        const area = calculateAreaFromSize(formData.size || '');
        setFormData(prev => ({
            ...prev,
            totalMaterialCost,
            totalDirectCost,
            finalCostPSM,
            area
        }));
    };
    const calculateAreaFromSize = (size) => {
        const match = size.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)/);
        if (match) {
            const width = parseFloat(match[1]);
            const height = parseFloat(match[2]);
            return (width * height) * 0.092903; // Convert sq ft to sq m
        }
        return 0;
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'construction') {
            setFormData(prev => ({ ...prev, quality: '' }));
        }
        // No longer need to recalculate based on global GSM since each material has its own GSM
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
            handSpinningCost: 0,
            costPerSqM: 0,
            plyCount: undefined
        };
        setFormData(prev => ({
            ...prev,
            materials: [...(prev.materials || []), newMaterial]
        }));
    };
    const updateMaterial = (index, field, value) => {
        const materials = [...(formData.materials || [])];
        materials[index] = { ...materials[index], [field]: value };
        // Simple calculation: GSM × (Rate + Dyeing + Hand Spinning)
        const rate = materials[index].rate || 0;
        const dyeingCost = materials[index].dyeingCost || 0;
        const handSpinningCost = materials[index].handSpinningCost || 0;
        const gsm = materials[index].consumption || 0;
        materials[index].costPerSqM = gsm * (rate + dyeingCost + handSpinningCost);
        setFormData(prev => ({ ...prev, materials }));
    };
    const removeMaterial = (index) => {
        const materials = [...(formData.materials || [])];
        materials.splice(index, 1);
        setFormData(prev => ({ ...prev, materials }));
    };
    const autoFillMaterialRates = (material, materialIndex) => {
        if (material && material.rate !== undefined) {
            const materials = [...(formData.materials || [])];
            console.log('Auto-filling material rates:', {
                materialName: material.name,
                rate: material.rate,
                supplier: material.supplier,
                type: material.type
            });
            // Update all fields at once
            materials[materialIndex] = {
                ...materials[materialIndex],
                name: material.name,
                type: material.type,
                rate: material.rate,
                dyeingCost: 0,
                handSpinningCost: 0
            };
            // Recalculate cost per SqM with existing GSM
            const gsm = materials[materialIndex].consumption || 0;
            const rate = material.rate || 0;
            const dyeingCost = materials[materialIndex].dyeingCost || 0;
            const handSpinningCost = materials[materialIndex].handSpinningCost || 0;
            materials[materialIndex].costPerSqM = gsm * (rate + dyeingCost + handSpinningCost);
            console.log('Material updated:', materials[materialIndex]);
            setFormData(prev => ({ ...prev, materials }));
        }
    };
    const getFilteredMaterials = (type) => {
        return materialDatabase.filter(m => m.type === type);
    };
    const handleProcessFlowChange = (processName, step) => {
        const processFlow = [...(formData.processFlow || [])];
        const existingIndex = processFlow.findIndex(p => p.process === processName);
        if (step === 0) {
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
    // Image compression utility
    const compressImage = (file, maxSizeKB = 200) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                // AGGRESSIVE: Use small dimensions like compliance system (400x300)
                const maxWidth = 400;
                const maxHeight = 300;
                let { width, height } = img;
                
                // Calculate new dimensions maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw image
                ctx?.drawImage(img, 0, 0, width, height);
                
                // AGGRESSIVE: Start with 0.7 quality like compliance system and reduce iteratively
                let quality = 0.7;
                let attempts = 0;
                const maxAttempts = 10;
                
                const compress = () => {
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    const sizeKB = (compressedDataUrl.length * 3) / 4 / 1024;
                    
                    console.log(`Compression attempt ${attempts + 1}: ${Math.round(sizeKB)}KB at quality ${quality.toFixed(2)}`);
                    
                    if (sizeKB <= maxSizeKB || attempts >= maxAttempts || quality <= 0.1) {
                        console.log(`Final compression: ${Math.round(sizeKB)}KB`);
                        resolve(compressedDataUrl);
                    } else {
                        // Reduce quality more aggressively
                        quality = Math.max(0.1, quality * 0.8);
                        attempts++;
                        compress();
                    }
                };
                
                compress();
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    };
    const handleImageUpload = async (imageType, file) => {
        try {
            console.log(`Uploading ${imageType}:`, file.name, file.size);
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({
                    title: "Invalid File Type",
                    description: "Please select a valid image file (JPG, PNG, GIF, etc.)",
                    variant: "destructive"
                });
                return;
            }
            // Show processing message
            toast({
                title: "Processing Image",
                description: "Uploading and processing image...",
            });
            // FIXED: Use aggressive compression to stay under 200KB limit
            try {
                console.log(`🔄 Starting compression for ${imageType}:`, file.name, `(${Math.round(file.size/1024)}KB)`);
                
                const compressedBase64 = await compressImage(file, 200); // Strict 200KB limit
                const finalSizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
                
                console.log(`✅ Compressed ${imageType} from ${Math.round(file.size/1024)}KB to ${finalSizeKB}KB`);
                
                // Strict size check - reject anything over 200KB
                if (finalSizeKB > 200) {
                    toast({
                        title: "Compression Failed",
                        description: `Unable to compress ${imageType} under 200KB (current: ${finalSizeKB}KB). Please use a smaller image.`,
                        variant: "destructive"
                    });
                    return;
                }
                
                setFormData(prev => {
                    const newImages = { ...prev.images, [imageType]: compressedBase64 };
                    console.log(`🖼️ Updated formData.images for ${imageType}: ${finalSizeKB}KB`);
                    return {
                        ...prev,
                        images: newImages
                    };
                });
                
                toast({
                    title: "✅ Image Ready",
                    description: `${imageType} compressed to ${finalSizeKB}KB and ready to save.`
                });
            }
            catch (compressionError) {
                console.warn('Compression failed, using direct upload:', compressionError);
                // Fallback: direct upload with size check
                if (file.size > 10 * 1024 * 1024) {
                    toast({
                        title: "File Too Large",
                        description: "Image size must be less than 10MB. Please choose a smaller file.",
                        variant: "destructive"
                    });
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target?.result;
                    if (base64) {
                        console.log(`Direct upload ${imageType}:`, Math.round(base64.length / 1024), 'KB');
                        setFormData(prev => {
                            const newImages = { ...prev.images, [imageType]: base64 };
                            console.log(`Updated formData.images for ${imageType} (direct):`, !!newImages[imageType]);
                            return {
                                ...prev,
                                images: newImages
                            };
                        });
                        toast({
                            title: "Image Uploaded",
                            description: `${imageType} uploaded successfully.`
                        });
                    }
                };
                reader.onerror = () => {
                    toast({
                        title: "Upload Failed",
                        description: "Failed to read the image file. Please try again.",
                        variant: "destructive"
                    });
                };
                reader.readAsDataURL(file);
            }
        }
        catch (error) {
            console.error('Error uploading image:', error);
            toast({
                title: "Upload Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive"
            });
        }
    };
    const handleCameraCapture = (imageType) => {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment'; // Use rear camera by default
            input.onchange = (e) => {
                try {
                    const file = e.target.files?.[0];
                    if (file) {
                        handleImageUpload(imageType, file);
                    }
                    else {
                        console.log('No file selected from camera');
                    }
                }
                catch (error) {
                    console.error('Error handling camera capture:', error);
                    toast({
                        title: "Camera Error",
                        description: "Failed to capture image from camera. Please try again.",
                        variant: "destructive"
                    });
                }
            };
            input.onerror = () => {
                toast({
                    title: "Camera Error",
                    description: "Failed to access camera. Please check camera permissions.",
                    variant: "destructive"
                });
            };
            input.click();
        }
        catch (error) {
            console.error('Error opening camera:', error);
            toast({
                title: "Camera Error",
                description: "Failed to open camera. Please try the upload option instead.",
                variant: "destructive"
            });
        }
    };
    const handleImageDelete = (imageType) => {
        try {
            console.log(`Deleting image: ${imageType}`);
            setFormData(prev => {
                const newImages = { ...prev.images };
                delete newImages[imageType]; // Completely remove the property
                console.log(`Deleted ${imageType}, remaining images:`, Object.keys(newImages));
                return {
                    ...prev,
                    images: newImages
                };
            });
            toast({
                title: "Image Deleted",
                description: `${imageType} has been successfully removed.`
            });
        }
        catch (error) {
            console.error('Error deleting image:', error);
            toast({
                title: "Delete Error",
                description: "Failed to delete the image. Please try again.",
                variant: "destructive"
            });
        }
    };
    const validateForm = () => {
        const errors = [];
        if (!formData.designName?.trim()) {
            errors.push('Design Name is required');
        }
        if (!formData.construction) {
            errors.push('Construction is required');
        }
        if (!formData.carpetNo?.trim()) {
            errors.push('Carpet Number is required');
        }
        if (!formData.size?.trim()) {
            errors.push('Size is required');
        }
        return errors;
    };
    const handleSave = async () => {
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setModal({
                show: true,
                type: 'error',
                title: 'Validation Error',
                message: `Please correct the following errors:\n• ${validationErrors.join('\n• ')}`
            });
            return;
        }
        setIsSaving(true);
        // Show immediate feedback
        toast({
            title: "Saving rug...",
            description: "Your rug is being saved and will appear in the gallery momentarily.",
        });
        try {
            // Include the rug ID if we're editing an existing rug
            const saveData = {
                ...formData,
                ...(rug?.id && { id: rug.id }), // Include ID only if editing
                images: formData.images || {},
            };
            console.log('Saving rug data:', { isEdit: !!rug?.id, rugId: rug?.id, saveData });
            await onSave(saveData);
            toast({
                title: "Success!",
                description: rug?.id ? "Rug updated successfully!" : "Rug saved successfully and is now available in the gallery.",
            });
        }
        catch (error) {
            console.error('Error saving rug:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast({
                title: "Error",
                description: `Failed to ${rug?.id ? 'update' : 'save'} rug. Please try again. ${errorMessage}`,
                variant: "destructive",
            });
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleGenerateShadeCardLabel = async () => {
        try {
            const { jsPDF } = await import('jspdf');
            const QRCode = await import('qrcode');
            // Create PDF with custom 4x3 inch size (101.6 x 76.2 mm)
            const doc = new jsPDF('landscape', 'mm', [101.6, 76.2]);
            // Generate QR code for shade card number
            const qrCodeDataUrl = await QRCode.toDataURL(formData.shadeCardNo || 'No Shade Card', {
                width: 256,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            // Use full page dimensions (4x3 inches = 101.6 x 76.2 mm)
            const labelWidth = 101.6;
            const labelHeight = 76.2;
            const startX = 0;
            const startY = 0;
            // Draw border
            doc.setLineWidth(0.5);
            doc.rect(startX, startY, labelWidth, labelHeight);
            // Add "SHADE CARD" header
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text('SHADE CARD', startX + 5, startY + 12);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            let textY = startY + 22;
            // Shade Card No.
            if (formData.shadeCardNo) {
                doc.text(`Shade Card No.: ${formData.shadeCardNo}`, startX + 5, textY);
                textY += 6;
            }
            // Design Name
            if (formData.designName) {
                doc.text(`Design: ${formData.designName}`, startX + 5, textY);
                textY += 6;
            }
            // Construction
            if (formData.construction) {
                doc.text(`Construction: ${formData.construction}`, startX + 5, textY);
                textY += 6;
            }
            // Quality
            if (formData.quality) {
                doc.text(`Quality: ${formData.quality}`, startX + 5, textY);
                textY += 6;
            }
            // Carpet No.
            if (formData.carpetNo) {
                doc.text(`Carpet No.: ${formData.carpetNo}`, startX + 5, textY);
                textY += 6;
            }
            // Unfinished GSM
            if (formData.unfinishedGSM) {
                doc.text(`Unfinished GSM: ${formData.unfinishedGSM}`, startX + 5, textY);
                textY += 6;
            }
            // Finished GSM
            if (formData.finishedGSM) {
                doc.text(`Finished GSM: ${formData.finishedGSM}`, startX + 5, textY);
                textY += 6;
            }
            // Date
            doc.text(`Date: ${new Date().toLocaleDateString()}`, startX + 5, textY);
            // Add QR code on the right side
            const qrSize = 25;
            doc.addImage(qrCodeDataUrl, 'PNG', startX + labelWidth - qrSize - 5, startY + 8, qrSize, qrSize);
            // Add shade card number below QR code
            doc.setFontSize(7);
            const shadeCardText = formData.shadeCardNo || '';
            if (shadeCardText) {
                doc.text(shadeCardText, startX + labelWidth - qrSize - 5 + (qrSize / 2), startY + 8 + qrSize + 4, { align: 'center' });
            }
            // Download PDF
            const fileName = `shade-card-${formData.shadeCardNo || 'label'}.pdf`;
            doc.save(fileName);
            // Open print dialog
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const printWindow = window.open(pdfUrl);
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
                // Clean up the URL after a delay
                setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
            }
            toast({
                title: "Success",
                description: "Shade card label generated and ready to print!",
            });
        }
        catch (error) {
            console.error('Error generating shade card label:', error);
            toast({
                title: "Error",
                description: "Failed to generate shade card label",
                variant: "destructive"
            });
        }
    };
    const TabButton = ({ tab, icon, label, shortLabel }) => (_jsxs("button", { type: "button", className: `flex items-center px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === tab
            ? 'border-blue-600 text-blue-600 bg-blue-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, onClick: () => setActiveTab(tab), children: [_jsx("i", { className: "material-icons text-sm mr-1 sm:mr-2", children: icon }), _jsx("span", { className: "hidden sm:inline", children: label }), _jsx("span", { className: "sm:hidden", children: shortLabel || label })] }));
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center gap-4 mb-4 sm:mb-0", children: [onBack && (_jsxs("button", { className: "bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center transition-colors", onClick: onBack, children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "arrow_back" }), _jsx("span", { className: "hidden sm:inline", children: "Back" })] })), _jsx("h2", { className: "text-lg sm:text-xl font-medium text-gray-900", children: rug ? 'Edit Rug' : 'Create New Rug' })] }), _jsxs("div", { className: "flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3", children: [_jsxs("button", { className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed", onClick: handleSave, disabled: isSaving, children: [_jsx("i", { className: `material-icons text-sm mr-1 ${isSaving ? 'animate-spin' : ''}`, children: isSaving ? 'refresh' : 'save' }), isSaving ? 'Saving...' : 'Save Rug'] }), _jsxs("button", { className: "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors", onClick: onReset, children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "refresh" }), "Reset Form"] })] })] }), _jsx("div", { className: "border-b border-gray-200", children: _jsxs("nav", { className: "flex overflow-x-auto", children: [_jsx(TabButton, { tab: "unfinished", icon: "info", label: "Unfinished Details", shortLabel: "Unfinished" }), _jsx(TabButton, { tab: "materials", icon: "inventory", label: "Materials & Costing", shortLabel: "Materials" }), _jsx(TabButton, { tab: "finishing", icon: "timeline", label: "Finishing Details", shortLabel: "Finishing" }), _jsx(TabButton, { tab: "images", icon: "photo_library", label: "Photo Studio", shortLabel: "Studio" })] }) }), _jsxs("div", { className: "p-4 sm:p-6", children: [(materialsLoading || buyersLoading) && (_jsx("div", { className: "fixed inset-0 bg-white/80 flex items-center justify-center z-50", children: _jsxs("div", { className: "text-center bg-white p-6 rounded-lg shadow-lg", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" }), _jsx("p", { className: "text-gray-600", children: "Loading form data..." })] }) })), activeTab === 'unfinished' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Design Name *" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter design name", value: formData.designName || '', onChange: (e) => handleInputChange('designName', e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Construction *" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.construction || '', onChange: (e) => handleInputChange('construction', e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select Construction" }), CONSTRUCTION_OPTIONS.map(option => (_jsx("option", { value: option, children: option }, option)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Quality *" }), !formData.construction ? (_jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-100 text-gray-500", placeholder: "Select Construction First", disabled: true })) : (_jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", list: `quality-options-${formData.construction}`, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: `Enter or select ${formData.construction} quality`, value: formData.quality || '', onChange: (e) => handleInputChange('quality', e.target.value), required: true }), _jsx("datalist", { id: `quality-options-${formData.construction}`, children: getQualityOptions().map(option => (_jsx("option", { value: option }, option))) })] }))] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Color Selection (Select up to 3)" }), formData.selectedColors && formData.selectedColors.length > 0 && (_jsxs("div", { className: "mb-3 p-3 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "text-xs text-gray-600 mb-1", children: "Selected Colors:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: formData.selectedColors.map((colorName, index) => {
                                                            const color = COLOR_PALETTE.find(c => c.name === colorName);
                                                            return (_jsxs("div", { className: "flex items-center gap-1 bg-white px-2 py-1 rounded border", children: [_jsx("div", { className: "w-4 h-4 rounded border border-gray-300", style: { backgroundColor: color?.hex || '#CCCCCC' } }), _jsx("span", { className: "text-xs", children: colorName }), _jsx("button", { type: "button", onClick: () => {
                                                                            const newColors = formData.selectedColors?.filter((_, i) => i !== index) || [];
                                                                            setFormData(prev => ({ ...prev, selectedColors: newColors }));
                                                                            handleInputChange('color', newColors.join(' + '));
                                                                        }, className: "text-red-500 hover:text-red-700 ml-1", children: "\u00D7" })] }, index));
                                                        }) })] })), _jsx("div", { className: "grid grid-cols-5 gap-2 mb-3", children: COLOR_PALETTE.map((color) => {
                                                    const isSelected = formData.selectedColors?.includes(color.name);
                                                    const canSelect = !isSelected && (formData.selectedColors?.length || 0) < 3;
                                                    return (_jsxs("button", { type: "button", onClick: () => {
                                                            if (isSelected) {
                                                                // Remove color
                                                                const newColors = formData.selectedColors?.filter(c => c !== color.name) || [];
                                                                setFormData(prev => ({ ...prev, selectedColors: newColors }));
                                                                handleInputChange('color', newColors.join(' + '));
                                                            }
                                                            else if (canSelect) {
                                                                // Add color
                                                                const newColors = [...(formData.selectedColors || []), color.name];
                                                                setFormData(prev => ({ ...prev, selectedColors: newColors }));
                                                                handleInputChange('color', newColors.join(' + '));
                                                            }
                                                        }, disabled: !isSelected && !canSelect, className: `flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${isSelected
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                            : canSelect
                                                                ? 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'}`, children: [_jsx("div", { className: "w-8 h-8 rounded border border-gray-300 relative", style: { backgroundColor: color.hex }, children: isSelected && (_jsx("div", { className: "absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs", children: "\u2713" })) }), _jsx("span", { className: "text-xs text-center", children: color.name })] }, color.name));
                                                }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Add Custom Color" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Enter color name", className: "flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500", onKeyDown: (e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        const customColor = e.target.value.trim();
                                                                        if (customColor && (formData.selectedColors?.length || 0) < 3) {
                                                                            const newColors = [...(formData.selectedColors || []), customColor];
                                                                            setFormData(prev => ({ ...prev, selectedColors: newColors }));
                                                                            handleInputChange('color', newColors.join(' + '));
                                                                            e.target.value = '';
                                                                        }
                                                                    }
                                                                } }), _jsx("button", { type: "button", onClick: (e) => {
                                                                    const input = e.target.previousElementSibling;
                                                                    const customColor = input.value.trim();
                                                                    if (customColor && (formData.selectedColors?.length || 0) < 3) {
                                                                        const newColors = [...(formData.selectedColors || []), customColor];
                                                                        setFormData(prev => ({ ...prev, selectedColors: newColors }));
                                                                        handleInputChange('color', newColors.join(' + '));
                                                                        input.value = '';
                                                                    }
                                                                }, disabled: (formData.selectedColors?.length || 0) >= 3, className: "px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed", children: "Add" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Order Type" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.orderType || '', onChange: (e) => handleInputChange('orderType', e.target.value), children: [_jsx("option", { value: "", children: "Select Order Type" }), ORDER_TYPE_OPTIONS.map(option => (_jsx("option", { value: option, children: option }, option)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Buyer Name" }), buyersLoading ? (_jsx("div", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500", children: "Loading buyers..." })) : (_jsxs("div", { className: "relative", children: [_jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white", value: formData.buyerName || '', onChange: (e) => {
                                                            if (e.target.value === '__custom__') {
                                                                // Switch to text input for custom entry
                                                                const customName = prompt('Enter custom buyer name:');
                                                                if (customName) {
                                                                    handleInputChange('buyerName', customName);
                                                                }
                                                            }
                                                            else {
                                                                handleInputChange('buyerName', e.target.value);
                                                            }
                                                        }, children: [_jsx("option", { value: "", children: "Select a buyer or enter custom" }), Array.isArray(buyers) && buyers.map((buyer) => (_jsxs("option", { value: buyer.buyerName, children: [buyer.buyerName, " (", buyer.buyerCode, ")"] }, buyer.id))), _jsx("option", { value: "__custom__", children: "+ Enter Custom Buyer Name" })] }), _jsx("div", { className: "absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none", children: _jsx("svg", { className: "w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) }) })] })), formData.buyerName && Array.isArray(buyers) && !buyers.find(b => b.buyerName === formData.buyerName) && (_jsxs("p", { className: "text-sm text-blue-600 mt-1", children: ["Custom buyer: ", formData.buyerName] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "OPS No." }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter OPS number", value: formData.opsNo || '', onChange: (e) => handleInputChange('opsNo', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Carpet No. (Barcode) *" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("input", { type: "text", className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter or scan carpet number", value: formData.carpetNo || '', onChange: (e) => handleInputChange('carpetNo', e.target.value), required: true }), _jsx("button", { type: "button", className: "bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors", onClick: () => setShowBarcodeScanner(true), children: _jsx("i", { className: "material-icons text-sm", children: "qr_code_scanner" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Size" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "e.g., 8x10 ft or 2x3 m", value: formData.size || '', onChange: (e) => handleInputChange('size', e.target.value) }), formData.area && formData.area > 0 && (_jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Area: ", formData.area.toFixed(2), " sq m"] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Shade Card No." }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter shade card number", value: formData.shadeCardNo || '', onChange: (e) => handleInputChange('shadeCardNo', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Unfinished GSM" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter unfinished GSM", value: formData.unfinishedGSM || '', onChange: (e) => handleInputChange('unfinishedGSM', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Contractor Type" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.contractorType || 'contractor', onChange: (e) => handleInputChange('contractorType', e.target.value), children: [_jsx("option", { value: "contractor", children: "Contractor" }), _jsx("option", { value: "inhouse", children: "Inhouse" })] })] }), formData.contractorType === 'contractor' ? (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Contractor Name" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter contractor name", value: formData.contractorName || '', onChange: (e) => handleInputChange('contractorName', e.target.value) })] })) : (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Weaver Name" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter weaver name", value: formData.weaverName || '', onChange: (e) => handleInputChange('weaverName', e.target.value) })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Submitted By" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter submitter name", value: formData.submittedBy || '', onChange: (e) => handleInputChange('submittedBy', e.target.value) })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-4 mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Washing Required?" }), _jsxs("div", { className: "flex space-x-4", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "hasWashing", value: "yes", checked: formData.hasWashing === 'yes', onChange: (e) => handleInputChange('hasWashing', e.target.value), className: "mr-2" }), "Yes"] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "hasWashing", value: "no", checked: formData.hasWashing === 'no', onChange: (e) => handleInputChange('hasWashing', e.target.value), className: "mr-2" }), "No"] })] })] }), formData.hasWashing === 'yes' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Washing Contractor" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter washing contractor name", value: formData.washingContractor || '', onChange: (e) => handleInputChange('washingContractor', e.target.value) })] }))] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Photo Documentation" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Upload required photos for this rug. Click on any photo area to select and upload files." }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
                                            { key: 'frontPhoto', label: 'Front Photo', icon: 'photo' },
                                            { key: 'backWithRuler', label: 'Back (With Ruler)', icon: 'straighten' },
                                            { key: 'frontWithMasterHankAndShadeCard', label: 'Front with Master Hank and Shade Card', icon: 'palette' }
                                        ].map(({ key, label, icon }) => (_jsx("div", { className: "bg-white rounded-lg p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: label }), _jsx("div", { className: "mb-4 cursor-pointer hover:opacity-80 transition-opacity", onClick: () => document.getElementById(`${key}-input`)?.click(), children: formData.images?.[key] ? (_jsxs("div", { className: "relative", children: [_jsx("img", { src: formData.images[key], alt: label, className: "w-full h-32 object-cover rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500" }), _jsx("button", { type: "button", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleImageDelete(key);
                                                                    }, className: "absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors", children: "\u00D7" })] })) : (_jsx("div", { className: "w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-100", children: _jsxs("div", { className: "text-center", children: [_jsx("i", { className: "material-icons text-gray-400 text-4xl mb-2", children: icon }), _jsx("p", { className: "text-sm text-gray-500", children: "Click to upload/take photo" })] }) })) }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { type: "button", className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center transition-colors", onClick: () => document.getElementById(`${key}-input`)?.click(), children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "upload" }), "Upload"] }), _jsxs("button", { type: "button", className: "flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center transition-colors", onClick: () => handleCameraCapture(key), children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "camera_alt" }), "Camera"] })] }), _jsx("input", { id: `${key}-input`, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleImageUpload(key, file);
                                                            }
                                                        } })] }) }, key))) })] })] })), activeTab === 'materials' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Materials" }), _jsxs("button", { type: "button", className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors", onClick: addMaterial, children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "add" }), "Add Material"] })] }), materialsLoading && (_jsxs("div", { className: "text-center py-4", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" }), _jsx("p", { className: "text-gray-600", children: "Loading materials from database..." })] })), _jsxs("div", { className: "space-y-4", children: [(formData.materials || []).map((material, index) => (_jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Type" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: material.type || 'warp', onChange: (e) => {
                                                                        const materials = [...(formData.materials || [])];
                                                                        materials[index] = {
                                                                            ...materials[index],
                                                                            type: e.target.value,
                                                                            name: '', // Clear material name when type changes
                                                                            rate: 0,
                                                                            dyeingCost: 0,
                                                                            handSpinningCost: 0,
                                                                            isDyed: false,
                                                                            hasHandSpinning: false,
                                                                            costPerSqM: 0
                                                                        };
                                                                        setFormData(prev => ({ ...prev, materials }));
                                                                    }, children: [_jsx("option", { value: "warp", children: "Warp" }), _jsx("option", { value: "weft", children: "Weft" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Material" }), _jsx(MaterialSearchDropdown, { materials: materialDatabase, value: material.name, type: material.type || 'warp', placeholder: `Search ${material.type || 'warp'} materials...`, onChange: (selectedMaterial, materialName) => {
                                                                        if (selectedMaterial) {
                                                                            // Auto-fill rates when material is selected from database
                                                                            autoFillMaterialRates(selectedMaterial, index);
                                                                        }
                                                                        else {
                                                                            // Just update name when typing custom material
                                                                            updateMaterial(index, 'name', materialName || '');
                                                                        }
                                                                    } }), material.name && (() => {
                                                                    const selectedMat = materialDatabase.find(m => m.name === material.name);
                                                                    return selectedMat?.supplier ? (_jsxs("p", { className: "text-xs text-gray-400 mt-1 italic", children: ["Supplier: ", selectedMat.supplier] })) : null;
                                                                })()] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "No. of Ply in Weaving" }), _jsx("input", { type: "number", min: "1", max: "99", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "1", value: material.plyCount || '', onChange: (e) => {
                                                                        const value = parseInt(e.target.value) || undefined;
                                                                        updateMaterial(index, 'plyCount', value);
                                                                    } })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "GSM (With Loss)" }), _jsx("input", { type: "number", step: "0.001", min: "0", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.000", value: material.consumption || '', onChange: (e) => {
                                                                        const inputValue = e.target.value;
                                                                        const gsm = inputValue === '' ? 0 : parseFloat(inputValue);
                                                                        updateMaterial(index, 'consumption', gsm);
                                                                    } })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Rate (per KG)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: material.rate || '', onChange: (e) => updateMaterial(index, 'rate', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Dyeing Cost (per KG)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: material.dyeingCost || '', onChange: (e) => updateMaterial(index, 'dyeingCost', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Type of Dyeing" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.typeOfDyeing || '', onChange: (e) => handleInputChange('typeOfDyeing', e.target.value), children: [_jsx("option", { value: "", children: "Select Dyeing Type" }), DYEING_TYPE_OPTIONS.map(option => (_jsx("option", { value: option, children: option }, option)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Hand Spinning Cost (per KG)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: material.handSpinningCost || '', onChange: (e) => updateMaterial(index, 'handSpinningCost', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { className: "flex flex-col justify-between", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Cost per SqM" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700", children: ["\u20B9", material.costPerSqM.toFixed(2)] }), _jsx("button", { type: "button", className: "text-red-600 hover:text-red-700 p-2", onClick: () => removeMaterial(index), children: _jsx("i", { className: "material-icons text-sm", children: "delete" }) })] })] })] }) }, material.id))), (formData.materials || []).length === 0 && (_jsxs("div", { className: "text-center py-8 border-2 border-dashed border-gray-300 rounded-lg", children: [_jsx("i", { className: "material-icons text-4xl text-gray-400 mb-2", children: "inventory" }), _jsx("p", { className: "text-gray-500", children: "No materials added yet. Click \"Add Material\" to start." })] }))] })] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Cost Calculation" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white rounded-lg p-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Unit" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.unit || 'PSM', onChange: (e) => handleInputChange('unit', e.target.value), children: [_jsx("option", { value: "PSM", children: "Per Square Meter (PSM)" }), _jsx("option", { value: "PSF", children: "Per Square Foot (PSF)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Currency" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.currency || 'INR', onChange: (e) => handleInputChange('currency', e.target.value), children: [_jsx("option", { value: "INR", children: "Indian Rupee (\u20B9)" }), _jsx("option", { value: "USD", children: "US Dollar ($)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Exchange Rate (INR to USD)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "83.00", value: formData.exchangeRate || '', onChange: (e) => handleInputChange('exchangeRate', parseFloat(e.target.value) || 83) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Overhead %" }), _jsx("input", { type: "number", step: "0.1", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "5.0", value: formData.overheadPercentage || '', onChange: (e) => handleInputChange('overheadPercentage', parseFloat(e.target.value) || 5) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Weaving Cost (per ", formData.unit || 'SqM', ")"] }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: formData.weavingCost || '', onChange: (e) => handleInputChange('weavingCost', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Finishing Cost (per ", formData.unit || 'SqM', ")"] }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: formData.finishingCost || '', onChange: (e) => handleInputChange('finishingCost', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Packing Cost (per ", formData.unit || 'SqM', ")"] }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: formData.packingCost || '', onChange: (e) => handleInputChange('packingCost', parseFloat(e.target.value) || 0) })] })] }), (formData.materials || []).length > 0 && (_jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Material GSM Analysis" }), _jsxs("div", { className: "space-y-2 text-sm", children: [(formData.materials || []).map((material, index) => (material.name && material.consumption > 0 && (_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-gray-700", children: [material.name, " (", material.type, "):"] }), _jsxs("span", { className: "font-medium text-blue-700", children: [material.consumption?.toFixed(3), " GSM"] })] }, index)))), _jsx("hr", { className: "border-blue-200" }), _jsxs("div", { className: "flex justify-between items-center font-semibold", children: [_jsx("span", { children: "Total GSM:" }), _jsxs("span", { className: "text-blue-800", children: [(formData.materials || [])
                                                                        .reduce((sum, material) => sum + (material.consumption || 0), 0)
                                                                        .toFixed(3), " GSM"] })] })] })] })), _jsxs("div", { className: "bg-white rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Cost Summary" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsxs("span", { className: "text-gray-600", children: ["Material Cost/", formData.unit || 'SqM', ":"] }), _jsxs("p", { className: "font-medium text-blue-600", children: [formData.currency === 'USD' ? '$' : '₹', (Number(formData.totalMaterialCost) || 0).toFixed(2)] })] }), _jsxs("div", { children: [_jsxs("span", { className: "text-gray-600", children: ["Total Direct Cost/", formData.unit || 'SqM', ":"] }), _jsxs("p", { className: "font-medium text-green-600", children: [formData.currency === 'USD' ? '$' : '₹', (Number(formData.totalDirectCost) || 0).toFixed(2)] })] }), _jsxs("div", { children: [_jsxs("span", { className: "text-gray-600", children: ["Final Cost/", formData.unit || 'SqM', ":"] }), _jsxs("p", { className: "font-medium text-orange-600", children: [formData.currency === 'USD' ? '$' : '₹', (Number(formData.finalCostPSM) || 0).toFixed(2)] })] })] }), formData.unit === 'PSF' && (_jsxs("div", { className: "mt-4 p-3 bg-blue-50 rounded-lg", children: [_jsx("h5", { className: "text-sm font-medium text-gray-900 mb-2", children: "Unit Conversion Information" }), _jsxs("p", { className: "text-xs text-gray-600", children: ["1 PSM = 10.764 PSF | Final Cost per PSM:", formData.currency === 'USD' ? '$' : '₹', ((Number(formData.finalCostPSM) || 0) * 10.764).toFixed(2)] })] })), formData.currency === 'USD' && (_jsxs("div", { className: "mt-4 p-3 bg-green-50 rounded-lg", children: [_jsx("h5", { className: "text-sm font-medium text-gray-900 mb-2", children: "Currency Conversion Information" }), _jsxs("p", { className: "text-xs text-gray-600", children: ["Exchange Rate: 1 USD = \u20B9", formData.exchangeRate || 83, " | Final Cost in INR: \u20B9", ((Number(formData.finalCostPSM) || 0) * (formData.exchangeRate || 83)).toFixed(2)] })] }))] })] })] })), activeTab === 'finishing' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-blue-50 p-6 rounded-lg", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Additional Specifications" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Finished GSM" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter finished GSM", value: formData.finishedGSM || '', onChange: (e) => handleInputChange('finishedGSM', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Pile GSM" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter pile GSM", value: formData.pileGSM || '', onChange: (e) => handleInputChange('pileGSM', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Warp in 6 inches" }), _jsx("input", { type: "number", min: "0", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter warp count", value: formData.warpIn6Inches || '', onChange: (e) => handleInputChange('warpIn6Inches', parseFloat(e.target.value) || undefined) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Weft in 6 inches" }), _jsx("input", { type: "number", min: "0", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter weft count", value: formData.weftIn6Inches || '', onChange: (e) => handleInputChange('weftIn6Inches', parseFloat(e.target.value) || undefined) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Pile height in MM" }), _jsx("input", { type: "number", min: "0", step: "0.1", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter pile height", value: formData.pileHeightMM || '', onChange: (e) => handleInputChange('pileHeightMM', parseFloat(e.target.value) || undefined) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Total Thickness in MM" }), _jsx("input", { type: "number", min: "0", step: "0.1", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter total thickness", value: formData.totalThicknessMM || '', onChange: (e) => handleInputChange('totalThicknessMM', parseFloat(e.target.value) || undefined) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Edge Details - Longer side" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.edgeLongerSide || '', onChange: (e) => handleInputChange('edgeLongerSide', e.target.value), children: [_jsx("option", { value: "", children: "Select edge type" }), EDGE_LONGER_SIDE_OPTIONS.map(option => (_jsx("option", { value: option, children: option }, option)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Edge Details - Short side" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.edgeShortSide || '', onChange: (e) => handleInputChange('edgeShortSide', e.target.value), children: [_jsx("option", { value: "", children: "Select edge type" }), EDGE_SHORT_SIDE_OPTIONS.map(option => (_jsx("option", { value: option, children: option }, option)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Fringes/Hem Length" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "4 - 5 cm", value: formData.fringesHemLength || '', onChange: (e) => handleInputChange('fringesHemLength', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Fringes/Hem Material" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "100% cotton", value: formData.fringesHemMaterial || '', onChange: (e) => handleInputChange('fringesHemMaterial', e.target.value) })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Manufacturing Process Flow" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Click on processes to add them to your workflow. Drag to reorder." }), _jsxs("div", { className: "mb-6", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-3", children: "Available Processes" }), _jsx("div", { className: "flex flex-wrap gap-2", children: PROCESS_NAMES
                                                    .filter(processName => !(formData.processFlow || []).find(p => p.process === processName))
                                                    .map(processName => (_jsxs("button", { type: "button", onClick: () => {
                                                        const newStep = (formData.processFlow || []).length + 1;
                                                        handleProcessFlowChange(processName, newStep);
                                                    }, className: "px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors text-sm", children: ["+ ", processName] }, processName))) })] }), (formData.processFlow || []).length > 0 && (_jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-3", children: "Your Process Flow" }), _jsx("div", { className: "space-y-2", children: (formData.processFlow || [])
                                                    .sort((a, b) => a.step - b.step)
                                                    .map((process, index) => (_jsxs("div", { className: "flex items-center justify-between bg-white rounded-lg p-3 shadow-sm", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full", children: process.step }), _jsx("span", { className: "text-gray-900 font-medium", children: process.process })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [index > 0 && (_jsx("button", { type: "button", onClick: () => {
                                                                        const newFlow = [...(formData.processFlow || [])];
                                                                        const current = newFlow.find(p => p.process === process.process);
                                                                        const previous = newFlow.find(p => p.step === process.step - 1);
                                                                        if (current && previous) {
                                                                            current.step = process.step - 1;
                                                                            previous.step = process.step;
                                                                            setFormData(prev => ({ ...prev, processFlow: newFlow }));
                                                                        }
                                                                    }, className: "text-gray-400 hover:text-blue-600 text-sm", children: "\u2191" })), index < (formData.processFlow || []).length - 1 && (_jsx("button", { type: "button", onClick: () => {
                                                                        const newFlow = [...(formData.processFlow || [])];
                                                                        const current = newFlow.find(p => p.process === process.process);
                                                                        const next = newFlow.find(p => p.step === process.step + 1);
                                                                        if (current && next) {
                                                                            current.step = process.step + 1;
                                                                            next.step = process.step;
                                                                            setFormData(prev => ({ ...prev, processFlow: newFlow }));
                                                                        }
                                                                    }, className: "text-gray-400 hover:text-blue-600 text-sm", children: "\u2193" })), _jsx("button", { type: "button", onClick: () => handleProcessFlowChange(process.process, 0), className: "text-red-400 hover:text-red-600 text-sm", children: "\u2715" })] })] }, index))) })] })), (formData.processFlow || []).length === 0 && (_jsxs("div", { className: "text-center py-8 border-2 border-dashed border-gray-300 rounded-lg", children: [_jsx("i", { className: "material-icons text-4xl text-gray-400 mb-2", children: "timeline" }), _jsx("p", { className: "text-gray-500", children: "No processes selected. Click on processes above to build your workflow." })] }))] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200", children: [_jsxs("button", { className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed", onClick: handleSave, disabled: isSaving, children: [_jsx("i", { className: `material-icons text-sm mr-1 ${isSaving ? 'animate-spin' : ''}`, children: isSaving ? 'refresh' : 'save' }), isSaving ? 'Saving...' : 'Save Rug'] }), _jsxs("button", { className: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors", onClick: handleGenerateShadeCardLabel, type: "button", children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "local_offer" }), "Shade Card Label"] })] })] })), activeTab === 'images' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Photo Studio" }), _jsx("p", { className: "text-gray-600", children: "Upload additional rug images for documentation. Click on any photo area to select and upload files." }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6", children: [
                                    { key: 'rugImage1', label: 'Rug Image 1', icon: 'photo' },
                                    { key: 'rugImage2', label: 'Rug Image 2', icon: 'photo' },
                                    { key: 'rugImage3', label: 'Rug Image 3', icon: 'photo' },
                                    { key: 'rugImage4', label: 'Rug Image 4', icon: 'photo' },
                                    { key: 'rugImage5', label: 'Rug Image 5', icon: 'photo' }
                                ].map(({ key, label, icon }) => {
                                    const hasImage = formData.images?.[key];
                                    const imageUrl = hasImage;
                                    return (_jsx("div", { className: "bg-gray-50 rounded-lg p-4 border", children: _jsxs("div", { className: "text-center", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: label }), _jsx("div", { className: "mb-4 cursor-pointer hover:opacity-80 transition-opacity", onClick: () => document.getElementById(`${key}-studio-input`)?.click(), children: hasImage ? (_jsxs("div", { className: "relative", children: [_jsx("img", { src: imageUrl, alt: label, className: "w-full h-32 object-cover rounded-lg border-2 border-solid border-green-400", onLoad: () => console.log(`Image loaded successfully: ${key}`), onError: (e) => console.error(`Image load error for ${key}:`, e) }), _jsx("button", { type: "button", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    handleImageDelete(key);
                                                                }, className: "absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors shadow-lg", children: "\u00D7" }), _jsx("div", { className: "absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded", children: "\u2713" })] })) : (_jsx("div", { className: "w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-100 transition-colors", children: _jsxs("div", { className: "text-center", children: [_jsx("i", { className: "material-icons text-gray-400 text-4xl mb-2", children: icon }), _jsx("p", { className: "text-sm text-gray-500", children: "Click to upload/take photo" })] }) })) }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { type: "button", className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center transition-colors", onClick: () => document.getElementById(`${key}-studio-input`)?.click(), children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "upload" }), "Upload"] }), _jsxs("button", { type: "button", className: "flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center transition-colors", onClick: () => handleCameraCapture(key), children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "camera_alt" }), "Camera"] })] }), _jsx("input", { id: `${key}-studio-input`, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            console.log(`File selected for ${key}:`, file.name);
                                                            handleImageUpload(key, file);
                                                        }
                                                        // Reset input to allow re-selecting same file
                                                        e.target.value = '';
                                                    } })] }) }, key));
                                }) })] }))] }), _jsx("div", { className: "border-t border-gray-200 p-4 sm:p-6 bg-gray-50", children: _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0", children: [_jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-600", children: [_jsxs("span", { className: "flex items-center", children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "info" }), "Fields marked with * are required"] }), formData.area && formData.area > 0 && (_jsxs("span", { className: "flex items-center", children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "straighten" }), "Area: ", formData.area.toFixed(2), " sq m"] }))] }), _jsxs("div", { className: "flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3", children: [formData.shadeCardNo && (_jsxs("button", { className: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors", onClick: handleGenerateShadeCardLabel, children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "print" }), "Shade Card Label"] })), _jsxs("button", { className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed", onClick: handleSave, disabled: isSaving, children: [_jsx("i", { className: `material-icons text-sm mr-1 ${isSaving ? 'animate-spin' : ''}`, children: isSaving ? 'refresh' : 'save' }), isSaving ? 'Saving...' : (rug ? 'Update Rug' : 'Save Rug')] })] })] }) }), _jsx(BarcodeScanner, { isOpen: showBarcodeScanner, onClose: () => setShowBarcodeScanner(false), onScan: (barcode) => {
                    handleInputChange('carpetNo', barcode);
                    setShowBarcodeScanner(false);
                } }), _jsx(CustomModal, { isOpen: modal.show, title: modal.title, message: modal.message, type: modal.type, onCancel: () => setModal({ show: false, type: '', title: '', message: '' }), onConfirm: modal.type === 'info' ? () => setModal({ show: false, type: '', title: '', message: '' }) : undefined })] }));
};
export default RugForm;
