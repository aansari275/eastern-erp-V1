import React, { useState, useEffect } from 'react';
import { Rug, Material, ProcessFlow, CONSTRUCTION_OPTIONS, ORDER_TYPE_OPTIONS, DYEING_TYPE_OPTIONS, CONSTRUCTION_QUALITY_MAP, PROCESS_NAMES } from '../types/rug';
import { useSqlMaterials } from '../hooks/useSqlMaterials';
import BarcodeScanner from './BarcodeScanner';
import CustomModal from './CustomModal';

interface RugFormProps {
  rug?: Rug;
  onSave: (rugData: Omit<Rug, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onReset: () => void;
}

const RugForm: React.FC<RugFormProps> = ({ rug, onSave, onReset }) => {
  const { materials: materialDatabase, loading: materialsLoading } = useSqlMaterials();
  const [formData, setFormData] = useState<Partial<Rug>>({
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

  const [activeTab, setActiveTab] = useState<'basic' | 'materials' | 'costs' | 'process' | 'images'>('basic');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [modal, setModal] = useState<{show: boolean, type: string, title: string, message: string}>({
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

  const calculateAreaFromSize = (size: string): number => {
    const match = size.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)/);
    if (match) {
      const width = parseFloat(match[1]);
      const height = parseFloat(match[2]);
      // Convert to square meters (assuming input is in feet by default)
      return (width * height) * 0.092903; // 1 sq ft = 0.092903 sq m
    }
    return 0;
  };

  const handleInputChange = (field: string, value: any) => {
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
    const newMaterial: Material = {
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

  const updateMaterial = (index: number, field: string, value: any) => {
    const materials = [...(formData.materials || [])];
    materials[index] = { ...materials[index], [field]: value };
    
    // Recalculate cost per sqm
    const material = materials[index];
    if (field === 'consumption' || field === 'rate' || field === 'dyeingCost') {
      material.costPerSqM = material.consumption * (material.rate + material.dyeingCost);
    }
    
    setFormData(prev => ({ ...prev, materials }));
  };

  const removeMaterial = (index: number) => {
    const materials = [...(formData.materials || [])];
    materials.splice(index, 1);
    setFormData(prev => ({ ...prev, materials }));
  };

  const autoFillMaterialRates = (materialId: string, materialIndex: number) => {
    const material = materialDatabase.find(m => m.id === materialId);
    if (material) {
      updateMaterial(materialIndex, 'name', material.name);
      updateMaterial(materialIndex, 'type', material.type);
      updateMaterial(materialIndex, 'rate', material.rate);
      updateMaterial(materialIndex, 'dyeingCost', material.dyeingCost);
    }
  };

  const getFilteredMaterials = (type: 'warp' | 'weft') => {
    return materialDatabase.filter(m => m.type === type);
  };

  const handleProcessFlowChange = (processName: string, step: number) => {
    const processFlow = [...(formData.processFlow || [])];
    const existingIndex = processFlow.findIndex(p => p.process === processName);
    
    if (step === 0) {
      // Remove process if step is 0
      if (existingIndex >= 0) {
        processFlow.splice(existingIndex, 1);
      }
    } else {
      if (existingIndex >= 0) {
        processFlow[existingIndex].step = step;
      } else {
        processFlow.push({ process: processName, step });
      }
    }
    
    setFormData(prev => ({ ...prev, processFlow }));
  };

  const handleImageUpload = (imageType: string, file: File) => {
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
      const base64 = e.target?.result as string;
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
      await onSave(formData as Omit<Rug, 'id' | 'createdAt' | 'updatedAt'>);
      setModal({
        show: true,
        type: 'info',
        title: 'Success',
        message: 'Rug saved successfully!'
      });
    } catch (error) {
      setModal({
        show: true,
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save rug. Please try again.'
      });
    }
  };



  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">Rug Creation Form</h2>
        <div className="flex space-x-3">
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            onClick={handleSave}
          >
            <i className="material-icons text-sm mr-1">save</i>
            Save Rug
          </button>
          <button 
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            onClick={onReset}
          >
            <i className="material-icons text-sm mr-1">refresh</i>
            Reset Form
          </button>
        </div>
      </div>

      <form className="space-y-8">
        {/* Basic Details Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <i className="material-icons text-xl mr-2 text-blue-600">info</i>
            Basic Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Design Name *</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="Enter design name"
                value={formData.designName || ''}
                onChange={(e) => handleInputChange('designName', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Construction *</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={formData.construction || ''}
                onChange={(e) => handleInputChange('construction', e.target.value)}
                required
              >
                <option value="">Select Construction</option>
                {CONSTRUCTION_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality *</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={formData.quality || ''}
                onChange={(e) => handleInputChange('quality', e.target.value)}
                required
                disabled={!formData.construction}
              >
                <option value="">Select Quality</option>
                {getQualityOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="Enter color description"
                value={formData.color || ''}
                onChange={(e) => handleInputChange('color', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={formData.orderType || ''}
                onChange={(e) => handleInputChange('orderType', e.target.value)}
              >
                <option value="">Select Order Type</option>
                {ORDER_TYPE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="Enter buyer name"
                value={formData.buyerName || ''}
                onChange={(e) => handleInputChange('buyerName', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">OPS No.</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="Enter OPS number"
                value={formData.opsNo || ''}
                onChange={(e) => handleInputChange('opsNo', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carpet No.</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                  placeholder="Enter carpet number"
                  value={formData.carpetNo || ''}
                  onChange={(e) => handleInputChange('carpetNo', e.target.value)}
                />
                <button 
                  type="button" 
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors"
                  onClick={() => setShowBarcodeScanner(true)}
                >
                  <i className="material-icons text-sm">qr_code_scanner</i>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="e.g., 8x10 ft or 2x3 m"
                value={formData.size || ''}
                onChange={(e) => handleInputChange('size', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Finished GSM</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="Enter finished GSM"
                value={formData.finishedGSM || ''}
                onChange={(e) => handleInputChange('finishedGSM', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unfinished GSM</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="Enter unfinished GSM"
                value={formData.unfinishedGSM || ''}
                onChange={(e) => handleInputChange('unfinishedGSM', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type of Dyeing</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={formData.typeOfDyeing || ''}
                onChange={(e) => handleInputChange('typeOfDyeing', e.target.value)}
              >
                <option value="">Select Dyeing Type</option>
                {DYEING_TYPE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contractor/Inhouse Toggle Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-4">Work Assignment</h4>
            <div className="space-y-4">
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="contractorType" 
                    value="contractor" 
                    className="text-blue-600 focus:ring-blue-600"
                    checked={formData.contractorType === 'contractor'}
                    onChange={(e) => handleInputChange('contractorType', e.target.value)}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Contractor</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="contractorType" 
                    value="inhouse" 
                    className="text-blue-600 focus:ring-blue-600"
                    checked={formData.contractorType === 'inhouse'}
                    onChange={(e) => handleInputChange('contractorType', e.target.value)}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">In-house</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.contractorType === 'contractor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contractor Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      placeholder="Enter contractor name"
                      value={formData.contractorName || ''}
                      onChange={(e) => handleInputChange('contractorName', e.target.value)}
                    />
                  </div>
                )}
                
                {formData.contractorType === 'inhouse' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weaver Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      placeholder="Enter weaver name"
                      value={formData.weaverName || ''}
                      onChange={(e) => handleInputChange('weaverName', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Submitted By</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                  placeholder="Enter submitter name"
                  value={formData.submittedBy || ''}
                  onChange={(e) => handleInputChange('submittedBy', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reed No./Quality</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                  placeholder="Enter reed number/quality"
                  value={formData.reedNoQuality || ''}
                  onChange={(e) => handleInputChange('reedNoQuality', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Washing?</label>
                <div className="flex space-x-4 mb-3">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="hasWashing" 
                      value="yes" 
                      className="text-blue-600 focus:ring-blue-600"
                      checked={formData.hasWashing === 'yes'}
                      onChange={(e) => handleInputChange('hasWashing', e.target.value)}
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="hasWashing" 
                      value="no" 
                      className="text-blue-600 focus:ring-blue-600"
                      checked={formData.hasWashing === 'no'}
                      onChange={(e) => handleInputChange('hasWashing', e.target.value)}
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
                {formData.hasWashing === 'yes' && (
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                    placeholder="Enter washing contractor name"
                    value={formData.washingContractor || ''}
                    onChange={(e) => handleInputChange('washingContractor', e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Calculation Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <i className="material-icons text-xl mr-2 text-orange-600">calculate</i>
            Cost Calculation
          </h3>

          {/* Material Database Integration */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-3">Material Selection</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warp/Weft</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  value={selectedMaterialType}
                  onChange={(e) => setSelectedMaterialType(e.target.value as 'warp' | 'weft' | '')}
                >
                  <option value="">Select Type</option>
                  <option value="warp">Warp</option>
                  <option value="weft">Weft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  disabled={!selectedMaterialType}
                >
                  <option value="">Select Material</option>
                  {getFilteredMaterials().map(material => (
                    <option key={material.id} value={material.id}>{material.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <button 
                  type="button" 
                  className="mt-7 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  onClick={addMaterial}
                >
                  <i className="material-icons text-sm mr-1">add</i>
                  Add Material
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Material Rows */}
          <div className="space-y-4 mb-6">
            {(formData.materials || []).map((material, index) => (
              <div key={material.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-sm font-medium text-gray-900">Material #{index + 1}</h5>
                  <button 
                    type="button" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => removeMaterial(index)}
                  >
                    <i className="material-icons text-sm">delete</i>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Material Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      placeholder="Enter material name"
                      value={material.name}
                      onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Consumption (per SqM)</label>
                    <input 
                      type="number" 
                      step="0.001" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      placeholder="0.000"
                      value={material.consumption}
                      onChange={(e) => updateMaterial(index, 'consumption', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Material Rate (per KG)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      placeholder="0.00"
                      value={material.rate}
                      onChange={(e) => updateMaterial(index, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Dyeing Cost (per KG)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      placeholder="0.00"
                      value={material.dyeingCost}
                      onChange={(e) => updateMaterial(index, 'dyeingCost', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-sm font-medium text-gray-700">
                    Material Cost per SqM: ₹{material.costPerSqM.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            {(!formData.materials || formData.materials.length === 0) && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <i className="material-icons text-4xl text-gray-400 mb-2">add_circle_outline</i>
                <p className="text-gray-500 mb-4">No materials added yet</p>
                <button 
                  type="button" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto transition-colors"
                  onClick={addMaterial}
                >
                  <i className="material-icons text-sm mr-1">add</i>
                  Add First Material
                </button>
              </div>
            )}
          </div>

          {/* Process Costs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weaving Cost (per SqM)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="0.00"
                value={formData.weavingCost || ''}
                onChange={(e) => handleInputChange('weavingCost', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Finishing Cost (per SqM)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="0.00"
                value={formData.finishingCost || ''}
                onChange={(e) => handleInputChange('finishingCost', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Packing/Forwarding (per SqM)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="0.00"
                value={formData.packingCost || ''}
                onChange={(e) => handleInputChange('packingCost', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Percentage Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overhead Percentage (%)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="0.00"
                value={formData.overheadPercentage || ''}
                onChange={(e) => handleInputChange('overheadPercentage', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profit Percentage (%)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="0.00"
                value={formData.profitPercentage || ''}
                onChange={(e) => handleInputChange('profitPercentage', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Cost Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="block text-gray-600">Total Material Cost (per SqM)</span>
                <span className="text-lg font-bold text-blue-600">₹{(formData.totalMaterialCost || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-gray-600">Total Direct Cost (per SqM)</span>
                <span className="text-lg font-bold text-blue-600">₹{(formData.totalDirectCost || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-gray-600">Final Cost (PSM)</span>
                <span className="text-lg font-bold text-green-600">₹{(formData.finalCostPSM || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-gray-600">Total Rug Cost</span>
                <span className="text-xl font-bold text-orange-600">₹{(formData.totalRugCost || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Process Flow Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <button 
            type="button" 
            className="w-full flex justify-between items-center text-lg font-medium text-gray-900 mb-4"
            onClick={() => setShowProcessFlow(!showProcessFlow)}
          >
            <span className="flex items-center">
              <i className="material-icons text-xl mr-2 text-blue-600">timeline</i>
              Process Flow Details
            </span>
            <i className="material-icons text-gray-400">
              {showProcessFlow ? 'expand_less' : 'expand_more'}
            </i>
          </button>
          
          {showProcessFlow && (
            <div>
              <p className="text-sm text-gray-600 mb-4">Enter the step order for each process (1, 2, 3...)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PROCESS_NAMES.map(processName => {
                  const process = (formData.processFlow || []).find(p => p.process === processName);
                  return (
                    <div key={processName} className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700 flex-1">{processName}</span>
                      <input 
                        type="number" 
                        min="0" 
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                        placeholder="0"
                        value={process?.step || ''}
                        onChange={(e) => handleProcessFlowChange(processName, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Image Upload Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <button 
            type="button" 
            className="w-full flex justify-between items-center text-lg font-medium text-gray-900 mb-4"
            onClick={() => setShowImageUpload(!showImageUpload)}
          >
            <span className="flex items-center">
              <i className="material-icons text-xl mr-2 text-blue-600">photo_camera</i>
              Image Details
            </span>
            <i className="material-icons text-gray-400">
              {showImageUpload ? 'expand_less' : 'expand_more'}
            </i>
          </button>
          
          {showImageUpload && (
            <div>
              <p className="text-sm text-gray-600 mb-4">Upload images (max 750KB each). Images will be converted to Base64 and stored.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { key: 'rugPhoto', label: 'Rug Photo', icon: 'add_photo_alternate' },
                  { key: 'shadeCard', label: 'Shade Card Photo', icon: 'palette' },
                  { key: 'backPhoto', label: 'Back Photo', icon: 'flip_to_back' },
                  { key: 'masterHank', label: 'Master Hank Photo', icon: 'gesture' },
                  { key: 'masterSample', label: 'Photo with Master Sample', icon: 'compare' }
                ].map(({ key, label, icon }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-600 transition-colors cursor-pointer">
                      <i className="material-icons text-3xl text-gray-400 mb-2">{icon}</i>
                      <p className="text-sm text-gray-500">Click to upload</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(key, file);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>

      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={(barcode) => {
          handleInputChange('carpetNo', barcode);
          setShowBarcodeScanner(false);
        }}
      />

      <CustomModal
        isOpen={modal.show}
        title={modal.title}
        message={modal.message}
        type={modal.type as any}
        onCancel={() => setModal({ show: false, type: '', title: '', message: '' })}
        onConfirm={() => setModal({ show: false, type: '', title: '', message: '' })}
      />
    </div>
  );
};

export default RugForm;
