import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ComplianceAudit, InsertComplianceAudit } from '../../../shared/schema';
import { useToast } from './use-toast';
import { apiRequest } from '../lib/queryClient';

export function useComplianceAudit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch compliance audits from new clean API
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['/api/audit'],
    queryFn: async () => {
      try {
        console.log('🔄 Fetching audits from new clean API...');
        const response = await apiRequest('/api/audit');
        console.log('✅ Clean audit API response:', response);
        return response.audits || [];
      } catch (error) {
        console.error('❌ Error fetching clean audits:', error);
        return [];
      }
    },
  });

  // Get draft audits
  const draftAudits = audits.filter((audit: ComplianceAudit) => audit.status === 'draft');
  
  // Get submitted audits - with debugging
  const submittedAudits = audits.filter((audit: ComplianceAudit) => audit.status === 'submitted');
  
  // Debug logging for status tracking
  useEffect(() => {
    console.log(`📊 Audit Status Debug:
    - Total audits: ${audits.length}
    - Draft audits: ${draftAudits.length}
    - Submitted audits: ${submittedAudits.length}
    - Status breakdown:`, audits.map((a: ComplianceAudit) => ({ id: a.id, status: a.status, company: a.company })));
  }, [audits.length, draftAudits.length, submittedAudits.length]);

  // Create audit mutation using new clean API
  const createAuditMutation = useMutation({
    mutationFn: async (auditData: any) => {
      console.log('🆕 Creating audit via clean API:', auditData);
      const response = await apiRequest('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData),
      });
      return response.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/audit'] });
      toast({
        title: "Audit created",
        description: "Compliance audit draft created successfully.",
      });
    },
    onError: (error) => {
      console.error('❌ Error creating audit:', error);
      toast({
        title: "Error creating audit",
        description: "Failed to create compliance audit. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update audit mutation using new clean API
  const updateAuditMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log('💾 HOOK: Updating audit via clean API', id, 'with data:', data);
      
      const response = await apiRequest(`/api/audit/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      console.log('✅ HOOK: Clean audit update successful');
      return id;
    },
    onSuccess: () => {
      console.log('✅ HOOK: Invalidating cache after successful update');
      queryClient.invalidateQueries({ queryKey: ['/api/audit'] });
    },
    onError: (error) => {
      console.error('❌ HOOK: Error updating audit:', error);
      toast({
        title: "Error saving audit",
        description: "Failed to save audit changes. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit audit mutation using new clean API
  const submitAuditMutation = useMutation({
    mutationFn: async (id: string) => {
      const submittedAt = new Date().toISOString();
      console.log('🚀 Frontend: Submitting audit via clean API with data:', { status: 'submitted', submittedAt });
      
      const response = await apiRequest(`/api/audit/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'submitted',
          submittedAt: submittedAt,
        }),
      });
      return { id, response, submittedAt };
    },
    onSuccess: async (result) => {
      // Force immediate cache refresh using new API key
      await queryClient.invalidateQueries({ queryKey: ['/api/audit'] });
      await queryClient.refetchQueries({ queryKey: ['/api/audit'] });
      
      // Also update the cache optimistically
      queryClient.setQueryData(['/api/audit'], (oldData: any) => {
        if (!oldData?.audits) return oldData;
        return {
          ...oldData,
          audits: oldData.audits.map((audit: any) => 
            audit.id === result.id 
              ? { ...audit, status: 'submitted', submittedAt: result.submittedAt }
              : audit
          )
        };
      });
      
      console.log('✅ Audit submitted successfully, cache updated');
      toast({
        title: "Audit submitted",
        description: "Compliance audit submitted successfully.",
      });
    },
    onError: (error) => {
      console.error('Error submitting audit:', error);
      toast({
        title: "Error submitting audit",
        description: "Failed to submit audit. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get single audit with full data preservation
  const getAudit = async (id: string): Promise<ComplianceAudit | null> => {
    try {
      // First try to find in current audits list
      let audit = audits.find((a: ComplianceAudit) => a.id === id);
      
      if (!audit) {
        // If not found locally, fetch directly from server
        console.log('🔍 Fetching audit from new clean API server:', id);
        const response = await apiRequest(`/api/audit/${id}`);
        audit = response.audit;
      }
      
      if (audit) {
        console.log('📋 Retrieved audit with parts:', audit.parts?.length || 0);
        // Log sample data to verify preservation
        if (audit.parts?.[0]?.items?.[0]) {
          console.log('📝 Sample item data:', {
            response: audit.parts[0].items[0].response,
            remark: audit.parts[0].items[0].remark,
            images: audit.parts[0].items[0].evidenceImages?.length || 0
          });
        }
      }
      
      return audit || null;
    } catch (error) {
      console.error('Error fetching audit:', error);
      return null;
    }
  };

  // Delete audit mutation using new clean API
  const deleteAuditMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/audit/${id}`, {
        method: 'DELETE',
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/audit'] });
      toast({
        title: "Audit deleted",
        description: "Compliance audit deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Error deleting audit:', error);
      toast({
        title: "Error deleting audit",
        description: "Failed to delete audit. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-save function DISABLED to prevent double saves
  const autoSave = async (id: string, data: Partial<ComplianceAudit>) => {
    console.log('🚫 AUTO-SAVE DISABLED: Preventing double save conflicts');
    // Auto-save disabled to prevent double save bug
    // Only manual saves are allowed
  };

  return {
    audits,
    draftAudits,
    submittedAudits,
    isLoading,
    createAudit: createAuditMutation.mutateAsync,
    updateAudit: updateAuditMutation.mutateAsync,
    submitAudit: submitAuditMutation.mutateAsync,
    deleteAuditMutation,
    getAudit,
    autoSave,
    isCreating: createAuditMutation.isPending,
    isUpdating: updateAuditMutation.isPending,
    isSubmitting: submitAuditMutation.isPending,
  };
}