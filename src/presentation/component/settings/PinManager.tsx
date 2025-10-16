import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Keyboard, Plus, Settings as SettingsIcon, RefreshCw, Trash2, User } from 'lucide-react-native';
import ButtonSecondary from '../buttons/ButtonSecondary';
import { CreatePinModal } from '../vault_access/CreatePinModal';
import { KeypadPin } from '../../../types/KeypadPinTypes';
import { useKeypadPins } from '../../hooks/vault/useKeypadPins';
import { useVaultManagement } from '../../hooks/VaultContext';
import CustomModal from '../modals/CustomModal';
import { KeypadPinService } from '../../../service/KeypadPinService';
import { StorageService } from '../../../config/api';

interface PinManagerProps {
  // Add any props that might be needed in the future
  // For now, keeping it simple like NFCManager
}

export const PinManager: React.FC<PinManagerProps> = () => {
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [managePinsModalVisible, setManagePinsModalVisible] = useState(false);
  const [deletingPinId, setDeletingPinId] = useState<number | null>(null);

  // Use the keypad pins hook
  const { pins, loading, error, refreshPins } = useKeypadPins();

  // Use vault management hook (for disabling buttons when no vaults)
  const { availableVaults, loading: vaultsLoading, retryLoadVaults, forceRefreshVaults, error: vaultsError } = useVaultManagement();

  // Load pins when manage modal opens
  useEffect(() => {
    if (managePinsModalVisible) {
      refreshPins();
    }
  }, [managePinsModalVisible, refreshPins]);

  const handlePinCreated = (pin: KeypadPin) => {
    Alert.alert('Success', `PIN "${pin.pin_code}" created successfully!`);
    // Refresh the pins list after creating a new pin
    refreshPins();
  };

  const handleManagePins = () => {
    setManagePinsModalVisible(true);
  };

  const handleDeletePin = (pin: KeypadPin) => {
    Alert.alert(
      'Delete PIN',
      `Are you sure you want to delete PIN "${pin.pin_code}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDeletePin(pin.id),
        },
      ]
    );
  };

  const confirmDeletePin = async (pinId: number) => {
    try {
      setDeletingPinId(pinId);
      const token = await StorageService.getAccessToken();
      await KeypadPinService.deletePin(pinId, token || undefined);

      Alert.alert('Success', 'PIN deleted successfully!');
      refreshPins(); // Refresh the list after deletion
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete PIN';
      Alert.alert('Error', errorMessage);
    } finally {
      setDeletingPinId(null);
    }
  };

  // Check if buttons should be disabled
  const shouldDisableButtons = vaultsLoading || availableVaults.length === 0;

  return (
    <>
      <View className="bg-surface-dark rounded-lg p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <Keyboard size={20} color="#60a5fa" />
          <Text className="text-white text-lg font-semibold ml-2">PIN Management</Text>
        </View>
        <Text className="text-muted-default mb-4">
          Create and manage keypad PIN codes for vault access
        </Text>
        {vaultsLoading ? (
          <Text className="text-blue-400 text-sm mb-4">
            Loading vaults...
          </Text>
        ) : vaultsError ? (
          <View className="mb-4">
            <Text className="text-red-400 text-sm mb-2">
              Error loading vaults: {vaultsError}
            </Text>
            <TouchableOpacity
              onPress={retryLoadVaults}
              className="bg-blue-600 px-3 py-2 rounded-lg self-start"
            >
              <Text className="text-white text-sm">Retry Loading Vaults</Text>
            </TouchableOpacity>
          </View>
        ) : availableVaults.length === 0 ? (
          <View className="mb-4">
            <Text className="text-yellow-600 text-sm mb-2">
              Please create or join a vault first before managing PINs
            </Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={retryLoadVaults}
                className="bg-blue-600 px-3 py-2 rounded-lg flex-1"
              >
                <Text className="text-white text-sm text-center">Retry Loading Vaults</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={forceRefreshVaults}
                className="bg-green-600 px-3 py-2 rounded-lg flex-1"
              >
                <Text className="text-white text-sm text-center">Force Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <ButtonSecondary
          title="Create New PIN"
          onPress={() => setPinModalVisible(true)}
          icon={<Plus size={20} />}
          disabled={shouldDisableButtons}
        />
        <View className="mt-3">
          <ButtonSecondary
            title="Manage Pins"
            onPress={handleManagePins}
            icon={<SettingsIcon size={20} />}
            disabled={shouldDisableButtons}
          />
        </View>
      </View>

      {/* PIN Creation Modal */}
      <CreatePinModal
        visible={pinModalVisible}
        onClose={() => setPinModalVisible(false)}
        onPinCreated={handlePinCreated}
      />

      {/* Manage Pins Modal */}
      <CustomModal
        visible={managePinsModalVisible}
        onClose={() => setManagePinsModalVisible(false)}
        title="Manage PINs"
        icon={<SettingsIcon size={20} color="#60a5fa" />}
        primaryAction={{
          label: "Refresh",
          onPress: refreshPins,
          loading: loading
        }}
      >
        <View className="max-h-96">
          {loading ? (
            <View className="py-8 items-center">
              <Text className="text-muted-default">Loading pins...</Text>
            </View>
          ) : error ? (
            <View className="py-8 items-center">
              <Text className="text-red-400 mb-2">Error loading pins</Text>
              <Text className="text-muted-default text-sm">{error}</Text>
            </View>
          ) : pins.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-muted-default mb-2">No pins found</Text>
              <Text className="text-muted-default text-sm">Create your first PIN to get started</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {pins.map((pin) => (
                <View key={pin.id} className="bg-surface-dark rounded-lg p-3 mb-2">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-white font-mono text-lg">
                          {pin.pin_code}
                        </Text>
                        {pin.user_id && (
                          <View className="flex-row items-center ml-2">
                            <User size={12} color="#60a5fa" />
                            <Text className="text-muted-default text-xs ml-1">
                              {pin.username || pin.first_name
                                ? `${pin.first_name || ''} ${pin.last_name || ''}`.trim() || pin.username || `User ${pin.user_id}`
                                : `User ${pin.user_id}`
                              }
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-muted-default text-xs">
                        Created: {new Date(pin.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => handleDeletePin(pin)}
                      disabled={deletingPinId === pin.id}
                    >
                      {deletingPinId === pin.id ? (
                        <RefreshCw size={16} color="#ef4444" />
                      ) : (
                        <Trash2 size={16} color="#ef4444" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </CustomModal>
    </>
  );
};