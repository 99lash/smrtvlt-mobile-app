import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Settings as SettingsIcon, Wifi, Keyboard, Plus } from 'lucide-react-native';
import { useAuthContext } from '../context/AuthContext';
import ButtonSecondary from '../component/buttons/ButtonSecondary';
import Provisioning from '../component/provisioning/Provisioning';
import { CreatePinModal } from '../component/vault_access/CreatePinModal';
import { KeypadPin } from '../../types/KeypadPinTypes';
import { useVaultManagement } from '../hooks/useVaultManagement';
import { VaultSelector } from '../component/settings/VaultSelector';
import { NFCManager } from '../component/settings/NFCManager';

const SettingsScreen = () => {
  const { logout } = useAuthContext();
  const [pinModalVisible, setPinModalVisible] = useState(false);

  // Use the extracted vault management hook
  const {
    availableVaults,
    currentVaultId,
    loading: vaultsLoading,
    error: vaultError,
    loadVaults,
    selectVault
  } = useVaultManagement();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handlePinCreated = (pin: KeypadPin) => {
    Alert.alert('Success', `PIN "${pin.pin_code}" created successfully!`);
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        className="flex-1 gap-3"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
       
        {/* PIN Management Section */}
        <View className="px-6 mt-10">
          <View className="bg-surface-dark rounded-lg p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Keyboard size={20} color="#60a5fa" />
              <Text className="text-white text-lg font-semibold ml-2">PIN Management</Text>
            </View>
            <Text className="text-muted-default mb-4">
              Create and manage keypad PIN codes for vault access
            </Text>
            <ButtonSecondary
              title="Create New PIN"
              onPress={() => setPinModalVisible(true)}
              icon={<Plus size={20} />}
            />
          </View>
        </View>
        {/* NFC Management Section */}
        <View className="px-6">
          <NFCManager
            currentVaultId={currentVaultId}
            vaultsLoading={vaultsLoading}
          />
        </View>
        {/* Provisioning Management Section */}
        <View className="px-6">
          <View className="bg-surface-dark rounded-lg p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Wifi size={20} color="#60a5fa" />
              <Text className="text-white text-lg font-semibold ml-2">Provisioning Management</Text>
            </View>
            <Text className="text-muted-default mb-4">
              Configure and manage your SmartVaults
            </Text>
            <Provisioning />
          </View>
        </View>
      </ScrollView>
      <View className="px-6 py-4 bg-black border-border-dark">
        {/* Logout button here */}
        <ButtonSecondary
          title="Sign Out"
          onPress={handleLogout}
          icon={<LogOut size={24}/>}
        />
        {/* Info Section here */}
        <Text className="text-sm text-muted-default mt-4 dark:text-muted-dark text-center">
          Smart Vault App v1.0.0
        </Text>
        <Text className="text-xs text-muted-default dark:text-muted-dark text-center mt-1">
          Secure device management and monitoring
        </Text>
      </View>

      {/* PIN Creation Modal */}
      <CreatePinModal
        visible={pinModalVisible}
        onClose={() => setPinModalVisible(false)}
        onPinCreated={handlePinCreated}
      />

    </View>
  );
};

export default SettingsScreen;