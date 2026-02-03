import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, Vault } from 'lucide-react-native';
import ButtonSecondary from '../component/buttons/ButtonSecondary';
import CustomModal from '../component/modals/CustomModal';
import BorderedList from '../component/lists/BorderedList';

// Dummy Data
const DUMMY_VAULTS = [
  { vault_id: 1, vault_name: 'Main Vault', role: 'admin', vault_location: 'Home' },
  { vault_id: 2, vault_name: 'Office Safe', role: 'member', vault_location: 'Office' }
];

// Placeholder Component for Managers
const ManagerPlaceholder = ({ title }: { title: string }) => (
  <View className="bg-surface-default p-4 rounded-xl border border-border-default mb-4">
    <Text className="text-text-dark font-bold text-lg mb-2">{title}</Text>
    <Text className="text-muted-default">Settings for {title} would appear here.</Text>
  </View>
);

const SettingsScreen = () => {
  const [currentVault, setCurrentVault] = useState(DUMMY_VAULTS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <View className="flex-1 bg-bg-default">
      <ScrollView
        className="flex-1 gap-2"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Vault Selection Dropdown */}
        <View className="px-3 mt-3">
          <ButtonSecondary
            title={`${currentVault.vault_name} (${currentVault.role})`}
            onPress={() => setIsDropdownOpen(true)}
            icon={isDropdownOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            iconPosition="right"
            className="w-full"
            textClassName="text-left flex-1"
          />
          
          {/* Dropdown Modal */}
          <CustomModal
            visible={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            title="Select Vault"
          >
            <BorderedList
              data={DUMMY_VAULTS}
              keyExtractor={(vault: any) => vault.vault_id.toString()}
              selectedId={currentVault.vault_id.toString()}
              getId={(vault: any) => vault.vault_id.toString()}
              onItemPress={(vault: any) => {
                setCurrentVault(vault);
                setIsDropdownOpen(false);
              }}
              iconExtractor={() => <Vault size={20} color="#9CA3AF" />}
              renderItem={(vault: any) => (
                <View className="flex-1">
                  <Text className="text-text-dark font-medium">
                    {vault.vault_name}
                  </Text>
                  <Text className="text-muted-default text-sm">
                    {vault.role} • {vault.vault_location}
                  </Text>
                </View>
              )}
            />
          </CustomModal>
        </View>
        
        {/* Sections */}
        <View className="px-3 mt-3">
          <ManagerPlaceholder title="Join Vault" />
          <ManagerPlaceholder title="PIN Management" />
          <ManagerPlaceholder title="NFC Management" />
          {currentVault.role === 'admin' && (
             <ManagerPlaceholder title="User Management" />
          )}
          <ManagerPlaceholder title="Provisioning" />
        </View>
      </ScrollView>

    </View>
  );
};

export default SettingsScreen;