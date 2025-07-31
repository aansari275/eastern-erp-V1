import React, { useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import FormBuilder, { FormFieldConfig, FormSection } from './FormBuilder';
import { z } from 'zod';

// Define the ComplianceAuditSchema locally
const ComplianceAuditSchema = z.object({
  company: z.enum(['EHI', 'EM', 'RG']),
  auditDate: z.string(),
  auditType: z.enum(['internal', 'external', 'customer']).default('internal'),
  auditor: z.string().min(1, 'Auditor name is required'),
});
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  Trash2,
  FileText,
  Calendar,
  Users,
  Building
} from 'lucide-react';

const companyOptions = [
  { label: 'Eastern Home Industries (EHI)', value: 'EHI' },
  { label: 'Eastern Mills (EM)', value: 'EM' },
  { label: 'Regal Group (RG)', value: 'RG' },
];

const auditTypeOptions = [
  { label: 'Internal Audit', value: 'internal' },
  { label: 'External Audit', value: 'external' },
  { label: 'Customer Audit', value: 'customer' },
];

const responseOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Not Applicable', value: 'na' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const actionStatusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Closed', value: 'closed' },
];

// Default audit sections and questions
const defaultAuditSections = [
  {
    id: 'safety_health',
    name: 'Safety & Health',
    questions: [
      {
        id: 'safety_1',
        question: 'Are adequate fire safety measures in place?',
        weight: 3,
      },
      {
        id: 'safety_2',
        question: 'Are workers provided with appropriate PPE?',
        weight: 3,
      },
      {
        id: 'safety_3',
        question: 'Are safety training programs conducted regularly?',
        weight: 2,
      },
      {
        id: 'safety_4',
        question: 'Is first aid equipment readily available?',
        weight: 2,
      },
      {
        id: 'safety_5',
        question: 'Are emergency procedures clearly defined and communicated?',
        weight: 3,
      },
    ],
  },
  {
    id: 'labor_practices',
    name: 'Labor Practices',
    questions: [
      {
        id: 'labor_1',
        question: 'Are working hours within legal limits?',
        weight: 3,
      },
      {
        id: 'labor_2',
        question: 'Are wages paid according to legal requirements?',
        weight: 3,
      },
      {
        id: 'labor_3',
        question: 'Is there freedom of association?',
        weight: 2,
      },
      {
        id: 'labor_4',
        question: 'Are there adequate rest areas for workers?',
        weight: 1,
      },
      {
        id: 'labor_5',
        question: 'Is child labor strictly prohibited?',
        weight: 5,
      },
    ],
  },
  {
    id: 'environmental',
    name: 'Environmental',
    questions: [
      {
        id: 'env_1',
        question: 'Are waste disposal procedures environmentally compliant?',
        weight: 3,
      },
      {
        id: 'env_2',
        question: 'Is water usage monitored and optimized?',
        weight: 2,
      },
      {
        id: 'env_3',
        question: 'Are chemical storage procedures safe and compliant?',
        weight: 3,
      },
      {
        id: 'env_4',
        question: 'Are air emissions within permitted levels?',
        weight: 2,
      },
      {
        id: 'env_5',
        question: 'Is energy consumption monitored and optimized?',
        weight: 1,
      },
    ],
  },
  {
    id: 'quality_management',
    name: 'Quality Management',
    questions: [
      {
        id: 'quality_1',
        question: 'Are quality control procedures documented and followed?',
        weight: 3,
      },
      {
        id: 'quality_2',
        question: 'Are inspection records maintained properly?',
        weight: 2,
      },
      {
        id: 'quality_3',
        question: 'Is customer feedback tracked and addressed?',
        weight: 2,
      },
      {
        id: 'quality_4',
        question: 'Are non-conforming products handled appropriately?',
        weight: 3,
      },
      {
        id: 'quality_5',
        question: 'Is continuous improvement practiced?',
        weight: 2,
      },
    ],
  },
];

interface EnhancedComplianceAuditFormProps {
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<any>;
  mode?: 'create' | 'edit';
}

