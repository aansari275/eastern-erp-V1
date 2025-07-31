// Determine severity based on defect type
function getSeverity(defectName) {
    const critical = ['Wrong P.O. NO.', 'Metal contamination', 'Color bleeding', 'Insect infested'];
    const minor = ['Missing A.S.N/ULL sticker', 'Moisture(Beyond tolerance)', 'Shedding'];
    if (critical.some(c => defectName.includes(c)))
        return 'Critical';
    if (minor.some(m => defectName.includes(m)))
        return 'Minor';
    return 'Major';
}
// Master defects from CSV data
export const CSV_DEFECTS = [
    { defectCode: 'P002', defectName: 'Wrong P.O. NO.', processes: ['Final Inspection'], severity: getSeverity('Wrong P.O. NO.') },
    { defectCode: 'P003', defectName: 'Missing A.S.N/ULL sticker', processes: ['Final Inspection'], severity: getSeverity('Missing A.S.N/ULL sticker') },
    { defectCode: 'P004', defectName: 'Incorrect Quantity / Assortments', processes: ['Final Inspection'], severity: getSeverity('Incorrect Quantity / Assortments') },
    { defectCode: 'P005', defectName: 'Carton/Pallet Marking Missing, incorrect or not legible, Carton/Pallet Type or Size not as specified or Damaged', processes: ['Final Inspection'], severity: getSeverity('Carton/Pallet Marking Missing') },
    { defectCode: 'P006', defectName: 'Insect infested', processes: ['Final Inspection'], severity: getSeverity('Insect infested') },
    { defectCode: 'P007', defectName: 'Metal contamination', processes: ['Final Inspection'], severity: getSeverity('Metal contamination') },
    { defectCode: 'P008', defectName: 'Moisture(Beyond tolerance)', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Moisture(Beyond tolerance)') },
    { defectCode: 'P009', defectName: 'Holes on surface', processes: ['Bazaar', 'Washing', 'Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Holes on surface') },
    { defectCode: 'P010', defectName: 'Shedding', processes: ['Stretching', 'Final Inspection'], severity: getSeverity('Shedding') },
    { defectCode: 'P011', defectName: 'Mending mark', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Mending mark') },
    { defectCode: 'P012', defectName: 'Knots', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Knots') },
    { defectCode: 'P013', defectName: 'Crooked/Skewness/Bowing', processes: ['Stretching', 'Final Inspection'], severity: getSeverity('Crooked/Skewness/Bowing') },
    { defectCode: 'P014', defectName: 'Size beyond tolerance', processes: ['Bazaar', 'Washing', 'Stretching', 'Binding', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Size beyond tolerance') },
    { defectCode: 'P015', defectName: 'Weight beyond tolerance', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Weight beyond tolerance') },
    { defectCode: 'P016', defectName: 'Stain (Oil,Soil,Latex)', processes: ['Bazaar', 'Washing', 'Stretching', 'Binding', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Stain (Oil,Soil,Latex)') },
    { defectCode: 'P017', defectName: 'Foreign matters/Lints/Dust', processes: ['Bazaar', 'Washing', 'Stretching', 'Binding', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Foreign matters/Lints/Dust') },
    { defectCode: 'P018', defectName: 'Curly/Round Corner', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Curly/Round Corner') },
    { defectCode: 'P019', defectName: 'Wavy selvedges/edges', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Wavy selvedges/edges') },
    { defectCode: 'P020', defectName: 'Contamination', processes: ['Stretching', 'Final Inspection'], severity: getSeverity('Contamination') },
    { defectCode: 'P021', defectName: 'Loose thread', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Loose thread') },
    { defectCode: 'R001', defectName: 'Construction (Hasiet) not as per approved sample', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Construction (Hasiet) not as per approved sample') },
    { defectCode: 'R002', defectName: 'Shade Variation', processes: ['Bazaar', 'Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Shade Variation') },
    { defectCode: 'R003', defectName: 'Color/Yarn not as per Map/Guchhi', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Color/Yarn not as per Map/Guchhi') },
    { defectCode: 'R004', defectName: 'Fringes not as per approved sample', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Fringes not as per approved sample') },
    { defectCode: 'R005', defectName: 'Wrong Design', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Wrong Design') },
    { defectCode: 'R006', defectName: 'Tufts per sq.in / rods per 10 c.m not as per approved sample.', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Tufts per sq.in / rods per 10 c.m not as per approved sample.') },
    { defectCode: 'R007', defectName: 'Pile height variation', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Pile height variation') },
    { defectCode: 'R008', defectName: 'Uneven Tufting.', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Uneven Tufting.') },
    { defectCode: 'R009', defectName: 'Incorrect pattern / repeat', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Incorrect pattern / repeat') },
    { defectCode: 'R010', defectName: 'Missing Tufts', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Missing Tufts') },
    { defectCode: 'R011', defectName: 'Knots', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Knots') },
    { defectCode: 'R012', defectName: 'Weaving defects (Floats)', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Weaving defects (Floats)') },
    { defectCode: 'W001', defectName: 'Damaged pile', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Damaged pile') },
    { defectCode: 'W002', defectName: 'Poor hand feel', processes: ['Stretching', 'Final Inspection'], severity: getSeverity('Poor hand feel') },
    { defectCode: 'W003', defectName: 'Spot(Color patches)', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Spot(Color patches)') },
    { defectCode: 'W004', defectName: 'Color bleeding', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Color bleeding') },
    { defectCode: 'L001', defectName: 'Latex visible on front.', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Latex visible on front.') },
    { defectCode: 'L002', defectName: 'Latex coating peeling/cracking', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Latex coating peeling/cracking') },
    { defectCode: 'L003', defectName: 'Coating uneven/lumps.', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Coating uneven/lumps.') },
    { defectCode: 'L004', defectName: 'Coating not completely dry.', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Coating not completely dry.') },
    { defectCode: 'L005', defectName: 'Latex Odour.', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Latex Odour.') },
    { defectCode: 'L006', defectName: 'Loose backing cloth', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Loose backing cloth') },
    { defectCode: 'L007', defectName: 'Wavy stretching', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Wavy stretching') },
    { defectCode: 'B001', defectName: 'Binding wool color variation.', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Binding wool color variation.') },
    { defectCode: 'B002', defectName: 'Stitch rate not as per approved sample', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Stitch rate not as per approved sample') },
    { defectCode: 'B003', defectName: 'Edges coming off.', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Edges coming off.') },
    { defectCode: 'B004', defectName: 'Binding. Lock Missing', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Binding. Lock Missing') },
    { defectCode: 'B005', defectName: 'Improper/uneven Binding', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Improper/uneven Binding') },
    { defectCode: 'H001', defectName: 'Color variation of Stitching thread', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Color variation of Stitching thread') },
    { defectCode: 'H002', defectName: 'Folding at edges not proper.', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Folding at edges not proper.') },
    { defectCode: 'H003', defectName: 'Stitching not proper.', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Stitching not proper.') },
    { defectCode: 'H004', defectName: 'Bubbling thread.', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Bubbling thread.') },
    { defectCode: 'H005', defectName: 'Wavy Stitching', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Wavy Stitching') },
    { defectCode: 'SE001', defectName: 'Embossing not as per design.', processes: ['Stretching', 'Final Inspection'], severity: getSeverity('Embossing not as per design.') },
    { defectCode: 'SE002', defectName: 'Uneven Shearing.', processes: ['Stretching', 'Final Inspection'], severity: getSeverity('Uneven Shearing.') },
    { defectCode: 'SE003', defectName: 'Berai not proper', processes: ['Stretching', 'Final Inspection'], severity: getSeverity('Berai not proper') },
    { defectCode: 'SE004', defectName: 'Uneven pile /Shearing', processes: ['Stretching', 'Final Inspection'], severity: getSeverity('Uneven pile /Shearing') },
    { defectCode: 'SE005', defectName: 'Improper/uneven embossing', processes: ['Stretching', 'Final Inspection'], severity: getSeverity('Improper/uneven embossing') },
    { defectCode: 'ST001', defectName: 'Broken/ Skipped/ Uneven', processes: ['Stretching', 'Final Inspection'], severity: getSeverity('Broken/ Skipped/ Uneven') },
    { defectCode: 'ST002', defectName: 'Puckering', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Puckering') },
    { defectCode: 'ST003', defectName: 'Stitch Rate', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Stitch Rate') },
    { defectCode: 'ST004', defectName: 'Wavy Stitch', processes: ['Stretching', '100% Finished QC', 'Final Inspection'], severity: getSeverity('Wavy Stitch') },
];
// Helper function to get defects by process using CSV data
export function getCSVDefectsByProcess(process) {
    return CSV_DEFECTS
        .filter(defect => defect.processes.includes(process))
        .map(defect => ({
        defectCode: defect.defectCode,
        defectName: defect.defectName,
        severity: defect.severity
    }));
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
    'Bazaar': 'Bazaar',
    'Binding': 'Binding',
    'Washing': 'Washing',
    'Stretching': 'Stretching',
    '100% Finished QC': '100% Finished QC',
    'Final Inspection': 'Final Inspection',
    'On Loom': 'On Loom',
    'Lab': 'Lab'
};
