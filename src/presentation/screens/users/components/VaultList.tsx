import React from 'react';
import { View, Text } from 'react-native';
import { Shield } from 'lucide-react-native';
import { VaultMembership } from '../../../../service/VaultService';
import { EnhancedEmptyState } from '../../../component/common/EnhancedEmptyState';
import BorderedList from '../../../component/lists/BorderedList';

interface VaultListProps {
  vaults: VaultMembership[];
  onVaultSelect: (vaultId: number) => void;
}

export const VaultList: React.FC<VaultListProps> = ({ vaults, onVaultSelect }) => {
    const renderVaultItem = (item: VaultMembership, index: number, isSelected: boolean) => {
    // Generate initials from vault ID (since vaults don't have names)
    const vaultInitials = `V${item.vault_id}`;

    return (
      <View className="flex-row items-center gap-3 py-2">
        {/* Vault Avatar - Show vault number */}
        <View className="w-10 h-10 rounded-full bg-icons-default items-center justify-center">
          <Text className="text-text-dark font-semibold text-sm">
            {vaultInitials}
          </Text>
        </View>

        {/* Main Content */}
        <View className="flex-1">
          {/* Vault Info and Badge Row */}
          <View className="flex-row items-center justify-between mb-1">
            <Text 
              className={`font-semibold text-base flex-1 ${
                isSelected ? "text-blue-400" : "text-text-dark"
              }`}
              numberOfLines={1}
            >
              {item.vault_name || `Vault ${item.vault_id}`}
            </Text>
            
            {/* Role Badge */}
            <View 
              className={`px-2 py-0.5 rounded ${
                item.role.toLowerCase() === 'admin' ? 'bg-icons-light' : 'bg-icons-default'
              }`}
            >
              <Text className="text-text-dark text-xs capitalize">
                {item.role}
              </Text>
            </View>
          </View>

          {/* Member Since Row */}
          <View className="flex-row items-center gap-4">
            <Text
              className={`text-xs ${
                isSelected ? "text-blue-300" : "text-neutral-400"
              }`}
            >
              Member since: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };


  return (
      <BorderedList
        data={vaults}
        keyExtractor={(vault) => vault.vault_id.toString()}
        renderItem={renderVaultItem}
        onItemPress={(vault) => onVaultSelect(vault.vault_id)}
        getId={(vault) => vault.vault_id.toString()}
        maxVisibleItems={8}
        itemHeight={80}
        itemGap={6}
        className="mx-4"
      />
  );
};
