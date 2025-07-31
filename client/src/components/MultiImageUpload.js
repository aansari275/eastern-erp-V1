import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
export function MultiImageUpload({ images, onImagesChange, maxImages = 10, title = "Evidence Images", className = "" }) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { toast } = useToast();
    const handleFileSelect = async (files) => {
        if (!files || files.length === 0)
            return;
        if (images.length + files.length > maxImages) {
            toast({
                title: "Too many images",
                description: `Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more.`,
                variant: "destructive",
            });
            return;
        }
        setIsUploading(true);
        try {
            const newImages = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast({
                        title: "Invalid file type",
                        description: `${file.name} is not an image file.`,
                        variant: "destructive",
                    });
                    continue;
                }
                // Validate file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    toast({
                        title: "File too large",
                        description: `${file.name} is larger than 5MB.`,
                        variant: "destructive",
                    });
                    continue;
                }
                // Convert to base64
                const reader = new FileReader();
                const imageDataUrl = await new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target?.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                newImages.push(imageDataUrl);
            }
            if (newImages.length > 0) {
                onImagesChange([...images, ...newImages]);
                toast({
                    title: "Images uploaded",
                    description: `${newImages.length} image(s) added successfully.`,
                });
            }
        }
        catch (error) {
            console.error('Error uploading images:', error);
            toast({
                title: "Upload failed",
                description: "Failed to upload images. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsUploading(false);
        }
    };
    const handleRemoveImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
        toast({
            title: "Image removed",
            description: "Image removed successfully.",
        });
    };
    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };
    const canAddMore = images.length < maxImages;
    return (_jsxs("div", { className: className, children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h4", { className: "text-sm font-medium", children: title }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [images.length, "/", maxImages, " images"] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-3", children: [images.map((image, index) => (_jsxs(Card, { className: "relative aspect-square overflow-hidden", children: [_jsx("img", { src: image, alt: `Evidence ${index + 1}`, className: "w-full h-full object-cover" }), _jsx(Button, { size: "sm", variant: "destructive", className: "absolute top-1 right-1 h-6 w-6 p-0", onClick: () => handleRemoveImage(index), children: _jsx(X, { className: "h-3 w-3" }) })] }, index))), canAddMore && (_jsx(Card, { className: "aspect-square flex items-center justify-center border-dashed border-2 hover:border-primary/50 transition-colors", children: _jsxs(Button, { variant: "ghost", size: "sm", className: "h-full w-full flex flex-col gap-1", onClick: triggerFileSelect, disabled: isUploading, children: [isUploading ? (_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" })) : (_jsx(Plus, { className: "h-6 w-6" })), _jsx("span", { className: "text-xs", children: "Add Evidence" })] }) }))] }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: (e) => handleFileSelect(e.target.files) }), !canAddMore && (_jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Maximum number of images reached. Remove an image to add more." }))] }));
}
