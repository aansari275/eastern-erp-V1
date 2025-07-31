import React, { useState } from 'react';
import { Rug } from '../types/rug';
import CustomModal from './CustomModal';

interface RugListProps {
  rugs: Rug[];
  onEdit: (rug: Rug) => void;
  onDelete: (rugId: string) => Promise<void>;
}

const RugList: React.FC<RugListProps> = ({ rugs, onEdit, onDelete }) => {
  const [modal, setModal] = useState<{
    show: boolean;
    type: string;
    title: string;
    message: string;
    rugId?: string;
  }>({ show: false, type: '', title: '', message: '' });

  const handleDeleteClick = (rugId: string, designName: string) => {
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
      } catch (error) {
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

  return (
    <div className="bg-white rounded-lg shadow-md mt-6 sm:mt-8">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <i className="material-icons text-xl mr-2 text-blue-600">inventory</i>
          Recent Rugs ({rugs.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {rugs.slice(0, 10).map(rug => ( // Show only latest 10 rugs
          <div key={rug.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3">
                  {/* Rug Image */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {rug.images?.rugPhoto ? (
                      <img 
                        src={rug.images.rugPhoto} 
                        alt={rug.designName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="material-icons text-gray-400 text-base sm:text-lg">photo</i>
                      </div>
                    )}
                  </div>

                  {/* Rug Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="text-lg font-medium text-gray-900 truncate">{rug.designName}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {rug.construction}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Size:</span> {rug.size || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">OPS:</span> {rug.opsNo || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Carpet #:</span> {rug.carpetNo || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Buyer:</span> {rug.buyerName || 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 mt-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">Cost/SqM:</span>
                        <span className="font-medium text-green-600">₹{rug.finalCostPSM?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-medium text-orange-600">₹{rug.totalRugCost?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">Area:</span>
                        <span className="text-gray-700">{rug.area?.toFixed(2) || '0'} SqM</span>
                      </div>
                      {rug.contractorType === 'contractor' ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Contractor:</span>
                          <span className="text-gray-700">{rug.contractorName || 'N/A'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Weaver:</span>
                          <span className="text-gray-700">{rug.weaverName || 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Process Flow Preview */}
                {rug.processFlow && rug.processFlow.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-gray-500 mr-2">Process:</span>
                      {rug.processFlow
                        .sort((a, b) => a.step - b.step)
                        .slice(0, 5) // Show only first 5 processes
                        .map((process, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {process.step}. {process.process}
                          </span>
                        ))}
                      {rug.processFlow.length > 5 && (
                        <span className="text-xs text-gray-500">+{rug.processFlow.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                <button 
                  className="inline-flex items-center justify-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                  onClick={() => onEdit(rug)}
                >
                  <i className="material-icons text-sm mr-1">edit</i>
                  Edit
                </button>
                <button 
                  className="inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                  onClick={() => handleDeleteClick(rug.id!, rug.designName)}
                >
                  <i className="material-icons text-sm mr-1">delete</i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rugs.length > 10 && (
        <div className="p-4 text-center border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing latest 10 rugs. Total: {rugs.length} rugs created.
          </p>
        </div>
      )}

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

export default RugList;