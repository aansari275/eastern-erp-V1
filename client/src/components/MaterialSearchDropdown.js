import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
const MaterialSearchDropdown = ({ materials, value, onChange, placeholder = "Search materials...", type }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    // Filter materials by type and search term
    useEffect(() => {
        console.log(`Filtering materials: Total=${materials.length}, Type=${type}`);
        const typedMaterials = materials.filter(m => m.type === type);
        console.log(`${type} materials found:`, typedMaterials.length);
        if (!searchTerm.trim()) {
            const displayMaterials = typedMaterials.slice(0, 100); // Show first 100 when no search
            setFilteredMaterials(displayMaterials);
            console.log(`Showing ${displayMaterials.length} ${type} materials without search`);
        }
        else {
            const filtered = typedMaterials.filter(material => material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (material.supplier || '').toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 50); // Show first 50 search results
            setFilteredMaterials(filtered);
            console.log(`Search "${searchTerm}" found ${filtered.length} ${type} materials`);
        }
    }, [materials, searchTerm, type]);
    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        onChange(null, newValue); // Allow typing custom material name
        setIsOpen(true);
    };
    const handleMaterialSelect = (material) => {
        setSearchTerm(material.name);
        setIsOpen(false);
        onChange(material, material.name);
    };
    const handleInputFocus = () => {
        setIsOpen(true);
        setSearchTerm(value || '');
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
        else if (e.key === 'ArrowDown' && !isOpen) {
            setIsOpen(true);
        }
    };
    return (_jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsx("input", { ref: inputRef, type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm", placeholder: placeholder, value: isOpen ? searchTerm : (value || ''), onChange: handleInputChange, onFocus: handleInputFocus, onKeyDown: handleKeyDown, autoComplete: "off" }), _jsx("div", { className: "absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none", children: _jsx("i", { className: "material-icons text-gray-400 text-sm", children: isOpen ? 'expand_less' : 'search' }) }), isOpen && (_jsxs("div", { className: "absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto", children: [searchTerm && filteredMaterials.length === 0 && (_jsx("div", { className: "px-3 py-2 text-sm text-gray-500", children: "No materials found. You can type a custom material name." })), filteredMaterials.length > 0 && (_jsxs(_Fragment, { children: [searchTerm && (_jsxs("div", { className: "px-3 py-1 text-xs text-gray-400 border-b border-gray-100", children: [filteredMaterials.length, " results found"] })), filteredMaterials.map((material, index) => (_jsx("div", { className: "px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0", onClick: () => handleMaterialSelect(material), children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-medium text-gray-900 truncate", children: material.name }), material.supplier && (_jsx("div", { className: "text-xs text-gray-500 truncate", children: material.supplier }))] }), _jsxs("div", { className: "ml-2 text-xs text-green-600 font-medium flex-shrink-0", children: ["\u20B9", material.rate.toFixed(2)] })] }) }, `${material.id}_${index}`))), !searchTerm && materials.filter(m => m.type === type).length > 100 && (_jsxs("div", { className: "px-3 py-2 text-xs text-gray-400 bg-gray-50", children: ["Type to search more materials... (", materials.filter(m => m.type === type).length, " total available)"] }))] }))] }))] }));
};
export default MaterialSearchDropdown;
