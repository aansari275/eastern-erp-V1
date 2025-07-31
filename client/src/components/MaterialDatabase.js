import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMaterials } from '@/hooks/useMaterials';
import CustomModal from './CustomModal';
const MaterialDatabase = () => {
    const { materials, addMaterial, updateMaterial, deleteMaterial, getWarpMaterials, getWeftMaterials } = useMaterials();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'warp',
        rate: 0,
        dyeingCost: 0,
        description: ''
    });
    const [modal, setModal] = useState({ show: false, type: '', title: '', message: '' });
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleSave = async () => {
        if (!formData.name || !formData.type) {
            setModal({
                show: true,
                type: 'error',
                title: 'Validation Error',
                message: 'Please fill in required fields: Name and Type.'
            });
            return;
        }
        try {
            if (editingMaterial) {
                await updateMaterial(editingMaterial.id, formData);
            }
            else {
                await addMaterial(formData);
            }
            setShowAddForm(false);
            setEditingMaterial(null);
            setFormData({ name: '', type: 'warp', rate: 0, dyeingCost: 0, description: '' });
            setModal({
                show: true,
                type: 'info',
                title: 'Success',
                message: `Material ${editingMaterial ? 'updated' : 'added'} successfully!`
            });
        }
        catch (error) {
            setModal({
                show: true,
                type: 'error',
                title: 'Save Error',
                message: 'Failed to save material. Please try again.'
            });
        }
    };
    const handleEdit = (material) => {
        setEditingMaterial(material);
        setFormData(material);
        setShowAddForm(true);
    };
    const handleDeleteClick = (materialId, materialName) => {
        setModal({
            show: true,
            type: 'confirm',
            title: 'Delete Material',
            message: `Are you sure you want to delete "${materialName}"? This action cannot be undone.`,
            materialId
        });
    };
    const confirmDelete = async () => {
        if (modal.materialId) {
            try {
                await deleteMaterial(modal.materialId);
                setModal({ show: false, type: '', title: '', message: '' });
            }
            catch (error) {
                setModal({
                    show: true,
                    type: 'error',
                    title: 'Delete Error',
                    message: 'Failed to delete material. Please try again.'
                });
            }
        }
    };
    const resetForm = () => {
        setShowAddForm(false);
        setEditingMaterial(null);
        setFormData({ name: '', type: 'warp', rate: 0, dyeingCost: 0, description: '' });
    };
    const MaterialCard = ({ material }) => (_jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium text-gray-900", children: material.name }), _jsx("p", { className: "text-sm text-gray-600", children: material.description }), _jsxs("div", { className: "mt-2 grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Rate:" }), _jsxs("span", { className: "font-medium", children: [" \u20B9", material.rate.toFixed(2), "/kg"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Dyeing:" }), _jsxs("span", { className: "font-medium", children: [" \u20B9", material.dyeingCost.toFixed(2), "/kg"] })] })] })] }), _jsxs("div", { className: "flex space-x-2 ml-4", children: [_jsx("button", { className: "text-blue-600 hover:text-blue-700", onClick: () => handleEdit(material), children: _jsx("i", { className: "material-icons text-sm", children: "edit" }) }), _jsx("button", { className: "text-red-600 hover:text-red-700", onClick: () => handleDeleteClick(material.id, material.name), children: _jsx("i", { className: "material-icons text-sm", children: "delete" }) })] })] }) }));
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-medium text-gray-900", children: "Material Database" }), _jsxs("button", { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors", onClick: () => setShowAddForm(true), children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "add" }), "Add Material"] })] }), showAddForm && (_jsxs("div", { className: "mb-8 p-6 bg-blue-50 rounded-lg", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: editingMaterial ? 'Edit Material' : 'Add New Material' }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Material Name *" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "Enter material name", value: formData.name || '', onChange: (e) => handleInputChange('name', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Type *" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", value: formData.type || 'warp', onChange: (e) => handleInputChange('type', e.target.value), children: [_jsx("option", { value: "warp", children: "Warp" }), _jsx("option", { value: "weft", children: "Weft" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Rate (per KG)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: formData.rate || '', onChange: (e) => handleInputChange('rate', parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Dyeing Cost (per KG)" }), _jsx("input", { type: "number", step: "0.01", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", placeholder: "0.00", value: formData.dyeingCost || '', onChange: (e) => handleInputChange('dyeingCost', parseFloat(e.target.value) || 0) })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Description" }), _jsx("textarea", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent", rows: 2, placeholder: "Enter material description", value: formData.description || '', onChange: (e) => handleInputChange('description', e.target.value) })] }), _jsxs("div", { className: "flex space-x-3", children: [_jsxs("button", { className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors", onClick: handleSave, children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "save" }), editingMaterial ? 'Update' : 'Save', " Material"] }), _jsxs("button", { className: "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors", onClick: resetForm, children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "close" }), "Cancel"] })] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx("i", { className: "material-icons text-xl mr-2 text-blue-600", children: "horizontal_rule" }), "Warp Materials"] }), _jsx("div", { className: "space-y-3", children: getWarpMaterials().length === 0 ? (_jsxs("div", { className: "text-center py-8 border-2 border-dashed border-gray-300 rounded-lg", children: [_jsx("i", { className: "material-icons text-4xl text-gray-400 mb-2", children: "inventory" }), _jsx("p", { className: "text-gray-500", children: "No warp materials added yet" })] })) : (getWarpMaterials().map(material => (_jsx(MaterialCard, { material: material }, material.id)))) })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx("i", { className: "material-icons text-xl mr-2 text-green-600", children: "vertical_align_center" }), "Weft Materials"] }), _jsx("div", { className: "space-y-3", children: getWeftMaterials().length === 0 ? (_jsxs("div", { className: "text-center py-8 border-2 border-dashed border-gray-300 rounded-lg", children: [_jsx("i", { className: "material-icons text-4xl text-gray-400 mb-2", children: "inventory" }), _jsx("p", { className: "text-gray-500", children: "No weft materials added yet" })] })) : (getWeftMaterials().map(material => (_jsx(MaterialCard, { material: material }, material.id)))) })] })] }), _jsx(CustomModal, { isOpen: modal.show, title: modal.title, message: modal.message, type: modal.type, onCancel: () => setModal({ show: false, type: '', title: '', message: '' }), onConfirm: modal.type === 'confirm' ? confirmDelete : undefined })] }));
};
export default MaterialDatabase;
