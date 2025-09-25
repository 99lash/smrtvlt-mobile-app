import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
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
    <TouchableOpacity
      onPress={handlePress}
      className="mb-3 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3"
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`User ${displayName}, ${user.role}, ${user.status}`}
      accessibilityHint="Double tap to view user details"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
            <Text className="text-white font-semibold">{initials}</Text>
          </View>
          <View>
            <Text className="text-white text-base font-semibold">
              {displayName}
            </Text>
            <View className="flex-row mt-1">
              <Badge label={user.role} />
              {user.status === 'inactive' && (
                <Badge label={USER_CONSTANTS.MESSAGES.INACTIVE} variant="secondary" />
              )}
            </View>
            <Text className="text-neutral-400 text-[12px] mt-1">
              {USER_CONSTANTS.MESSAGES.LAST_ACCESS}: {user.lastAccess}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Switch
            value={user.enabled}
            onValueChange={handleToggleEnabled}
            accessible={true}
            accessibilityRole="switch"
            accessibilityLabel={`${user.enabled ? 'Disable' : 'Enable'} user ${displayName}`}
            accessibilityHint={`Double tap to ${user.enabled ? 'disable' : 'enable'} this user`}
          />
          <TouchableOpacity
            onPress={handlePress}
            className="ml-3"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`View security settings for ${displayName}`}
          >
            <Shield color={USER_CONSTANTS.COLORS.ICON_SHIELD} size={USER_CONSTANTS.UI.ICON_SIZE} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePress}
            className="ml-3"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`View settings for ${displayName}`}
          >
            <Settings2 color={USER_CONSTANTS.COLORS.ICON_SETTINGS} size={USER_CONSTANTS.UI.ICON_SIZE} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRemoveUser}
            className="ml-3"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Remove user ${displayName}`}
            accessibilityHint="Double tap to remove this user"
          >
            <Trash2 color={USER_CONSTANTS.COLORS.ICON_DELETE} size={USER_CONSTANTS.UI.ICON_SIZE} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(UserItemComponent);