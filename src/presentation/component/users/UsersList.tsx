import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User } from '../../../types/UserTypes';
import { EmptyState } from '../common/EmptyState';
import BorderedList from '../lists/BorderedList';
import { UserCheck, Shield, Clock, CreditCard, Hash, Edit, Trash2 } from 'lucide-react-native';

interface UsersListProps {
  users: User[];
  onUserPress: (userId: string) => void;
  onRefresh: () => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onToggleStatus?: (userId: string) => void;
}

export const UsersList: React.FC<UsersListProps> = ({
  users,
  onUserPress,
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

  const renderUserItem = (item: User, index: number, isSelected: boolean) => {
    const displayName = item.firstName && item.lastName
      ? `${item.firstName} ${item.lastName}`
      : item.username || `User ${item.id}`;
    
    // Get initials for avatar
    const initials = displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2); // Limit to 2 characters

    const isActive = item.status.toLowerCase() === 'active';
    const isAdmin = item.role.toLowerCase() === 'admin';
    const adminCount = users.filter(u => u.role.toLowerCase() === 'admin').length;
    const canDelete = !(isAdmin && adminCount === 1);

    return (
      <View className="flex-row items-center gap-3 py-2">
        {/* Avatar - Always show initials */}
        <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center">
          <Text className="text-white font-semibold text-sm">
            {initials}
          </Text>
        </View>

        {/* Main Content */}
        <View className="flex-1">
          {/* Name and Badges Row */}
          <View className="flex-row items-center gap-2 mb-1">
            <Text 
              className={`font-semibold text-base ${
                isSelected ? "text-blue-800" : "text-white"
              }`}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            
            {/* Role Badge */}
            <View 
              className={`px-2 py-0.5 rounded ${
                isAdmin ? 'bg-blue-600' : 'bg-neutral-700'
              }`}
            >
              <Text className="text-white text-xs capitalize">
                {item.role}
              </Text>
            </View>

            {/* Inactive Badge */}
            {!isActive && (
              <View className="px-2 py-0.5 rounded border border-neutral-600">
                <Text className="text-neutral-400 text-xs">
                  Inactive
                </Text>
              </View>
            )}
          </View>

          {/* Last Access and Auth Methods Row */}
          <View className="flex-row items-center gap-4">
            <Text
              className={`text-xs ${
                isSelected ? "text-blue-700" : "text-neutral-400"
              }`}
            >
              Last access: {formatLastAccess(item.lastAccess)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-2">
          {/* Toggle Switch */}
          <TouchableOpacity
            onPress={() => onToggleStatus?.(item.id.toString())}
            className={`w-11 h-6 rounded-full p-0.5 ${
              isActive ? 'bg-blue-600' : 'bg-neutral-700'
            }`}
          >
            <View
              className={`w-5 h-5 rounded-full bg-white ${
                isActive ? 'ml-auto' : 'ml-0'
              }`}
            />
          </TouchableOpacity>

          {/* Edit Button */}
          <TouchableOpacity
            onPress={() => onEditUser?.(item)}
            className="p-2 rounded hover:bg-neutral-800"
          >
            <Edit size={16} color={isSelected ? "#1e40af" : "#9ca3af"} />
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={() => canDelete && onDeleteUser?.(item.id.toString())}
            className="p-2 rounded hover:bg-neutral-800"
            disabled={!canDelete}
          >
            <Trash2
              size={16}
              color={canDelete ? (isSelected ? "#dc2626" : "#ef4444") : "#4b5563"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getId = (item: User) => item.id.toString();

  if (users.length === 0) {
    return (
      <EmptyState
        title="No users found"
        message="No users are currently shared in your vaults"
        actionLabel="Refresh"
        onAction={onRefresh}
      />
    );
  }

  return (
    <View className="px-4">
      <BorderedList
        data={users}
        keyExtractor={(user) => user.id.toString()}
        renderItem={renderUserItem}
        onItemPress={(user) => onUserPress(user.id.toString())}
        getId={getId}
        className="bg-neutral-900 border-neutral-700"
        maxVisibleItems={8}
        itemHeight={80}
      />
    </View>
  );
};