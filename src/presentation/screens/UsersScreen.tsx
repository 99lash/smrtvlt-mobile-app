import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
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
export default function UsersScreen({ navigation }: UsersScreenProps) {
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showQRScannerModal, setShowQRScannerModal] = useState(false);
  const { user: currentUser, isLoading: authLoading } = useAuthContext();

  const {
    sortedUsers,
    isLoading,
    error,
    toggleUserEnabled,
    removeUser,
    refreshUsers,
  } = useUserManagement();

  // Load users on component mount
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const handleUserPress = useCallback((userId: string) => {
    navigation.navigate('UsersDetail', { userId });
  }, [navigation]);

  const handleInviteUser = useCallback(() => {
    setShowInvitationModal(true);
  }, []);

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
        onClose={() => setShowInvitationModal(false)}
        vaultId={1} // TODO: Get actual vault ID from context
        onInvitationCreated={handleInvitationCreated}
      />

      <QRScannerModal
        visible={showQRScannerModal}
        onClose={() => setShowQRScannerModal(false)}
        onInvitationAccepted={handleInvitationAccepted}
      />
    </View>
  );
}
