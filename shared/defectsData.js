export const MASTER_DEFECTS = [
    // Pre Inspection defects
    { defectCode: 'P001', defectName: 'Stain', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'P002', defectName: 'Wrong Color', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'P003', defectName: 'Wrong Design', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'P004', defectName: 'Foreign material', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'P005', defectName: 'Contamination with different material', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'P006', defectName: 'Color blotch/bleeding/stain', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'P007', defectName: 'Other', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'P008', defectName: 'Insert Defect', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
    // Binding defects
    { defectCode: 'B001', defectName: 'Color Enhancement', process: 'Binding', severity: 'Major', defectClassification: 'CRITICAL' },
    { defectCode: 'B002', defectName: 'Binding', process: 'Binding', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'B003', defectName: 'Shearing Not', process: 'Binding', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'B004', defectName: 'Knot', process: 'Binding', severity: 'Minor', defectClassification: 'MINOR' },
    // Clipping defects
    { defectCode: 'C001', defectName: 'Compressing and oil stain/spots', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'C002', defectName: 'Selvage', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'C003', defectName: 'Color variations', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'C004', defectName: 'Size off', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'C005', defectName: 'Shade Variation', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'C006', defectName: 'Design not central', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'C007', defectName: 'Missing Line', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'C008', defectName: 'Design not matching', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'C009', defectName: 'Open Side', process: 'Clipping', severity: 'Minor', defectClassification: 'MINOR' },
    { defectCode: 'C010', defectName: 'Over shearing', process: 'Clipping', severity: 'Minor', defectClassification: 'MINOR' },
    { defectCode: 'C011', defectName: 'Latex Bleed', process: 'Clipping', severity: 'Minor', defectClassification: 'MINOR' },
    // Final Inspection defects
    { defectCode: 'F001', defectName: 'Stain Removal', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'F002', defectName: 'Brush Variation', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'F003', defectName: 'Size', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'F004', defectName: 'Denting and roll', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
    { defectCode: 'F005', defectName: 'Edge curling/roll edge', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
    { defectCode: 'F006', defectName: 'Crooked cut/cut edge', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
    { defectCode: 'F007', defectName: 'Crease/fold marks', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
    { defectCode: 'F008', defectName: 'Color bleeding', process: 'Final Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'F009', defectName: 'Color fading', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'F010', defectName: 'Color staining (water/wet cutting)', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'F011', defectName: 'Color staining (other)', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'F012', defectName: 'Soiling', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
    { defectCode: 'F013', defectName: 'Abrasion (wearing/thinning)', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'F014', defectName: 'Weaving knots', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
    { defectCode: 'F015', defectName: 'Wrong dimensions', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'F016', defectName: 'Surface defects', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
    { defectCode: 'F017', defectName: 'Back Pile', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
    // Washing defects
    { defectCode: 'W001', defectName: 'Color bleeding during wash', process: 'Washing', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'W002', defectName: 'Shrinkage excessive', process: 'Washing', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'W003', defectName: 'Water stains', process: 'Washing', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'W004', defectName: 'Chemical residue', process: 'Washing', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'W005', defectName: 'Drying marks', process: 'Washing', severity: 'Minor', defectClassification: 'MINOR' },
    // Stretching defects
    { defectCode: 'S001', defectName: 'Uneven stretching', process: 'Stretching', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'S002', defectName: 'Over-stretching damage', process: 'Stretching', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'S003', defectName: 'Corner not square', process: 'Stretching', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'S004', defectName: 'Tension marks', process: 'Stretching', severity: 'Minor', defectClassification: 'MINOR' },
    // On Loom defects
    { defectCode: 'OL001', defectName: 'Broken warp threads', process: 'On Loom', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'OL002', defectName: 'Uneven knot density', process: 'On Loom', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'OL003', defectName: 'Wrong pattern execution', process: 'On Loom', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'OL004', defectName: 'Loom marks', process: 'On Loom', severity: 'Minor', defectClassification: 'MINOR' },
    { defectCode: 'OL005', defectName: 'Tension inconsistency', process: 'On Loom', severity: 'Major', defectClassification: 'MAJOR' },
    // Lab defects
    { defectCode: 'L001', defectName: 'Color fastness failure', process: 'Lab', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'L002', defectName: 'Fiber composition mismatch', process: 'Lab', severity: 'Critical', defectClassification: 'CRITICAL' },
    { defectCode: 'L003', defectName: 'GSM variance', process: 'Lab', severity: 'Major', defectClassification: 'MAJOR' },
    { defectCode: 'L004', defectName: 'pH level incorrect', process: 'Lab', severity: 'Minor', defectClassification: 'MINOR' },
    { defectCode: 'L005', defectName: 'Moisture content high', process: 'Lab', severity: 'Minor', defectClassification: 'MINOR' },
];
// Helper function to get defects by process
export function getDefectsByProcess(process) {
    return MASTER_DEFECTS.filter(defect => defect.process === process);
}
// Helper function to get defect severity color
export function getDefectSeverityColor(severity) {
    switch (severity) {
        case 'Critical':
            return 'text-red-600 bg-red-50';
        case 'Major':
            return 'text-orange-600 bg-orange-50';
        case 'Minor':
            return 'text-yellow-600 bg-yellow-50';
        default:
            return 'text-gray-600 bg-gray-50';
    }
}
// Process mapping for quality tabs - matching actual tab names
export const PROCESS_MAPPING = {
    'Bazaar': 'Pre Inspection',
    'Binding': 'Binding',
    'Washing': 'Washing',
    'Stretching': 'Stretching',
    '100% Finished QC': 'Clipping',
    'Final Inspection': 'Final Inspection',
    'On Loom': 'On Loom',
    'Lab': 'Lab'
};
