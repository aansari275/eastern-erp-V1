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
export const CONSTRUCTION_QUALITY_MAP = {
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
// 10 main colors for rug selection - arranged in 2 rows
export const COLOR_PALETTE = [
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
