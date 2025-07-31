import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { apiRequest } from '../lib/queryClient';
export function useComplianceAudit() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    // Fetch compliance audits
    const { data: audits = [], isLoading } = useQuery({
        queryKey: ['compliance-audits'],
        queryFn: async () => {
            try {
                const response = await apiRequest('/api/audits/compliance');
                return response.audits || [];
            }
            catch (error) {
                console.error('Error fetching compliance audits:', error);
                return [];
            }
        },
    });
    // Get draft audits
    const draftAudits = audits.filter(audit => audit.status === 'draft');
    // Get submitted audits
    const submittedAudits = audits.filter(audit => audit.status === 'submitted');
    // Create audit mutation
    const createAuditMutation = useMutation({
        mutationFn: async (auditData) => {
            const response = await apiRequest('/api/audits/compliance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(auditData),
            });
            return response.id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['compliance-audits'] });
            toast({
                title: "Audit created",
                description: "Compliance audit draft created successfully.",
            });
        },
        onError: (error) => {
            console.error('Error creating audit:', error);
            toast({
                title: "Error creating audit",
                description: "Failed to create compliance audit. Please try again.",
                variant: "destructive",
            });
        },
    });
    // Update audit mutation (for auto-save and manual save)
    const updateAuditMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await apiRequest(`/api/audits/compliance/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['compliance-audits'] });
        },
        onError: (error) => {
            console.error('Error updating audit:', error);
            toast({
                title: "Error saving audit",
                description: "Failed to save audit changes. Please try again.",
                variant: "destructive",
            });
        },
    });
    // Submit audit mutation
    const submitAuditMutation = useMutation({
        mutationFn: async (id) => {
            const response = await apiRequest(`/api/audits/compliance/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'submitted',
                    submittedAt: new Date().toISOString(),
                }),
            });
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['compliance-audits'] });
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
    // Get single audit
    const getAudit = async (id) => {
        try {
            // Find audit in current audits list
            const audit = audits.find(a => a.id === id);
            return audit || null;
        }
        catch (error) {
            console.error('Error fetching audit:', error);
            return null;
        }
    };
    // Auto-save function with debouncing
    const autoSave = async (id, data) => {
        try {
            await updateAuditMutation.mutateAsync({ id, data });
        }
        catch (error) {
            console.error('Auto-save failed:', error);
        }
    };
    return {
        audits,
        draftAudits,
        submittedAudits,
        isLoading,
        createAudit: createAuditMutation.mutateAsync,
        updateAudit: updateAuditMutation.mutateAsync,
        submitAudit: submitAuditMutation.mutateAsync,
        getAudit,
        autoSave,
        isCreating: createAuditMutation.isPending,
        isUpdating: updateAuditMutation.isPending,
        isSubmitting: submitAuditMutation.isPending,
    };
}
