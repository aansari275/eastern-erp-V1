import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import FormBuilder, { FormFieldConfig, FormSection } from './FormBuilder';
import { z } from 'zod';

// Define the RugSchema locally for now
const RugSchema = z.object({
  articleNumber: z.string().min(1, 'Article number is required'),
  buyerCode: z.string().min(1, 'Buyer code is required'),
  construction: z.string().min(1, 'Construction is required'),
  designName: z.string().min(1, 'Design name is required'),
  colour: z.string().min(1, 'Colour is required'),
  size: z.string().min(1, 'Size is required'),
  material: z.string().min(1, 'Material is required'),
});
import { 
  Package, 
  Calculator, 
  Settings, 
  ImageIcon,
  Palette,
  Ruler,
  Truck,
  DollarSign,
  FileText,
  Users,
  Factory
} from 'lucide-react';

// Quality options
const qualityOptions = [
  { label: 'Hand Knotted', value: 'hand_knotted' },
  { label: 'Hand Tufted', value: 'hand_tufted' },
  { label: 'Hand Woven', value: 'hand_woven' },
  { label: 'Machine Made', value: 'machine_made' },
  { label: 'Flat Weave', value: 'flat_weave' },
];

const constructionOptions = [
  { label: 'Hand Knotted (HK)', value: 'HK' },
  { label: 'Hand Tufted (HT)', value: 'HT' },
  { label: 'Hand Woven (HW)', value: 'HW' },
  { label: 'Machine Made (MM)', value: 'MM' },
  { label: 'Flat Weave (FW)', value: 'FW' },
];

const materialOptions = [
  { label: 'Wool', value: 'wool' },
  { label: 'Silk', value: 'silk' },
  { label: 'Cotton', value: 'cotton' },
  { label: 'Bamboo Silk', value: 'bamboo_silk' },
  { label: 'Jute', value: 'jute' },
  { label: 'Viscose', value: 'viscose' },
  { label: 'Polyester', value: 'polyester' },
  { label: 'Mixed', value: 'mixed' },
];

const orderTypeOptions = [
  { label: 'Sample', value: 'sample' },
  { label: 'Production', value: 'production' },
  { label: 'Trial', value: 'trial' },
  { label: 'Development', value: 'development' },
];

const dyeingOptions = [
  { label: 'Vegetable Dyes', value: 'vegetable' },
  { label: 'Chrome Dyes', value: 'chrome' },
  { label: 'Acid Dyes', value: 'acid' },
  { label: 'Natural Dyes', value: 'natural' },
  { label: 'Synthetic Dyes', value: 'synthetic' },
];

const contractorTypeOptions = [
  { label: 'Contractor', value: 'contractor' },
  { label: 'In-house', value: 'inhouse' },
];

