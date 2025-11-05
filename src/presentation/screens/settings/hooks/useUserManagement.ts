import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { VaultMembershipResponse } from '../../../../types/UserTypes';
import { VaultMembership } from '../../../../service/VaultService';
import { VaultMembershipService } from '../../../../service/VaultMembershipService';

export interface UserManagementState {
  vaultMembers: VaultMembershipResponse[];
  loading: boolean;
  error: string | null;
  deletingUserId: number | null;
}

export interface UseUserManagementProps {
  currentVault: VaultMembership | null;
}

export interface UseUserManagementReturn extends UserManagementState {
  fetchVaultMembers: () => Promise<void>;
  deleteUser: (member: VaultMembershipResponse) => Promise<void>;
  clearError: () => void;
}

export const useUserManagement = ({
  currentVault,
}: UseUserManagementProps): UseUserManagementReturn => {
  const currentVaultId = currentVault?.vault_id || null;

  const [state, setState] = useState<UserManagementState>({
    vaultMembers: [],
    loading: false,
    error: null,
    deletingUserId: null,
  });

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Fetches vault members from the API
   */
  const fetchVaultMembers = useCallback(async () => {
    if (!currentVaultId) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // TODO: Replace with actual VaultMembershipResponse fetch
      // Casting here ensures compatibility with correct state type
      // Fetch members using VaultMembershipService for the selected vault
      const rawMembers = await VaultMembershipService.fetchVaultMembers(currentVaultId);

      // Normalize and validate data
      const members: VaultMembershipResponse[] = Array.isArray(rawMembers)
        ? rawMembers.map((m: any, index: number) => ({
            id: m.id ?? index + 1,
            user_id: m.user_id ?? m.id ?? index + 1,
            vault_id: m.vault_id ?? currentVaultId,
            vault_name: m.vault_name ?? m.vault?.name ?? 'Unknown Vault',
            vault_device_id: m.vault_device_id ?? m.vault?.device_id ?? 'N/A',
            vault_location: m.vault_location ?? m.vault?.location ?? 'Unknown',
            first_name: m.first_name ?? m.user?.first_name ?? '',
            last_name: m.last_name ?? m.user?.last_name ?? '',
            username: m.username ?? m.user?.username ?? '',
            role: m.role ?? m.user?.role ?? 'user',
            created_at: m.created_at ?? new Date().toISOString(),
            updated_at: m.updated_at ?? new Date().toISOString(),
            last_access: m.last_access ?? new Date().toISOString(),
          }))
        : [];
      setState(prev => ({
        ...prev,
        vaultMembers: members,
        loading: false,
        error: null,
      }));
    } catch (error: unknown) {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Network error occurred';
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error; // Re-throw for component handling
    }
  }, [currentVaultId]);

  /**
   * Handles delete user from vault (no confirmation - handled by caller)
   */
  const deleteUser = useCallback(async (member: VaultMembershipResponse) => {
    if (!currentVaultId) {
      throw new Error('No vault selected');
    }

    setState(prev => ({ ...prev, deletingUserId: member.user_id }));
    
    try {
      await VaultMembershipService.removeUserFromVault(currentVaultId, member.user_id);
      
      setState(prev => ({
        ...prev,
        vaultMembers: prev.vaultMembers.filter(u => u.user_id !== member.user_id),
        deletingUserId: null,
      }));
    } catch (error: unknown) {
      setState(prev => ({ ...prev, deletingUserId: null }));
      const message = error instanceof Error ? error.message : 'Network error occurred';
      throw new Error(message);
    }
  }, [currentVaultId]);

  return {
    ...state,
    fetchVaultMembers,
    deleteUser,
    clearError,
  };
};