import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User as UserIcon, Users } from 'lucide-react-native';
import { User as UserType } from '../../../../types/UserTypes';
import { EnhancedEmptyState } from '../../../component/common/EnhancedEmptyState';
import BorderedList from '../../../component/lists/BorderedList';
import { Edit, Trash2 } from 'lucide-react-native';

interface UsersListProps {
  users: UserType[];
  onUserPress: (userId: string) => void;
  onRefresh: () => void;
  onEditUser?: (user: UserType) => void;
  onDeleteUser?: (userId: string) => void;
  onToggleStatus?: (userId: string) => void;
}

export const UserList: React.FC<UsersListProps> = ({
  users,
  onRefresh,
  onEditUser,
  onDeleteUser,
  onToggleStatus,
}) => {
  const formatLastAccess = (lastAccess: string | undefined): string => {
    if (!lastAccess) return 'Never';
    
    const accessDate = new Date(lastAccess);
    const now = new Date();
    const diffMs = now.getTime() - accessDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const renderUserItem = (item: UserType, index: number, isSelected: boolean) => {
    const displayName = item.firstName && item.lastName
      ? `${item.firstName} ${item.lastName}`
      : item.username || `User ${item.id}`;

    // Get initials for avatar
    const initials = displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2); // Limit to 2 characters

    const isActive = item.status.toLowerCase() === 'active';
    const isAdmin = item.role.toLowerCase() === 'admin';
    const adminCount = users.filter((u: UserType) => u.role.toLowerCase() === 'admin').length;
    const canDelete = !(isAdmin && adminCount === 1);

    return ( 
      <View className="flex-row items-center gap-3" >
        
        {/* Avatar - Always show initials */}
        <View className="w-12 h-12 rounded-full bg-icons-default items-center justify-center">
          <Text className="text-text-dark font-semibold text-sm">
            {initials}
          </Text>
        </View>

        {/* Main Content */}
        <View className="flex-1">
          {/* Name and Badges Row */}
          <View className="flex-row items-center justify-between mb-1">
            <Text 
              className={`font-semibold text-base text-text-default flex-1`}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            
            <View className="flex-row items-center gap-2">
              {/* Inactive Badge */}
              {!isActive && (
                <View className="px-2 py-0.5 rounded border border-neutral-600">
                  <Text className="text-neutral-400 text-xs">
                    Inactive
                  </Text>
                </View>
              )}

              {/* Role Badge */}
              <View 
                className={`px-2 py-0.5 rounded ${
                  isAdmin ? 'bg-primary-default' : 'bg-icons-default'
                }`}
              >
                <Text className="text-text-dark text-xs capitalize">
                  {item.role}
                </Text>
              </View>
            </View>
          </View>

          {/* Last Access and Auth Methods Row */}
          <View className="flex-row items-center gap-4">
            <Text
              className={`text-xs ${
                isSelected ? "text-blue-700" : "text-neutral-400"
              }`}
            >
              Joined: {formatLastAccess(item.lastAccess)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const getId = (item: UserType) => item.id.toString();

  if (users.length === 0) {
    return (
      <EnhancedEmptyState
        icon={Users}
        iconSize={48}
        title="No users found"
        message="No users are currently shared in your vaults"
      />
    );
  }

  return (
    <BorderedList
      data={users}
      keyExtractor={(user) => user.id.toString()}
      renderItem={renderUserItem}
      onItemPress={() => {}}
      getId={getId}
      maxVisibleItems={8}
      itemHeight={80}
      className="mx-4"
    />
  );
};