import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronRight, Database, RefreshCw, Eye } from 'lucide-react';
const FirebaseDatabaseViewer = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedCollections, setExpandedCollections] = useState(new Set());
    const [expandedDocuments, setExpandedDocuments] = useState(new Set());
    const collectionNames = [
        'users', 'rugs', 'materials', 'buyers', 'articleNumbers',
        'buyerArticlesNo', 'pdocs', 'dwp', 'testReports', 'labels',
        'quotes', 'qualityInspections', 'departments', 'roles', 'permissions'
    ];
    const fetchCollectionData = async () => {
        setLoading(true);
        try {
            const collectionData = [];
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
                    }
                    else {
                        collectionData.push({
                            name: collectionName,
                            count: 0,
                            documents: []
                        });
                    }
                }
                catch (error) {
                    console.error(`Error fetching ${collectionName}:`, error);
                    collectionData.push({
                        name: collectionName,
                        count: 0,
                        documents: []
                    });
                }
            }
            setCollections(collectionData);
        }
        catch (error) {
            console.error('Error fetching collections:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCollectionData();
    }, []);
    const toggleCollection = (collectionName) => {
        const newExpanded = new Set(expandedCollections);
        if (newExpanded.has(collectionName)) {
            newExpanded.delete(collectionName);
        }
        else {
            newExpanded.add(collectionName);
        }
        setExpandedCollections(newExpanded);
    };
    const toggleDocument = (docId) => {
        const newExpanded = new Set(expandedDocuments);
        if (newExpanded.has(docId)) {
            newExpanded.delete(docId);
        }
        else {
            newExpanded.add(docId);
        }
        setExpandedDocuments(newExpanded);
    };
    const formatValue = (value) => {
        if (value === null || value === undefined)
            return 'null';
        if (typeof value === 'object') {
            if (value._seconds) {
                // Firestore timestamp
                return new Date(value._seconds * 1000).toLocaleString();
            }
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };
    const renderDocumentContent = (doc, docId) => {
        return (_jsx("div", { className: "space-y-2 pl-6 border-l-2 border-gray-200", children: Object.entries(doc).map(([key, value]) => (_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Badge, { variant: "outline", className: "text-xs min-w-0 max-w-32 truncate", children: key }), _jsx("div", { className: "flex-1 text-sm font-mono text-gray-700 break-all", children: formatValue(value) })] }, key))) }));
    };
    return (_jsxs(Card, { className: "w-full max-w-6xl mx-auto", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Database, { className: "h-5 w-5" }), _jsx(CardTitle, { children: "Firebase Database Viewer" })] }), _jsxs(Button, { onClick: fetchCollectionData, disabled: loading, variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}` }), "Refresh"] })] }) }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "overview", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "detailed", children: "Detailed View" })] }), _jsx(TabsContent, { value: "overview", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: collections.map((collection) => (_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold capitalize", children: collection.name }), _jsxs(Badge, { variant: collection.count > 0 ? "default" : "secondary", children: [collection.count, " docs"] })] }), _jsxs("p", { className: "text-sm text-gray-600 mt-2", children: ["Collection: ", collection.name] })] }, collection.name))) }) }), _jsx(TabsContent, { value: "detailed", children: _jsx(ScrollArea, { className: "h-[600px] w-full", children: _jsx("div", { className: "space-y-4", children: collections.map((collection) => (_jsx(Card, { children: _jsxs(Collapsible, { open: expandedCollections.has(collection.name), onOpenChange: () => toggleCollection(collection.name), children: [_jsx(CollapsibleTrigger, { asChild: true, children: _jsx(CardHeader, { className: "cursor-pointer hover:bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [expandedCollections.has(collection.name) ? (_jsx(ChevronDown, { className: "h-4 w-4" })) : (_jsx(ChevronRight, { className: "h-4 w-4" })), _jsx(CardTitle, { className: "capitalize", children: collection.name })] }), _jsxs(Badge, { variant: collection.count > 0 ? "default" : "secondary", children: [collection.count, " documents"] })] }) }) }), _jsx(CollapsibleContent, { children: _jsx(CardContent, { children: collection.documents.length === 0 ? (_jsx("p", { className: "text-gray-500 italic", children: "No documents in this collection" })) : (_jsxs("div", { className: "space-y-3", children: [collection.documents.slice(0, 10).map((doc, index) => {
                                                                    const docId = `${collection.name}-${doc.id || index}`;
                                                                    return (_jsxs(Collapsible, { open: expandedDocuments.has(docId), onOpenChange: () => toggleDocument(docId), children: [_jsx(CollapsibleTrigger, { asChild: true, children: _jsxs("div", { className: "flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50", children: [expandedDocuments.has(docId) ? (_jsx(ChevronDown, { className: "h-3 w-3" })) : (_jsx(ChevronRight, { className: "h-3 w-3" })), _jsx("span", { className: "font-mono text-sm", children: doc.id || `doc_${index}` }), _jsx(Eye, { className: "h-3 w-3 ml-auto" })] }) }), _jsx(CollapsibleContent, { children: renderDocumentContent(doc, docId) })] }, docId));
                                                                }), collection.documents.length > 10 && (_jsxs("p", { className: "text-sm text-gray-500 text-center", children: ["... and ", collection.documents.length - 10, " more documents"] }))] })) }) })] }) }, collection.name))) }) }) })] }) })] }));
};
export default FirebaseDatabaseViewer;
