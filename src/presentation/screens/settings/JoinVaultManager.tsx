import React, { useState } from 'react';
import { View } from 'react-native';
import { UserPlus } from 'lucide-react-native';
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
 * Allows users to join vaults using invitation codes.
 * Visible when:
 * - User has 'member' role in their current vault
 * - User has no vault membership (role is null)
 * 
 * Responsibilities:
 * - Manage join vault modal state
 * - Handle invitation acceptance
 * - Refresh vault list after joining
 * - Select newly joined vault
 */
const JoinVaultManager: React.FC<JoinVaultManagerProps> = ({ currentVault }) => {
  const [showJoinVaultModal, setShowJoinVaultModal] = useState(false);
  const { forceRefreshVaults, selectVault } = useVaultManagement();
  
  // Show for members or when user has no vault (role is null)
  const isMember = currentVault?.role === 'member';
  const hasNoVault = !currentVault;
  const shouldShow = isMember || hasNoVault;
  
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
  
  // Determine button text based on user's vault status
  const buttonText = hasNoVault ? "Join Vault" : "Join Another Vault";
  
  return (
    <View>
      <ButtonSecondary
        title={buttonText}
        onPress={() => setShowJoinVaultModal(true)}
        icon={<UserPlus size={20} />}
        iconPosition="left"
        className="w-full"
      />
      
      <InvitationModal
        visible={showJoinVaultModal}
        onClose={() => setShowJoinVaultModal(false)}
        onInvitationAccepted={handleJoinVault}
        mode="accept"
      />
    </View>
  );
};

export default JoinVaultManager;

