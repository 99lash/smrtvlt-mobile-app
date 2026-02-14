import React from 'react';
import { View, Text } from 'react-native';
import { Shield } from 'lucide-react-native';
import { VaultMembership } from '../../../../service/VaultService';
import { EnhancedEmptyState } from '../../../component/common/EnhancedEmptyState';
import BorderedList from '../../../component/lists/BorderedList';

interface VaultListProps {
  vaults: VaultMembership[];
  onVaultSelect: (vaultId: number) => void;
  scrollEnabled?: boolean;
}

export const VaultList: React.FC<VaultListProps> = ({ vaults, onVaultSelect, scrollEnabled = true }) => {
    const renderVaultItem = (item: VaultMembership, index: number, isSelected: boolean) => {
    const vaultInitials = `V${item.vault_id}`;
    const isAdmin = item.role.toLowerCase() === 'admin';

    return (
      <View className="flex-row items-center gap-5 py-2">
        <View className="w-14 h-14 rounded-3xl bg-black border border-zinc-800 items-center justify-center shadow-lg">
          <Text className="text-white font-black text-lg uppercase">
            {vaultInitials}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text 
              className="font-black text-lg text-text-default uppercase tracking-tighter flex-1"
              numberOfLines={1}
            >
              {item.vault_name || `UNIT ${item.vault_id}`}
            </Text>
            
            <View 
              className={`px-3 py-1 rounded-lg border ${isAdmin ? 'bg-white border-white' : 'bg-transparent border-zinc-800'}`}
            >
              <Text className={`${isAdmin ? 'text-black' : 'text-white'} text-[9px] font-black uppercase tracking-widest`}>
                {item.role}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <Shield size={12} color="#71717A" />
            <Text className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
              DEPLOYED: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (vaults.length === 0) {
    return (
      <View className="px-6">
        <EnhancedEmptyState
            icon={Shield}
            iconSize={48}
            title="NO UNITS DETECTED"
            message="SYSTEM ARCHIVE EMPTY"
        />
      </View>
    );
  }

  return (
      <BorderedList
        data={vaults}
        keyExtractor={(vault) => vault.vault_id.toString()}
        renderItem={renderVaultItem}
        onItemPress={(vault) => onVaultSelect(vault.vault_id)}
        getId={(vault) => vault.vault_id.toString()}
        maxVisibleItems={10}
        itemHeight={100}
        itemGap={16}
        className="mx-6"
        scrollEnabled={scrollEnabled}
      />
  );
};
