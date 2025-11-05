import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Shield, Settings2, Trash2 } from 'lucide-react-native';
import type { UserItemProps } from '../../../types/UserTypes';
import { USER_CONSTANTS } from '../../../utils/userConstants';
import { getUserDisplayName } from '../../../types/UserTypes';
import Badge from './Badge';

const getInitials = (user: any): string => {
  if (user.firstName && user.lastName) {
    const first = user.firstName[0] ?? '';
    const last = user.lastName[0] ?? '';
    return `${first}${last}`.toUpperCase();
  }

  if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }

  return user.id.toString().substring(0, 2).toUpperCase();
};

const UserItemComponent: React.FC<UserItemProps> = ({
  user,
  onToggleEnabled,
  onRemoveUser,
  onPress,
}) => {
  const initials = getInitials(user);
  const displayName = getUserDisplayName(user);

  const handleToggleEnabled = () => {
    onToggleEnabled(user.id.toString());
  };

  const handleRemoveUser = () => {
    onRemoveUser(user.id.toString());
  };

  const handlePress = () => {
    onPress(user.id.toString());
  };

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-primary-default items-center justify-center mr-3">
            <Text className="text-white font-semibold">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-dark text-base font-semibold">
              {displayName}
            </Text>
            <View className="flex-row mt-1">
              <Badge label={user.role} />
              {user.status === 'inactive' && (
                <Badge label={USER_CONSTANTS.MESSAGES.INACTIVE} variant="secondary" />
              )}
            </View>
            <Text className="text-muted-default text-[12px] mt-1">
              {USER_CONSTANTS.MESSAGES.LAST_ACCESS}: {user.lastAccess}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleRemoveUser}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Remove user ${displayName}`}
          accessibilityHint="Double tap to remove this user from the vault"
        >
          <Trash2 color={USER_CONSTANTS.COLORS.ICON_DELETE} size={USER_CONSTANTS.UI.ICON_SIZE} />
        </Pressable>
      </View>
    </View>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(UserItemComponent);