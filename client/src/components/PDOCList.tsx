import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Eye, Edit, FileText, Calendar, User, Package, TestTube, Tag, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import EnhancedPDOCForm from "./EnhancedPDOCForm";

interface PDOC {
  id: number;
  pdocNumber: string;
  buyerId: number;
  buyerProductDesignCode: string;
  ted: string;
  productType: string;
  pdocStatus: string;
  createdAt: string;
  updatedAt: string;
  // Add more fields as needed
}

const PDOCList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPDOC, setSelectedPDOC] = useState<PDOC | null>(null);

  const { data: pdocs = [], isLoading, error } = useQuery({
    queryKey: ['/api/pdocs'],
    queryFn: async () => {
      const response = await fetch('/api/pdocs');
      if (!response.ok) {
        throw new Error('Failed to fetch PDOCs');
      }
      return response.json();
    },
  });

  const filteredPDOCs = pdocs.filter((pdoc: PDOC) =>
    pdoc.pdocNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdoc.buyerProductDesignCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdoc.productType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error loading PDOCs</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search PDOCs by number, product code, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredPDOCs.length} of {pdocs.length} PDOCs
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Draft: {pdocs.filter((p: PDOC) => p.pdocStatus === 'draft').length}</Badge>
          <Badge variant="outline">Pending: {pdocs.filter((p: PDOC) => p.pdocStatus === 'pending').length}</Badge>
          <Badge variant="outline">Approved: {pdocs.filter((p: PDOC) => p.pdocStatus === 'approved').length}</Badge>
        </div>
      </div>

      {/* PDOC Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPDOCs.map((pdoc: PDOC) => (
          <Card key={pdoc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium line-clamp-1">
                  {pdoc.pdocNumber}
                </CardTitle>
                <Badge className={getStatusColor(pdoc.pdocStatus)}>
                  {pdoc.pdocStatus}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                {pdoc.buyerProductDesignCode}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Type:</span>
                  <span className="capitalize">{pdoc.productType}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Created:</span>
                  <span>{formatDate(pdoc.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Buyer ID:</span>
                  <span>{pdoc.buyerId}</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>PDOC: {pdoc.pdocNumber}</DialogTitle>
                    </DialogHeader>
                    <EnhancedPDOCForm pdoc={pdoc} />
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPDOCs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No PDOCs found matching your search.' : 'No PDOCs created yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PDOCList;