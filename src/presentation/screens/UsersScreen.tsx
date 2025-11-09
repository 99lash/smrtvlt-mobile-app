import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Shield, Loader } from 'lucide-react-native';
import type { UsersScreenProps } from '../../types/UserTypes';
import { useAuth } from '../hooks/useAuth';
import { useInvitationFlow } from '../hooks/user/useInvitationFlow';
import { VaultService, VaultMembership } from '../../service/VaultService';
import InvitationModal from '../component/invitations/InvitationModal';
import TransferOwnershipModal from '../component/modals/TransferOwnershipModal';
import ButtonSecondary from '../component/buttons/ButtonSecondary';
import { FloatingActionButton } from '../component/buttons/FloatingActionButton';
import CustomModal from '../component/modals/CustomModal';
import BorderedList from '../component/lists/BorderedList';
import { UserActions } from './users/components/UserActions';
import { ErrorBanner } from '../component/common/ErrorBanner';
import { EnhancedEmptyState } from '../component/common/EnhancedEmptyState';

// Extracted components
import { TabNavigation } from './users/components/TabNavigation';
import { TabContent } from './users/components/TabContent';

// Extracted hooks
import { useUsersScreen } from './users/hooks/useUsersScreen';
import { useUserActions } from './users/hooks/useUserActions';

export default function UsersScreen({ navigation }: UsersScreenProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Use extracted screen hook
  const {
    activeTab,
    setActiveTab,
    showActionModal,
    setShowActionModal,
    showTransferModal,
    selectedUserForTransfer,
    handleTransferOwnership,
    handleCloseTransferModal,
    handleRefreshAfterTransfer,
    users,
    vaults,
    loading,
    error,
    loadData,
  } = useUsersScreen();

  // Invitation flow - manages modal states
  const {
    showInvitationModal,
    showQRScannerModal,
    showVaultSelector,
    selectedVaultId,
    openInvitationFlow,
    openQRScanner,
    closeModals,
    selectVault,
  } = useInvitationFlow();

  // Use extracted actions hook
  const {
    handleUserPress,
    handleInviteUser,
    handleVaultSelect,
    handleInvitationAccepted,
    handleJoinVault,
    handleInitiateOwnershipTransfer,
  } = useUserActions({
    navigation,
    vaults,
    loadData,
    openInvitationFlow,
    openQRScanner,
    closeModals,
    selectVault,
  });

  const renderVaultItem = (item: VaultMembership, index: number, isSelected: boolean) => (
    <View className="flex-1">
      <Text className="text-text-default font-medium text-base mb-1">
        {item.vault_name || `Vault ID: ${item.vault_id}`}
      </Text>
      <Text className="text-neutral-400 text-sm capitalize">
        Role: {item.role}
      </Text>
      <Text className="text-neutral-500 text-xs">
        Member since: {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  const handleVaultItemPress = (item: VaultMembership) => {
    handleVaultSelect(item.vault_id);
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <View className="flex-1 bg-bg-default">
        <EnhancedEmptyState
          icon={Loader}
          title="Loading Users and Vaults"
          message="Please wait while we load your users and vault information..."
        />
      </View>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-white text-lg mb-4">Authentication Required</Text>
        <Text className="text-neutral-400 text-center">
          Please log in to view users and vaults
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg-default pt-4">
      {/* Error Banner */}
      <ErrorBanner error={error} />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <TabContent
        activeTab={activeTab}
        users={users}
        vaults={vaults}
        onUserPress={handleUserPress}
        onVaultSelect={handleVaultSelect}
        onRefresh={loadData}
        onTransferOwnership={handleTransferOwnership}
      />

      {/* Vault Selector Modal */}
      <CustomModal
        visible={showVaultSelector}
        onClose={closeModals}
        title="Select Vault"
        icon={<Shield size={24} color="#5e5e5ea" />}
        iconPosition="left"
      >
        {vaults.length > 0 ? (
          <BorderedList
            data={vaults}
            keyExtractor={(vault) => vault.vault_id.toString()}
            renderItem={renderVaultItem}
            onItemPress={handleVaultItemPress}
            maxVisibleItems={5}
            itemHeight={80}
            itemGap={12}
          />
        ) : (
          <View className="justify-center items-center py-8">
            <EnhancedEmptyState
              icon={Shield}
              iconSize={48}
              title="No accessible vaults found"
              message="You need access to at least one vault to invite users"
            />
          </View>
        )}
      </CustomModal>

      {/* QR Scanner Modal for accepting invitations */}
      <InvitationModal
        visible={showQRScannerModal}
        onClose={closeModals}
        onInvitationAccepted={(vaultId, role) => handleInvitationAccepted(vaultId, role)}
        mode="accept"
      />

      {/* Invitation Generation Modal */}
      <InvitationModal
        visible={showInvitationModal}
        onClose={closeModals}
        mode="generate"
        selectedVaultId={selectedVaultId}
        vaults={vaults}
        onInvitationGenerated={() => {
          // Optional: Add any post-generation logic here
          console.log('Invitation code generated successfully');
        }}
      />

      {/* Action Modal with Join and Invite buttons */}
      <CustomModal
        visible={showActionModal}
        onClose={() => setShowActionModal(false)}
        title="Actions"
      >
        <UserActions
          onJoinVault={handleJoinVault}
          onInviteUser={handleInviteUser}
        />
      </CustomModal>

      {/* Transfer Ownership Modal */}
      <TransferOwnershipModal
        visible={showTransferModal && !!selectedUserForTransfer}
        onClose={handleCloseTransferModal}
        user={selectedUserForTransfer || {
          id: 0,
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          role: '',
          status: '',
          lastAccess: '',
          enabled: false
        }}
        adminVaults={VaultService.getAdminVaults(vaults)}
        onInitiateTransfer={handleInitiateOwnershipTransfer}
        onRefreshData={handleRefreshAfterTransfer}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => setShowActionModal(true)} />
    </View>
  );
}
