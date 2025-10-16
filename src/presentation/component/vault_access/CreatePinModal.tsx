import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Shield, Eye, EyeOff, ChevronDown, Check } from 'lucide-react-native';
import { KeypadPin } from '../../../types/KeypadPinTypes';
import { useKeypadPins } from '../../hooks/vault/useKeypadPins';
import { useAuthContext } from '../../context/AuthContext';
import { useVaultManagement } from '../../hooks/VaultContext';
import CustomModal from '../modals/CustomModal';

interface CreatePinModalProps {
  visible: boolean;
  onClose: () => void;
  onPinCreated: (pin: KeypadPin) => void;
}

export const CreatePinModal: React.FC<CreatePinModalProps> = ({
  visible,
  onClose,
  onPinCreated
}) => {
  const [pinCode, setPinCode] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [showVaultDropdown, setShowVaultDropdown] = useState(false);

  const { createPin, loading } = useKeypadPins();
  const { user } = useAuthContext();
  const { availableVaults, loading: vaultsLoading, loadVaults } = useVaultManagement();

  // Reset selection when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedVaultId(null);
      setShowVaultDropdown(false);
      setPinCode('');
      setIsVisible(false);
    }
  }, [visible]);

  // Auto-select first vault when vaults are loaded
  useEffect(() => {
    if (availableVaults.length > 0 && selectedVaultId === null) {
      setSelectedVaultId(availableVaults[0].vault_id);
    }
  }, [availableVaults, selectedVaultId]);
  
  const handleCreate = async () => {
    if (!pinCode || !user || !selectedVaultId) {
      Alert.alert('Error', 'Please enter a PIN code and select a vault.');
      return;
    }

    try {
      // Pass the current user's ID and selected vault ID when creating PIN
      const newPin = await createPin(pinCode, user.id, selectedVaultId);
      onPinCreated(newPin);
      onClose();
      setPinCode('');
      setSelectedVaultId(null); // Reset selection
    } catch (error) {
      // Error handled by hook
    }
  };
  
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Create New PIN"
      icon={<Shield size={24} color="#60a5fa" />}
      primaryAction={{
        label: loading ? "Creating..." : "Create PIN",
        onPress: handleCreate,
        disabled: loading || !pinCode || !selectedVaultId,
        loading
      }}
    >
      <View className="relative mb-4">
        <TextInput
          value={pinCode}
          onChangeText={setPinCode}
          placeholder="Enter PIN code"
          secureTextEntry={!isVisible}
          maxLength={8}
          className="border border-border-default dark:border-border-dark rounded-lg px-3 py-3 pr-12 text-text-default dark:text-text-dark bg-surface-default dark:bg-surface-dark"
        />
        <TouchableOpacity
          onPress={() => setIsVisible(!isVisible)}
          className="absolute right-3 top-3"
        >
          {isVisible ? (
            <EyeOff size={20} color="#6b7280" />
          ) : (
            <Eye size={20} color="#6b7280" />
          )}
        </TouchableOpacity>
      </View>

      {/* Vault Selection */}
      <View className="mb-4">
        <Text className="text-text-default dark:text-text-dark mb-2 font-medium">
          Select Vault
        </Text>

        {vaultsLoading ? (
          <View className="border border-border-default dark:border-border-dark rounded-lg px-3 py-3 bg-surface-default dark:bg-surface-dark">
            <Text className="text-muted-default dark:text-muted-dark">Loading vaults...</Text>
          </View>
        ) : availableVaults.length === 0 ? (
          <View className="border border-border-default dark:border-border-dark rounded-lg px-3 py-3 bg-surface-default dark:bg-surface-dark">
            <Text className="text-muted-default dark:text-muted-dark">No vaults available</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowVaultDropdown(!showVaultDropdown)}
            className="border border-border-default dark:border-border-dark rounded-lg px-3 py-3 bg-surface-default dark:bg-surface-dark flex-row justify-between items-center"
          >
            <Text className="text-text-default dark:text-text-dark">
              {selectedVaultId
                ? (() => {
                    const vault = availableVaults.find(v => v.vault_id === selectedVaultId);
                    console.log('🔍 CreatePinModal - Selected vault data:', vault);
                    const displayName = vault?.vault_name || `Vault ${selectedVaultId}`;
                    const role = vault?.role || 'Unknown';
                    console.log('🔍 CreatePinModal - Displaying:', `${displayName} (${role})`);
                    return `${displayName} (${role})`;
                  })()
                : 'Select a vault'
              }
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>
        )}

        {/* Vault Dropdown */}
        {showVaultDropdown && availableVaults.length > 0 && (
          <View className="border border-border-default dark:border-border-dark rounded-lg bg-surface-default dark:bg-surface-dark mt-1 max-h-48">
            <ScrollView showsVerticalScrollIndicator={false}>
              {availableVaults.map((vault) => (
                <TouchableOpacity
                  key={vault.vault_id}
                  onPress={() => {
                    setSelectedVaultId(vault.vault_id);
                    setShowVaultDropdown(false);
                  }}
                  className="px-3 py-3 flex-row justify-between items-center border-b border-border-default dark:border-border-dark last:border-b-0"
                >
                  <View>
                    <Text className="text-text-default dark:text-text-dark font-medium">
                      {(() => {
                        const displayName = vault.vault_name || `Vault ${vault.vault_id}`;
                        console.log('🔍 CreatePinModal - Dropdown option:', {
                          id: vault.vault_id,
                          name: vault.vault_name,
                          displayName,
                          role: vault.role,
                          location: vault.vault_location
                        });
                        return displayName;
                      })()}
                    </Text>
                    <Text className="text-muted-default dark:text-muted-dark text-sm">
                      Role: {vault.role} {vault.vault_location && `• ${vault.vault_location}`}
                    </Text>
                  </View>
                  {selectedVaultId === vault.vault_id && (
                    <Check size={20} color="#60a5fa" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {(!selectedVaultId || availableVaults.length === 0) && !vaultsLoading && (
        <Text className="text-warning-DEFAULT text-sm text-center mb-2">
          Please select a vault first before creating PINs
        </Text>
      )}
    </CustomModal>
  );
  };
  