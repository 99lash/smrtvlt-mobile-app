import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Shield, Eye, EyeOff } from 'lucide-react-native';
import { KeypadPin } from '../../../types/KeypadPinTypes';
import { useKeypadPins } from '../../screens/settings/hooks/useKeypadPins';
import { useAuthContext } from '../../context/AuthContext';
import { VaultMembership } from '../../../service/VaultService';
import CustomModal from '../modals/CustomModal';
import { AccessLimits } from '../../../types/AccessLimits';

interface CreatePinModalProps {
  visible: boolean;
  onClose: () => void;
  onPinCreated: (pin: KeypadPin) => void;
  limits?: AccessLimits | null;
  currentVault?: VaultMembership | null;
}

export const CreatePinModal: React.FC<CreatePinModalProps> = ({
  visible,
  onClose,
  onPinCreated,
  limits,
  currentVault
}) => {
  const [pinCode, setPinCode] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const { createPin, loading } = useKeypadPins();
  const { user } = useAuthContext();
  
  // Use the current vault from props instead of managing vault selection internally
  const selectedVaultId = currentVault?.vault_id || null;

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setPinCode('');
      setIsVisible(false);
    }
  }, [visible]);
  
  const handleCreate = async () => {
    if (!pinCode || !user || !selectedVaultId) {
      Alert.alert('Error', 'Please enter a PIN code and select a vault.');
      return;
    }

    try {
      // For members, don't pass user_id (backend auto-assigns)
      // For admins, pass user_id to assign to specific user
      const userId = limits?.role === 'admin' ? user.id : undefined;
      const newPin = await createPin(pinCode, userId, selectedVaultId);
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
      icon={<Shield size={24} color="#5e5e5e" />}
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
          placeholderTextColor="#64748b"
          secureTextEntry={!isVisible}
          maxLength={8}
          className="border border-border-dark rounded-2xl px-3 py-3 pr-12 text-text-default bg-surface-default "
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
        {!currentVault ? (
          <View className="border border-border-dark rounded-lg px-3 py-3 bg-surface-default">
            <Text className="text-muted-default">No vault selected</Text>
          </View>
        ) : (
          <View className="border border-border-dark rounded-2xl px-3 py-3 bg-surface-default">
            <Text className="text-text-default">
              {currentVault.vault_name || `Vault ${currentVault.vault_id}`} ({currentVault.role})
            </Text>
          </View>
        )}

      </View>

      {/* Information text based on role */}
      {limits?.role === 'member' && (
        <Text className="text-muted-default text-sm text-center mb-2">
          This PIN will be assigned to you automatically
        </Text>
      )}
      
      {!currentVault && (
        <Text className="text-warning-DEFAULT text-sm text-center mb-2">
          {limits?.role === 'guest' 
            ? 'Guest users cannot create keypad PINs'
            : 'You need appropriate access to create PINs in this vault'
          }
        </Text>
      )}
    </CustomModal>
  );
};