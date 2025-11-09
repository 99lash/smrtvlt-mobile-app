import { useCallback } from 'react';
import type { UsersScreenProps } from '../../../../types/UserTypes';
import { VaultMembership, VaultService, TransferType } from '../../../../service/VaultService';
import { useVaultManagement } from '../../../hooks/VaultContext';

interface UseUserActionsProps {
  navigation: UsersScreenProps['navigation'];
  vaults: VaultMembership[];
  loadData: () => Promise<void>;
  openInvitationFlow: (vaults: VaultMembership[], checkAdmin: (id: number) => Promise<boolean>) => Promise<void>;
  openQRScanner: () => void;
  closeModals: () => void;
  selectVault: (vaultId: number) => void;
}

export const useUserActions = ({
  navigation,
  vaults,
  loadData,
  openInvitationFlow,
  openQRScanner,
  closeModals,
  selectVault,
}: UseUserActionsProps) => {
  // Vault context for global vault management
  const { forceRefreshVaults, selectVault: selectVaultInContext } = useVaultManagement();

  const handleUserPress = useCallback((userId: string) => {
    navigation?.navigate('UserDetails', { userId });
  }, [navigation]);

  const handleInviteUser = useCallback(() => {
    // For now, pass empty array and a simple check function
    // This should be improved based on actual vault checking logic
    openInvitationFlow(vaults, async (id: number) => {
      // Simple admin check - can be improved
      return vaults.some(v => v.vault_id === id && v.role === 'admin');
    });
  }, [openInvitationFlow, vaults]);

  const handleVaultSelect = useCallback((vaultId: number) => {
    selectVault(vaultId);
  }, [selectVault]);

  const handleInvitationAccepted = useCallback(async (vaultId?: number, role?: string) => {
    try {
      console.log('🎉 Invitation accepted, refreshing vault lists...', { vaultId, role });
      
      // Refresh both local data and global vault context in parallel
      await Promise.all([
        loadData(),
        forceRefreshVaults()
      ]);
      
      // If we have the vault ID, select it in the global context
      if (vaultId) {
        console.log('🎯 Selecting new vault in context:', vaultId);
        selectVaultInContext(vaultId);
      }
      
      console.log('✅ Vault lists refreshed successfully');
      closeModals();
    } catch (error) {
      console.error('❌ Failed to refresh vault lists after invitation acceptance:', error);
      // Still close modals even if refresh fails
      closeModals();
    }
  }, [loadData, forceRefreshVaults, selectVaultInContext, closeModals]);

  const handleInitiateOwnershipTransfer = useCallback(async (
    vaultId: number,
    newOwnerId: number,
    transferType: TransferType
  ) => {
    try {
      console.log('🔄 Initiating ownership transfer:', { vaultId, newOwnerId, transferType });
      const response = await VaultService.initiateOwnershipTransfer(vaultId, newOwnerId, transferType);
      console.log('✅ Ownership transfer initiated successfully:', response);
      console.log('🔍 Response data:', response.data);
      console.log('🔍 Invitation code:', response.data?.invitation_code);

      // DON'T refresh data here - it causes the modal to unmount before showing the code
      // The refresh will happen when the user closes the modal

      // Return only the fields the modal needs
      const result = {
        invitation_code: response.data?.invitation_code,
        expires_at: response.data?.expires_at,
        transfer_type: response.data?.transfer_type,
      };
      
      console.log('🔍 Returning result:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to initiate ownership transfer:', error);
      throw error;
    }
  }, []);

  // Wrapper functions that close the modal after actions
  const handleInviteUserWithClose = useCallback(() => {
    handleInviteUser();
  }, [handleInviteUser]);

  const handleJoinVaultWithClose = useCallback(() => {
    openQRScanner();
  }, [openQRScanner]);

  return {
    handleUserPress,
    handleInviteUser: handleInviteUserWithClose,
    handleVaultSelect,
    handleInvitationAccepted,
    handleJoinVault: handleJoinVaultWithClose,
    handleInitiateOwnershipTransfer,
  };
};