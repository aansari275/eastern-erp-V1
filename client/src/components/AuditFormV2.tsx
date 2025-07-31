import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Upload, X, Save, Send } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ChecklistItem {
  code: string;
  question: string;
  response?: 'Yes' | 'No' | 'NA';
  remark?: string;
  evidence: string[];
}

interface AuditData {
  auditDate: string;
  company: 'EHI' | 'EMPL';
  auditor: string;
  status: 'draft' | 'submitted';
  checklist: ChecklistItem[];
  createdAt: string;
  submittedAt?: string;
}

const CHECKLIST_TEMPLATE: ChecklistItem[] = [
  // Design Control (C1-C7)
  { code: 'C1', question: 'Are design and development procedures established?', evidence: [] },
  { code: 'C2', question: 'Are design input requirements identified and reviewed?', evidence: [] },
  { code: 'C3', question: 'Are design reviews conducted at key stages?', evidence: [] },
  { code: 'C4', question: 'Does design output include all necessary production info?', evidence: [] },
  { code: 'C5', question: 'Are design changes verified and controlled?', evidence: [] },
  { code: 'C6', question: 'Is prototype or pilot testing done before production?', evidence: [] },
  { code: 'C7', question: 'Are design personnel competent and qualified?', evidence: [] },
  
  // Purchasing Control (C8-C12)
  { code: 'C8', question: 'Are suppliers evaluated and approved before ordering?', evidence: [] },
  { code: 'C9', question: 'Are materials purchased from approved sources?', evidence: [] },
  { code: 'C10', question: 'Are product specs and requirements agreed with suppliers?', evidence: [] },
  { code: 'C11', question: 'Is supplier performance monitored regularly?', evidence: [] },
  { code: 'C12', question: 'Are purchase orders clear and complete?', evidence: [] },
  
  // Storage Management (C13-C17)
  { code: 'C13', question: 'Are materials stored in appropriate conditions?', evidence: [] },
  { code: 'C14', question: 'Is inventory management system in place?', evidence: [] },
  { code: 'C15', question: 'Are materials protected from damage/deterioration?', evidence: [] },
  { code: 'C16', question: 'Is FIFO (First In, First Out) system implemented?', evidence: [] },
  { code: 'C17', question: 'Are storage areas clean and organized?', evidence: [] },
  
  // Incoming Inspection (C18-C25)
  { code: 'C18', question: 'Are all incoming materials inspected?', evidence: [] },
  { code: 'C19', question: 'Are inspection criteria clearly defined?', evidence: [] },
  { code: 'C20', question: 'Is inspection equipment calibrated?', evidence: [] },
  { code: 'C21', question: 'Are inspection records maintained?', evidence: [] },
  { code: 'C22', question: 'Is non-conforming material identified and segregated?', evidence: [] },
  { code: 'C23', question: 'Are suppliers notified of quality issues?', evidence: [] },
  { code: 'C24', question: 'Is incoming material traceability maintained?', evidence: [] },
  { code: 'C25', question: 'Are inspection personnel trained and competent?', evidence: [] },
];

