import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { Shield, Check } from 'lucide-react-native';
import CustomModal from '../modals/CustomModal';
import { useVaultCreation } from '../../hooks/provisioning/useVaultCreation';
import { useAuthContext } from '../../context/AuthContext';
import type { ESPDevice } from '@orbital-systems/react-native-esp-idf-provisioning';

interface VaultConfigurationModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDevice: ESPDevice | null;
  onVaultCreated: (vaultData: any) => void;
  isCreating?: boolean;
}

const VaultConfigurationModal: React.FC<VaultConfigurationModalProps> = ({
  visible,
  onClose,
  selectedDevice,
  onVaultCreated,
  isCreating = false,
}) => {
  const [vaultName, setVaultName] = useState('');
  const [location, setLocation] = useState('');
  const { createVault } = useVaultCreation();
  const { isAuthenticated } = useAuthContext();

  const handleCreateVault = async () => {
    if (!vaultName.trim()) {
      Alert.alert('Error', 'Please enter a vault name');
      return;
    }

    if (!selectedDevice) {
      Alert.alert('Error', 'No device selected');
      return;
    }

    const vaultData = {
      device_id: selectedDevice.name, // Use device name as vault ID
      name: vaultName.trim(),
      location: location.trim() || undefined,
    };

    console.log('Creating vault with data:', vaultData);

    const result = await createVault(vaultData);

    if (result) {
      onVaultCreated(result);
      onClose();

      // Reset form
      setVaultName('');
      setLocation('');
    }
    // Error handling is done in the hook
  };

  const handleClose = () => {
    if (!isCreating) {
      setVaultName('');
      setLocation('');
      onClose();
    }
  };

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      title="Configure Vault"
      icon={<Shield size={24} color="#3B82F6" />}
      iconPosition="left"
      primaryAction={{
        label: "Create Vault",
        onPress: handleCreateVault,
        disabled: !vaultName.trim() || !isAuthenticated,
        loading: isCreating,
      }}
      secondaryAction={{
        label: "Cancel",
        onPress: handleClose,
      }}
    >
      <View className="mb-4">
        {selectedDevice && (
          <View className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <Text className="text-sm font-medium text-green-800 mb-1">
              WiFi Configuration Successful! 🎉
            </Text>
            <Text className="text-lg font-semibold text-green-900">
              {selectedDevice.name}
            </Text>
            <Text className="text-sm text-green-700 mt-1">
              Now let's configure your vault settings
            </Text>
          </View>
        )}

        {/* Authentication check */}
        {!isAuthenticated && (
          <View className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <Text className="text-sm font-medium text-red-800 mb-1">
              Authentication Required
            </Text>
            <Text className="text-sm text-red-700">
              You need to be logged in to create a vault. Please log in and try again.
            </Text>
          </View>
        )}

        {/* Vault Name Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Vault Name *
          </Text>
          <TextInput
            value={vaultName}
            onChangeText={setVaultName}
            placeholder="Enter vault name (e.g., Office Safe)"
            className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
            editable={!isCreating}
            maxLength={100}
          />
        </View>

        {/* Location Input */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Location (Optional)
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Enter vault location (e.g., 2nd Floor Storage)"
            className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
            editable={!isCreating}
            maxLength={200}
          />
        </View>

        {/* Info Text */}
        <View className="p-3 bg-blue-50 rounded-lg">
          <Text className="text-sm text-blue-600">
            💡 Your vault will be created with the device ID as its unique identifier.
            You'll automatically become the admin of this vault.
          </Text>
        </View>
      </View>
    </CustomModal>
  );
};

export default VaultConfigurationModal;