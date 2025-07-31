import React from 'react';

interface CustomModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'error' | 'confirm';
  onConfirm?: () => void;
  onCancel: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  title,
  message,
  type,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'error';
      case 'confirm':
        return 'help';
      default:
        return 'info';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'confirm':
        return 'bg-orange-600 hover:bg-orange-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <i className={`material-icons text-2xl mr-3 ${
              type === 'error' ? 'text-red-500' : 
              type === 'confirm' ? 'text-orange-500' : 'text-blue-500'
            }`}>
              {getIcon()}
            </i>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button 
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              onClick={onCancel}
            >
              {type === 'confirm' ? 'Cancel' : 'Close'}
            </button>
            {(type === 'confirm' || type === 'error') && onConfirm && (
              <button 
                className={`px-4 py-2 text-white rounded-lg transition-colors ${getButtonColor()}`}
                onClick={onConfirm}
              >
                {type === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
