import React, { useState, useRef, useEffect } from 'react';
import { MaterialDatabaseItem } from '../types/rug';

interface MaterialSearchDropdownProps {
  materials: MaterialDatabaseItem[];
  value: string;
  onChange: (material: MaterialDatabaseItem | null, materialName: string) => void;
  placeholder?: string;
  type: 'warp' | 'weft';
}

const MaterialSearchDropdown: React.FC<MaterialSearchDropdownProps> = ({
  materials,
  value,
  onChange,
  placeholder = "Search materials...",
  type
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialDatabaseItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter materials by type and search term
  useEffect(() => {
    console.log(`Filtering materials: Total=${materials.length}, Type=${type}`);
    const typedMaterials = materials.filter(m => m.type === type);
    console.log(`${type} materials found:`, typedMaterials.length);
    
    if (!searchTerm.trim()) {
      const displayMaterials = typedMaterials.slice(0, 100); // Show first 100 when no search
      setFilteredMaterials(displayMaterials);
      console.log(`Showing ${displayMaterials.length} ${type} materials without search`);
    } else {
      const filtered = typedMaterials.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.supplier || '').toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 50); // Show first 50 search results
      setFilteredMaterials(filtered);
      console.log(`Search "${searchTerm}" found ${filtered.length} ${type} materials`);
    }
  }, [materials, searchTerm, type]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(null, newValue); // Allow typing custom material name
    setIsOpen(true);
  };

  const handleMaterialSelect = (material: MaterialDatabaseItem) => {
    setSearchTerm(material.name);
    setIsOpen(false);
    onChange(material, material.name);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchTerm(value || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
        placeholder={placeholder}
        value={isOpen ? searchTerm : (value || '')}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      
      {/* Search/dropdown icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <i className="material-icons text-gray-400 text-sm">
          {isOpen ? 'expand_less' : 'search'}
        </i>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchTerm && filteredMaterials.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No materials found. You can type a custom material name.
            </div>
          )}
          
          {filteredMaterials.length > 0 && (
            <>
              {searchTerm && (
                <div className="px-3 py-1 text-xs text-gray-400 border-b border-gray-100">
                  {filteredMaterials.length} results found
                </div>
              )}
              
              {filteredMaterials.map((material, index) => (
                <div
                  key={`${material.id}_${index}`}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                  onClick={() => handleMaterialSelect(material)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {material.name}
                      </div>
                      {material.supplier && (
                        <div className="text-xs text-gray-500 truncate">
                          {material.supplier}
                        </div>
                      )}
                    </div>
                    <div className="ml-2 text-xs text-green-600 font-medium flex-shrink-0">
                      ₹{material.rate.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
              
              {!searchTerm && materials.filter(m => m.type === type).length > 100 && (
                <div className="px-3 py-2 text-xs text-gray-400 bg-gray-50">
                  Type to search more materials... ({materials.filter(m => m.type === type).length} total available)
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialSearchDropdown;