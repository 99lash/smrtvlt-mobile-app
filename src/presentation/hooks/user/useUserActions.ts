import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useVaultInvitation } from '../../screens/settings/hooks/useVaultInvitation';
import { useInvitationFlow } from './useInvitationFlow';
import { UserService } from '../../../service/UserService';
import { VaultMembership } from '../../../service/VaultService';

interface UseUserActionsProps {
  navigation: any;
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
  selectVault
}: UseUserActionsProps) => {
  const { checkVaultAdmin } = useVaultInvitation();

  const handleUserPress = useCallback((userId: string) => {
    navigation.navigate('UserDetail', { userId });
  }, [navigation]);

  const handleInviteUser = useCallback(async () => {
    if (vaults.length === 0) {
      Alert.alert('No Vaults', 'You need access to at least one vault to invite users.');
      return;
    }

    try {
      const checkAdminWrapper = async (vaultId: number) => {
        const token = await UserService.getStoredToken();
        if (!token) return false;
        return await checkVaultAdmin(vaultId, token);
      };

      await openInvitationFlow(vaults, checkAdminWrapper);
    } catch (error) {
      Alert.alert('Error', 'Failed to open invitation flow');
    }
  }, [vaults, openInvitationFlow, checkVaultAdmin]);

  const handleVaultSelect = useCallback((vaultId: number) => {
    selectVault(vaultId);
  }, [selectVault]);

  const handleInvitationAccepted = useCallback((vaultId: number, role: string) => {
    Alert.alert(
      'Success!',
      `Successfully joined vault ${vaultId} with ${role} access!`,
      [{ text: 'OK', onPress: loadData }]
    );
  }, [loadData]);

  return {
    handleUserPress,
    handleInviteUser,
    handleVaultSelect,
    handleInvitationAccepted,
  };
};