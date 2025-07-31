import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AuditQuestion {
  question: string;
  answer: 'Yes' | 'No' | 'Pass' | 'Fail' | '';
  comments: string;
  images: string[];
}

export interface AuditSection {
  title: string;
  questions: AuditQuestion[];
}

export interface AuditForm {
  id?: string;
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
  status: 'draft' | 'submitted' | 'dropped';
  company: string;
  auditType: 'Final Inspection' | 'Washing' | 'Bazar';
  sections: AuditSection[];
}

const BASE_URL = import.meta.env.DEV ? 'http://localhost:5000' : '';

export function useAuditForms(company?: string, status?: string, auditType?: string) {
  const queryClient = useQueryClient();
  
  const queryParams = new URLSearchParams();
  if (company) queryParams.append('company', company);
  if (status) queryParams.append('status', status);
  if (auditType) queryParams.append('auditType', auditType);
  
  const { data: auditForms = [], isLoading, error } = useQuery({
    queryKey: ['/api/audit-forms', company, status, auditType],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/api/audit-forms?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch audit forms');
      return response.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (auditForm: Omit<AuditForm, 'id'>) => {
      const response = await fetch(`${BASE_URL}/api/audit-forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditForm)
      });
      if (!response.ok) throw new Error('Failed to create audit form');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/audit-forms'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...auditForm }: AuditForm) => {
      const response = await fetch(`${BASE_URL}/api/audit-forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditForm)
      });
      if (!response.ok) throw new Error('Failed to update audit form');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/audit-forms'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${BASE_URL}/api/audit-forms/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete audit form');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/audit-forms'] });
    }
  });

  return {
    auditForms,
    isLoading,
    error,
    createAuditForm: createMutation.mutate,
    updateAuditForm: updateMutation.mutate,
    deleteAuditForm: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

export function useAuditForm(id: string) {
  const { data: auditForm, isLoading, error } = useQuery({
    queryKey: ['/api/audit-forms', id],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/api/audit-forms/${id}`);
      if (!response.ok) throw new Error('Failed to fetch audit form');
      return response.json();
    },
    enabled: !!id
  });

  return { auditForm, isLoading, error };
}