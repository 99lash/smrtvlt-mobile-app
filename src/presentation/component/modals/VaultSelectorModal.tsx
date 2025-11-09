import React from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity } from 'react-native';
import { VaultMembership } from '../../../service/VaultService';

interface VaultSelectorModalProps {
  visible: boolean;
  vaults: VaultMembership[];
  onClose: () => void;
  onSelectVault: (vaultId: number) => void;
}

export function VaultSelectorModal({
  visible,
  vaults,
  onClose,
  onSelectVault,
}: VaultSelectorModalProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-black">
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-800">
          <Text className="text-white text-lg font-semibold">Select Vault</Text>
          <TouchableOpacity 
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close vault selector"
          >
            <Text className="text-blue-400 text-base">Cancel</Text>
          </TouchableOpacity>
        </View>

        {vaults.length > 0 ? (
          <FlatList
            data={vaults}
            keyExtractor={(vault) => vault.vault_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-neutral-800 p-4 mb-2 rounded-lg mx-4"
                onPress={() => onSelectVault(item.vault_id)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Vault ${item.vault_id}, role ${item.role}`}
              >
                <Text className="text-text-dark font-medium text-base">
                  Vault ID: {item.vault_id}
                </Text>
                <Text className="text-neutral-400 text-sm capitalize">
                  Role: {item.role}
                </Text>
                <Text className="text-neutral-500 text-xs">
                  Member since: {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-center items-center px-4">
            <Text className="text-neutral-400 text-center mb-4">
              No accessible vaults found
            </Text>
            <Text className="text-neutral-500 text-center text-sm">
              You need access to at least one vault to invite users
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}