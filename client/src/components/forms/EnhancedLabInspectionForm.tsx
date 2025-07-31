import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import FormBuilder, { FormFieldConfig, FormSection } from './FormBuilder';
import { z } from 'zod';

// Define the LabInspectionSchema locally
const LabInspectionSchema = z.object({
  inspectionType: z.enum(['dyed', 'undyed', 'cotton']),
  company: z.enum(['EHI', 'EM', 'RG']),
  dateOfIncoming: z.string(),
  challanInvoiceNo: z.string().min(1, 'Challan/Invoice number is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  transportCondition: z.enum(['ok', 'not_ok']),
});

// Testing parameters for different material types
const testParameters = {
  dyed: [
    'Color Fastness to Light',
    'Color Fastness to Washing', 
    'Color Fastness to Crocking',
    'Color Fastness to Perspiration',
    'Fiber Content Analysis',
    'Twist Direction',
    'Yarn Count',
    'Moisture Content',
    'pH Value'
  ],
  undyed: [
    'Fiber Content Analysis',
    'Yarn Count (Ne)',
    'Twist per Inch (TPI)',
    'Twist Direction',
    'Tensile Strength',
    'Elongation at Break',
    'Moisture Content',
    'Oil Content',
    'Ash Content',
    'Evenness CV%',
    'Thin Places',
    'Thick Places',
    'Neps'
  ],
  cotton: [
    'Staple Length (mm)',
    'Fiber Fineness (Micronaire)',
    'Fiber Strength (g/tex)',
    'Fiber Elongation (%)',
    'Short Fiber Content (%)',
    'Maturity Ratio',
    'Yellowness (+b)',
    'Brightness (Rd %)',
    'Trash Content (%)',
    'Moisture Content (%)',
    'Color Grade',
    'Leaf Grade',
    'Preparation Grade',
    'Ginning Quality',
    'Contamination Level'
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

const transportConditionOptions = [
  { label: 'Good Condition', value: 'ok' },
  { label: 'Damaged/Issues', value: 'not_ok' },
];

const statusOptions = [
  { label: 'Pass', value: 'pass' },
  { label: 'Fail', value: 'fail' },
  { label: 'Not Applicable', value: 'na' },
];

const overallStatusOptions = [
  { label: 'OK - Accepted', value: 'ok' },
  { label: 'Not OK - Rejected', value: 'not_ok' },
];

interface EnhancedLabInspectionFormProps {
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<any>;
  mode?: 'create' | 'edit';
}

const EnhancedLabInspectionForm: React.FC<EnhancedLabInspectionFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  mode = 'create'
}) => {
  const { toast } = useToast();
  const [selectedInspectionType, setSelectedInspectionType] = useState<string>(
    initialData.inspectionType || 'dyed'
  );
  const [dynamicTestParameters, setDynamicTestParameters] = useState<string[]>([]);

  // Update test parameters when inspection type changes
  useEffect(() => {
    const parameters = testParameters[selectedInspectionType as keyof typeof testParameters] || [];
    setDynamicTestParameters(parameters);
  }, [selectedInspectionType]);

  // Form sections
  const sections: FormSection[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Inspection details and identification',
    },
    {
      id: 'material',
      title: 'Material Information',
      description: 'Material type and supplier details',
    },
    {
      id: 'quantity',
      title: 'Quantity & Weight',
      description: 'Quantity and weight measurements',
    },
    {
      id: 'testing',
      title: 'Test Parameters',
      description: 'Quality testing parameters and results',
    },
    {
      id: 'results',
      title: 'Inspection Results',
      description: 'Overall results and conclusions',
    },
  ];

  // Base form fields
  const baseFields: FormFieldConfig[] = [
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
      name: 'inspectionType',
      label: 'Inspection Type',
      type: 'select',
      required: true,
      options: inspectionTypeOptions,
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'dateOfIncoming',
      label: 'Date of Incoming',
      type: 'date',
      required: true,
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'challanInvoiceNo',
      label: 'Challan/Invoice Number',
      type: 'text',
      required: true,
      placeholder: 'Enter challan or invoice number',
      section: 'basic',
      className: 'col-span-1',
    },

    // Material Information
    {
      name: 'supplierName',
      label: 'Supplier Name',
      type: 'text',
      required: true,
      placeholder: 'Enter supplier name',
      section: 'material',
      className: 'col-span-1',
    },
    {
      name: 'transportCondition',
      label: 'Transport Condition',
      type: 'select',
      required: true,
      options: transportConditionOptions,
      section: 'material',
      className: 'col-span-1',
    },

    // Quantity & Weight
    {
      name: 'noOfBales',
      label: 'Number of Bales',
      type: 'number',
      min: 0,
      section: 'quantity',
      className: 'col-span-1',
    },
    {
      name: 'actualWeight',
      label: 'Actual Weight (kg)',
      type: 'number',
      min: 0,
      step: 0.01,
      section: 'quantity',
      className: 'col-span-1',
    },
    {
      name: 'supplierWeight',
      label: 'Supplier Weight (kg)',
      type: 'number',
      min: 0,
      step: 0.01,
      section: 'quantity',
      className: 'col-span-1',
    },

    // Results
    {
      name: 'overallStatus',
      label: 'Overall Status',
      type: 'select',
      options: overallStatusOptions,
      section: 'results',
      className: 'col-span-1',
    },
    {
      name: 'checkedBy',
      label: 'Checked By',
      type: 'text',
      required: true,
      placeholder: 'Inspector name',
      section: 'results',
      className: 'col-span-1',
    },
    {
      name: 'verifiedBy',
      label: 'Verified By',
      type: 'text',
      placeholder: 'Supervisor/Manager name',
      section: 'results',
      className: 'col-span-1',
    },
    {
      name: 'remarks',
      label: 'Overall Remarks',
      type: 'textarea',
      placeholder: 'Enter any additional remarks or observations...',
      section: 'results',
      className: 'col-span-2',
      rows: 4,
    },
  ];

  // Conditional fields based on inspection type
  const getConditionalFields = (): FormFieldConfig[] => {
    const conditionalFields: FormFieldConfig[] = [];

    // Dyed material specific fields
    if (selectedInspectionType === 'dyed') {
      conditionalFields.push(
        {
          name: 'color',
          label: 'Color',
          type: 'text',
          placeholder: 'Primary color of dyed material',
          section: 'material',
          className: 'col-span-1',
        },
        {
          name: 'shade',
          label: 'Shade',
          type: 'text',
          placeholder: 'Shade description or code',
          section: 'material',
          className: 'col-span-1',
        }
      );
    }

    // Cotton specific fields
    if (selectedInspectionType === 'cotton') {
      conditionalFields.push(
        {
          name: 'cottonType',
          label: 'Cotton Type',
          type: 'select',
          options: [
            { label: 'Organic Cotton', value: 'organic' },
            { label: 'Conventional Cotton', value: 'conventional' },
            { label: 'Recycled Cotton', value: 'recycled' },
            { label: 'Pima Cotton', value: 'pima' },
            { label: 'Egyptian Cotton', value: 'egyptian' },
          ],
          section: 'material',
          className: 'col-span-1',
        },
        {
          name: 'grade',
          label: 'Cotton Grade',
          type: 'select',
          options: [
            { label: 'Grade A', value: 'A' },
            { label: 'Grade B', value: 'B' },
            { label: 'Grade C', value: 'C' },
            { label: 'Grade D', value: 'D' },
          ],
          section: 'material',
          className: 'col-span-1',
        }
      );
    }

    return conditionalFields;
  };

  // Generate test parameter fields
  const getTestParameterFields = (): FormFieldConfig[] => {
    return dynamicTestParameters.map((parameter, index) => ({
      name: `testParam_${index}`,
      label: parameter,
      type: 'custom',
      section: 'testing',
      className: 'col-span-2',
      customRender: (field: any, form: any) => (
        <div className="grid grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
          <div className="col-span-4">
            <h4 className="font-medium text-gray-900 mb-2">{parameter}</h4>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Value
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter value"
              onChange={(e) => {
                const currentTestParams = form.getValues('testParameters') || {};
                currentTestParams[parameter] = {
                  ...currentTestParams[parameter],
                  value: e.target.value,
                };
                form.setValue('testParameters', currentTestParams);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Unit"
              onChange={(e) => {
                const currentTestParams = form.getValues('testParameters') || {};
                currentTestParams[parameter] = {
                  ...currentTestParams[parameter],
                  unit: e.target.value,
                };
                form.setValue('testParameters', currentTestParams);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const currentTestParams = form.getValues('testParameters') || {};
                currentTestParams[parameter] = {
                  ...currentTestParams[parameter],
                  status: e.target.value,
                };
                form.setValue('testParameters', currentTestParams);
              }}
            >
              <option value="">Select status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional remarks"
              onChange={(e) => {
                const currentTestParams = form.getValues('testParameters') || {};
                currentTestParams[parameter] = {
                  ...currentTestParams[parameter],
                  remarks: e.target.value,
                };
                form.setValue('testParameters', currentTestParams);
              }}
            />
          </div>
        </div>
      ),
    }));
  };

  // Combine all fields
  const getAllFields = (): FormFieldConfig[] => {
    return [
      ...baseFields,
      ...getConditionalFields(),
      ...getTestParameterFields(),
    ];
  };

  // Default values
  const defaultValues = {
    inspectionType: 'dyed',
    company: 'EHI',
    dateOfIncoming: new Date().toISOString().split('T')[0],
    transportCondition: 'ok',
    status: 'draft',
    testParameters: {},
    sampleResults: [],
    ...initialData,
  };

  // Tabs configuration
  const tabs = [
    {
      id: 'info',
      label: 'Basic Info',
      sections: ['basic', 'material'],
    },
    {
      id: 'quantity',
      label: 'Quantity',
      sections: ['quantity'],
    },
    {
      id: 'testing',
      label: 'Testing',
      sections: ['testing'],
    },
    {
      id: 'results',
      label: 'Results',
      sections: ['results'],
    },
  ];

  const handleSubmit = async (data: any) => {
    try {
      // Process the form data
      const processedData = {
        ...data,
        // Set timestamps
        createdAt: mode === 'create' ? new Date().toISOString() : initialData.createdAt,
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user', // Replace with actual user ID
        updatedBy: 'current-user', // Replace with actual user ID
        status: 'submitted', // Mark as submitted
        lastSaved: new Date().toISOString(),
      };

      if (onSubmit) {
        await onSubmit(processedData);
      } else {
        // Default submission logic
        const response = await fetch('/api/lab-inspections', {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(processedData),
        });

        if (!response.ok) {
          throw new Error('Failed to save lab inspection');
        }

        toast({
          title: "Success",
          description: `Lab inspection ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: `Failed to ${mode} lab inspection. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Watch for inspection type changes
  React.useEffect(() => {
    // This will trigger re-render with new fields when inspection type changes
  }, [selectedInspectionType]);

  return (
    <div className="space-y-6">
      {/* Inspection Type Selector */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Select Inspection Type
        </h3>
        <p className="text-blue-700 text-sm mb-3">
          The inspection type determines which test parameters will be available for testing.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {inspectionTypeOptions.map((option) => (
            <div
              key={option.value}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedInspectionType === option.value
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
              onClick={() => setSelectedInspectionType(option.value)}
            >
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">{option.label}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {testParameters[option.value as keyof typeof testParameters]?.length} parameters
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Form */}
      <FormBuilder
        title={mode === 'create' ? 'New Lab Inspection' : 'Edit Lab Inspection'}
        description={`Complete inspection form for ${selectedInspectionType} material with ${dynamicTestParameters.length} test parameters`}
        schema={LabInspectionSchema}
        fields={getAllFields()}
        sections={sections}
        tabs={tabs}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        submitLabel={mode === 'create' ? 'Submit Inspection' : 'Update Inspection'}
        autoSave={true}
        autoSaveInterval={30000}
        className="max-w-6xl"
      />
    </div>
  );
};

export default EnhancedLabInspectionForm;