import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Rug } from '../types/rug';

interface DbRug {
  id: number;
  userId: string;
  designName: string;
  construction?: string;
  quality?: string;
  color?: string;
  orderType?: string;
  buyerName?: string;
  opsNo?: string;
  carpetNo?: string;
  finishedGSM?: string;
  unfinishedGSM?: string;
  size?: string;
  typeOfDyeing?: string;
  contractorType?: string;
  contractorName?: string;
  weaverName?: string;
  submittedBy?: string;
  washingContractor?: string;
  reedNoQuality?: string;
  hasWashing?: string;
  materials?: any;
  weavingCost?: string;
  finishingCost?: string;
  packingCost?: string;
  overheadPercentage?: string;
  profitPercentage?: string;
  processFlow?: any;
  images?: any;
  totalMaterialCost?: string;
  totalDirectCost?: string;
  finalCostPSM?: string;
  totalRugCost?: string;
  area?: string;
  createdAt: string;
  updatedAt: string;
}

// Transform database rug to frontend rug format
const transformDbRugToRug = (dbRug: DbRug): Rug => ({
  id: dbRug.id.toString(),
  designName: dbRug.designName,
  construction: dbRug.construction || '',
  quality: dbRug.quality || '',
  color: dbRug.color || '',
  orderType: dbRug.orderType || '',
  buyerName: dbRug.buyerName || '',
  opsNo: dbRug.opsNo || '',
  carpetNo: dbRug.carpetNo || '',
  finishedGSM: parseFloat(dbRug.finishedGSM || '0'),
  unfinishedGSM: parseFloat(dbRug.unfinishedGSM || '0'),
  size: dbRug.size || '',
  typeOfDyeing: dbRug.typeOfDyeing || '',
  contractorType: (dbRug.contractorType as 'contractor' | 'inhouse') || 'contractor',
  contractorName: dbRug.contractorName || '',
  weaverName: dbRug.weaverName || '',
  submittedBy: dbRug.submittedBy || '',
  washingContractor: dbRug.washingContractor || '',
  reedNoQuality: dbRug.reedNoQuality || '',
  hasWashing: (dbRug.hasWashing as 'yes' | 'no') || 'no',
  materials: dbRug.materials || [],
  weavingCost: parseFloat(dbRug.weavingCost || '0'),
  finishingCost: parseFloat(dbRug.finishingCost || '0'),
  packingCost: parseFloat(dbRug.packingCost || '0'),
  overheadPercentage: parseFloat(dbRug.overheadPercentage || '0'),
  profitPercentage: parseFloat(dbRug.profitPercentage || '0'),
  processFlow: dbRug.processFlow || [],
  images: dbRug.images || {},
  totalMaterialCost: parseFloat(dbRug.totalMaterialCost || '0'),
  totalDirectCost: parseFloat(dbRug.totalDirectCost || '0'),
  finalCostPSM: parseFloat(dbRug.finalCostPSM || '0'),
  totalRugCost: parseFloat(dbRug.totalRugCost || '0'),
  area: parseFloat(dbRug.area || '0'),
  createdAt: new Date(dbRug.createdAt),
  updatedAt: new Date(dbRug.updatedAt),
});

// Transform frontend rug to database format
const transformRugToDbRug = (rug: Omit<Rug, 'id' | 'createdAt' | 'updatedAt'>, userId: string): any => ({
  userId,
  designName: rug.designName,
  construction: rug.construction,
  quality: rug.quality,
  color: rug.color,
  orderType: rug.orderType,
  buyerName: rug.buyerName,
  opsNo: rug.opsNo,
  carpetNo: rug.carpetNo,
  finishedGSM: rug.finishedGSM, // Keep as number, schema will handle conversion
  unfinishedGSM: rug.unfinishedGSM,
  size: rug.size,
  typeOfDyeing: rug.typeOfDyeing,
  contractorType: rug.contractorType,
  contractorName: rug.contractorName,
  weaverName: rug.weaverName,
  submittedBy: rug.submittedBy,
  washingContractor: rug.washingContractor,
  reedNoQuality: rug.reedNoQuality,
  hasWashing: rug.hasWashing,
  materials: rug.materials,
  weavingCost: rug.weavingCost,
  finishingCost: rug.finishingCost,
  packingCost: rug.packingCost,
  overheadPercentage: rug.overheadPercentage,
  profitPercentage: rug.profitPercentage,
  processFlow: rug.processFlow,
  images: rug.images,
  totalMaterialCost: rug.totalMaterialCost,
  totalDirectCost: rug.totalDirectCost,
  finalCostPSM: rug.finalCostPSM,
  totalRugCost: rug.totalRugCost,
  area: rug.area,
});

export const useDbRugs = (userId: string = 'demo-user') => {
  const queryClient = useQueryClient();

  const { data: dbRugs = [], isLoading, error } = useQuery({
    queryKey: ['/api/rugs'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const rugs = dbRugs.map(transformDbRugToRug);

  const addRugMutation = useMutation({
    mutationFn: async (rugData: Omit<Rug, 'id' | 'createdAt' | 'updatedAt'>) => {
      const dbRugData = transformRugToDbRug(rugData, userId);

      const response = await apiRequest('POST', '/api/rugs', dbRugData);
      const data = await response.json();
      return data as DbRug;
    },
    onSuccess: () => {
      // Invalidate and refetch after success
      queryClient.invalidateQueries({ queryKey: ['/api/rugs'] });
    },
  });

  const updateRugMutation = useMutation({
    mutationFn: async ({ id, rugData }: { id: string; rugData: Omit<Rug, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const dbRugData = transformRugToDbRug(rugData, userId);
      const response = await apiRequest('PUT', `/api/rugs/${id}`, dbRugData);
      const data = await response.json();
      return data as DbRug;
    },
    onSuccess: () => {
      // Invalidate and refetch after success
      queryClient.invalidateQueries({ queryKey: ['/api/rugs'] });
    },
  });

  const deleteRugMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/rugs/${id}`);
    },
    onSuccess: () => {
      // Invalidate and refetch after success
      queryClient.invalidateQueries({ queryKey: ['/api/rugs'] });
    },
  });

  return {
    rugs,
    loading: isLoading,
    error,
    addRug: (rugData: Omit<Rug, 'id' | 'createdAt' | 'updatedAt'>) => addRugMutation.mutateAsync(rugData),
    updateRug: (id: string, rugData: Omit<Rug, 'id' | 'createdAt' | 'updatedAt'>) => 
      updateRugMutation.mutateAsync({ id, rugData }),
    deleteRug: (id: string) => deleteRugMutation.mutateAsync(id),
  };
};