import { useCallback } from 'react';
import type { UsersScreenProps } from '../../../../types/UserTypes';
import { VaultMembership } from '../../../../service/VaultService';

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

  const handleUserPress = useCallback((userId: string) => {
    navigation.navigate('UserDetails', { userId });
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

  const handleInvitationAccepted = useCallback(() => {
    loadData();
    closeModals();
  }, [loadData, closeModals]);

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
  };
};