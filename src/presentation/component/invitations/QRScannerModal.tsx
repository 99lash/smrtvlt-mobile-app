import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Edit3, CheckCircle, QrCode } from 'lucide-react-native';
import CustomModal from '../modals/CustomModal'; 
import { useAuthContext } from '../../context/AuthContext';
import { useVaultInvitation } from '../../hooks/vault/useVaultInvitation';
import { UserService } from '../../../service/UserService';

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onInvitationAccepted?: (vaultId: number, role: string) => void;
}

export default function QRScannerModal({
  visible,
  onClose,
  onInvitationAccepted
}: QRScannerModalProps) {
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'menu' | 'manual' | 'success'>('menu');

  const { user } = useAuthContext();
  const { validateInvitation, acceptInvitation } = useVaultInvitation();

  const processInvitationCode = async (code: string) => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter an invitation code');
      return;
    }

    setIsProcessing(true);

    try {
      // Validate invitation
      const validation = await validateInvitation(code.trim());

      if (!validation.valid) {
        throw new Error(validation.reason || 'Invalid invitation');
      }

      // Get token directly from UserService instead of user object
      const token = await UserService.getStoredToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Accept invitation
      const result = await acceptInvitation(code.trim(), token);

      setMode('success');
      setTimeout(() => {
        Alert.alert(
          'Success!',
          `Successfully joined vault with ${result.role} access!`,
          [
            {
              text: 'OK',
              onPress: () => {
                onInvitationAccepted?.(result.vault_id!, result.role!);
                handleClose();
              }
            }
          ]
        );
      }, 1000);

    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to process invitation',
        [
          { text: 'OK', onPress: () => setMode('menu') }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setMode('menu');
    setManualCode('');
    setIsProcessing(false);
    onClose();
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'menu':
        return 'Join Vault';
      case 'manual':
        return 'Enter Invitation Code';
      case 'success':
        return 'Success!';
      default:
        return 'Join Vault';
    }
  };

  const getPrimaryAction = () => {
    switch (mode) {
      case 'menu':
        return undefined; // No primary action for menu
      case 'manual':
        return {
          label: isProcessing ? 'Processing...' : 'Accept Invitation',
          onPress: () => processInvitationCode(manualCode),
          disabled: isProcessing || !manualCode.trim(),
          loading: isProcessing,
        };
      case 'success':
        return {
          label: 'Continue',
          onPress: handleClose,
        };
      default:
        return undefined;
    }
  };

  const getSecondaryAction = () => {
    switch (mode) {
      case 'menu':
        return {
          label: 'Cancel',
          onPress: handleClose,
        };
      case 'manual':
        return {
          label: 'Back',
          onPress: () => setMode('menu'),
        };
      case 'success':
        return undefined; // No secondary action for success
      default:
        return {
          label: 'Cancel',
          onPress: handleClose,
        };
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'menu':
        return (
          <View className="w-full">
            <TouchableOpacity
              onPress={() => setMode('manual')}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
            >
              <View className="flex-row items-center">
                <Edit3 color="#3B82F6" size={24} />
                <View className="ml-3 flex-1">
                  <Text className="text-blue-800 font-semibold">Enter Code Manually</Text>
                  <Text className="text-blue-600 text-sm mt-1">Type the invitation code</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Coming Soon', 'QR scanning will be available after installing expo-barcode-scanner')}
              className="bg-gray-50 border border-gray-300 rounded-lg p-4"
            >
              <View className="flex-row items-center">
                <View className="w-6 h-6 border-2 border-gray-400 rounded mr-3" />
                <View className="flex-1">
                  <Text className="text-gray-600 font-semibold">Scan QR Code</Text>
                  <Text className="text-gray-500 text-sm mt-1">Install expo-barcode-scanner</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        );

      case 'manual':
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full"
          >
            <View className="w-full">
              <Text className="text-gray-700 mb-4">
                Enter the invitation code you received from the vault admin:
              </Text>

              <TextInput
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="Enter invitation code..."
                className="bg-gray-50 text-gray-800 p-4 rounded-lg mb-6 border border-gray-300 text-lg font-mono"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </KeyboardAvoidingView>
        );

      case 'success':
        return (
          <View className="w-full items-center py-4">
            <CheckCircle color="#10B981" size={64} />
            <Text className="text-gray-800 text-xl font-semibold mt-4 mb-2">
              Invitation Accepted!
            </Text>
            <Text className="text-gray-600 text-center">
              You now have access to the vault
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      title={getModalTitle()}
      icon={<QrCode size={24} color="#3B82F6" />}
      primaryAction={getPrimaryAction()}
      secondaryAction={getSecondaryAction()}
    >
      {renderContent()}
    </CustomModal>
  );
}
