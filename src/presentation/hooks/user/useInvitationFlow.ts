import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { VaultMembership } from '../../../service/VaultService';

interface UseInvitationFlowReturn {
  showInvitationModal: boolean;
  showQRScannerModal: boolean;
  showVaultSelector: boolean;
  selectedVaultId: number | null;
  openInvitationFlow: (vaults: VaultMembership[], checkAdmin: (id: number) => Promise<boolean>) => Promise<void>;
  openQRScanner: () => void;
  closeModals: () => void;
  selectVault: (vaultId: number) => void;
}

export function useInvitationFlow(): UseInvitationFlowReturn {
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showQRScannerModal, setShowQRScannerModal] = useState(false);
  const [showVaultSelector, setShowVaultSelector] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);

  const closeModals = useCallback(() => {
    setShowInvitationModal(false);
    setShowQRScannerModal(false);
    setShowVaultSelector(false);
    setSelectedVaultId(null);
  }, []);

  const openInvitationFlow = useCallback(async (
    vaults: VaultMembership[],
    checkAdmin: (id: number) => Promise<boolean>
  ) => {
    if (vaults.length === 0) {
      Alert.alert('No Vaults', 'You need access to at least one vault to invite users.');
      return;
    }

    if (vaults.length === 1) {
      const vault = vaults[0];
      const isAdmin = await checkAdmin(vault.vault_id);
      
      if (isAdmin) {
        setSelectedVaultId(vault.vault_id);
        setShowInvitationModal(true);
      } else {
        Alert.alert('Permission Denied', 'You need admin access to this vault to invite users.');
      }
    } else {
      setShowVaultSelector(true);
    }
  }, []);

  const openQRScanner = useCallback(() => {
    setShowQRScannerModal(true);
  }, []);

  const selectVault = useCallback((vaultId: number) => {
    setSelectedVaultId(vaultId);
    setShowVaultSelector(false);
    setShowInvitationModal(true);
  }, []);

  return {
    showInvitationModal,
    showQRScannerModal,
    showVaultSelector,
    selectedVaultId,
    openInvitationFlow,
    openQRScanner,
    closeModals,
    selectVault,
  };
}