const EnhancedComplianceAuditForm: React.FC<EnhancedComplianceAuditFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  mode = 'create'
}) => {
  const { toast } = useToast();
  const [auditSections, setAuditSections] = useState(
    initialData.sections || defaultAuditSections
  );
  const [actionItems, setActionItems] = useState(initialData.actionItems || []);

  // Form sections
  const sections: FormSection[] = [
    {
      id: 'basic',
      title: 'Audit Information',
      description: 'Basic audit details and identification',
    },
    {
      id: 'auditor',
      title: 'Auditor Details',
      description: 'Information about the auditor and audit scope',
    },
    {
      id: 'assessment',
      title: 'Assessment Sections',
      description: 'Detailed compliance assessment questions',
    },
    {
      id: 'actions',
      title: 'Action Items',
      description: 'Corrective and preventive actions',
    },
    {
      id: 'summary',
      title: 'Summary & Results',
      description: 'Overall results and recommendations',
    },
  ];

  // Form fields
  const fields: FormFieldConfig[] = [
    // Basic Information
    {
      name: 'company',
      label: 'Company',
      type: 'select',
      required: true,
      options: companyOptions,
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'auditDate',
      label: 'Audit Date',
      type: 'date',
      required: true,
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'auditType',
      label: 'Audit Type',
      type: 'select',
      required: true,
      options: auditTypeOptions,
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'department',
      label: 'Department/Area',
      type: 'text',
      placeholder: 'e.g., Production, Quality, HR',
      section: 'basic',
      className: 'col-span-1',
    },

    // Auditor Details
    {
      name: 'auditor',
      label: 'Lead Auditor',
      type: 'text',
      required: true,
      placeholder: 'Enter auditor name',
      section: 'auditor',
      className: 'col-span-1',
    },
    {
      name: 'nextAuditDate',
      label: 'Next Audit Date',
      type: 'date',
      section: 'auditor',
      className: 'col-span-1',
      description: 'Recommended date for next audit',
    },

    // Assessment - Custom rendered
    {
      name: 'auditAssessment',
      label: 'Compliance Assessment',
      type: 'custom',
      section: 'assessment',
      className: 'col-span-2',
      customRender: (field: any, form: any) => (
        <div className="space-y-6">
          {auditSections.map((section, sectionIndex) => (
            <Card key={section.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{section.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {section.questions.length} questions
                    </Badge>
                    {calculateSectionScore(section) !== null && (
                      <Badge 
                        variant={getSectionScoreBadgeVariant(calculateSectionScore(section)!)}
                      >
                        {Math.round(calculateSectionScore(section)!)}%
                      </Badge>
                    )}
                  </div>
                </div>
                {calculateSectionScore(section) !== null && (
                  <Progress 
                    value={calculateSectionScore(section)!} 
                    className="h-2"
                  />
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {section.questions.map((question, questionIndex) => (
                  <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">
                          {question.question}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Weight: {question.weight}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Response
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => updateQuestionResponse(sectionIndex, questionIndex, 'response', e.target.value)}
                          value={question.response || ''}
                        >
                          <option value="">Select response</option>
                          {responseOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Evidence/Comments
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="Provide evidence or comments..."
                          onChange={(e) => updateQuestionResponse(sectionIndex, questionIndex, 'evidence', e.target.value)}
                          value={question.evidence || ''}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ),
    },

    // Action Items - Custom rendered
    {
      name: 'actionItemsManagement',
      label: 'Action Items',
      type: 'custom',
      section: 'actions',
      className: 'col-span-2',
      customRender: (field: any, form: any) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Corrective & Preventive Actions</h3>
            <Button 
              type="button" 
              onClick={addActionItem}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Action Item
            </Button>
          </div>

          {actionItems.map((item, index) => (
            <Card key={item.id || index} className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Describe the action required..."
                    value={item.description || ''}
                    onChange={(e) => updateActionItem(index, 'description', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.priority || 'medium'}
                    onChange={(e) => updateActionItem(index, 'priority', e.target.value)}
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Assign to..."
                    value={item.assignee || ''}
                    onChange={(e) => updateActionItem(index, 'assignee', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.dueDate || ''}
                    onChange={(e) => updateActionItem(index, 'dueDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.status || 'open'}
                    onChange={(e) => updateActionItem(index, 'status', e.target.value)}
                  >
                    {actionStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeActionItem(index)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </Card>
          ))}

          {actionItems.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No action items added yet</p>
            </div>
          )}
        </div>
      ),
    },

    // Summary
    {
      name: 'remarks',
      label: 'Overall Remarks',
      type: 'textarea',
      placeholder: 'Enter overall observations, recommendations, and conclusions...',
      section: 'summary',
      className: 'col-span-2',
      rows: 4,
    },
  ];

  // Helper functions
  const calculateSectionScore = (section: any): number | null => {
    const answeredQuestions = section.questions.filter(q => q.response && q.response !== '');
    if (answeredQuestions.length === 0) return null;

    const totalWeight = section.questions.reduce((sum, q) => sum + (q.weight || 1), 0);
    const achievedScore = section.questions.reduce((sum, q) => {
      if (q.response === 'yes') return sum + (q.weight || 1);
      if (q.response === 'na') return sum + (q.weight || 1); // NA counts as full score
      return sum;
    }, 0);

    return (achievedScore / totalWeight) * 100;
  };

  const getSectionScoreBadgeVariant = (score: number) => {
    if (score >= 85) return 'default'; // green
    if (score >= 70) return 'secondary'; // yellow
    return 'destructive'; // red
  };

  const updateQuestionResponse = (sectionIndex: number, questionIndex: number, field: string, value: string) => {
    const updatedSections = [...auditSections];
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...updatedSections[sectionIndex].questions[questionIndex],
      [field]: value,
    };
    setAuditSections(updatedSections);
  };

  const addActionItem = () => {
    const newItem = {
      id: `action_${Date.now()}`,
      description: '',
      priority: 'medium',
      status: 'open',
      assignee: '',
      dueDate: '',
    };
    setActionItems([...actionItems, newItem]);
  };

  const updateActionItem = (index: number, field: string, value: string) => {
    const updatedItems = [...actionItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setActionItems(updatedItems);
  };

  const removeActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  // Calculate overall scores
  const calculateOverallScores = () => {
    const sectionScores = auditSections.map(section => calculateSectionScore(section)).filter(score => score !== null);
    if (sectionScores.length === 0) return { totalScore: null, complianceScore: null };

    const totalScore = sectionScores.reduce((sum, score) => sum + score!, 0) / sectionScores.length;
    return {
      totalScore: Math.round(totalScore),
      complianceScore: Math.round(totalScore),
    };
  };

  // Default values
  const defaultValues = {
    company: 'EHI',
    auditDate: new Date().toISOString().split('T')[0],
    auditType: 'internal',
    status: 'draft',
    sections: auditSections,
    actionItems: actionItems,
    ...initialData,
  };

  // Tabs configuration
  const tabs = [
    {
      id: 'info',
      label: 'Audit Info',
      sections: ['basic', 'auditor'],
    },
    {
      id: 'assessment',
      label: 'Assessment',
      sections: ['assessment'],
    },
    {
      id: 'actions',
      label: 'Actions',
      sections: ['actions'],
    },
    {
      id: 'summary',
      label: 'Summary',
      sections: ['summary'],
    },
  ];

  const handleSubmit = async (data: any) => {
    try {
      const scores = calculateOverallScores();
      
      const processedData = {
        ...data,
        sections: auditSections,
        actionItems: actionItems,
        totalScore: scores.totalScore,
        complianceScore: scores.complianceScore,
        createdAt: mode === 'create' ? new Date().toISOString() : initialData.createdAt,
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user',
        updatedBy: 'current-user',
        status: 'submitted',
      };

      if (onSubmit) {
        await onSubmit(processedData);
      } else {
        // Default submission logic
        const response = await fetch('/api/compliance-audits', {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(processedData),
        });

        if (!response.ok) {
          throw new Error('Failed to save compliance audit');
        }

        toast({
          title: "Success",
          description: `Compliance audit ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: `Failed to ${mode} compliance audit. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Audit Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {auditSections.length}
              </div>
              <div className="text-sm text-blue-700">Assessment Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {calculateOverallScores().totalScore || 0}%
              </div>
              <div className="text-sm text-green-700">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {actionItems.length}
              </div>
              <div className="text-sm text-orange-700">Action Items</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FormBuilder
        title={mode === 'create' ? 'New Compliance Audit' : 'Edit Compliance Audit'}
        description="Comprehensive compliance assessment with scoring and action items"
        schema={ComplianceAuditSchema}
        fields={fields}
        sections={sections}
        tabs={tabs}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        submitLabel={mode === 'create' ? 'Submit Audit' : 'Update Audit'}
        autoSave={true}
        autoSaveInterval={30000}
        className="max-w-6xl"
      />
    </div>
  );
};

export default EnhancedComplianceAuditForm;