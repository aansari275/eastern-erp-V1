import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { Package, Edit2, Search, Filter, FileText, Palette, Ruler } from 'lucide-react';

interface ArticleNumber {
  id: string;
  buyerId: string;
  rugId?: string;
  articleNumber: string;
  buyerArticleCode: string;
  designName: string;
  color: string;
  size: string;
  construction: string;
  quality: string;
  unitPrice?: number;
  currency: string;
  leadTime: string;
  minimumOrder?: number;
  notes: string;
  isActive: boolean;
}

interface Buyer {
  id: string;
  name: string;
  code: string;
}

interface ArticleNumberDisplayProps {
  buyerId: string;
  buyerCode: string;
  buyerName: string;
}

export function ArticleNumberDisplay({ buyerId, buyerCode, buyerName }: ArticleNumberDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [constructionFilter, setConstructionFilter] = useState('');

  // Fetch article numbers for this buyer
  const { data: articleNumbers = [], isLoading } = useQuery({
    queryKey: ['/api/article-numbers', buyerId],
    queryFn: async () => {
      const response = await fetch(`/api/article-numbers/buyer/${buyerId}`);
      if (!response.ok) throw new Error('Failed to fetch article numbers');
      const data = await response.json();
      
      // Remove duplicates based on design+color+size+construction
      const seen = new Set<string>();
      const uniqueArticles = data.filter((article: ArticleNumber) => {
        const uniqueKey = `${article.designName}-${article.color}-${article.size}-${article.construction}`.toLowerCase();
        if (seen.has(uniqueKey)) {
          return false;
        }
        seen.add(uniqueKey);
        return true;
      });
      
      return uniqueArticles;
    },
  });

  // Filter article numbers based on search and construction
  const filteredArticles = articleNumbers.filter((article: ArticleNumber) => {
    const matchesSearch = 
      article.designName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.size?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.articleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesConstruction = 
      !constructionFilter || article.construction === constructionFilter;
    
    return matchesSearch && matchesConstruction;
  });

  // Get unique constructions for filter
  const constructions = [...new Set(articleNumbers.map((a: ArticleNumber) => a.construction).filter(Boolean))];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-center text-gray-500">Loading article numbers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package className="h-4 w-4 mr-2" />
          {isLoading ? 'Loading...' : `${articleNumbers.length} Articles`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Article Numbers for {buyerName} ({buyerCode})</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by design, color, size, or article number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={constructionFilter}
                onChange={(e) => setConstructionFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Constructions</option>
                {constructions.map(construction => (
                  <option key={construction} value={construction}>
                    {construction}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredArticles.length} of {articleNumbers.length} article numbers
            </p>
            <Badge variant="outline">
              {constructions.length} different constructions
            </Badge>
          </div>

          {/* Article Numbers List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || constructionFilter ? 'No article numbers match your filters' : 'No article numbers found'}
              </div>
            ) : (
              filteredArticles.map((article: ArticleNumber) => (
                <Card key={article.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Design Information */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">Design Details</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Design:</strong> {article.designName || 'Not specified'}</p>
                          <p><strong>Construction:</strong> {article.construction || 'Not specified'}</p>
                          <p><strong>Quality:</strong> {article.quality || 'TBD'}</p>
                        </div>
                      </div>

                      {/* Color and Size */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Palette className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">Specifications</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Color:</strong> {article.color || 'Not specified'}</p>
                          <p><strong>Size:</strong> {article.size || 'Not specified'}</p>
                          <p><strong>Currency:</strong> {article.currency}</p>
                        </div>
                      </div>

                      {/* Article Codes */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Ruler className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-sm">Article Codes</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Article #:</strong> 
                            <span className="ml-2">
                              {article.articleNumber ? (
                                <Badge variant="secondary">{article.articleNumber}</Badge>
                              ) : (
                                <Badge variant="outline">Manual Entry Required</Badge>
                              )}
                            </span>
                          </p>
                          <p><strong>Buyer Code:</strong> {article.buyerArticleCode || 'TBD'}</p>
                          {article.unitPrice && (
                            <p><strong>Unit Price:</strong> {article.unitPrice} {article.currency}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {article.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-600">
                          <strong>Notes:</strong> {article.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              💡 <strong>Next steps:</strong> Fill in article number codes for OPS auto-population
            </div>
            <Button variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Manage Article Numbers
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}