const statusOptions = [
  { label: 'Draft', value: 'Draft' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Archived', value: 'Archived' },
];

const unitOptions = [
  { label: 'PSM (Per Square Meter)', value: 'PSM' },
  { label: 'PSF (Per Square Foot)', value: 'PSF' },
];

const currencyOptions = [
  { label: 'INR (Indian Rupee)', value: 'INR' },
  { label: 'USD (US Dollar)', value: 'USD' },
];

const colorOptions = [
  { label: 'Red', value: 'red' },
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Orange', value: 'orange' },
  { label: 'Purple', value: 'purple' },
  { label: 'Pink', value: 'pink' },
  { label: 'Brown', value: 'brown' },
  { label: 'Black', value: 'black' },
  { label: 'White', value: 'white' },
  { label: 'Grey', value: 'grey' },
  { label: 'Beige', value: 'beige' },
  { label: 'Cream', value: 'cream' },
  { label: 'Gold', value: 'gold' },
  { label: 'Silver', value: 'silver' },
];

interface EnhancedCreateRugFormProps {
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<any>;
  mode?: 'create' | 'edit';
}

const EnhancedCreateRugForm: React.FC<EnhancedCreateRugFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  mode = 'create'
}) => {
  const { toast } = useToast();
  const [availableMaterials, setAvailableMaterials] = useState<any[]>([]);
  const [availableBuyers, setAvailableBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch materials and buyers from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch materials
        const materialsResponse = await fetch('/api/materials');
        const materialsData = await materialsResponse.json();
        setAvailableMaterials(materialsData.materials || []);

        // Fetch buyers
        const buyersResponse = await fetch('/api/buyers');
        const buyersData = await buyersResponse.json();
        setAvailableBuyers(buyersData.buyers || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load materials and buyers data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Form sections
  const sections: FormSection[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Essential rug details and identification',
    },
    {
      id: 'buyer',
      title: 'Buyer Information',
      description: 'Customer and order details',
    },
    {
      id: 'specifications',
      title: 'Technical Specifications',
      description: 'Detailed technical parameters',
    },
    {
      id: 'production',
      title: 'Production Details',
      description: 'Manufacturing and processing information',
    },
    {
      id: 'materials',
      title: 'Materials & Costs',
      description: 'Material selection and cost calculations',
    },
    {
      id: 'quality',
      title: 'Quality & Finishing',
      description: 'Quality parameters and finishing details',
    },
    {
      id: 'attachments',
      title: 'Images & Attachments',
      description: 'Upload images and related documents',
    },
  ];

  // Form fields configuration
  const fields: FormFieldConfig[] = [
    // Basic Information
    {
      name: 'articleNumber',
      label: 'Article Number',
      type: 'text',
      required: true,
      placeholder: 'Enter unique article number',
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'designName',
      label: 'Design Name',
      type: 'text',
      required: true,
      placeholder: 'Enter design name',
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'construction',
      label: 'Construction Type',
      type: 'select',
      required: true,
      options: constructionOptions,
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'quality',
      label: 'Quality',
      type: 'select',
      options: qualityOptions,
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'size',
      label: 'Size',
      type: 'text',
      required: true,
      placeholder: 'e.g., 9x12 ft or 274x366 cm',
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'material',
      label: 'Primary Material',
      type: 'select',
      required: true,
      options: materialOptions,
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'colour',
      label: 'Primary Color',
      type: 'select',
      required: true,
      options: colorOptions,
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'selectedColors',
      label: 'Additional Colors',
      type: 'multiselect',
      options: colorOptions,
      section: 'basic',
      className: 'col-span-1',
      description: 'Select multiple colors used in the design',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: statusOptions,
      section: 'basic',
      className: 'col-span-1',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Detailed description of the rug...',
      section: 'basic',
      className: 'col-span-2',
      rows: 3,
    },

    // Buyer Information
    {
      name: 'buyerCode',
      label: 'Buyer Code',
      type: 'select',
      required: true,
      options: availableBuyers.map(buyer => ({
        label: `${buyer.code} - ${buyer.name}`,
        value: buyer.code,
      })),
      section: 'buyer',
      className: 'col-span-1',
    },
    {
      name: 'buyerName',
      label: 'Buyer Name',
      type: 'text',
      section: 'buyer',
      className: 'col-span-1',
      disabled: true,
      description: 'Auto-populated based on buyer code',
    },
    {
      name: 'orderType',
      label: 'Order Type',
      type: 'select',
      options: orderTypeOptions,
      section: 'buyer',
      className: 'col-span-1',
    },
    {
      name: 'opsNo',
      label: 'OPS Number',
      type: 'text',
      placeholder: 'Operations number',
      section: 'buyer',
      className: 'col-span-1',
    },

    // Technical Specifications
    {
      name: 'warpIn6Inches',
      label: 'Warp per 6 inches',
      type: 'number',
      min: 0,
      section: 'specifications',
      className: 'col-span-1',
    },
    {
      name: 'weftIn6Inches',
      label: 'Weft per 6 inches',
      type: 'number',
      min: 0,
      section: 'specifications',
      className: 'col-span-1',
    },
    {
      name: 'pileHeightMM',
      label: 'Pile Height (mm)',
      type: 'number',
      min: 0,
      step: 0.1,
      section: 'specifications',
      className: 'col-span-1',
    },
    {
      name: 'totalThicknessMM',
      label: 'Total Thickness (mm)',
      type: 'number',
      min: 0,
      step: 0.1,
      section: 'specifications',
      className: 'col-span-1',
    },
    {
      name: 'finishedGSM',
      label: 'Finished GSM',
      type: 'number',
      min: 0,
      section: 'specifications',
      className: 'col-span-1',
    },
    {
      name: 'unfinishedGSM',
      label: 'Unfinished GSM',
      type: 'number',
      min: 0,
      section: 'specifications',
      className: 'col-span-1',
    },
    {
      name: 'edgeLongerSide',
      label: 'Edge - Longer Side',
      type: 'text',
      placeholder: 'Edge finishing details',
      section: 'specifications',
      className: 'col-span-1',
    },
    {
      name: 'edgeShortSide',
      label: 'Edge - Shorter Side',
      type: 'text',
      placeholder: 'Edge finishing details',
      section: 'specifications',
      className: 'col-span-1',
    },
    {
      name: 'fringesHemLength',
      label: 'Fringes/Hem Length',
      type: 'text',
      placeholder: 'Length in cm or inches',
      section: 'specifications',
      className: 'col-span-1',
    },
    {
      name: 'fringesHemMaterial',
      label: 'Fringes/Hem Material',
      type: 'text',
      placeholder: 'Material used for hem',
      section: 'specifications',
      className: 'col-span-1',
    },
    {
      name: 'shadeCardNo',
      label: 'Shade Card Number',
      type: 'text',
      placeholder: 'Color reference number',
      section: 'specifications',
      className: 'col-span-2',
    },

    // Production Details
    {
      name: 'typeOfDyeing',
      label: 'Type of Dyeing',
      type: 'select',
      options: dyeingOptions,
      section: 'production',
      className: 'col-span-1',
    },
    {
      name: 'contractorType',
      label: 'Contractor Type',
      type: 'select',
      options: contractorTypeOptions,
      section: 'production',
      className: 'col-span-1',
    },
    {
      name: 'contractorName',
      label: 'Contractor Name',
      type: 'text',
      placeholder: 'Enter contractor name',
      section: 'production',
      className: 'col-span-1',
      conditional: {
        field: 'contractorType',
        value: 'contractor',
        operator: 'equals',
      },
    },
    {
      name: 'weaverName',
      label: 'Weaver Name',
      type: 'text',
      placeholder: 'Enter weaver name',
      section: 'production',
      className: 'col-span-1',
    },
    {
      name: 'submittedBy',
      label: 'Submitted By',
      type: 'text',
      placeholder: 'Name of person submitting',
      section: 'production',
      className: 'col-span-1',
    },
    {
      name: 'hasWashing',
      label: 'Requires Washing',
      type: 'radio',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      section: 'production',
      className: 'col-span-1',
    },
    {
      name: 'washingContractor',
      label: 'Washing Contractor',
      type: 'text',
      placeholder: 'Name of washing contractor',
      section: 'production',
      className: 'col-span-2',
      conditional: {
        field: 'hasWashing',
        value: 'yes',
        operator: 'equals',
      },
    },
    {
      name: 'carpetNo',
      label: 'Carpet Number',
      type: 'text',
      placeholder: 'Internal carpet number',
      section: 'production',
      className: 'col-span-1',
    },

    // Materials & Costs
    {
      name: 'weavingCost',
      label: 'Weaving Cost',
      type: 'number',
      min: 0,
      step: 0.01,
      section: 'materials',
      className: 'col-span-1',
    },
    {
      name: 'finishingCost',
      label: 'Finishing Cost',
      type: 'number',
      min: 0,
      step: 0.01,
      section: 'materials',
      className: 'col-span-1',
    },
    {
      name: 'packingCost',
      label: 'Packing Cost',
      type: 'number',
      min: 0,
      step: 0.01,
      section: 'materials',
      className: 'col-span-1',
    },
    {
      name: 'overheadPercentage',
      label: 'Overhead (%)',
      type: 'number',
      min: 0,
      max: 100,
      step: 0.1,
      section: 'materials',
      className: 'col-span-1',
    },
    {
      name: 'profitPercentage',
      label: 'Profit Margin (%)',
      type: 'number',
      min: 0,
      max: 100,
      step: 0.1,
      section: 'materials',
      className: 'col-span-1',
    },
    {
      name: 'unit',
      label: 'Unit of Measurement',
      type: 'select',
      options: unitOptions,
      section: 'materials',
      className: 'col-span-1',
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      options: currencyOptions,
      section: 'materials',
      className: 'col-span-1',
    },
    {
      name: 'exchangeRate',
      label: 'Exchange Rate (INR to USD)',
      type: 'number',
      min: 0,
      step: 0.01,
      section: 'materials',
      className: 'col-span-1',
      description: 'Current exchange rate',
    },

    // Quality & Finishing
    {
      name: 'priority',
      label: 'Priority Level',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
      section: 'quality',
      className: 'col-span-1',
    },
    {
      name: 'isTemplate',
      label: 'Save as Template',
      type: 'checkbox',
      section: 'quality',
      className: 'col-span-2',
      description: 'Check to save this configuration as a reusable template',
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'text',
      placeholder: 'Enter tags separated by commas',
      section: 'quality',
      className: 'col-span-2',
      description: 'Add tags for better searchability and organization',
    },

    // Images & Attachments
    {
      name: 'images',
      label: 'Rug Images',
      type: 'file',
      accept: 'image/*',
      multiple: true,
      section: 'attachments',
      className: 'col-span-2',
      description: 'Upload high-quality images of the rug design',
    },
  ];

  // Default values
  const defaultValues = {
    status: 'Draft',
    unit: 'PSM',
    currency: 'INR',
    exchangeRate: 83,
    packingCost: 125,
    overheadPercentage: 5,
    profitPercentage: 0,
    hasWashing: 'no',
    priority: 'medium',
    isTemplate: false,
    selectedColors: [],
    tags: [],
    materials: [],
    images: [],
    processFlow: [],
    attachments: [],
    ...initialData,
  };

  // Tabs configuration
  const tabs = [
    {
      id: 'basic',
      label: 'Basic Info',
      sections: ['basic', 'buyer'],
    },
    {
      id: 'technical',
      label: 'Technical',
      sections: ['specifications', 'production'],
    },
    {
      id: 'cost',
      label: 'Cost & Materials',
      sections: ['materials', 'quality'],
    },
    {
      id: 'attachments',
      label: 'Attachments',
      sections: ['attachments'],
    },
  ];

  const handleSubmit = async (data: any) => {
    try {
      // Process the form data
      const processedData = {
        ...data,
        // Convert tags string to array
        tags: typeof data.tags === 'string' 
          ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
          : data.tags || [],
        // Set timestamps
        createdAt: mode === 'create' ? new Date().toISOString() : initialData.createdAt,
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user', // Replace with actual user ID
        updatedBy: 'current-user', // Replace with actual user ID
      };

      if (onSubmit) {
        await onSubmit(processedData);
      } else {
        // Default submission logic
        const response = await fetch('/api/rugs', {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(processedData),
        });

        if (!response.ok) {
          throw new Error('Failed to save rug');
        }

        toast({
          title: "Success",
          description: `Rug ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: `Failed to ${mode} rug. Please try again.`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <FormBuilder
      title={mode === 'create' ? 'Create New Rug Sample' : 'Edit Rug Sample'}
      description="Complete form with all rug specifications, materials, and production details"
      schema={RugSchema}
      fields={fields}
      sections={sections}
      tabs={tabs}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitLabel={mode === 'create' ? 'Create Rug' : 'Update Rug'}
      autoSave={true}
      autoSaveInterval={30000}
      className="max-w-6xl"
    />
  );
};

export default EnhancedCreateRugForm;