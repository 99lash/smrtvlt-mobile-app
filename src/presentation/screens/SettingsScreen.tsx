import React from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { LogOut } from 'lucide-react-native';
import ButtonSecondary from '../component/buttons/ButtonSecondary';
import { useVaultManagement } from '../hooks/VaultContext';
import { NFCManager } from '../component/settings/NFCManager';
import { PinManager } from '../component/settings/PinManager';
import { ProvisioningManager } from '../component/settings/ProvisioningManager';

const SettingsScreen = () => {
  // Use the extracted vault management hook
  const {
    currentVaultId,
    loading: vaultsLoading
  } = useVaultManagement();
  return (
    <View className="flex-1 bg-bg-default">
      <ScrollView
        className="flex-1 gap-2"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >

        {/* PIN Management Section */}
        <View className="px-3 mt-3">
          <PinManager />
        </View>

        {/* NFC Management Section */}
        <View className="px-3">
          <NFCManager
            currentVaultId={currentVaultId}
            vaultsLoading={vaultsLoading}
          />
        </View>

        {/* Provisioning Management Section */}
        <View className="px-3">
          <ProvisioningManager />
        </View>
      </ScrollView>

    </View>
  );
};

export default SettingsScreen;