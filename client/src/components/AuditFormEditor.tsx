import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowLeft, Save, Send, Plus, Trash2, Upload, X } from 'lucide-react';
import { useAuditForm, useAuditForms, type AuditForm, type AuditSection, type AuditQuestion } from '../hooks/useAuditForms';
import { useToast } from '../hooks/use-toast';

interface AuditFormEditorProps {
  formId?: string | null;
  selectedCompany: 'EHI' | 'EMPL';
  onClose: () => void;
}

export function AuditFormEditor({ formId, selectedCompany, onClose }: AuditFormEditorProps) {
  const { toast } = useToast();
  const { auditForm, isLoading } = useAuditForm(formId || '');
  const { createAuditForm, updateAuditForm, isCreating, isUpdating } = useAuditForms();
  
  const [formData, setFormData] = useState<Omit<AuditForm, 'id'>>({
    createdBy: 'abdulansari@easternmills.com', // This would come from auth context
    status: 'draft',
    company: selectedCompany === 'EHI' ? 'Eastern Home Industries' : 'Eastern Mills Pvt. Ltd.',
    auditType: 'Final Inspection',
    sections: []
  });

  useEffect(() => {
    if (auditForm && formId) {
      setFormData({
        createdBy: auditForm.createdBy,
        status: auditForm.status,
        company: auditForm.company,
        auditType: auditForm.auditType,
        sections: auditForm.sections || []
      });
    }
  }, [auditForm, formId]);

  const addSection = () => {
    const newSection: AuditSection = {
      title: '',
      questions: []
    };
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const updateSection = (sectionIndex: number, title: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) => 
        index === sectionIndex ? { ...section, title } : section
      )
    }));
  };

  const removeSection = (sectionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex)
    }));
  };

  const addQuestion = (sectionIndex: number) => {
    const newQuestion: AuditQuestion = {
      question: '',
      answer: '',
      comments: '',
      images: []
    };
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) => 
        index === sectionIndex 
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    }));
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, field: keyof AuditQuestion, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, sIndex) => 
        sIndex === sectionIndex 
          ? {
              ...section,
              questions: section.questions.map((question, qIndex) =>
                qIndex === questionIndex ? { ...question, [field]: value } : question
              )
            }
          : section
      )
    }));
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, sIndex) => 
        sIndex === sectionIndex 
          ? { ...section, questions: section.questions.filter((_, qIndex) => qIndex !== questionIndex) }
          : section
      )
    }));
  };

  const handleSave = async () => {
    try {
      if (formId) {
        await updateAuditForm({ id: formId, ...formData });
        toast({ title: "✅ Audit form updated successfully" });
      } else {
        await createAuditForm(formData);
        toast({ title: "✅ Audit form created successfully" });
      }
    } catch (error) {
      toast({ 
        title: "❌ Error", 
        description: "Failed to save audit form",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = { ...formData, status: 'submitted' as const };
      if (formId) {
        await updateAuditForm({ id: formId, ...submitData });
        toast({ title: "✅ Audit form submitted successfully" });
      } else {
        await createAuditForm(submitData);
        toast({ title: "✅ Audit form created and submitted successfully" });
      }
      onClose();
    } catch (error) {
      toast({ 
        title: "❌ Error", 
        description: "Failed to submit audit form",
        variant: "destructive"
      });
    }
  };

  if (isLoading && formId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit form...</p>
        </div>
      </div>
    );
  }

  const isReadOnly = formData.status === 'submitted';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {formId ? 'Edit Audit Form' : 'Create New Audit Form'}
            </h2>
            <p className="text-gray-600">
              {isReadOnly ? 'Viewing submitted audit form' : 'Configure sections and questions for your audit'}
            </p>
          </div>
        </div>
        {formData.status && (
          <Badge variant={formData.status === 'submitted' ? 'default' : 'secondary'}>
            {formData.status}
          </Badge>
        )}
      </div>

      {/* Form Details */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audit Type
              </label>
              <Select 
                value={formData.auditType} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, auditType: value }))}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Final Inspection">Final Inspection</SelectItem>
                  <SelectItem value="Washing">Washing</SelectItem>
                  <SelectItem value="Bazar">Bazar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <Input 
                value={formData.company} 
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Audit Sections</h3>
          {!isReadOnly && (
            <Button onClick={addSection} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          )}
        </div>

        {formData.sections.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
            <p className="text-gray-600 mb-4">Add your first section to start building your audit form</p>
            {!isReadOnly && (
              <Button onClick={addSection}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </Button>
            )}
          </Card>
        ) : (
          formData.sections.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(sectionIndex, e.target.value)}
                    placeholder="Section title (e.g., Packing, Quality Check)"
                    className="text-lg font-semibold"
                    disabled={isReadOnly}
                  />
                  {!isReadOnly && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeSection(sectionIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question
                        </label>
                        <Input
                          value={question.question}
                          onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'question', e.target.value)}
                          placeholder="Enter your question..."
                          disabled={isReadOnly}
                        />
                      </div>
                      {!isReadOnly && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeQuestion(sectionIndex, questionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Answer
                        </label>
                        <Select 
                          value={question.answer} 
                          onValueChange={(value: any) => updateQuestion(sectionIndex, questionIndex, 'answer', value)}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select answer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Not answered</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Pass">Pass</SelectItem>
                            <SelectItem value="Fail">Fail</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comments
                        </label>
                        <Textarea
                          value={question.comments}
                          onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'comments', e.target.value)}
                          placeholder="Additional comments..."
                          className="min-h-[80px]"
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {!isReadOnly && (
                  <Button 
                    variant="outline" 
                    onClick={() => addQuestion(sectionIndex)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Actions */}
      {!isReadOnly && (
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={isCreating || isUpdating}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isCreating || isUpdating}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Audit
          </Button>
        </div>
      )}
    </div>
  );
}