export default function AuditFormV2() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Hardcoded test button function
  const handleQuickSave = async () => {
    try {
      const checklist = [
        {
          code: "C1",
          question: "Are design and development procedures established?",
          response: "Yes",
          remark: "Manually inserted test",
          evidence: ["https://example.com/test.jpg"]
        },
        {
          code: "C2", 
          question: "Are design inputs properly documented?",
          response: "No",
          remark: "Nothing here",
          evidence: []
        }
      ];

      const docRef = await addDoc(collection(db, "audit"), {
        auditDate: "2025-07-28",
        auditor: "Abdul (test)",
        company: "EHI",
        status: "draft",
        checklist,
        createdAt: serverTimestamp()
      });

      console.log('✅ Hardcoded audit saved with ID:', docRef.id);
      
      // Emit custom event to update dashboard
      window.dispatchEvent(new CustomEvent('auditSaved'));
      
      alert("✅ Manual audit saved");
      toast({
        title: "Test Audit Saved",
        description: "Hardcoded audit successfully saved to Firebase",
      });
    } catch (error) {
      console.error('❌ Error saving test audit:', error);
      alert("❌ Error saving test audit: " + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };
  const [auditData, setAuditData] = useState<AuditData>({
    auditDate: new Date().toISOString().split('T')[0],
    company: 'EHI',
    auditor: '',
    status: 'draft',
    checklist: CHECKLIST_TEMPLATE,
    createdAt: new Date().toISOString()
  });

  const updateChecklistItem = (code: string, field: keyof ChecklistItem, value: any) => {
    setAuditData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.code === code ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleImageUpload = async (code: string, file: File) => {
    try {
      console.log('📸 Starting image upload for code:', code);
      
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 2MB",
          variant: "destructive"
        });
        return;
      }

      // Convert to base64 with compression
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        
        // Create a compressed version
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Set max dimensions
          const maxWidth = 400;
          const maxHeight = 300;
          let { width, height } = img;
          
          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          console.log('📸 Image compressed and ready for upload');
          updateChecklistItem(code, 'evidence', [...(auditData.checklist.find(item => item.code === code)?.evidence || []), compressedBase64]);
          
          toast({
            title: "Image Uploaded",
            description: "Evidence image added successfully",
            variant: "default"
          });
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Image upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  const removeEvidence = (code: string, index: number) => {
    const item = auditData.checklist.find(item => item.code === code);
    if (item) {
      const newEvidence = item.evidence.filter((_, i) => i !== index);
      updateChecklistItem(code, 'evidence', newEvidence);
    }
  };

  const saveAudit = async (status: 'draft' | 'submitted') => {
    if (!auditData.auditor.trim()) {
      toast({
        title: "Validation Error",
        description: "Auditor name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        ...auditData,
        status,
        submittedAt: status === 'submitted' ? new Date().toISOString() : undefined
      };

      console.log('📋 Flattened checklist before saving:', dataToSave.checklist);
      console.log('📊 Checklist items with evidence:', dataToSave.checklist.filter(item => item.evidence.length > 0));

      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      if (!response.ok) {
        throw new Error('Failed to save audit');
      }

      const result = await response.json();
      console.log('✅ Audit save result:', result);
      
      toast({
        title: "Success",
        description: status === 'draft' ? `Draft saved successfully (ID: ${result.id})` : "Audit submitted successfully",
        variant: "default"
      });

      // Emit custom event to notify parent components
      window.dispatchEvent(new CustomEvent('auditSaved', { 
        detail: { id: result.id, status, auditData: dataToSave } 
      }));

      if (status === 'submitted') {
        // Reset form after submission
        setAuditData({
          auditDate: new Date().toISOString().split('T')[0],
          company: 'EHI',
          auditor: '',
          status: 'draft',
          checklist: CHECKLIST_TEMPLATE,
          createdAt: new Date().toISOString()
        });
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save audit",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getResponseColor = (response?: string) => {
    switch (response) {
      case 'Yes': return 'bg-green-100 text-green-800';
      case 'No': return 'bg-red-100 text-red-800';
      case 'NA': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const completedItems = auditData.checklist.filter(item => item.response).length;
  const progressPercentage = Math.round((completedItems / auditData.checklist.length) * 100);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>ISO 9001:2015 Compliance Audit Form V2</span>
            <Badge variant="outline">
              {completedItems}/{auditData.checklist.length} Complete ({progressPercentage}%)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auditDate">Audit Date</Label>
              <Input
                id="auditDate"
                type="date"
                value={auditData.auditDate}
                onChange={(e) => setAuditData(prev => ({ ...prev, auditDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select value={auditData.company} onValueChange={(value: 'EHI' | 'EMPL') => setAuditData(prev => ({ ...prev, company: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EHI">Eastern Home Industries</SelectItem>
                  <SelectItem value="EMPL">Eastern Mills Pvt. Ltd.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auditor">Auditor Name</Label>
              <Input
                id="auditor"
                value={auditData.auditor}
                onChange={(e) => setAuditData(prev => ({ ...prev, auditor: e.target.value }))}
                placeholder="Enter auditor name"
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Checklist Items */}
          <div className="space-y-4">
            {auditData.checklist.map((item, index) => (
              <Card key={item.code} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{item.code}</Badge>
                        {item.response && (
                          <Badge className={getResponseColor(item.response)}>
                            {item.response}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{item.question}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Response Selection */}
                    <div className="space-y-2">
                      <Label>Response</Label>
                      <Select 
                        value={item.response || ''} 
                        onValueChange={(value: 'Yes' | 'No' | 'NA') => updateChecklistItem(item.code, 'response', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select response" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="NA">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Evidence Upload */}
                    <div className="space-y-2">
                      <Label>Evidence Images</Label>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach(file => handleImageUpload(item.code, file));
                            }}
                          />
                        </label>
                        <span className="text-sm text-gray-500">
                          {item.evidence.length} image(s)
                        </span>
                      </div>
                      
                      {/* Evidence Preview */}
                      {item.evidence.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.evidence.map((evidence, evidenceIndex) => (
                            <div key={evidenceIndex} className="relative">
                              <img 
                                src={evidence} 
                                alt={`Evidence ${evidenceIndex + 1}`}
                                className="w-16 h-16 object-cover rounded border"
                              />
                              <button
                                onClick={() => removeEvidence(item.code, evidenceIndex)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="mt-4 space-y-2">
                    <Label>Remarks (Optional)</Label>
                    <Textarea
                      value={item.remark || ''}
                      onChange={(e) => updateChecklistItem(item.code, 'remark', e.target.value)}
                      placeholder="Add any remarks or observations..."
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              onClick={handleQuickSave}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Test Manual Save
            </Button>
            <Button
              onClick={() => saveAudit('draft')}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              onClick={() => saveAudit('submitted')}
              disabled={loading || !auditData.auditor.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Audit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}