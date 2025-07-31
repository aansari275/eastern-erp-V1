import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { getCSVDefectsByProcess, getDefectSeverityColor, PROCESS_MAPPING } from '@shared/csvDefectsData';
export function ProcessDefectChecklist({ inspectionType, onDefectsChange, initialDefects = [] }) {
    const [selectedDefects, setSelectedDefects] = useState(initialDefects);
    // Get the mapped process name
    const processName = PROCESS_MAPPING[inspectionType] || inspectionType;
    // Get defects for this specific process using CSV data
    const processDefects = getCSVDefectsByProcess(processName);
    // Debug logging removed to prevent infinite re-renders
    // Group defects by severity for better organization
    const defectsBySeverity = {
        Critical: processDefects.filter(d => d.severity === 'Critical'),
        Major: processDefects.filter(d => d.severity === 'Major'),
        Minor: processDefects.filter(d => d.severity === 'Minor'),
    };
    const handleDefectToggle = (defect, isSelected) => {
        let updatedDefects;
        if (isSelected) {
            // Add defect with count of 1
            updatedDefects = [...selectedDefects, {
                    defectCode: defect.defectCode,
                    defectName: defect.defectName,
                    severity: defect.severity,
                    count: 1
                }];
        }
        else {
            // Remove defect
            updatedDefects = selectedDefects.filter(d => d.defectCode !== defect.defectCode);
        }
        setSelectedDefects(updatedDefects);
        onDefectsChange(updatedDefects);
    };
    const handleCountChange = (defectCode, count) => {
        const updatedDefects = selectedDefects.map(defect => defect.defectCode === defectCode ? { ...defect, count: Math.max(1, count) } : defect);
        setSelectedDefects(updatedDefects);
        onDefectsChange(updatedDefects);
    };
    const isDefectSelected = (defectCode) => {
        return selectedDefects.some(d => d.defectCode === defectCode);
    };
    const getDefectCount = (defectCode) => {
        const defect = selectedDefects.find(d => d.defectCode === defectCode);
        return defect?.count || 1;
    };
    if (processDefects.length === 0) {
        return (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg text-center text-gray-600", children: ["No defects configured for ", inspectionType] }));
    }
    const SeveritySection = ({ severity, defects }) => (_jsxs("div", { className: "mb-6", children: [_jsxs("h4", { className: `text-sm font-semibold mb-3 px-2 py-1 rounded ${getDefectSeverityColor(severity)}`, children: [severity, " Defects (", defects.length, ")"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: defects.map((defect) => {
                    const isSelected = isDefectSelected(defect.defectCode);
                    return (_jsx("div", { className: `border rounded-lg p-3 transition-colors ${isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'}`, children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("input", { type: "checkbox", id: defect.defectCode, checked: isSelected, onChange: (e) => handleDefectToggle(defect, e.target.checked), className: "mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("label", { htmlFor: defect.defectCode, className: "block text-sm font-medium text-gray-900 cursor-pointer", children: [defect.defectCode, " - ", defect.defectName] }), isSelected && (_jsxs("div", { className: "mt-2 flex items-center space-x-2", children: [_jsx("span", { className: "text-xs text-gray-600", children: "Count:" }), _jsx("input", { type: "number", min: "1", value: getDefectCount(defect.defectCode), onChange: (e) => handleCountChange(defect.defectCode, parseInt(e.target.value) || 1), className: "w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" })] }))] })] }) }, defect.defectCode));
                }) })] }));
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: [inspectionType, " Defect Checklist"] }), selectedDefects.length > 0 && (_jsxs("span", { className: "bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded", children: [selectedDefects.length, " defect", selectedDefects.length !== 1 ? 's' : '', " selected"] }))] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [defectsBySeverity.Critical.length > 0 && (_jsx(SeveritySection, { severity: "Critical", defects: defectsBySeverity.Critical })), defectsBySeverity.Major.length > 0 && (_jsx(SeveritySection, { severity: "Major", defects: defectsBySeverity.Major })), defectsBySeverity.Minor.length > 0 && (_jsx(SeveritySection, { severity: "Minor", defects: defectsBySeverity.Minor }))] }), selectedDefects.length > 0 && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Selected Defects Summary:" }), _jsx("div", { className: "space-y-1", children: selectedDefects.map((defect) => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: [defect.defectCode, " - ", defect.defectName] }), _jsxs("span", { className: `px-2 py-0.5 rounded text-xs ${getDefectSeverityColor(defect.severity)}`, children: [defect.severity, " (\u00D7", defect.count, ")"] })] }, defect.defectCode))) })] }))] }));
}
