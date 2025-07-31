
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface TabPermission {
  tabId: string;
  canView: boolean;
  canEdit: boolean;
}

export const useTabPermissions = () => {
  const { userDoc } = useAuth();
  const [tabPermissions, setTabPermissions] = useState<TabPermission[]>([]);

  useEffect(() => {
    if (userDoc) {
      // Extract tab permissions from user document
      const allowedTabs = userDoc.allowedTabs || [];
      const role = userDoc.role || 'viewer';
      
      // Define default tab permissions based on role
      const permissions: TabPermission[] = [
        {
          tabId: 'sampling_create',
          canView: allowedTabs.includes('sampling_create') || role === 'admin',
          canEdit: role === 'admin' || role.includes('manager'),
        },
        {
          tabId: 'sampling_gallery',
          canView: allowedTabs.includes('sampling_gallery') || role === 'admin',
          canEdit: role === 'admin' || role.includes('manager'),
        },
        {
          tabId: 'merchandising_quotes',
          canView: allowedTabs.includes('merchandising_quotes') || role === 'admin',
          canEdit: role === 'admin' || role.includes('manager'),
        },
        {
          tabId: 'merchandising_buyers',
          canView: allowedTabs.includes('merchandising_buyers') || role === 'admin',
          canEdit: role === 'admin' || role.includes('manager'),
        },
        {
          tabId: 'merchandising_pdoc',
          canView: allowedTabs.includes('merchandising_pdoc') || role === 'admin',
          canEdit: role === 'admin' || role.includes('manager'),
        },
        {
          tabId: 'admin_users',
          canView: role === 'admin',
          canEdit: role === 'admin',
        },
      ];
      
      setTabPermissions(permissions);
    }
  }, [userDoc]);

  const canViewTab = (tabId: string): boolean => {
    const permission = tabPermissions.find(p => p.tabId === tabId);
    return permission?.canView || false;
  };

  const canEditTab = (tabId: string): boolean => {
    const permission = tabPermissions.find(p => p.tabId === tabId);
    return permission?.canEdit || false;
  };

  return {
    tabPermissions,
    canViewTab,
    canEditTab,
  };
};
