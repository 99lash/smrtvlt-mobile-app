import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Shield, Unlock } from 'lucide-react-native';
import { VaultMembership } from '../../../service/VaultService';

interface VaultGridProps {
  vaults: VaultMembership[];
  onVaultPress: (vault: VaultMembership) => void;
  isLoading?: boolean;
}

interface VaultCardProps {
  vault: VaultMembership;
  onPress: () => void;
}

const VaultCard: React.FC<VaultCardProps> = ({ vault, onPress }) => {
  const getStatusColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#22c55e'; // Green for admin
      case 'member':
        return '#3b82f6'; // Blue for member
      case 'guest':
        return '#64748b'; // Gray for guest
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} color="#22c55e" />;
      case 'member':
        return <Unlock size={16} color="#3b82f6" />;
      case 'guest':
        return <Shield size={16} color="#64748b" />;
      default:
        return <Shield size={16} color="#64748b" />;
    }
  };

  return (
    <TouchableOpacity
      className="bg-surface-default dark:bg-surface-dark rounded-xl p-4 mb-3 mx-1 border border-border-default dark:border-border-dark"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: `${getStatusColor(vault.role)}20` }}
          >
            {getStatusIcon(vault.role)}
          </View>
          <View>
            <Text className="text-text-dark dark:text-text-dark font-semibold text-base">
              {vault.vault_name || `Vault ${vault.vault_id}`}
            </Text>
            <Text className="text-muted-default dark:text-muted-dark text-sm">
              {vault.vault_location || 'No location'}
            </Text>
          </View>
        </View>
        <View
          className="px-2 py-1 rounded-full"
          style={{ backgroundColor: `${getStatusColor(vault.role)}20` }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: getStatusColor(vault.role) }}
          >
            {vault.role.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const VaultGrid: React.FC<VaultGridProps> = ({
  vaults,
  onVaultPress,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <View className="bg-surface-default dark:bg-surface-dark rounded-xl p-6 mb-4">
        <Text className="text-text-dark dark:text-text-dark text-lg font-semibold mb-4">
          My Vaults
        </Text>
        <View className="flex-row gap-3">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className="bg-surface-active dark:bg-border-dark rounded-xl p-4 mb-3 flex-1 animate-pulse"
            >
              <View className="h-4 bg-border-default dark:bg-border-dark rounded mb-2" />
              <View className="h-3 bg-border-default dark:bg-border-dark rounded w-3/4" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (vaults.length === 0) {
    return (
      <View className="bg-surface-default dark:bg-surface-dark rounded-xl p-6 mb-4">
        <Text className="text-text-dark dark:text-text-dark text-lg font-semibold mb-4">
          My Vaults
        </Text>
        <View className="items-center py-8">
          <Shield size={48} color="#64748b" />
          <Text className="text-muted-default dark:text-muted-dark text-center mt-4">
            No vaults available
          </Text>
          <Text className="text-muted-default dark:text-muted-dark text-center text-sm mt-2">
            Contact your administrator to get access to vaults
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-surface-default dark:bg-surface-dark rounded-xl p-6 mb-4">
      <Text className="text-text-dark dark:text-text-dark text-lg font-semibold mb-4">
        My Vaults ({vaults.length})
      </Text>

      <FlatList
        data={vaults}
        keyExtractor={(item) => item.vault_id.toString()}
        renderItem={({ item }) => (
          <VaultCard vault={item} onPress={() => onVaultPress(item)} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
};