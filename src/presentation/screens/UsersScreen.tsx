import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { RefreshCw, UserPlus, QrCode } from 'lucide-react-native';
import type { UsersScreenProps } from '../../types/UserTypes';
import { USER_CONSTANTS } from '../../utils/userConstants';
import { useUserManagement } from '../../presentation/hooks/useUserManagement';
import { useAuthContext } from '../../presentation/context/AuthContext';
import { Badge, UserItem } from '../../presentation/component/users';
import ButtonPrimary from '../../presentation/component/buttons/ButtonPrimary';
import FailureBanner from '../../presentation/component/banner/FailureBanner';
import { useVaultInvitation } from '../../presentation/hooks/useVaultInvitation';
import InvitationModal from '../../presentation/component/invitations/InvitationModal';
import QRScannerModal from '../../presentation/component/invitations/QRScannerModal';
import { UserService } from '../../service/UserService';
export default function UsersScreen({ navigation }: UsersScreenProps) {
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showQRScannerModal, setShowQRScannerModal] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [userVaults, setUserVaults] = useState<any[]>([]);
  const [isLoadingVaults, setIsLoadingVaults] = useState(false);
  const [showVaultSelector, setShowVaultSelector] = useState(false);
  const { user: currentUser, isLoading: authLoading } = useAuthContext();

  const {
    sortedUsers,
    isLoading,
    error,
    toggleUserEnabled,
    removeUser,
    refreshUsers,
  } = useUserManagement();

  // Load user's accessible vaults
  const loadUserVaults = useCallback(async () => {
    if (!currentUser) return;

    setIsLoadingVaults(true);
    try {
      const token = await UserService.getStoredToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      console.log('Loading user vaults from:', `${process.env.BASE_URL || 'https://quenchlessly-headachy-enriqueta.ngrok-free.dev'}/vault-memberships/user/vaults`);
      console.log('BASE_URL value:', process.env.BASE_URL);

      const response = await fetch(`${process.env.BASE_URL || 'https://quenchlessly-headachy-enriqueta.ngrok-free.dev'}/vault-memberships/user/vaults`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Vault data received:', data);
        if (data.success) {
          setUserVaults(data.data);
          console.log('User vaults loaded:', data.data.length);
        } else {
          console.error('API returned error:', data);
          Alert.alert('Error', data.detail || 'Failed to load accessible vaults');
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to load user vaults:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: response.url
        });
        Alert.alert('Error', `Failed to load accessible vaults (${response.status})`);
      }
    } catch (error) {
      console.error('Error loading user vaults:', error);
      Alert.alert('Error', 'Network error while loading vaults');
    } finally {
      setIsLoadingVaults(false);
    }
  }, [currentUser]);

  // Load users on component mount
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // Load user's vaults when user is available
  useEffect(() => {
    if (currentUser) {
      loadUserVaults();
    }
  }, [currentUser, loadUserVaults]);

  const handleUserPress = useCallback((userId: string) => {
    navigation.navigate('UsersDetail', { userId });
  }, [navigation]);

  const handleInviteUser = useCallback(async () => {
    if (userVaults.length === 0) {
      Alert.alert('No Vaults', 'You need access to at least one vault to invite users.');
      return;
    }

    if (userVaults.length === 1) {
      // Only one vault, check if user is admin before proceeding
      const vault = userVaults[0];
      console.log('Checking admin access for vault:', vault.vault_id);

      const token = await UserService.getStoredToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      try {
        const adminResponse = await fetch(`${process.env.BASE_URL || 'https://quenchlessly-headachy-enriqueta.ngrok-free.dev'}/vault-memberships/vaults/${vault.vault_id}/admin-check`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Admin check response:', adminResponse.status);

        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          console.log('Admin check result:', adminData);

          if (adminData.success && adminData.data.is_admin) {
            setSelectedVaultId(vault.vault_id);
            setShowInvitationModal(true);
          } else {
            Alert.alert('Permission Denied', 'You need admin access to this vault to invite users.');
          }
        } else {
          Alert.alert('Error', 'Failed to check vault permissions');
        }
      } catch (error) {
        console.error('Admin check error:', error);
        Alert.alert('Error', 'Failed to verify vault permissions');
      }
    } else {
      // Multiple vaults, show selection modal
      setShowVaultSelector(true);
    }
  }, [userVaults]);

  const handleScanQRCode = useCallback(() => {
    setShowQRScannerModal(true);
  }, []);

  const handleInvitationCreated = useCallback((inviteCode: string) => {
    console.log('Invitation created:', inviteCode);
    // Could show a success message or copy to clipboard
  }, []);

  const handleInvitationAccepted = useCallback((vaultId: number, role: string) => {
    console.log('Invitation accepted for vault:', vaultId, 'with role:', role);
    // Refresh users list to show new member
    refreshUsers();
  }, [refreshUsers]);

  const handleRefresh = useCallback(() => {
    refreshUsers();
  }, [refreshUsers]);

  const renderUserItem = useCallback(({ item }: { item: any }) => (
    <UserItem
      user={item}
      onToggleEnabled={toggleUserEnabled}
      onRemoveUser={removeUser}
      onPress={handleUserPress}
    />
  ), [toggleUserEnabled, removeUser, handleUserPress]);

  const renderHeader = () => (
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-white text-lg font-semibold">
        {USER_CONSTANTS.MESSAGES.USER_MANAGEMENT_TITLE}
      </Text>
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleRefresh}
          className="mr-3 p-2"
          disabled={isLoading}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Refresh users list"
          accessibilityHint="Double tap to refresh the users list"
        >
          <RefreshCw
            color={USER_CONSTANTS.COLORS.ICON_DEFAULT}
            size={USER_CONSTANTS.UI.ICON_SIZE}
          />
        </TouchableOpacity>
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={handleScanQRCode}
            className="p-2 bg-neutral-800 rounded-lg mr-2"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Scan invitation QR code"
            accessibilityHint="Scan QR code to join a vault"
          >
            <QrCode
              color={USER_CONSTANTS.COLORS.ICON_DEFAULT}
              size={USER_CONSTANTS.UI.ICON_SIZE}
            />
          </TouchableOpacity>
          <ButtonPrimary
            title="Invite User"
            onPress={handleInviteUser}
            className="px-4 py-2"
          />
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center">
      <Text className="text-neutral-400 text-center mb-4">
        {error ? 'Unable to load users' : 'No shared vault users found'}
      </Text>
      <Text className="text-neutral-500 text-center text-sm mb-4 px-8">
        {error
          ? 'There was an issue connecting to the server. Please check your connection and try again.'
          : 'This is normal if you haven\'t been added to any vaults yet, or if you\'re the only user with access to your vaults.'
        }
      </Text>
      <ButtonPrimary
        title="Refresh"
        onPress={handleRefresh}
        loading={isLoading}
      />
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-neutral-400 mt-4">Loading users...</Text>
    </View>
  );

  const renderNoAuthState = () => (
    <View className="flex-1 justify-center items-center">
      <Text className="text-neutral-400 text-center mb-4">
        Authentication required to view users
      </Text>
      <Text className="text-neutral-500 text-center text-sm">
        Please restart the app and log in
      </Text>
    </View>
  );

  // Show loading if auth is loading or if we're loading users
  if (authLoading || (isLoading && sortedUsers.length === 0)) {
    return (
      <View className="flex-1 bg-black px-4 py-4">
        {renderLoadingState()}
      </View>
    );
  }

  // Show no auth message if no current user
  if (!currentUser) {
    return (
      <View className="flex-1 bg-black px-4 py-4">
        {renderNoAuthState()}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-4 py-4">
      {renderHeader()}

      {/* Error Banner */}
      {error && (
        <FailureBanner
          message={error}
          duration={5000}
          onHide={() => {}} // Error will be cleared by refresh
        />
      )}

      {/* Users List */}
      {sortedUsers.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={sortedUsers}
          keyExtractor={(user) => user.id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          accessible={true}
          accessibilityRole="list"
          accessibilityLabel="Users list"
        />
      )}

      {/* Invitation Modals */}
      <InvitationModal
        visible={showInvitationModal}
        onClose={() => {
          setShowInvitationModal(false);
          setSelectedVaultId(null);
        }}
        vaultId={selectedVaultId || 1}
        onInvitationCreated={handleInvitationCreated}
      />

      <QRScannerModal
        visible={showQRScannerModal}
        onClose={() => setShowQRScannerModal(false)}
        onInvitationAccepted={handleInvitationAccepted}
      />

      {/* Vault Selection Modal */}
      <Modal visible={showVaultSelector} animationType="slide">
        <View className="flex-1 bg-black">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-neutral-800">
            <Text className="text-white text-lg font-semibold">
              Select Vault
            </Text>
            <TouchableOpacity onPress={() => setShowVaultSelector(false)}>
              <Text className="text-blue-400 text-base">Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Vault List */}
          {userVaults.length > 0 ? (
            <FlatList
              data={userVaults}
              keyExtractor={(vault) => vault.vault_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="bg-neutral-800 p-4 mb-2 rounded-lg mx-4"
                  onPress={async () => {
                    console.log('Selected vault:', item.vault_id, 'Role:', item.role);

                    // Check if user has admin access for this vault
                    const token = await UserService.getStoredToken();
                    if (!token) {
                      Alert.alert('Error', 'Authentication required');
                      return;
                    }

                    try {
                      const adminResponse = await fetch(`${process.env.BASE_URL || 'https://quenchlessly-headachy-enriqueta.ngrok-free.dev'}/vault-memberships/vaults/${item.vault_id}/admin-check`, {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                        },
                      });

                      if (adminResponse.ok) {
                        const adminData = await adminResponse.json();
                        if (adminData.success && adminData.data.is_admin) {
                          setSelectedVaultId(item.vault_id);
                          setShowVaultSelector(false);
                          setShowInvitationModal(true);
                        } else {
                          Alert.alert('Permission Denied', `You need admin access to invite users to Vault ${item.vault_id}. Current role: ${item.role}`);
                        }
                      } else {
                        Alert.alert('Error', 'Failed to check vault permissions');
                      }
                    } catch (error) {
                      console.error('Admin check error:', error);
                      Alert.alert('Error', 'Failed to verify vault permissions');
                    }
                  }}
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
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
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
    </View>
  );
}
