
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronRight, Database, RefreshCw, Eye, Edit } from 'lucide-react';

interface DocumentData {
  [key: string]: any;
}

interface CollectionInfo {
  name: string;
  count: number;
  documents: DocumentData[];
}

const FirebaseDatabaseViewer: React.FC = () => {
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set());

  const collectionNames = [
    'users', 'rugs', 'materials', 'buyers', 'articleNumbers', 
    'buyerArticlesNo', 'pdocs', 'dwp', 'testReports', 'labels', 
    'quotes', 'qualityInspections', 'departments', 'roles', 'permissions'
  ];

  const fetchCollectionData = async () => {
    setLoading(true);
    try {
      const collectionData: CollectionInfo[] = [];
      
      for (const collectionName of collectionNames) {
        try {
          const response = await fetch(`/api/firebase-collections/${collectionName}`);
          if (response.ok) {
            const data = await response.json();
            collectionData.push({
              name: collectionName,
              count: data.documents?.length || 0,
              documents: data.documents || []
            });
          } else {
            collectionData.push({
              name: collectionName,
              count: 0,
              documents: []
            });
          }
        } catch (error) {
          console.error(`Error fetching ${collectionName}:`, error);
          collectionData.push({
            name: collectionName,
            count: 0,
            documents: []
          });
        }
      }
      
      setCollections(collectionData);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionData();
  }, []);

  const toggleCollection = (collectionName: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionName)) {
      newExpanded.delete(collectionName);
    } else {
      newExpanded.add(collectionName);
    }
    setExpandedCollections(newExpanded);
  };

  const toggleDocument = (docId: string) => {
    const newExpanded = new Set(expandedDocuments);
    if (newExpanded.has(docId)) {
      newExpanded.delete(docId);
    } else {
      newExpanded.add(docId);
    }
    setExpandedDocuments(newExpanded);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') {
      if (value._seconds) {
        // Firestore timestamp
        return new Date(value._seconds * 1000).toLocaleString();
      }
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const renderDocumentContent = (doc: DocumentData, docId: string) => {
    return (
      <div className="space-y-2 pl-6 border-l-2 border-gray-200">
        {Object.entries(doc).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2">
            <Badge variant="outline" className="text-xs min-w-0 max-w-32 truncate">
              {key}
            </Badge>
            <div className="flex-1 text-sm font-mono text-gray-700 break-all">
              {formatValue(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Firebase Database Viewer</CardTitle>
          </div>
          <Button
            onClick={fetchCollectionData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((collection) => (
                <Card key={collection.name} className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold capitalize">{collection.name}</h3>
                    <Badge variant={collection.count > 0 ? "default" : "secondary"}>
                      {collection.count} docs
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Collection: {collection.name}
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="detailed">
            <ScrollArea className="h-[600px] w-full">
              <div className="space-y-4">
                {collections.map((collection) => (
                  <Card key={collection.name}>
                    <Collapsible
                      open={expandedCollections.has(collection.name)}
                      onOpenChange={() => toggleCollection(collection.name)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {expandedCollections.has(collection.name) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <CardTitle className="capitalize">{collection.name}</CardTitle>
                            </div>
                            <Badge variant={collection.count > 0 ? "default" : "secondary"}>
                              {collection.count} documents
                            </Badge>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent>
                          {collection.documents.length === 0 ? (
                            <p className="text-gray-500 italic">No documents in this collection</p>
                          ) : (
                            <div className="space-y-3">
                              {collection.documents.slice(0, 10).map((doc, index) => {
                                const docId = `${collection.name}-${doc.id || index}`;
                                return (
                                  <Collapsible
                                    key={docId}
                                    open={expandedDocuments.has(docId)}
                                    onOpenChange={() => toggleDocument(docId)}
                                  >
                                    <CollapsibleTrigger asChild>
                                      <div className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                                        {expandedDocuments.has(docId) ? (
                                          <ChevronDown className="h-3 w-3" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3" />
                                        )}
                                        <span className="font-mono text-sm">
                                          {doc.id || `doc_${index}`}
                                        </span>
                                        <Eye className="h-3 w-3 ml-auto" />
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      {renderDocumentContent(doc, docId)}
                                    </CollapsibleContent>
                                  </Collapsible>
                                );
                              })}
                              {collection.documents.length > 10 && (
                                <p className="text-sm text-gray-500 text-center">
                                  ... and {collection.documents.length - 10} more documents
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FirebaseDatabaseViewer;
