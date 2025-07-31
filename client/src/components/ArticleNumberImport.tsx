import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from '../hooks/use-toast';
import { Database, Download, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function ArticleNumberImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const response = await fetch('/api/article-numbers/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setImportResult(result);
        toast({
          title: "Import Successful",
          description: `${result.imported} article numbers imported successfully`,
        });
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Database className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle>Import Article Numbers from ERP</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Import unique article numbers from Microsoft SQL Database (vopslistdtl table)
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Import Source:</strong> vopslistdtl table with bo_id &gt; 1614
            <br />
            <strong>Mapping:</strong> b_code → buyer code, quality → construction, design → design name, colour → color, Fs5 → size
            <br />
            <strong>Note:</strong> Article number field will be left blank for manual entry. EMPL buyer codes will be ignored.
          </AlertDescription>
        </Alert>

        {importResult && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Total Records:</strong> {importResult.total}
                </div>
                <div>
                  <strong>Imported:</strong> {importResult.imported}
                </div>
                <div>
                  <strong>New Buyers Created:</strong> {importResult.created}
                </div>
                <div>
                  <strong>Skipped:</strong> {importResult.skipped}
                </div>
              </div>
              <p className="mt-2 text-green-700">
                {importResult.message}
              </p>
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Import Process
          </h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>• Connects to Microsoft SQL Database</li>
            <li>• Fetches unique records from vopslistdtl table</li>
            <li>• Creates missing buyers automatically</li>
            <li>• Imports article numbers with blank article_number field</li>
            <li>• Eliminates duplicates based on buyer-design-color-size combinations</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Next Steps After Import
          </h4>
          <ul className="text-sm space-y-1 text-blue-700">
            <li>• Review and update buyer names in Buyer Management</li>
            <li>• Assign merchants to imported buyers</li>
            <li>• Fill in article number codes manually (e.g., A-02/EM-25-MA-5202)</li>
            <li>• Link article numbers to existing rug designs</li>
            <li>• Add pricing, quality, and delivery information</li>
          </ul>
        </div>

        <Button 
          onClick={handleImport} 
          disabled={isImporting}
          className="w-full"
          size="lg"
        >
          {isImporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing Article Numbers...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Start Import from ERP Database
            </>
          )}
        </Button>

        {isImporting && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Connecting to Microsoft SQL Database and importing article numbers. This may take a few minutes...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}