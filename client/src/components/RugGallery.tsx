import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { useToast } from '../hooks/use-toast';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  Search, 
  Filter, 
  Package, 
  Calendar,
  User,
  Palette,
  Maximize,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Grid3X3,
  List,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { CONSTRUCTION_OPTIONS, COLOR_PALETTE } from '../types/rug.js';

// TypeScript interfaces
interface Rug {
  id: string;
  articleNumber: string;
  buyerCode: string;
  construction: string;
  designName: string;
  colour: string;
  size: string;
  material: string;
  description?: string;
  status: 'Draft' | 'Active' | 'Inactive' | 'Archived';
  images: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdByEmail?: string;
  createdByName?: string;
}

interface FilterState {
  search: string;
  status: string;
  construction: string;
  buyerCode: string;
  colour: string;
}

interface RugGalleryProps {
  className?: string;
}

const RugGallery: React.FC<RugGalleryProps> = ({ className = "" }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [rugs, setRugs] = useState<Rug[]>([]);
  const [filteredRugs, setFilteredRugs] = useState<Rug[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    construction: '',
    buyerCode: '',
    colour: ''
  });

  // Real-time listener for rugs
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const rugsCollection = collection(db, 'rugs');
    const q = query(
      rugsCollection,
      where('createdBy', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rugData: Rug[] = [];
        snapshot.forEach((doc) => {
          rugData.push({ id: doc.id, ...doc.data() } as Rug);
        });
        
        setRugs(rugData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching rugs:', error);
        toast({
          title: "Error loading rugs",
          description: "Failed to load rug data. Please refresh the page.",
          variant: "destructive"
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  // Apply filters
  useEffect(() => {
    let filtered = rugs;

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(rug => 
        rug.designName.toLowerCase().includes(searchTerm) ||
        rug.articleNumber.toLowerCase().includes(searchTerm) ||
        rug.colour.toLowerCase().includes(searchTerm) ||
        rug.material.toLowerCase().includes(searchTerm) ||
        rug.buyerCode.toLowerCase().includes(searchTerm) ||
        (rug.description && rug.description.toLowerCase().includes(searchTerm))
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(rug => rug.status === filters.status);
    }

    // Construction filter
    if (filters.construction) {
      filtered = filtered.filter(rug => rug.construction === filters.construction);
    }

    // Buyer code filter
    if (filters.buyerCode) {
      filtered = filtered.filter(rug => 
        rug.buyerCode.toLowerCase().includes(filters.buyerCode.toLowerCase())
      );
    }

    // Colour filter
    if (filters.colour) {
      filtered = filtered.filter(rug => rug.colour === filters.colour);
    }

    setFilteredRugs(filtered);
  }, [rugs, filters]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handle rug deletion
  const handleDeleteRug = async (rugId: string, articleNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete rug "${articleNumber}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'rugs', rugId));
      toast({
        title: "Rug deleted",
        description: `Rug "${articleNumber}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting rug:', error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete the rug. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      construction: '',
      buyerCode: '',
      colour: ''
    });
  }, []);

  // Get unique buyer codes from rugs
  const uniqueBuyerCodes = [...new Set(rugs.map(rug => rug.buyerCode))].sort();

  // Status badge styling
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Draft': return 'secondary';
      case 'Inactive': return 'outline';
      case 'Archived': return 'secondary';
      default: return 'secondary';
    }
  };

  // Format date
  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get color hex value
  const getColorHex = (colorName: string) => {
    return COLOR_PALETTE.find(c => c.name === colorName)?.hex || '#gray';
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
        <p className="text-gray-500">Please sign in to view your rug gallery.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rug Gallery</h2>
          <p className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${filteredRugs.length} of ${rugs.length} rugs`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search rugs..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Construction */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Construction</label>
                <Select value={filters.construction} onValueChange={(value) => handleFilterChange('construction', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All constructions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All constructions</SelectItem>
                    {CONSTRUCTION_OPTIONS.map(construction => (
                      <SelectItem key={construction} value={construction}>
                        {construction}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Buyer Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Buyer Code</label>
                <Select value={filters.buyerCode} onValueChange={(value) => handleFilterChange('buyerCode', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All buyers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All buyers</SelectItem>
                    {uniqueBuyerCodes.map(buyerCode => (
                      <SelectItem key={buyerCode} value={buyerCode}>
                        {buyerCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Colour */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Colour</label>
                <Select value={filters.colour} onValueChange={(value) => handleFilterChange('colour', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All colours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All colours</SelectItem>
                    {COLOR_PALETTE.map(color => (
                      <SelectItem key={color.name} value={color.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Clear Filters */}
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading rugs...</span>
        </div>
      ) : filteredRugs.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {rugs.length === 0 ? 'No rugs found' : 'No matching rugs'}
          </h3>
          <p className="text-gray-500 mb-4">
            {rugs.length === 0 
              ? 'Create your first rug to get started' 
              : 'Try adjusting your filters to see more results'
            }
          </p>
          {rugs.length === 0 && (
            <Button onClick={() => window.history.back()}>
              <Package className="h-4 w-4 mr-2" />
              Create Your First Rug
            </Button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredRugs.map((rug) => (
            <Card key={rug.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {rug.images && rug.images.length > 0 ? (
                      <img 
                        src={rug.images[0]} 
                        alt={rug.designName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Image count badge */}
                    {rug.images && rug.images.length > 0 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {rug.images.length} image{rug.images.length !== 1 ? 's' : ''}
                      </div>
                    )}
                    
                    {/* Status badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant={getStatusBadgeVariant(rug.status)}>
                        {rug.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Title and Article Number */}
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{rug.designName}</h3>
                        <p className="text-sm text-gray-600">{rug.articleNumber}</p>
                      </div>
                      
                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-medium">{rug.size}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Construction:</span>
                          <span className="font-medium text-xs">{rug.construction}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Material:</span>
                          <span className="font-medium text-xs">{rug.material}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Buyer:</span>
                          <span className="font-medium">{rug.buyerCode}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Colour:</span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{ backgroundColor: getColorHex(rug.colour) }}
                            />
                            <span className="font-medium text-xs">{rug.colour}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Date */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t">
                        <Calendar className="h-3 w-3" />
                        <span>Created {formatDate(rug.createdAt)}</span>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteRug(rug.id, rug.articleNumber)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                // List View
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {rug.images && rug.images.length > 0 ? (
                        <img 
                          src={rug.images[0]} 
                          alt={rug.designName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{rug.designName}</h3>
                          <p className="text-sm text-gray-600">{rug.articleNumber}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>{rug.size}</span>
                            <span>{rug.construction}</span>
                            <span>{rug.buyerCode}</span>
                            <div className="flex items-center gap-1">
                              <div 
                                className="w-3 h-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: getColorHex(rug.colour) }}
                              />
                              <span>{rug.colour}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={getStatusBadgeVariant(rug.status)}>
                            {rug.status}
                          </Badge>
                          
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteRug(rug.id, rug.articleNumber)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RugGallery;