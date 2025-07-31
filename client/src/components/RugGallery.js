import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, FileText, Plus, Search, Trash2, Tag, X } from 'lucide-react';
import easternLogo from '@/assets/eastern-logo-new.png';
const RugGallery = ({ rugs, onEditRug, onDownloadTED, onGenerateLabel, onDeleteRugs, onImageUpload, onImageDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [constructionFilter, setConstructionFilter] = useState('All Constructions');
    const [buyerFilter, setBuyerFilter] = useState('All Buyers');
    const [sortBy, setSortBy] = useState('Sort by Date');
    const [selectedRugs, setSelectedRugs] = useState(new Set());
    const [uploadingImages, setUploadingImages] = useState(new Set());
    // Filter and sort rugs (latest first)
    const filteredRugs = rugs.filter(rug => {
        const matchesSearch = searchTerm === '' ||
            rug.designName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rug.carpetNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rug.construction.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rug.color.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesConstruction = constructionFilter === 'All Constructions' ||
            rug.construction === constructionFilter;
        const matchesBuyer = buyerFilter === 'All Buyers' ||
            rug.buyerName === buyerFilter;
        return matchesSearch && matchesConstruction && matchesBuyer;
    }).sort((a, b) => {
        // Sort by creation date (latest first) - assuming id represents creation order
        const aId = typeof a.id === 'string' ? parseInt(a.id) : a.id || 0;
        const bId = typeof b.id === 'string' ? parseInt(b.id) : b.id || 0;
        return bId - aId;
    });
    // Get unique constructions and buyers for filters
    const uniqueConstructions = [...new Set(rugs.map(rug => rug.construction))];
    const uniqueBuyers = [...new Set(rugs.map(rug => rug.buyerName))];
    const handleRugSelect = (rugId) => {
        const newSelected = new Set(selectedRugs);
        if (newSelected.has(rugId)) {
            newSelected.delete(rugId);
        }
        else {
            newSelected.add(rugId);
        }
        setSelectedRugs(newSelected);
    };
    const handleBulkDelete = async () => {
        if (selectedRugs.size === 0)
            return;
        const confirmation = window.confirm(`Are you sure you want to delete ${selectedRugs.size} selected rug(s)? This action cannot be undone.`);
        if (confirmation && onDeleteRugs) {
            try {
                await onDeleteRugs(Array.from(selectedRugs));
                setSelectedRugs(new Set()); // Clear selection after successful delete
            }
            catch (error) {
                console.error('Error deleting rugs:', error);
                alert('Failed to delete rugs. Please try again.');
            }
        }
    };
    const handleSelectAll = () => {
        if (selectedRugs.size === filteredRugs.length) {
            setSelectedRugs(new Set()); // Deselect all
        }
        else {
            setSelectedRugs(new Set(filteredRugs.map(rug => rug.id.toString()))); // Select all visible rugs
        }
    };
    const handleImageUpload = async (rugId, imageIndex, event) => {
        const file = event.target.files?.[0];
        if (!file || !onImageUpload)
            return;
        const uploadKey = `${rugId}-${imageIndex}`;
        setUploadingImages(prev => new Set(prev).add(uploadKey));
        try {
            await onImageUpload(rugId, imageIndex, file);
        }
        catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image. Please try again.');
        }
        finally {
            setUploadingImages(prev => {
                const newSet = new Set(prev);
                newSet.delete(uploadKey);
                return newSet;
            });
        }
    };
    const handleImageDelete = async (rugId, imageIndex) => {
        if (!onImageDelete)
            return;
        const confirmDelete = window.confirm('Are you sure you want to delete this image?');
        if (!confirmDelete)
            return;
        try {
            await onImageDelete(rugId, imageIndex);
        }
        catch (error) {
            console.error('Failed to delete image:', error);
            alert('Failed to delete image. Please try again.');
        }
    };
    const getImageForSlot = (rug, index) => {
        if (!rug.images)
            return undefined;
        // Handle different image storage formats
        const images = rug.images;
        // Define slot-specific image keys - rugImage1 is the main thumbnail
        const slotKeys = [
            ['rugImage1'], // Slot 0 - Main thumbnail in rug card (rugImage1)
            ['rugImage1'], // Slot 1 - First thumbnail icon (rugImage1)  
            ['rugImage2'], // Slot 2 - Second thumbnail icon (rugImage2)
            ['rugImage3'], // Slot 3 - Third thumbnail icon (rugImage3)
            ['rugImage4'], // Slot 4 - Fourth thumbnail icon (rugImage4)
            ['rugImage5'] // Slot 5 - Fifth thumbnail icon (rugImage5)
        ];
        // First, try to get image for specific slot
        if (index < slotKeys.length) {
            for (const key of slotKeys[index]) {
                const imageValue = images[key];
                if (imageValue && typeof imageValue === 'string' && imageValue.trim() !== '') {
                    // Validate image URL/data
                    if (imageValue.startsWith('data:image/') ||
                        imageValue.startsWith('/uploads/') ||
                        imageValue.startsWith('http') ||
                        imageValue.includes('.jpg') ||
                        imageValue.includes('.jpeg') ||
                        imageValue.includes('.png') ||
                        imageValue.includes('.webp')) {
                        return imageValue;
                    }
                }
            }
        }
        // If no specific slot image found, don't fallback to other slots
        // This ensures each slot shows only its own image
        return undefined;
    };
    const handleDownloadTED = (rug) => {
        if (onDownloadTED) {
            onDownloadTED(rug);
        }
        else {
            // Default TED download as PDF
            const tedData = {
                designName: rug.designName,
                construction: rug.construction,
                quality: rug.quality,
                size: rug.size,
                color: rug.color,
                finishedGSM: rug.finishedGSM,
                materials: rug.materials,
                specifications: {
                    warpIn6Inches: rug.warpIn6Inches,
                    weftIn6Inches: rug.weftIn6Inches,
                    pileHeightMM: rug.pileHeightMM,
                    totalThicknessMM: rug.totalThicknessMM
                },
                costs: {
                    materialCost: rug.totalMaterialCost,
                    weavingCost: rug.weavingCost,
                    finishingCost: rug.finishingCost,
                    finalCostPSM: rug.finalCostPSM
                }
            };
            const dataStr = JSON.stringify(tedData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `TED_${rug.designName}_${rug.carpetNo}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };
    if (rugs.length === 0) {
        return (_jsxs("div", { className: "text-center py-12 bg-white rounded-lg shadow-sm", children: [_jsx("div", { className: "text-6xl text-gray-300 mb-4", children: "\uD83D\uDCD0" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Rugs Available" }), _jsx("p", { className: "text-gray-500", children: "Rug designs created by the Sampling Department will appear here." })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg sm:text-2xl font-semibold text-gray-900", children: "Gallery" }), _jsxs("p", { className: "text-sm sm:text-base text-gray-600", children: [filteredRugs.length, " of ", rugs.length, " rugs"] })] }), _jsxs(Button, { variant: "outline", size: "sm", className: "hidden sm:flex", children: [_jsx(Search, { className: "h-4 w-4 mr-2" }), "Refresh Data"] })] }), _jsx("div", { className: "bg-white rounded-lg p-3 sm:p-4 shadow-sm", children: _jsxs("div", { className: "space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4", children: [_jsxs("div", { className: "relative sm:col-span-2 lg:col-span-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: "Search rugs...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 sm:gap-4 sm:col-span-2 lg:col-span-3 sm:grid-cols-3", children: [_jsxs(Select, { value: constructionFilter, onValueChange: setConstructionFilter, children: [_jsx(SelectTrigger, { className: "text-xs sm:text-sm", children: _jsx(SelectValue, { placeholder: "Construction" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "All Constructions", children: "All" }), uniqueConstructions.filter(construction => construction && construction.trim() !== '').map(construction => (_jsx(SelectItem, { value: construction, children: construction }, construction)))] })] }), _jsxs(Select, { value: buyerFilter, onValueChange: setBuyerFilter, children: [_jsx(SelectTrigger, { className: "text-xs sm:text-sm", children: _jsx(SelectValue, { placeholder: "Buyers" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "All Buyers", children: "All" }), uniqueBuyers.filter(buyer => buyer && buyer.trim() !== '').map(buyer => (_jsx(SelectItem, { value: buyer, children: buyer }, buyer)))] })] }), _jsxs(Select, { value: sortBy, onValueChange: setSortBy, children: [_jsx(SelectTrigger, { className: "text-xs sm:text-sm", children: _jsx(SelectValue, { placeholder: "Sort" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Sort by Date", children: "Date" }), _jsx(SelectItem, { value: "Sort by Name", children: "Name" }), _jsx(SelectItem, { value: "Sort by Construction", children: "Type" })] })] })] })] }) }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6", children: filteredRugs.map((rug) => (_jsxs("div", { className: "bg-white rounded-lg border shadow-sm overflow-hidden relative", children: [_jsxs("div", { className: "relative h-32 sm:h-48 bg-gray-100 flex items-center justify-center", children: [_jsx("div", { className: "absolute top-2 sm:top-3 left-2 sm:left-3 z-10", children: _jsx("input", { type: "checkbox", checked: selectedRugs.has(rug.id.toString()), onChange: () => handleRugSelect(rug.id.toString()), className: "w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500" }) }), (() => {
                                    const imageUrl = getImageForSlot(rug, 0);
                                    return imageUrl ? (_jsx("img", { src: imageUrl, alt: rug.designName, className: "w-full h-full object-cover", onLoad: () => console.log('Main image loaded successfully:', imageUrl), onError: (e) => {
                                            console.log('Main image failed to load:', imageUrl);
                                            // Replace with placeholder if image fails
                                            const img = e.target;
                                            const container = img.parentElement;
                                            img.style.display = 'none';
                                            if (container && !container.querySelector('.fallback-icon')) {
                                                const fallback = document.createElement('div');
                                                fallback.className = 'fallback-icon w-full h-full bg-white flex items-center justify-center p-2';
                                                fallback.innerHTML = `<img src="${easternLogo}" alt="Eastern Logo" class="w-full h-full object-contain opacity-60" />`;
                                                container.appendChild(fallback);
                                            }
                                        } })) : (_jsx("div", { className: "w-full h-full bg-white flex items-center justify-center p-2", children: _jsx("img", { src: easternLogo, alt: "Eastern Logo", className: "w-full h-full object-contain opacity-60" }) }));
                                })()] }), _jsxs("div", { className: "p-2 sm:p-4 space-y-2 sm:space-y-3", children: [_jsx("h3", { className: "font-semibold text-gray-900 text-center text-sm sm:text-base", children: rug.designName }), _jsxs("div", { className: "space-y-1 sm:space-y-2 text-xs sm:text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Construction:" }), _jsx("span", { className: "font-medium text-right", children: rug.construction })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Color:" }), _jsx("span", { className: "font-medium truncate text-right", children: rug.color })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Size:" }), _jsx("span", { className: "font-medium text-right", children: rug.size })] })] }), _jsxs("div", { className: "hidden sm:block", children: [_jsx("div", { className: "text-xs sm:text-sm text-gray-600 mb-2", children: "Photos:" }), _jsx("div", { className: "grid grid-cols-5 gap-1 sm:gap-2", children: [...Array(5)].map((_, index) => {
                                                const slotIndex = index + 1; // Map to rugImage1-5
                                                const uploadKey = `${rug.id}-${slotIndex}`;
                                                const isUploading = uploadingImages.has(uploadKey);
                                                const existingImage = getImageForSlot(rug, slotIndex);
                                                const imageLabel = `rugImage${slotIndex}`;
                                                return (_jsxs("div", { className: "relative group", children: [_jsx("input", { type: "file", accept: "image/*", onChange: (e) => handleImageUpload(rug.id.toString(), slotIndex, e), className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10", disabled: isUploading, title: `Upload ${imageLabel}` }), _jsx("div", { className: `aspect-square border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${existingImage
                                                                ? 'border-green-300 bg-green-50'
                                                                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'} ${isUploading ? 'opacity-50' : ''}`, children: isUploading ? (_jsx("div", { className: "animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-blue-500 border-t-transparent rounded-full" })) : existingImage ? (_jsxs("div", { className: "w-full h-full bg-gray-100 rounded-md overflow-hidden relative", children: [_jsx("img", { src: existingImage, alt: imageLabel, className: "w-full h-full object-cover", onError: (e) => {
                                                                            console.log(`Small thumbnail failed to load (${imageLabel}):`, existingImage);
                                                                            // Hide image and show placeholder
                                                                            const img = e.target;
                                                                            img.style.display = 'none';
                                                                            const container = img.parentElement;
                                                                            if (container && !container.querySelector('.fallback-plus')) {
                                                                                const fallback = document.createElement('div');
                                                                                fallback.className = 'fallback-plus flex items-center justify-center w-full h-full bg-gray-100';
                                                                                fallback.innerHTML = '<svg class="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>';
                                                                                container.appendChild(fallback);
                                                                            }
                                                                        }, onLoad: () => console.log(`Small thumbnail loaded successfully (${imageLabel}):`, existingImage) }), _jsx("button", { onClick: (e) => {
                                                                            e.stopPropagation();
                                                                            handleImageDelete(rug.id.toString(), slotIndex);
                                                                        }, className: "absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-sm", title: `Delete ${imageLabel}`, children: _jsx(X, { className: "h-2.5 w-2.5" }) })] })) : (_jsx(Plus, { className: "h-3 w-3 sm:h-4 sm:w-4 text-gray-400", title: `Click to upload ${imageLabel}` })) }), _jsx("div", { className: "absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-[6px] sm:text-[8px] text-gray-500 whitespace-nowrap", children: imageLabel })] }, `${rug.id}-thumb-${slotIndex}`));
                                            }) })] }), _jsxs("div", { className: "flex gap-1 sm:gap-2 pt-1 sm:pt-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => onEditRug?.(rug), className: "flex-1 text-xs h-7 sm:h-8", children: [_jsx(Edit, { className: "h-3 w-3 sm:mr-1" }), _jsx("span", { className: "hidden sm:inline", children: "Edit" })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => onGenerateLabel?.(rug), className: "flex-1 text-xs h-7 sm:h-8", children: [_jsx(Tag, { className: "h-3 w-3 sm:mr-1" }), _jsx("span", { className: "hidden sm:inline", children: "Label" })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleDownloadTED(rug), className: "flex-1 text-xs h-7 sm:h-8", children: [_jsx(FileText, { className: "h-3 w-3 sm:mr-1" }), _jsx("span", { className: "hidden sm:inline", children: "PDF" })] })] })] })] }, rug.id))) }), selectedRugs.size > 0 && (_jsx("div", { className: "fixed bottom-3 sm:bottom-6 left-2 right-2 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 shadow-lg z-50", children: _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-6", children: [_jsxs("span", { className: "text-xs sm:text-sm font-medium text-blue-900", children: [selectedRugs.size, " rug(s) selected"] }), _jsxs("div", { className: "flex gap-2 w-full sm:w-auto", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedRugs(new Set()), className: "flex-1 sm:flex-none text-xs", children: "Clear" }), _jsxs(Button, { size: "sm", variant: "destructive", onClick: handleBulkDelete, className: "bg-red-600 hover:bg-red-700 flex-1 sm:flex-none text-xs", children: [_jsx(Trash2, { className: "h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" }), _jsx("span", { className: "hidden sm:inline", children: "Delete Selected" }), _jsx("span", { className: "sm:hidden", children: "Delete" })] })] })] }) })), selectedRugs.size > 0 && (_jsxs("div", { className: "mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600", children: [_jsx("strong", { children: "Debug - Selected IDs:" }), " ", Array.from(selectedRugs).join(', ')] }))] }));
};
export default RugGallery;
