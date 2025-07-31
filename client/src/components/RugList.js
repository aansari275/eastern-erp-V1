import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import CustomModal from './CustomModal';
const RugList = ({ rugs, onEdit, onDelete }) => {
    const [modal, setModal] = useState({ show: false, type: '', title: '', message: '' });
    const handleDeleteClick = (rugId, designName) => {
        setModal({
            show: true,
            type: 'confirm',
            title: 'Delete Rug',
            message: `Are you sure you want to delete "${designName}"? This action cannot be undone.`,
            rugId
        });
    };
    const confirmDelete = async () => {
        if (modal.rugId) {
            try {
                await onDelete(modal.rugId);
                setModal({ show: false, type: '', title: '', message: '' });
            }
            catch (error) {
                setModal({
                    show: true,
                    type: 'error',
                    title: 'Delete Error',
                    message: 'Failed to delete rug. Please try again.'
                });
            }
        }
    };
    if (rugs.length === 0) {
        return null; // Don't show anything if no rugs
    }
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md mt-6 sm:mt-8", children: [_jsx("div", { className: "p-4 sm:p-6 border-b border-gray-200", children: _jsxs("h3", { className: "text-lg font-medium text-gray-900 flex items-center", children: [_jsx("i", { className: "material-icons text-xl mr-2 text-blue-600", children: "inventory" }), "Recent Rugs (", rugs.length, ")"] }) }), _jsx("div", { className: "divide-y divide-gray-200", children: rugs.slice(0, 10).map(rug => ( // Show only latest 10 rugs
                _jsx("div", { className: "p-4 sm:p-6 hover:bg-gray-50 transition-colors", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3 sm:space-x-4 mb-3", children: [_jsx("div", { className: "w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0", children: rug.images?.rugPhoto ? (_jsx("img", { src: rug.images.rugPhoto, alt: rug.designName, className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx("i", { className: "material-icons text-gray-400 text-base sm:text-lg", children: "photo" }) })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-1", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 truncate", children: rug.designName }), _jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: rug.construction })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Size:" }), " ", rug.size || 'N/A'] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "OPS:" }), " ", rug.opsNo || 'N/A'] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Carpet #:" }), " ", rug.carpetNo || 'N/A'] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Buyer:" }), " ", rug.buyerName || 'N/A'] })] }), _jsxs("div", { className: "flex items-center space-x-6 mt-2 text-sm", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("span", { className: "text-gray-500", children: "Cost/SqM:" }), _jsxs("span", { className: "font-medium text-green-600", children: ["\u20B9", rug.finalCostPSM?.toFixed(2) || '0.00'] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("span", { className: "text-gray-500", children: "Total:" }), _jsxs("span", { className: "font-medium text-orange-600", children: ["\u20B9", rug.totalRugCost?.toFixed(2) || '0.00'] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("span", { className: "text-gray-500", children: "Area:" }), _jsxs("span", { className: "text-gray-700", children: [rug.area?.toFixed(2) || '0', " SqM"] })] }), rug.contractorType === 'contractor' ? (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("span", { className: "text-gray-500", children: "Contractor:" }), _jsx("span", { className: "text-gray-700", children: rug.contractorName || 'N/A' })] })) : (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("span", { className: "text-gray-500", children: "Weaver:" }), _jsx("span", { className: "text-gray-700", children: rug.weaverName || 'N/A' })] }))] })] })] }), rug.processFlow && rug.processFlow.length > 0 && (_jsx("div", { className: "mt-3", children: _jsxs("div", { className: "flex flex-wrap gap-1", children: [_jsx("span", { className: "text-xs text-gray-500 mr-2", children: "Process:" }), rug.processFlow
                                                    .sort((a, b) => a.step - b.step)
                                                    .slice(0, 5) // Show only first 5 processes
                                                    .map((process, index) => (_jsxs("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700", children: [process.step, ". ", process.process] }, index))), rug.processFlow.length > 5 && (_jsxs("span", { className: "text-xs text-gray-500", children: ["+", rug.processFlow.length - 5, " more"] }))] }) }))] }), _jsxs("div", { className: "flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0 sm:ml-4 flex-shrink-0", children: [_jsxs("button", { className: "inline-flex items-center justify-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors", onClick: () => onEdit(rug), children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "edit" }), "Edit"] }), _jsxs("button", { className: "inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors", onClick: () => handleDeleteClick(rug.id, rug.designName), children: [_jsx("i", { className: "material-icons text-sm mr-1", children: "delete" }), "Delete"] })] })] }) }, rug.id))) }), rugs.length > 10 && (_jsx("div", { className: "p-4 text-center border-t border-gray-200", children: _jsxs("p", { className: "text-sm text-gray-500", children: ["Showing latest 10 rugs. Total: ", rugs.length, " rugs created."] }) })), _jsx(CustomModal, { isOpen: modal.show, title: modal.title, message: modal.message, type: modal.type, onCancel: () => setModal({ show: false, type: '', title: '', message: '' }), onConfirm: modal.type === 'confirm' ? confirmDelete : undefined })] }));
};
export default RugList;
