// QC Inspector definitions based on order types and stages
export const QC_INSPECTORS = [
    // Area Rugs Inspectors
    {
        id: 'afreen',
        name: 'Afreen',
        email: undefined, // Will be set when user logs in
        assignedStages: ['Lab'],
        orderTypes: ['Area Rugs']
    },
    {
        id: 'navazish',
        name: 'Navazish',
        email: undefined,
        assignedStages: ['Bazaar', '100% Finished QC'],
        orderTypes: ['Area Rugs']
    },
    {
        id: 'irfan',
        name: 'Irfan',
        email: undefined,
        assignedStages: ['Washing', 'Bazaar', 'Final Inspection'],
        orderTypes: ['Area Rugs', 'Custom']
    },
    {
        id: 'maiser',
        name: 'Maiser',
        email: undefined,
        assignedStages: ['Stretching', 'Binding'],
        orderTypes: ['Area Rugs']
    },
    {
        id: 'deepak',
        name: 'Deepak',
        email: undefined,
        assignedStages: ['100% Finished QC'],
        orderTypes: ['Area Rugs']
    },
    {
        id: 'shivam',
        name: 'Shivam',
        email: undefined,
        assignedStages: ['Final Inspection'],
        orderTypes: ['Area Rugs']
    },
    {
        id: 'arjun',
        name: 'Arjun',
        email: undefined,
        assignedStages: ['Final Inspection'],
        orderTypes: ['Area Rugs']
    },
    // Broadloom Inspector
    {
        id: 'ehsan',
        name: 'Ehsan',
        email: undefined,
        assignedStages: ['On Loom', 'Bazaar', 'Final Inspection'],
        orderTypes: ['Broadloom']
    }
];
// Function to get QC inspectors for a specific stage
export function getInspectorsForStage(stage) {
    return QC_INSPECTORS.filter(inspector => inspector.assignedStages.includes(stage));
}
// Function to get stages assigned to a specific inspector
export function getStagesForInspector(inspectorId) {
    const inspector = QC_INSPECTORS.find(i => i.id === inspectorId);
    return inspector?.assignedStages || [];
}
// Function to check if an inspector has access to a stage
export function hasStageAccess(inspectorId, stage) {
    const inspector = QC_INSPECTORS.find(i => i.id === inspectorId);
    return inspector?.assignedStages.includes(stage) || false;
}
// Function to get tabs visible to a specific user
export function getVisibleTabsForUser(userEmail, qcPermissions) {
    const userPermission = qcPermissions.find(p => p.email === userEmail);
    if (!userPermission || !userPermission.isActive) {
        return []; // No access if user not found or inactive
    }
    return userPermission.assignedStages;
}
// All possible inspection stages in sequence
export const ALL_INSPECTION_STAGES = [
    'Lab',
    'On Loom',
    'Bazaar',
    'Washing',
    'Stretching',
    'Binding',
    '100% Finished QC',
    'Final Inspection'
];
// Function to filter stages based on user permissions
export function filterStagesByPermission(userEmail, qcPermissions) {
    const visibleStages = getVisibleTabsForUser(userEmail, qcPermissions);
    if (visibleStages.length === 0) {
        return ALL_INSPECTION_STAGES; // Admin/fallback - show all stages
    }
    return visibleStages;
}
