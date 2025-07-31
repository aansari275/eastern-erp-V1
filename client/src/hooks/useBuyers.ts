import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Buyer, InsertBuyer } from "@shared/schema";

export const useBuyers = () => {
  const queryClient = useQueryClient();

  const { data: buyers = [], isLoading, error } = useQuery({
    queryKey: ['/api/buyers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/buyers');
      if (!response.ok) {
        throw new Error('Failed to fetch buyers');
      }
      const data = await response.json();
      return Array.isArray(data) ? data as Buyer[] : [];
    },
  });

  const createBuyerMutation = useMutation({
    mutationFn: async (buyerData: InsertBuyer) => {
      const response = await apiRequest('POST', '/api/buyers', buyerData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buyers'] });
    },
  });

  const updateBuyerMutation = useMutation({
    mutationFn: async ({ id, ...buyerData }: { id: number } & Partial<InsertBuyer>) => {
      const response = await apiRequest('PUT', `/api/buyers/${id}`, buyerData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buyers'] });
    },
  });

  const deleteBuyerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/buyers/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/buyers'] });
    },
  });

  return {
    buyers,
    isLoading,
    error,
    createBuyer: createBuyerMutation.mutate,
    updateBuyer: updateBuyerMutation.mutate,
    deleteBuyer: deleteBuyerMutation.mutate,
    isCreating: createBuyerMutation.isPending,
    isUpdating: updateBuyerMutation.isPending,
    isDeleting: deleteBuyerMutation.isPending,
  };
};