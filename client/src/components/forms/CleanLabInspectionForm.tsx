import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { FileText, Save, CheckCircle } from 'lucide-react';

// Test parameters with standards and tolerances
const testParametersData = {
  dyed: [
    {
      name: 'Cleanliness of hanks',
      standard: 'Proper neat & Clean',
      tolerance: 'Proper neat & Clean'
    },
    {
      name: 'Smell',
      standard: 'Natural fiber smell',
      tolerance: 'Only natural fiber smell'
    },
    {
      name: 'Strength',
      standard: 'OK',
      tolerance: 'OK'
    },
    {
      name: 'Stain/Dust',
      standard: 'NO',
      tolerance: 'NO'
    },
    {
      name: 'Color Fastness to Light',
      standard: 'Grade 4 min',
      tolerance: 'Grade 4 min'
    },
    {
      name: 'Color Fastness to Washing',
      standard: 'Grade 4 min',
      tolerance: 'Grade 4 min'
    },
    {
      name: 'Color Fastness to Crocking',
      standard: 'Grade 4 min',
      tolerance: 'Grade 4 min'
    },
    {
      name: 'Moisture Content',
      standard: '8-12%',
      tolerance: '±1%'
    },
    {
      name: 'pH Value',
      standard: '7.0-8.5',
      tolerance: '±0.5'
    }
  ],
  undyed: [
    {
      name: 'Cleanliness of hanks',
      standard: 'Proper neat & Clean',
      tolerance: 'Proper neat & Clean'
    },
    {
      name: 'Smell',
      standard: 'Natural fiber smell',
      tolerance: 'Only natural fiber smell'
    },
    {
      name: 'Strength',
      standard: 'OK',
      tolerance: 'OK'
    },
    {
      name: 'Stain/Dust',
      standard: 'NO',
      tolerance: 'NO'
    },
    {
      name: 'Fiber Content',
      standard: '100% Cotton',
      tolerance: '±2%'
    },
    {
      name: 'Yarn Count (Ne)',
      standard: 'As per specification',
      tolerance: '±5%'
    },
    {
      name: 'Twist per Inch (TPI)',
      standard: 'As per specification',
      tolerance: '±10%'
    },
    {
      name: 'Tensile Strength',
      standard: '≥18 g/tex',
      tolerance: '±2 g/tex'
    },
    {
      name: 'Elongation at Break',
      standard: '6-8%',
      tolerance: '±1%'
    },
    {
      name: 'Moisture Content',
      standard: '8-12%',
      tolerance: '±1%'
    },
    {
      name: 'Oil Content',
      standard: '0.5-1.5%',
      tolerance: '±0.3%'
    },
    {
      name: 'Evenness CV%',
      standard: '≤16%',
      tolerance: '±2%'
    },
    {
      name: 'Neps',
      standard: '≤200/km',
      tolerance: '±50/km'
    }
  ],
  cotton: [
    {
      name: 'Staple Length (mm)',
      standard: '28-32 mm',
      tolerance: '±2 mm'
    },
    {
      name: 'Fiber Fineness (Micronaire)',
      standard: '3.5-4.9',
      tolerance: '±0.3'
    },
    {
      name: 'Fiber Strength (g/tex)',
      standard: '28-32 g/tex',
      tolerance: '±2 g/tex'
    },
    {
      name: 'Fiber Elongation (%)',
      standard: '6-8%',
      tolerance: '±1%'
    },
    {
      name: 'Short Fiber Content (%)',
      standard: '≤8%',
      tolerance: '±2%'
    },
    {
      name: 'Maturity Ratio',
      standard: '0.85-0.95',
      tolerance: '±0.05'
    },
    {
      name: 'Yellowness (+b)',
      standard: '7-9',
      tolerance: '±1'
    },
    {
      name: 'Brightness (Rd %)',
      standard: '75-85%',
      tolerance: '±3%'
    },
    {
      name: 'Trash Content (%)',
      standard: '≤0.5%',
      tolerance: '±0.2%'
    },
    {
      name: 'Moisture Content (%)',
      standard: '8-12%',
      tolerance: '±1%'
    },
    {
      name: 'Color Grade',
      standard: 'Grade 1-2',
      tolerance: 'Grade 1-2'
    },
    {
      name: 'Leaf Grade',
      standard: 'Grade 1-2',
      tolerance: 'Grade 1-2'
    },
    {
      name: 'Preparation Grade',
      standard: 'Grade 1-2',
      tolerance: 'Grade 1-2'
    },
    {
      name: 'Ginning Quality',
      standard: 'Good',
      tolerance: 'Good'
    },
    {
      name: 'Contamination Level',
      standard: 'Minimal',
      tolerance: 'Minimal'
    }
  ]
};

