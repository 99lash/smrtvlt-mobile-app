import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Users, Crown, Archive, Trash2 } from 'lucide-react-native';
import { User as UserType } from '../../../../types/UserTypes';
import { EnhancedEmptyState } from '../../../component/common/EnhancedEmptyState';
import BorderedList from '../../../component/lists/BorderedList';

interface UsersListProps {
  users: UserType[];
  onUserPress: (userId: string) => void;
  onRefresh: () => void;
  onEditUser?: (user: UserType) => void;
  onDeleteUser?: (userId: string) => void;
  onArchiveUser?: (userId: string) => void;
  onToggleStatus?: (userId: string) => void;
  onTransferOwnership?: (user: UserType) => void;
  scrollEnabled?: boolean;
}

export const UserList: React.FC<UsersListProps> = ({
  users,
  onRefresh,
  onEditUser,
  onDeleteUser,
  onArchiveUser,
  onToggleStatus,
  onTransferOwnership,
  scrollEnabled = true,
}) => {
  const formatLastAccess = (lastAccess: string | undefined): string => {
    return 'ACTIVE';
  };

  const renderUserItem = (item: UserType, index: number, isSelected: boolean) => {
    const displayName = item.firstName && item.lastName
      ? `${item.firstName} ${item.lastName}`
      : item.username || `User ${item.id}`;

    const initials = displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const isActive = item.status.toLowerCase() === 'active';
    const isAdmin = item.role.toLowerCase() === 'admin';

    return ( 
      <View className="flex-row items-center gap-5 py-2" >
        <View className={`w-16 h-16 rounded-full ${isAdmin ? 'bg-white' : 'bg-black border border-zinc-800'} items-center justify-center shadow-lg`}>
          <Text className={`${isAdmin ? 'text-black' : 'text-white'} font-black text-xl`}>
            {initials}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text 
              className="font-black text-lg text-text-default uppercase tracking-tighter"
              numberOfLines={1}
            >
              {displayName}
            </Text>
            
            <View className={`px-3 py-1 rounded-lg border ${isAdmin ? 'bg-white border-white' : 'bg-transparent border-zinc-800'}`}>
                <Text className={`${isAdmin ? 'text-black' : 'text-white'} text-[9px] font-black uppercase tracking-widest`}>
                  {item.role}
                </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <View className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-zinc-800'}`} />
            <Text className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
              {isActive ? 'ACTIVE LINK' : 'INACTIVE'} • USER ID: {item.id}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const getId = (item: UserType) => item.id.toString();

  if (users.length === 0) {
    return (
      <View className="px-6">
        <EnhancedEmptyState
            icon={Users}
            iconSize={48}
            title="NO USERS DETECTED"
            message="DATABASE BUFFER EMPTY"
        />
      </View>
    );
  }

  return (
    <BorderedList
      data={users}
      keyExtractor={(user) => user.id.toString()}
      renderItem={renderUserItem}
      onItemPress={() => {}}
      rightContentExtractor={(user, index) => {
        const isAdmin = user.role.toLowerCase() === 'admin';
        return (
          <View className="flex-row gap-2 items-center">
            {isAdmin && onTransferOwnership && (
              <TouchableOpacity
                onPress={() => onTransferOwnership(user)}
                className="bg-zinc-100 p-3 rounded-2xl border border-zinc-200"
              >
                <Crown size={18} color="#000000" strokeWidth={3} />
              </TouchableOpacity>
            )}
            {!isAdmin && onArchiveUser && (
              <TouchableOpacity
                onPress={() => onArchiveUser(user.id.toString())}
                className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800"
              >
                <Archive size={18} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
            {!isAdmin && onDeleteUser && (
              <TouchableOpacity
                onPress={() => onDeleteUser(user.id.toString())}
                className="bg-red-900/40 p-3 rounded-2xl border border-red-800"
              >
                <Trash2 size={18} color="#EF4444" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
        );
      }}
      getId={getId}
      maxVisibleItems={10}
      itemHeight={100}
      itemGap={16}
      className="mx-6"
      scrollEnabled={scrollEnabled}
    />
  );
};