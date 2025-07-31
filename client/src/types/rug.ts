export interface Material {
  id: string;
  name: string;
  type: 'warp' | 'weft';
  consumption: number;
  rate: number;
  dyeingCost: number;
  handSpinningCost: number;
  costPerSqM: number;
  plyCount?: number; // No. of Ply in Weaving (1-99)
  isDyed?: boolean;
  hasHandSpinning?: boolean;
}

export interface ProcessFlow {
  process: string;
  step: number;
}

export interface RugImages {
  [key: string]: string | undefined;
  rugPhoto?: string;
  shadeCard?: string;
  backPhoto?: string;
  masterHank?: string;
  masterSample?: string;
}

export interface Rug {
  id?: string;
  designName: string;
  construction: string;
  quality: string;
  color: string;
  primaryColor?: string;
  secondaryColor?: string;
  selectedColors?: string[];
  orderType: string;
  buyerName: string;
  opsNo: string;
  carpetNo: string;
  finishedGSM: number;
  unfinishedGSM: number;
  size: string;
  typeOfDyeing: string;
  contractorType: 'contractor' | 'inhouse';
  contractorName?: string;
  weaverName?: string;
  submittedBy: string;
  washingContractor?: string;
  reedNoQuality: string;
  hasWashing: 'yes' | 'no';
  // New specification fields
  warpIn6Inches?: number;
  weftIn6Inches?: number;
  pileHeightMM?: number;
  totalThicknessMM?: number;
  edgeLongerSide?: 'Loom Binding' | 'Binding';
  edgeShortSide?: 'Fringes' | 'Binding' | 'Hem';
  fringesHemLength?: string;
  fringesHemMaterial?: string;
  shadeCardNo?: string;
  materials: Material[];
  weavingCost: number;
  finishingCost: number;
  packingCost: number;
  overheadPercentage: number;
  profitPercentage: number;
  processFlow: ProcessFlow[];
  images: RugImages;
  totalMaterialCost: number;
  totalDirectCost: number;
  finalCostPSM: number;
  totalRugCost: number;
  area: number;
  unit: 'PSM' | 'PSF';
  currency: 'INR' | 'USD';
  exchangeRate: number;
  pileGSM?: number;
  createdAt: Date;
  updatedAt: Date;
}

// SQL Server database material item (from vopspurchase table)
export interface MaterialDatabaseItem {
  id: string;
  name: string;
  type: 'warp' | 'weft';
  rate: number;
  dyeingCost: number;
  description?: string;
  // Add any other fields that exist in your vopspurchase table
  [key: string]: any;
}

export const CONSTRUCTION_OPTIONS = [
  'Pitloom',
  'Punja', 
  'Hand Knotted',
  'Nepali',
  'Tufted',
  'Table Tufted',
  'Handloom',
  'VDW',
  'Jaquard'
];

export const ORDER_TYPE_OPTIONS = [
  'Sample',
  'Custom', 
  'Buyer PD'
];

export const DYEING_TYPE_OPTIONS = [
  'Solid/Plain',
  'Gabbeh',
  'Tie Dye',
  'Abrash',
  'Space Dyed',
  'Natural Yarn'
];

export const EDGE_LONGER_SIDE_OPTIONS = [
  'Loom Binding',
  'Binding'
];

export const EDGE_SHORT_SIDE_OPTIONS = [
  'Fringes',
  'Binding',
  'Hem'
];

export const CONSTRUCTION_QUALITY_MAP: Record<string, string[]> = {
  'Hand Knotted': [
    '3/8', '3/10', '3/12', '3/15', '3/20', '4/14', '4/20', '4/30', 
    '5/15', '5/20', '5/25', '6/16', '7/18', '7/35', '8/22', '8/36', 
    '8/40', '9/25', '9/30', '9/45', '10/30', '10/36'
  ],
  'Nepali': [
    '4/20', '4/30', '5/15', '5/20', '5/25', '6/16', '7/18', '7/35', 
    '8/22', '8/36', '8/40', '9/25', '9/30', '9/45', '10/30', '10/36', 
    '10/42', '10/50', '11/55', '12/36'
  ],
  'Punja': [
    'Reed No. 4', 'Reed No. 6', 'Reed No. 8', 'Reed No. 10', 'Reed No. 12', 
    'Reed No. 14', 'Reed No. 16', 'Reed No. 18', 'Reed No. 20', 'Reed No. 22', 'Reed No. 24'
  ],
  'Pitloom': [
    'Reed No. 4', 'Reed No. 6', 'Reed No. 8', 'Reed No. 10', 'Reed No. 12', 
    'Reed No. 14', 'Reed No. 16', 'Reed No. 18', 'Reed No. 20', 'Reed No. 22', 'Reed No. 24'
  ],
  'Handloom': [
    'Reed No. 4', 'Reed No. 6', 'Reed No. 8', 'Reed No. 10', 'Reed No. 12', 
    'Reed No. 14', 'Reed No. 16', 'Reed No. 18', 'Reed No. 20', 'Reed No. 22', 'Reed No. 24'
  ],
  'Tufted': [
    'Pick 10', 'Pick 12', 'Pick 14', 'Pick 16', 'Pick 18', 'Pick 20'
  ],
  'VDW': [
    '6 Pick', '7 Pick', '8 Pick', '9 Pick'
  ],
  'Jaquard': [], // Allow user entry
  'Table Tufted': [] // Allow user entry
};

export const PROCESS_NAMES = [
  'Raw Material Purchase',
  'Dyeing',
  'Weaving',
  'Washing',
  'Clipping',
  'Faafi (Final Clipping)',
  'Stretching',
  'Action Backing',
  'Cotton Backing',
  'Binding',
  'Futki',
  'Packing'
];

export interface ColorOption {
  name: string;
  hex: string;
}

// 10 main colors for rug selection - arranged in 2 rows
export const COLOR_PALETTE: ColorOption[] = [
  // Row 1 - Light/Neutral tones
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Sand', hex: '#C2B280' },
  { name: 'Wheat', hex: '#F5DEB3' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Beige', hex: '#F5F5DC' },

  // Row 2 - Darker/Accent tones
  { name: 'Grey', hex: '#808080' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Green', hex: '#228B22' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Multi', hex: '#DE5D83' }
];