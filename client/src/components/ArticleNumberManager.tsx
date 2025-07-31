import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';

interface ArticleNumber {
  id: number;
  buyerId: number;
  rugId?: number;
  articleNumber: string;
  buyerArticleCode?: string;
  designName: string;
  color: string;
  size: string;
  construction: string;
  quality: string;
  unitPrice: number;
  currency: string;
  leadTime: string;
  minimumOrder?: number;
  notes?: string;
  isActive: boolean;
}

interface ArticleNumberManagerProps {
  buyerId: number;
  buyerName: string;
  buyerCode: string;
}

export function ArticleNumberManager({ buyerId, buyerName, buyerCode }: ArticleNumberManagerProps) {
  // Demo data - in real implementation, this would come from API
  const [articleNumbers, setArticleNumbers] = useState<ArticleNumber[]>([
    {
      id: 1,
      buyerId,
      articleNumber: `${buyerCode}/EM-25-MA-5202`,
      designName: "Vintage Persian Classic",
      color: "Navy Blue",
      size: "170x240",
      construction: "Hand Knotted",
      quality: "3/12",
      unitPrice: 285.50,
      currency: "USD",
      leadTime: "12-14 weeks",
      minimumOrder: 10,
      isActive: true
    },
    {
      id: 2,
      buyerId,
      articleNumber: `${buyerCode}/EM-25-MA-5202-B`,
      designName: "Vintage Persian Classic",
      color: "Burgundy",
      size: "200x300",
      construction: "Hand Knotted", 
      quality: "3/12",
      unitPrice: 425.75,
      currency: "USD",
      leadTime: "12-14 weeks",
      minimumOrder: 8,
      isActive: true
    },
    {
      id: 3,
      buyerId,
      articleNumber: `${buyerCode}/EM-25-MA-6103`,
      designName: "Modern Geometric Lines",
      color: "Charcoal",
      size: "160x230",
      construction: "Nepali",
      quality: "4/20",
      unitPrice: 195.25,
      currency: "USD",
      leadTime: "10-12 weeks",
      minimumOrder: 15,
      isActive: true
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Article Numbers</CardTitle>
            <Badge variant="secondary">{articleNumbers.length} SKUs</Badge>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Article Number
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Manage product specifications and pricing for {buyerName}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {showAddForm && (
          <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Article Number</Label>
                  <Input placeholder={`${buyerCode}/EM-25-MA-XXXX`} className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">Design Name</Label>
                  <Input placeholder="Design name" className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">Color</Label>
                  <Input placeholder="Color" className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">Size</Label>
                  <Input placeholder="170x240" className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">Construction</Label>
                  <Select>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hand-knotted">Hand Knotted</SelectItem>
                      <SelectItem value="nepali">Nepali</SelectItem>
                      <SelectItem value="tufted">Tufted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Quality</Label>
                  <Input placeholder="3/12" className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">Unit Price</Label>
                  <Input placeholder="285.50" type="number" className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">Lead Time</Label>
                  <Input placeholder="12-14 weeks" className="h-8" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button size="sm">Save Article Number</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {articleNumbers.map((article) => (
          <Card key={article.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                  <div>
                    <Label className="text-xs text-gray-500">Article Number</Label>
                    <p className="font-mono text-sm font-medium">{article.articleNumber}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Design</Label>
                    <p className="text-sm font-medium">{article.designName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Specifications</Label>
                    <p className="text-sm">
                      {article.color} • {article.size}
                    </p>
                    <p className="text-xs text-gray-600">
                      {article.construction} {article.quality}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Pricing & Lead Time</Label>
                    <p className="text-sm font-medium">
                      {article.currency} {article.unitPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {article.leadTime} • MOQ: {article.minimumOrder}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 ml-3">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {articleNumbers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No article numbers defined yet</p>
            <p className="text-xs">Add article numbers to enable automatic OPS population</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}