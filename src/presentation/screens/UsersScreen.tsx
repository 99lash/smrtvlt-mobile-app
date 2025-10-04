import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import type { UsersScreenProps } from '../../types/UserTypes';
import { useAuth } from '../hooks/useAuth';
import { UserDataService } from '../../service/UserDataService';
import { VaultService, VaultMembership } from '../../service/VaultService';
import { UserService } from '../../service/UserService';
import { User } from '../../types/UserTypes';
import { useVaultInvitation } from '../hooks/vault/useVaultInvitation';
import { useInvitationFlow } from '../hooks/user/useInvitationFlow';
import InvitationModal from '../component/invitations/InvitationModal';
import QRScannerModal from '../component/invitations/QRScannerModal';

export default function UsersScreen({ navigation }: UsersScreenProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [vaults, setVaults] = useState<VaultMembership[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVaultSelector, setShowVaultSelector] = useState(false);

  // Invitation flow hooks
  const { checkVaultAdmin } = useVaultInvitation();
  const {
    showInvitationModal,
    showQRScannerModal,
    selectedVaultId,
    openInvitationFlow,
    openQRScanner,
    closeModals,
    selectVault,
  } = useInvitationFlow();

  // Load users and vaults on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user's vaults
      const userVaults = await VaultService.getUserVaults();
      setVaults(userVaults);

      // Load shared vault users (placeholder - you may want to implement this differently)
      // const sharedUsers = await UserDataService.fetchSharedVaultUsers(currentUserId);
      // setUsers(sharedUsers);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = useCallback((userId: string) => {
    navigation.navigate('UserDetail', { userId });
  }, [navigation]);

  const handleInviteUser = useCallback(async () => {
    if (vaults.length === 0) {
      Alert.alert('No Vaults', 'You need access to at least one vault to invite users.');
      return;
    }

    try {
      // Create a wrapper function that matches the expected signature
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
    setShowVaultSelector(false);
    selectVault(vaultId);
  }, [selectVault]);

  const renderUserItem = useCallback(({ item }: { item: User }) => (
    <TouchableOpacity
      className="bg-neutral-800 p-4 mb-2 rounded-lg mx-4"
      onPress={() => handleUserPress(item.id.toString())}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`User ${item.firstName || item.username || `User ${item.id}`}`}
    >
      <Text className="text-white font-medium text-base">
        {item.firstName && item.lastName
          ? `${item.firstName} ${item.lastName}`
          : item.username || `User ${item.id}`}
      </Text>
      <Text className="text-neutral-400 text-sm capitalize">
        Role: {item.role}
      </Text>
      <Text className="text-neutral-500 text-xs">
        Status: {item.status}
      </Text>
    </TouchableOpacity>
  ), [handleUserPress]);

  const renderVaultItem = useCallback(({ item }: { item: VaultMembership }) => (
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
  ), [handleVaultSelect]);

  // Loading state
  if (authLoading || loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-white mt-4">Loading...</Text>
      </View>
    );
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
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 border-b border-neutral-800">
        <Text className="text-white text-xl font-semibold">Users & Vaults</Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="bg-green-600 px-4 py-2 rounded-lg"
            onPress={openQRScanner}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Join vault using invitation code"
          >
            <Text className="text-white font-medium">Join Vault</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-600 px-4 py-2 rounded-lg"
            onPress={handleInviteUser}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Invite user"
          >
            <Text className="text-white font-medium">Invite User</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Banner */}
      {error && (
        <View className="bg-red-900/50 mx-4 mt-4 p-3 rounded-lg">
          <Text className="text-red-200 text-sm">{error}</Text>
        </View>
      )}

      {/* Content Tabs */}
      <View className="flex-row border-b border-neutral-800">
        <TouchableOpacity className="flex-1 p-3 border-b-2 border-blue-600">
          <Text className="text-blue-400 text-center font-medium">Users</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 p-3">
          <Text className="text-neutral-400 text-center font-medium">My Vaults</Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <View className="flex-1">
        {users.length === 0 ? (
          <View className="flex-1 justify-center items-center px-4">
            <Text className="text-neutral-400 text-center mb-4">
              No users found
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-lg"
              onPress={loadData}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Refresh data"
            >
              <Text className="text-white font-medium">Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(user) => user.id.toString()}
            renderItem={renderUserItem}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Vault Selector Modal */}
      <Modal visible={showVaultSelector} animationType="slide">
        <View className="flex-1 bg-black">
          <View className="flex-row items-center justify-between p-4 border-b border-neutral-800">
            <Text className="text-white text-lg font-semibold">Select Vault</Text>
            <TouchableOpacity
              onPress={() => setShowVaultSelector(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close vault selector"
            >
              <Text className="text-blue-400 text-base">Cancel</Text>
            </TouchableOpacity>
          </View>

          {vaults.length > 0 ? (
            <FlatList
              data={vaults}
              keyExtractor={(vault) => vault.vault_id.toString()}
              renderItem={renderVaultItem}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 justify-center items-center px-4">
              <Text className="text-neutral-400 text-center mb-4">
                No accessible vaults found
              </Text>
              <Text className="text-neutral-500 text-center text-sm">
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
        onInvitationCreated={(inviteCode) => {
          console.log('Invitation created:', inviteCode);
        }}
      />

      {/* QR Scanner Modal for accepting invitations */}
      <QRScannerModal
        visible={showQRScannerModal}
        onClose={closeModals}
        onInvitationAccepted={(vaultId, role) => {
          console.log('Invitation accepted for vault:', vaultId, 'with role:', role);
          Alert.alert(
            'Success!',
            `Successfully joined vault ${vaultId} with ${role} access!`,
            [{ text: 'OK', onPress: loadData }]
          );
        }}
      />
    </View>
  );
}