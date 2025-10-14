import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Shield, Eye, EyeOff } from 'lucide-react-native';
import { KeypadPin } from '../../../types/KeypadPinTypes';
import { useKeypadPins } from '../../hooks/vault/useKeypadPins';
import { useAuthContext } from '../../context/AuthContext';
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
  const { createPin, loading } = useKeypadPins();
  const { user } = useAuthContext();
  
  const handleCreate = async () => {
    if (!pinCode || !user) return;

    try {
      // Pass the current user's ID when creating PIN
      const newPin = await createPin(pinCode, user.id);
      onPinCreated(newPin);
      onClose();
      setPinCode('');
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
        disabled: loading || !pinCode,
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
          className="border border-gray-300 rounded-lg px-3 py-3 pr-12 text-text-default dark:text-text-dark"
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
    </CustomModal>
  );
  };
  