import React, { useState } from 'react';
import { getCSVDefectsByProcess, getDefectSeverityColor, PROCESS_MAPPING } from '@shared/csvDefectsData';

interface SelectedDefect {
  defectCode: string;
  defectName: string;
  severity: string;
  count: number;
}

interface ProcessDefectChecklistProps {
  inspectionType: string;
  onDefectsChange: (defects: SelectedDefect[]) => void;
  initialDefects?: SelectedDefect[];
}

export function ProcessDefectChecklist({ inspectionType, onDefectsChange, initialDefects = [] }: ProcessDefectChecklistProps) {
  const [selectedDefects, setSelectedDefects] = useState<SelectedDefect[]>(initialDefects);
  
  // Get the mapped process name
  const processName = PROCESS_MAPPING[inspectionType as keyof typeof PROCESS_MAPPING] || inspectionType;
  
  // Get defects for this specific process using CSV data
  const processDefects = getCSVDefectsByProcess(processName);
  
  // Debug logging removed to prevent infinite re-renders
  
  // Group defects by severity for better organization
  const defectsBySeverity = {
    Critical: processDefects.filter(d => d.severity === 'Critical'),
    Major: processDefects.filter(d => d.severity === 'Major'),
    Minor: processDefects.filter(d => d.severity === 'Minor'),
  };

  const handleDefectToggle = (defect: {defectCode: string, defectName: string, severity: 'Critical' | 'Major' | 'Minor'}, isSelected: boolean) => {
    let updatedDefects: SelectedDefect[];
    
    if (isSelected) {
      // Add defect with count of 1
      updatedDefects = [...selectedDefects, {
        defectCode: defect.defectCode,
        defectName: defect.defectName,
        severity: defect.severity,
        count: 1
      }];
    } else {
      // Remove defect
      updatedDefects = selectedDefects.filter(d => d.defectCode !== defect.defectCode);
    }
    
    setSelectedDefects(updatedDefects);
    onDefectsChange(updatedDefects);
  };

  const handleCountChange = (defectCode: string, count: number) => {
    const updatedDefects = selectedDefects.map(defect =>
      defect.defectCode === defectCode ? { ...defect, count: Math.max(1, count) } : defect
    );
    
    setSelectedDefects(updatedDefects);
    onDefectsChange(updatedDefects);
  };

  const isDefectSelected = (defectCode: string) => {
    return selectedDefects.some(d => d.defectCode === defectCode);
  };

  const getDefectCount = (defectCode: string) => {
    const defect = selectedDefects.find(d => d.defectCode === defectCode);
    return defect?.count || 1;
  };

  if (processDefects.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-600">
        No defects configured for {inspectionType}
      </div>
    );
  }

  const SeveritySection = ({ severity, defects }: { severity: string; defects: MasterDefect[] }) => (
    <div className="mb-6">
      <h4 className={`text-sm font-semibold mb-3 px-2 py-1 rounded ${getDefectSeverityColor(severity)}`}>
        {severity} Defects ({defects.length})
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {defects.map((defect) => {
          const isSelected = isDefectSelected(defect.defectCode);
          return (
            <div 
              key={defect.defectCode}
              className={`border rounded-lg p-3 transition-colors ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id={defect.defectCode}
                  checked={isSelected}
                  onChange={(e) => handleDefectToggle(defect, e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <label 
                    htmlFor={defect.defectCode}
                    className="block text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    {defect.defectCode} - {defect.defectName}
                  </label>
                  
                  {isSelected && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-gray-600">Count:</span>
                      <input
                        type="number"
                        min="1"
                        value={getDefectCount(defect.defectCode)}
                        onChange={(e) => handleCountChange(defect.defectCode, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {inspectionType} Defect Checklist
        </h3>
        {selectedDefects.length > 0 && (
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {selectedDefects.length} defect{selectedDefects.length !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {defectsBySeverity.Critical.length > 0 && (
          <SeveritySection severity="Critical" defects={defectsBySeverity.Critical} />
        )}
        {defectsBySeverity.Major.length > 0 && (
          <SeveritySection severity="Major" defects={defectsBySeverity.Major} />
        )}
        {defectsBySeverity.Minor.length > 0 && (
          <SeveritySection severity="Minor" defects={defectsBySeverity.Minor} />
        )}
      </div>

      {selectedDefects.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Selected Defects Summary:</h4>
          <div className="space-y-1">
            {selectedDefects.map((defect) => (
              <div key={defect.defectCode} className="flex justify-between text-sm">
                <span>{defect.defectCode} - {defect.defectName}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${getDefectSeverityColor(defect.severity)}`}>
                  {defect.severity} (×{defect.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}