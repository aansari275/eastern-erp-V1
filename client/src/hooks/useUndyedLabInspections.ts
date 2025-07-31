import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import type { UndyedLabInspection } from '../../../shared/schema';

// Hook for managing undyed lab inspections
export function useUndyedLabInspections() {
  return useQuery({
    queryKey: ['/api/lab-inspections/undyed'],
    queryFn: () => apiRequest('/api/lab-inspections/undyed'),
    select: (data: any[]): UndyedLabInspection[] => {
      console.log('🧪 Client: Processing undyed lab inspections:', data.length);
      return data.map(item => ({
        ...item,
        materialType: 'undyed' as const
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for creating new undyed lab inspection
export function useCreateUndyedLabInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UndyedLabInspection>) => {
      console.log('🧪 Client: Creating undyed lab inspection');
      return apiRequest('/api/lab-inspections/undyed', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lab-inspections/undyed'] });
      console.log('✅ Client: Undyed lab inspection created, cache invalidated');
    },
    onError: (error) => {
      console.error('❌ Client: Error creating undyed lab inspection:', error);
    }
  });
}

// Hook for updating undyed lab inspection
export function useUpdateUndyedLabInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UndyedLabInspection> }) => {
      console.log('🧪 Client: Updating undyed lab inspection:', id);
      return apiRequest(`/api/lab-inspections/undyed/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lab-inspections/undyed'] });
      console.log('✅ Client: Undyed lab inspection updated, cache invalidated');
    },
    onError: (error) => {
      console.error('❌ Client: Error updating undyed lab inspection:', error);
    }
  });
}

// Hook for deleting undyed lab inspection
export function useDeleteUndyedLabInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      console.log('🧪 Client: Deleting undyed lab inspection:', id);
      return apiRequest(`/api/lab-inspections/undyed/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lab-inspections/undyed'] });
      console.log('✅ Client: Undyed lab inspection deleted, cache invalidated');
    },
    onError: (error) => {
      console.error('❌ Client: Error deleting undyed lab inspection:', error);
    }
  });
}