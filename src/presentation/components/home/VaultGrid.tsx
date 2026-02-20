import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Shield, Unlock, Lock, ChevronRight, Plus } from 'lucide-react-native';
import { VaultMembership } from '../../../service/VaultService';

interface VaultGridProps {
  vaults: VaultMembership[];
  onVaultPress: (vault: VaultMembership) => void;
  isLoading?: boolean;
  onAddVault?: () => void;
}

interface VaultCardProps {
  vault: VaultMembership;
  onPress: () => void;
}

const VaultCard: React.FC<VaultCardProps> = ({ vault, onPress }) => {
  const isAdmin = vault.role.toLowerCase() === 'admin';

  return (
    <TouchableOpacity
      className="bg-zinc-950 rounded-[24px] p-6 mb-4 border border-zinc-900 flex-row items-center gap-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className={`w-14 h-14 rounded-2xl items-center justify-center ${isAdmin ? 'bg-white' : 'bg-zinc-900 border border-zinc-800'}`}
      >
        {isAdmin ? (
          <Shield size={22} color="black" strokeWidth={2.5} />
        ) : (
          <Unlock size={22} color="white" strokeWidth={2} />
        )}
      </View>
      
      <View className="flex-1">
        <Text 
          className="text-white font-black text-lg tracking-tight uppercase"
          numberOfLines={1}
        >
          {vault.vault_name || `UNIT-${vault.vault_id}`}
        </Text>
        <Text 
          className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1"
          numberOfLines={1}
        >
          {vault.vault_location || 'SECURE SECTOR'}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <View
          className={`px-3 py-1 rounded-lg border ${isAdmin ? 'bg-zinc-800 border-zinc-700' : 'bg-transparent border-zinc-800'}`}
        >
          <Text
            className={`text-[8px] font-black uppercase tracking-tighter ${isAdmin ? 'text-white' : 'text-zinc-500'}`}
          >
            {vault.role}
          </Text>
        </View>
        <ChevronRight size={16} color="#27272A" />
      </View>
    </TouchableOpacity>
  );
};

export const VaultGrid: React.FC<VaultGridProps> = ({
  vaults,
  onVaultPress,
  isLoading = false,
  onAddVault,
}) => {
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-2">
            <View className="w-1.5 h-6 bg-white rounded-full" />
            <Text className="text-white text-xl font-black uppercase tracking-tighter ml-1">
                Active Units
            </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {onAddVault ? (
            <TouchableOpacity
              onPress={onAddVault}
              activeOpacity={0.8}
              className="w-8 h-8 bg-white rounded-full items-center justify-center"
            >
              <Plus size={16} color="black" strokeWidth={2.5} />
            </TouchableOpacity>
          ) : null}
          <View className="bg-white px-3 py-1 rounded-full">
              <Text className="text-black font-black text-[9px] uppercase">
                  {vaults.length} Units
              </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View>
          {[1, 2].map((i) => (
            <View key={i} className="h-24 bg-zinc-950 rounded-[24px] mb-4 animate-pulse border border-zinc-900" />
          ))}
        </View>
      ) : vaults.length === 0 ? (
        <View className="py-12 items-center bg-zinc-950 rounded-[24px] border border-dashed border-zinc-900">
          <Lock size={40} color="#27272A" />
          <Text className="text-zinc-600 text-center mt-4 font-black uppercase tracking-[2px] text-[9px]">
            No Secure Nodes Detected
          </Text>
        </View>
      ) : (
        <View>
          {vaults.map((item) => (
            <VaultCard key={item.vault_id} vault={item} onPress={() => onVaultPress(item)} />
          ))}
        </View>
      )}
    </View>
  );
};