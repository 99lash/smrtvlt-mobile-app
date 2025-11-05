import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { UserCheck } from 'lucide-react-native';
import ButtonSecondary from '../../component/buttons/ButtonSecondary';
import CustomModal from '../../component/modals/CustomModal';
import BorderedList from '../../component/lists/BorderedList';
import { RoleBadge } from '../../component/common/RoleBadge';
import { WarningMessage } from '../../component/common/WarningMessage';
import { useAuthContext } from '../../context/AuthContext';
import { VaultMembership } from '../../../service/VaultService';
import { getUserDisplayName } from '../../../types/UserTypes';
import { useUserManagement } from './hooks/useUserManagement';
import UserItem from '../../component/users/UserItem';
import type { VaultMembershipResponse, UserRole, UserStatus } from '../../../types/UserTypes';
import { formatRelativeDate } from '../../../utils/dateUtils';

interface UserManagerProps {
  currentVault: VaultMembership | null;
  vaultsLoading: boolean;
}

export const UserManager: React.FC<UserManagerProps> = ({
  currentVault,
  vaultsLoading,
}) => {
  const { user } = useAuthContext();
  
  // Modal state
  const [showUsersModal, setShowUsersModal] = useState(false);
  
  // Use custom hook for user management logic
  const {
    vaultMembers,
    loading,
    error,
    deletingUserId,
    fetchVaultMembers,
    deleteUser,
    clearError,
  } = useUserManagement({ currentVault });

  /**
   * Handles opening the users modal
   */
  const handleManageUsers = useCallback(() => {
    if (!currentVault?.vault_id || vaultsLoading) {
      Alert.alert('Error', 'Please select a vault first');
      return;
    }

    setShowUsersModal(true);
  }, [currentVault?.vault_id, vaultsLoading]);

  /**
   * Handles closing the users modal
   */
  const handleCloseModal = useCallback(() => {
    setShowUsersModal(false);
    clearError();
  }, [clearError]);

  /**
   * Fetch members when modal opens
   */
  useEffect(() => {
    if (showUsersModal && currentVault?.vault_id) {
      fetchVaultMembers().catch(console.error);
    }
  }, [showUsersModal, currentVault?.vault_id, fetchVaultMembers]);

  /**
   * Handles delete user confirmation
   */
  const confirmDelete = useCallback((member: VaultMembershipResponse) => {
    const userDisplayName = getUserDisplayName({
      id: member.user_id,
      firstName: member.first_name || undefined,
      lastName: member.last_name || undefined,
      username: member.username || undefined,
      role: member.role === 'admin' ? 'admin' : 'user',
      status: 'active',
      lastAccess: member.created_at,
      enabled: true
    });

    Alert.alert(
      'Remove User',
      `Are you sure you want to remove ${userDisplayName} from this vault?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(member);
              Alert.alert('Success', `${userDisplayName} has been removed from the vault`);
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to remove user');
            }
          },
        },
      ]
    );
  }, [deleteUser]);

  /**
   * Render user item for the list
   */
  const renderUserItem = useCallback(
    (member: VaultMembershipResponse) => {
      const mappedUser = {
        id: member.user_id,
        firstName: member.first_name ?? undefined,
        lastName: member.last_name ?? undefined,
        username: member.username ?? undefined,
        role: (member.role === 'admin' ? 'admin' : 'user') as UserRole,
        status: 'active' as UserStatus,
        lastAccess: formatRelativeDate(member.created_at),
        enabled: true,
      };

      const handleRemoveUser = (userId: string) => {
        confirmDelete(member);
      };

      return (
        <UserItem
          user={mappedUser}
          onToggleEnabled={() => {}}
          onRemoveUser={handleRemoveUser}
          onPress={() => {}}
        />
      );
    },
    [confirmDelete]
  );

  /**
   * Determines if user has access to view members
   */
  const canViewMembers = currentVault?.vault_id && !vaultsLoading && currentVault?.role;

  /**
   * Determines the appropriate warning message
   */
  const getWarningMessage = useCallback(() => {
    if (!currentVault?.vault_id) {
      return "Please select a vault to view its members.";
    }
    if (vaultsLoading) {
      return "Loading vault information...";
    }
    if (!currentVault?.role) {
      return "You need vault access to view members.";
    }
    return null;
  }, [currentVault?.vault_id, vaultsLoading, currentVault?.role]);

  const warningMessage = getWarningMessage();

  return (
    <>
      {/* Main User Manager Card */}
      <View className="bg-surface-default rounded-3xl p-4 mb-4 shadow-lg">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Text className="text-text-dark text-lg font-semibold ml-2">
              User Management
            </Text>
          </View>
          {currentVault && <RoleBadge role={currentVault.role} size="sm" />}
        </View>

        {/* Member count display */}
        {currentVault && (
          <View className="mb-3">
            <View className="flex-row items-center mb-2">
              <UserCheck size={16} color="#5e5e5e" />
              <Text className="text-text-dark text-sm font-medium ml-1">
                Current Members
              </Text>
            </View>
            <Text className="text-muted-default text-sm">
              View and manage members of this vault
            </Text>
          </View>
        )}

        {/* Warning message when no access */}
        {warningMessage && !vaultsLoading && (
          <WarningMessage
            message={warningMessage}
          />
        )}

        {/* Manage Users Button */}
        <ButtonSecondary
          title="Manage Users"
          onPress={handleManageUsers}
          iconPosition="left"
          className="w-full"
          disabled={!canViewMembers}
          textClassName="flex-1"
        />
      </View>

      {/* Users Modal */}
      <CustomModal
        visible={showUsersModal}
        onClose={handleCloseModal}
        title={`Vault Members - ${currentVault?.vault_name || `Vault ${currentVault?.vault_id}`}`}
        iconPosition="left"
        primaryAction={{
          label: loading ? 'Loading...' : 'Refresh',
          onPress: fetchVaultMembers,
          loading: loading,
          disabled: loading,
        }}
      >
        {loading ? (
          <View className="justify-center items-center py-8">
            <Text className="text-text-default">Loading vault members...</Text>
          </View>
        ) : error ? (
          <View className="justify-center items-center py-8">
            <WarningMessage
              message={error}
            />
          </View>
        ) : vaultMembers.length > 0 ? (
          <BorderedList
            data={vaultMembers.filter(member => member.user_id !== user?.id)}
            keyExtractor={(member) => member.user_id.toString()}
            renderItem={renderUserItem}
            maxVisibleItems={8}
            itemHeight={80}
            itemGap={12}
          />
        ) : vaultMembers.filter(member => member.user_id !== user?.id).length === 0 ? (
          <View className="justify-center items-center py-8">
            <Text className="text-muted-default text-center">
              No other members found for this vault
            </Text>
          </View>
        ) : (
          <View className="justify-center items-center py-8">
            <Text className="text-muted-default text-center">
              No members found for this vault
            </Text>
          </View>
        )}
      </CustomModal>
    </>
  );
};