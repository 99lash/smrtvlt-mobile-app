import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, Vault, ArrowRight } from 'lucide-react-native';
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
  <View className="bg-surface-default p-8 rounded-[32px] border border-zinc-800 mb-6 shadow-xl">
    <View className="flex-row items-center justify-between mb-4">
        <Text className="text-text-default font-black text-2xl uppercase tracking-tighter">{title}</Text>
        <ArrowRight size={24} color="#FFFFFF" strokeWidth={3} />
    </View>
    <Text className="text-muted-default text-xs font-bold uppercase tracking-[2px]">System parameters for {title}</Text>
  </View>
);

const SettingsScreen = () => {
  const [currentVault, setCurrentVault] = useState(DUMMY_VAULTS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <View className="flex-1 bg-bg-default">
      <ScrollView
        className="flex-1 gap-2"
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mb-10">
            <Text className="text-white text-4xl font-black uppercase tracking-tighter">SETTINGS</Text>
            <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[3px] mt-1">Global Configuration</Text>
        </View>

        {/* Vault Selection Dropdown */}
        <View className="px-6 mb-10">
          <ButtonSecondary
            title={`${currentVault.vault_name} / ${currentVault.role}`}
            onPress={() => setIsDropdownOpen(true)}
            icon={isDropdownOpen ? <ChevronUp size={20} color="#FFFFFF" /> : <ChevronDown size={20} color="#FFFFFF" />}
            iconPosition="right"
            className="w-full bg-black border-2 border-zinc-800 rounded-[24px] py-6"
            textClassName="text-left flex-1 text-white font-black uppercase tracking-tighter text-lg"
          />
          
          {/* Dropdown Modal */}
          <CustomModal
            visible={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            title="SELECT UNIT"
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
              iconExtractor={() => <Vault size={20} color="#FFFFFF" strokeWidth={2.5} />}
              renderItem={(vault: any) => (
                <View className="flex-1">
                  <Text className="text-text-default font-black uppercase tracking-tight text-lg">
                    {vault.vault_name}
                  </Text>
                  <Text className="text-muted-default text-[10px] font-bold uppercase tracking-widest mt-1">
                    {vault.role} • {vault.vault_location}
                  </Text>
                </View>
              )}
              scrollEnabled={false}
            />
          </CustomModal>
        </View>
        
        {/* Sections */}
        <View className="px-6">
          <ManagerPlaceholder title="Unit Enrollment" />
          <ManagerPlaceholder title="Pin Codes" />
          <ManagerPlaceholder title="NFC Tokens" />
          {currentVault.role === 'admin' && (
             <ManagerPlaceholder title="User Archive" />
          )}
          <ManagerPlaceholder title="Provisioning" />
        </View>
      </ScrollView>

    </View>
  );
};

export default SettingsScreen;