const companyOptions = [
  { label: 'Eastern Home Industries (EHI)', value: 'EHI' },
  { label: 'Eastern Mills (EM)', value: 'EM' },
  { label: 'Regal Group (RG)', value: 'RG' },
];

const inspectionTypeOptions = [
  { label: 'Dyed Material', value: 'dyed' },
  { label: 'Undyed Material', value: 'undyed' },
  { label: 'Cotton', value: 'cotton' },
];

const statusOptions = [
  { label: 'Pass', value: 'pass' },
  { label: 'Fail', value: 'fail' },
  { label: 'Not Applicable', value: 'na' },
];

interface CleanLabInspectionFormProps {
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const CleanLabInspectionForm: React.FC<CleanLabInspectionFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  mode = 'create'
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    company: initialData.company || 'EHI',
    inspectionType: initialData.inspectionType || 'dyed',
    dateOfIncoming: initialData.dateOfIncoming || new Date().toISOString().split('T')[0],
    challanInvoiceNo: initialData.challanInvoiceNo || '',
    supplierName: initialData.supplierName || '',
    testResults: initialData.testResults || {},
    remarks: initialData.remarks || '',
    status: initialData.status || 'pass',
    checkedBy: initialData.checkedBy || '',
    verifiedBy: initialData.verifiedBy || '',
  });

  const [currentTestParameters, setCurrentTestParameters] = useState(testParametersData.dyed);

  // Update test parameters when inspection type changes
  useEffect(() => {
    const parameters = testParametersData[formData.inspectionType as keyof typeof testParametersData] || testParametersData.dyed;
    setCurrentTestParameters(parameters);
  }, [formData.inspectionType]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestResultChange = (parameterName: string, hankNumber: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      testResults: {
        ...prev.testResults,
        [parameterName]: {
          ...prev.testResults[parameterName],
          [hankNumber]: value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      const submissionData = {
        ...formData,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      };

      if (onSubmit) {
        await onSubmit(submissionData);
      }

      toast({
        title: "Success",
        description: "Lab inspection submitted successfully",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit lab inspection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveDraft = async () => {
    try {
      const draftData = {
        ...formData,
        status: 'draft',
        lastSaved: new Date().toISOString(),
      };

      if (onSubmit) {
        await onSubmit(draftData);
      }

      toast({
        title: "Draft Saved",
        description: "Lab inspection saved as draft",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generatePDF = () => {
    // TODO: Implement PDF generation
    toast({
      title: "PDF Generation",
      description: "PDF generation feature will be implemented soon",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900">Lab Inspection Form</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <Select value={formData.company} onValueChange={(value) => handleInputChange('company', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Type</label>
              <Select 
                value={formData.inspectionType} 
                onValueChange={(value) => handleInputChange('inspectionType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inspectionTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Incoming</label>
              <Input
                type="date"
                value={formData.dateOfIncoming}
                onChange={(e) => handleInputChange('dateOfIncoming', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Challan/Invoice No</label>
              <Input
                type="text"
                placeholder="Enter challan or invoice number"
                value={formData.challanInvoiceNo}
                onChange={(e) => handleInputChange('challanInvoiceNo', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name</label>
              <Input
                type="text"
                placeholder="Enter supplier name"
                value={formData.supplierName}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Parameters */}
      <div className="space-y-4">
        {currentTestParameters.map((parameter, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Parameter</h3>
                  <p className="text-gray-700">{parameter.name}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Standard</h3>
                  <p className="text-gray-700">{parameter.standard}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Tolerance</h3>
                  <p className="text-gray-700">{parameter.tolerance}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Hank Results</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hank 1</label>
                    <Input
                      type="text"
                      placeholder="Enter result"
                      value={formData.testResults[parameter.name]?.hank1 || ''}
                      onChange={(e) => handleTestResultChange(parameter.name, 'hank1', e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Remarks & Submission */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Remarks & Submission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarks/Comments</label>
              <Textarea
                placeholder="Enter any remarks or comments"
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Checked By *</label>
                <Input
                  type="text"
                  placeholder="Inspector name"
                  value={formData.checkedBy}
                  onChange={(e) => handleInputChange('checkedBy', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verified By</label>
                <Input
                  type="text"
                  placeholder="Verifier name (optional)"
                  value={formData.verifiedBy}
                  onChange={(e) => handleInputChange('verifiedBy', e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={generatePDF}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Generate PDF</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Draft</span>
              </Button>

              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Submit Test Report</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CleanLabInspectionForm;