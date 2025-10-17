import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { Users, Shield } from 'lucide-react-native';
import ButtonSecondary from '../component/buttons/ButtonSecondary';
import type { UsersScreenProps } from '../../types/UserTypes';
import { useAuth } from '../hooks/useAuth';
import { useUsersData } from '../hooks/user/useUsersData';
import { useUserActions } from '../hooks/user/useUserActions';
import { useInvitationFlow } from '../hooks/user/useInvitationFlow';
import { VaultService, VaultMembership } from '../../service/VaultService';
import InvitationModal from '../component/invitations/InvitationModal';
import QRScannerModal from '../component/invitations/QRScannerModal';
import { UserActions } from '../component/users/UserActions';
import { UsersList } from '../component/users/UsersList';
import { ErrorBanner } from '../component/common/ErrorBanner';
import { LoadingState } from '../component/common/LoadingState';

type TabType = 'users' | 'vaults';

export default function UsersScreen({ navigation }: UsersScreenProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('users');

  // Use extracted data hook
  const { users, vaults, loading, error, loadData } = useUsersData(isAuthenticated);

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
  } = useUserActions({
    navigation,
    vaults,
    loadData,
    openInvitationFlow,
    openQRScanner,
    closeModals,
    selectVault,
  });

  const renderVaultItem = ({ item }: { item: VaultMembership }) => (
    <TouchableOpacity
      className="bg-neutral-800 p-4 mb-2 rounded-lg mx-4"
      onPress={() => handleVaultSelect(item.vault_id)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Vault ${item.vault_id}, role ${item.role}`}
    >
      <Text className="text-white font-medium text-base">
        Vault ID: {item.vault_id}
      </Text>
      <Text className="text-neutral-400 text-sm capitalize">
        Role: {item.role}
      </Text>
      <Text className="text-neutral-500 text-xs">
        Member since: {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const TabButton = ({
    tab,
    isActive,
    onPress,
    icon: Icon,
    label
  }: {
    tab: TabType;
    isActive: boolean;
    onPress: () => void;
    icon: any;
    label: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center py-4 px-2 rounded-lg mx-1 ${
        isActive
          ? 'bg-blue-600'
          : 'bg-transparent'
      }`}
      accessible={true}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${label} tab ${isActive ? 'selected' : 'unselected'}`}
    >
      <Icon
        size={20}
        color={isActive ? "#ffffff" : "#9ca3af"}
      />
      <Text
        className={`ml-2 font-medium ${
          isActive ? 'text-white' : 'text-neutral-400'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Loading state
  if (authLoading || loading) {
    return <LoadingState />;
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-4">
        <Text className="text-white text-lg mb-4">Authentication Required</Text>
        <Text className="text-neutral-400 text-center">
          Please log in to view users and vaults
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header with Action Buttons */}
      <View className="pt-2 pb-1">
        <UserActions
          onJoinVault={openQRScanner}
          onInviteUser={handleInviteUser}
        />
      </View>

      {/* Error Banner */}
      <ErrorBanner error={error} />

      {/* Modern Tab Navigation with Better Spacing */}
      <View className="px-4 py-2">
        <View className="bg-neutral-900 rounded-2xl p-1.5 shadow-lg">
          <View className="flex-row">
            <TabButton
              tab="users"
              isActive={activeTab === 'users'}
              onPress={() => setActiveTab('users')}
              icon={Users}
              label="Users"
            />
            <TabButton
              tab="vaults"
              isActive={activeTab === 'vaults'}
              onPress={() => setActiveTab('vaults')}
              icon={Shield}
              label="My Vaults"
            />
          </View>
        </View>
      </View>

      {/* Tab Content with Improved Spacing */}
      <View className="flex-1 px-4">
        {activeTab === 'users' ? (
          <View className="flex-1">
            <UsersList
              users={users}
              onUserPress={handleUserPress}
              onRefresh={loadData}
            />
          </View>
        ) : (
          <View className="flex-1">
            {vaults.length === 0 ? (
              <View className="flex-1 justify-center items-center py-8">
                <View className="bg-neutral-800 p-6 rounded-2xl items-center">
                  <Shield size={56} color="#6b7280" />
                  <Text className="text-neutral-300 text-center mb-2 mt-4 text-lg font-medium">
                    No vaults found
                  </Text>
                  <Text className="text-neutral-500 text-center text-sm leading-5">
                    You're not a member of any vaults yet.{'\n'}Join a vault to get started.
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-1">
                <View className="mb-4">
                  <Text className="text-white text-xl font-semibold mb-2">
                    Your Vault Memberships
                  </Text>
                  <Text className="text-neutral-400 text-sm">
                    Vaults you have access to
                  </Text>
                </View>
                <FlatList
                  data={vaults}
                  keyExtractor={(vault) => vault.vault_id.toString()}
                  renderItem={renderVaultItem}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View className="h-3" />}
                />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Vault Selector Modal */}
      <Modal visible={showVaultSelector} animationType="slide">
        <View className="flex-1 bg-black">
          <View className="flex-row items-center justify-between p-6 border-b border-neutral-800">
            <Text className="text-white text-xl font-semibold">Select Vault</Text>
            <ButtonSecondary
              title="Cancel"
              onPress={closeModals}
              className="bg-neutral-800 border-neutral-700"
              textClassName="text-blue-400"
            />
          </View>

          {vaults.length > 0 ? (
            <FlatList
              data={vaults}
              keyExtractor={(vault) => vault.vault_id.toString()}
              renderItem={renderVaultItem}
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 justify-center items-center px-6">
              <Shield size={48} color="#6b7280" />
              <Text className="text-neutral-400 text-center mb-4 mt-4 text-lg">
                No accessible vaults found
              </Text>
              <Text className="text-neutral-500 text-center text-sm leading-5">
                You need access to at least one vault to invite users
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Invitation Modal */}
      <InvitationModal
        visible={showInvitationModal}
        onClose={closeModals}
        vaultId={selectedVaultId || 0}
        onInvitationCreated={() => {
          // Invitation created - could add logic here if needed
        }}
      />

      {/* QR Scanner Modal for accepting invitations */}
      <QRScannerModal
        visible={showQRScannerModal}
        onClose={closeModals}
        onInvitationAccepted={handleInvitationAccepted}
      />
    </View>
  );
}