import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import type { UsersScreenProps } from '../../types/UserTypes';
import { USER_CONSTANTS } from '../../utils/userConstants';
import { useUserManagement } from '../hooks/useUserManagement';
import { useAuthContext } from '../context/AuthContext';
import { Badge, UserItem, RegisterModal } from '../component/users';
import ButtonPrimary from '../component/buttons/ButtonPrimary';
import FailureBanner from '../component/banner/FailureBanner';
export default function UsersScreen({ navigation }: UsersScreenProps) {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
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

  const handleAddUser = useCallback(() => {
    setShowRegisterModal(true);
  }, []);

  const handleRegisterSuccess = useCallback(() => {
    // Refresh the users list after successful registration
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
        <ButtonPrimary
          title={USER_CONSTANTS.MESSAGES.ADD_USER}
          onPress={handleAddUser}
          className="px-4 py-2"
        />
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

      {/* Register Modal */}
      <RegisterModal
        visible={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </View>
  );
}
