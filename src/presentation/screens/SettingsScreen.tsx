import React from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuthContext } from '../context/AuthContext';
import ButtonSecondary from '../component/buttons/ButtonSecondary';
import { useVaultManagement } from '../hooks/VaultContext';
import { NFCManager } from '../component/settings/NFCManager';
import { PinManager } from '../component/settings/PinManager';
import { ProvisioningManager } from '../component/settings/ProvisioningManager';

const SettingsScreen = () => {
  const { logout } = useAuthContext();

  // Use the extracted vault management hook
  const {
    currentVaultId,
    loading: vaultsLoading
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

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        className="flex-1 gap-3"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >

        {/* PIN Management Section */}
        <View className="px-6 mt-10">
          <PinManager />
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
          <ProvisioningManager />
        </View>
        <View className="px-6 py-4 bg-black border-border-dark">
          {/* Logout button here */}
          <ButtonSecondary
            title="Sign Out"
            onPress={handleLogout}
            icon={<LogOut size={24} />}
          />

          {/* Info Section here */}
          <Text className="text-sm text-muted-default mt-4 dark:text-muted-dark text-center">
            Smart Vault App v1.0.0
          </Text>
          <Text className="text-xs text-muted-default dark:text-muted-dark text-center mt-1">
            Secure device management and monitoring
          </Text>
        </View>
      </ScrollView>

    </View>
  );
};

export default SettingsScreen;