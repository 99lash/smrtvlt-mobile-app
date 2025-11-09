import React, { useState } from 'react';
import { View } from 'react-native';
import { UserPlus, Crown } from 'lucide-react-native';
import ButtonSecondary from '../../component/buttons/ButtonSecondary';
import InvitationModal from '../../component/invitations/InvitationModal';
import { useVaultManagement } from '../../hooks/VaultContext';
import { VaultMembership } from '../../../service/VaultService';

interface JoinVaultManagerProps {
  currentVault: VaultMembership | null;
}

/**
 * JoinVaultManager Component
 *
 * Allows users to join vaults using invitation codes or accept ownership transfers.
 * Visible when:
 * - User has 'member' role in their current vault
 * - User has 'admin' role in their current vault
 * - User has no vault membership (role is null)
 *
 * Responsibilities:
 * - Manage join vault modal state
 * - Handle invitation acceptance
 * - Handle ownership transfer acceptance
 * - Refresh vault list after joining
 * - Select newly joined vault
 */
const JoinVaultManager: React.FC<JoinVaultManagerProps> = ({ currentVault }) => {
  const [showJoinVaultModal, setShowJoinVaultModal] = useState(false);
  const [showAcceptTransferModal, setShowAcceptTransferModal] = useState(false);
  const { forceRefreshVaults, selectVault } = useVaultManagement();
  
  // Show for members, admins, or when user has no vault (role is null)
  const isMember = currentVault?.role === 'member';
  const isAdmin = currentVault?.role === 'admin';
  const hasNoVault = !currentVault;
  const shouldShow = isMember || isAdmin || hasNoVault;
  
  if (!shouldShow) {
    return null;
  }
  
  /**
   * Handle successful vault join
   * Refreshes vault list and selects the newly joined vault
   */
  const handleJoinVault = async (vaultId?: number, role?: string) => {
    try {
      console.log('🎉 Vault joined successfully:', { vaultId, role });
      
      // Refresh vault context to get updated vault list
      await forceRefreshVaults();
      
      // Select the newly joined vault if vault ID is provided
      if (vaultId) {
        console.log('🎯 Selecting newly joined vault:', vaultId);
        selectVault(vaultId);
      }
      
      setShowJoinVaultModal(false);
    } catch (error) {
      console.error('❌ Failed to refresh vault list after joining:', error);
      // Modal will remain open on error
    }
  };

  /**
   * Handle successful ownership transfer acceptance
   * Refreshes vault list and selects the newly owned vault
   */
  const handleTransferAccepted = async (vaultId?: number, role?: string) => {
    try {
      console.log('🎉 Ownership transfer accepted successfully:', { vaultId, role });
      
      // Refresh vault context to get updated vault list
      await forceRefreshVaults();
      
      // Select the newly owned vault if vault ID is provided
      if (vaultId) {
        console.log('🎯 Selecting newly owned vault:', vaultId);
        selectVault(vaultId);
      }
      
      setShowAcceptTransferModal(false);
    } catch (error) {
      console.error('❌ Failed to refresh vault list after transfer:', error);
      // Modal will remain open on error
    }
  };
  
  // Determine button text based on user's vault status
  const buttonText = hasNoVault ? "Join Vault" : "Join Another Vault";
  
  return (
    <View className="gap-3">
      <ButtonSecondary
        title={buttonText}
        onPress={() => setShowJoinVaultModal(true)}
        icon={<UserPlus size={20} />}
        iconPosition="left"
        className="w-full"
      />

      <ButtonSecondary
        title="Accept Ownership Transfer"
        onPress={() => setShowAcceptTransferModal(true)}
        icon={<Crown size={20} color="#FFD700" />}
        iconPosition="left"
        className="w-full"
      />
      
      <InvitationModal
        visible={showJoinVaultModal}
        onClose={() => setShowJoinVaultModal(false)}
        onInvitationAccepted={handleJoinVault}
        mode="accept"
      />

      <InvitationModal
        visible={showAcceptTransferModal}
        onClose={() => setShowAcceptTransferModal(false)}
        onInvitationAccepted={handleTransferAccepted}
        mode="accept_transfer"
      />
    </View>
  );
};

export default JoinVaultManager;

