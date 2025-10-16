import React from 'react';
import { View, Text } from 'react-native';
import { Wifi } from 'lucide-react-native';
import Provisioning from '../provisioning/Provisioning';

interface ProvisioningManagerProps {
  // Add any props that might be needed in the future
  // For now, keeping it simple like NFCManager
}

export const ProvisioningManager: React.FC<ProvisioningManagerProps> = () => {
  return (
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
  );
};

