import { useQuery } from '@tanstack/react-query';
export const useSqlMaterials = () => {
    // Function to determine material type based on ERP material name
    const determineMaterialType = (item, index) => {
        const materialName = (item.name || '').toLowerCase();
        // Check for explicit warp keywords first (typically stronger, foundational materials)
        const warpKeywords = ['cotton', 'linen', 'silk warp', 'cotton warp', 'foundation'];
        const weftKeywords = ['wool', 'woolen', 'marino', 'felted', 'nm wool', 'silk weft'];
        // Check material name for explicit keywords
        if (warpKeywords.some(keyword => materialName.includes(keyword))) {
            return 'warp';
        }
        if (weftKeywords.some(keyword => materialName.includes(keyword))) {
            return 'weft';
        }
        // For ERP materials without clear type indicators, 
        // distribute evenly using index for consistency (alternating pattern)
        return (index % 2 === 0) ? 'warp' : 'weft';
    };
    const { data: materials = [], isLoading: loading, error } = useQuery({
        queryKey: ['/api/materials'],
        queryFn: async () => {
            console.log('Fetching materials from ERP database...');
            // Use the main API materials endpoint
            const response = await fetch('/api/materials');
            console.log('Response status:', response.status, 'OK:', response.ok);
            if (!response.ok) {
                throw new Error(`Failed to fetch materials: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                console.log(`✅ Successfully fetched ${data.length} materials from ERP database`);
                console.log('First few materials:', data.slice(0, 3));
                return data;
            }
            else {
                throw new Error('Invalid response format from materials API');
            }
        },
        select: (data) => {
            console.log(`✅ Successfully fetched ${data.length} materials from ERP database`);
            console.log('First few materials:', data.slice(0, 3));
            // Transform ERP data to MaterialDatabaseItem format
            // Create both warp and weft versions of each material for flexibility
            const transformedMaterials = [];
            data.forEach((item, index) => {
                const baseMaterial = {
                    name: (item.name || 'Unknown Material').trim(),
                    rate: parseFloat(item.rate) || 0,
                    dyeingCost: 0, // Default dyeing cost
                    description: item.supplier ? `Supplier: ${item.supplier.trim()}` : '',
                    supplier: (item.supplier || '').trim(),
                    dyeType: '',
                    quantity: 0,
                    orderNumber: '',
                    itemType: '',
                };
                // Add as warp material
                transformedMaterials.push({
                    ...baseMaterial,
                    id: `erp_warp_${index}`,
                    type: 'warp',
                });
                // Add as weft material
                transformedMaterials.push({
                    ...baseMaterial,
                    id: `erp_weft_${index}`,
                    type: 'weft',
                });
            });
            console.log(`Transformed ${transformedMaterials.length} materials for dropdown`);
            console.log('Warp materials:', transformedMaterials.filter(m => m.type === 'warp').length);
            console.log('Weft materials:', transformedMaterials.filter(m => m.type === 'weft').length);
            return transformedMaterials;
        },
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
    const getWarpMaterials = () => materials.filter(m => m.type === 'warp');
    const getWeftMaterials = () => materials.filter(m => m.type === 'weft');
    return {
        materials,
        loading,
        error: error?.message || null,
        getWarpMaterials,
        getWeftMaterials,
    };
};
