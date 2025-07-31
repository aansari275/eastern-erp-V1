import React, { useState } from 'react';
import { MaterialDatabaseItem } from '../types/rug';
import { useMaterials } from '../hooks/useMaterials';
import CustomModal from './CustomModal';

const MaterialDatabase: React.FC = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial, getWarpMaterials, getWeftMaterials } = useMaterials();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialDatabaseItem | null>(null);
  const [formData, setFormData] = useState<Partial<MaterialDatabaseItem>>({
    name: '',
    type: 'warp',
    rate: 0,
    dyeingCost: 0,
    description: ''
  });
  const [modal, setModal] = useState<{
    show: boolean;
    type: string;
    title: string;
    message: string;
    materialId?: string;
  }>({ show: false, type: '', title: '', message: '' });

  const handleInputChange = (field: string, value: any) => {
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
      } else {
        await addMaterial(formData as Omit<MaterialDatabaseItem, 'id'>);
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
    } catch (error) {
      setModal({
        show: true,
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save material. Please try again.'
      });
    }
  };

  const handleEdit = (material: MaterialDatabaseItem) => {
    setEditingMaterial(material);
    setFormData(material);
    setShowAddForm(true);
  };

  const handleDeleteClick = (materialId: string, materialName: string) => {
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
      } catch (error) {
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

  const MaterialCard: React.FC<{ material: MaterialDatabaseItem }> = ({ material }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{material.name}</h4>
          <p className="text-sm text-gray-600">{material.description}</p>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Rate:</span>
              <span className="font-medium"> ₹{material.rate.toFixed(2)}/kg</span>
            </div>
            <div>
              <span className="text-gray-500">Dyeing:</span>
              <span className="font-medium"> ₹{material.dyeingCost.toFixed(2)}/kg</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <button 
            className="text-blue-600 hover:text-blue-700"
            onClick={() => handleEdit(material)}
          >
            <i className="material-icons text-sm">edit</i>
          </button>
          <button 
            className="text-red-600 hover:text-red-700"
            onClick={() => handleDeleteClick(material.id, material.name)}
          >
            <i className="material-icons text-sm">delete</i>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">Material Database</h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          onClick={() => setShowAddForm(true)}
        >
          <i className="material-icons text-sm mr-1">add</i>
          Add Material
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingMaterial ? 'Edit Material' : 'Add New Material'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material Name *</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="Enter material name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={formData.type || 'warp'}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="warp">Warp</option>
                <option value="weft">Weft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rate (per KG)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="0.00"
                value={formData.rate || ''}
                onChange={(e) => handleInputChange('rate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dyeing Cost (per KG)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                placeholder="0.00"
                value={formData.dyeingCost || ''}
                onChange={(e) => handleInputChange('dyeingCost', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
              rows={2}
              placeholder="Enter material description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
          <div className="flex space-x-3">
            <button 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              onClick={handleSave}
            >
              <i className="material-icons text-sm mr-1">save</i>
              {editingMaterial ? 'Update' : 'Save'} Material
            </button>
            <button 
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              onClick={resetForm}
            >
              <i className="material-icons text-sm mr-1">close</i>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Warp Materials */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <i className="material-icons text-xl mr-2 text-blue-600">horizontal_rule</i>
            Warp Materials
          </h3>
          <div className="space-y-3">
            {getWarpMaterials().length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <i className="material-icons text-4xl text-gray-400 mb-2">inventory</i>
                <p className="text-gray-500">No warp materials added yet</p>
              </div>
            ) : (
              getWarpMaterials().map(material => (
                <MaterialCard key={material.id} material={material} />
              ))
            )}
          </div>
        </div>

        {/* Weft Materials */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <i className="material-icons text-xl mr-2 text-green-600">vertical_align_center</i>
            Weft Materials
          </h3>
          <div className="space-y-3">
            {getWeftMaterials().length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <i className="material-icons text-4xl text-gray-400 mb-2">inventory</i>
                <p className="text-gray-500">No weft materials added yet</p>
              </div>
            ) : (
              getWeftMaterials().map(material => (
                <MaterialCard key={material.id} material={material} />
              ))
            )}
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={modal.show}
        title={modal.title}
        message={modal.message}
        type={modal.type as any}
        onCancel={() => setModal({ show: false, type: '', title: '', message: '' })}
        onConfirm={modal.type === 'confirm' ? confirmDelete : undefined}
      />
    </div>
  );
};

export default MaterialDatabase;
