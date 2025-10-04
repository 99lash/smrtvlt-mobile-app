import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { X, Edit3, CheckCircle } from 'lucide-react-native';
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

  const renderMenu = () => (
    <View className="flex-1 justify-center items-center p-6">
      <Text className="text-white text-xl font-semibold mb-8">Join Vault</Text>

      <TouchableOpacity
        onPress={() => setMode('manual')}
        className="bg-blue-600 p-4 rounded-lg items-center mb-4 w-full"
      >
        <Edit3 color="white" size={24} />
        <Text className="text-white font-semibold mt-2">Enter Code Manually</Text>
        <Text className="text-blue-200 text-sm mt-1">Type the invitation code</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Alert.alert('Coming Soon', 'QR scanning will be available after installing expo-barcode-scanner')}
        className="bg-neutral-700 p-4 rounded-lg items-center w-full"
      >
        <View className="w-6 h-6 border-2 border-neutral-400 rounded mb-2" />
        <Text className="text-neutral-300 font-semibold">Scan QR Code</Text>
        <Text className="text-neutral-400 text-sm mt-1">Install expo-barcode-scanner</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleClose}
        className="mt-8 p-3"
      >
        <Text className="text-neutral-400">Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderManualEntry = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 justify-center p-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white text-xl font-semibold">Enter Invitation Code</Text>
          <TouchableOpacity onPress={() => setMode('menu')} className="p-2">
            <X color="#9CA3AF" size={24} />
          </TouchableOpacity>
        </View>

        <Text className="text-neutral-300 mb-4">
          Enter the invitation code you received from the vault admin:
        </Text>

        <TextInput
          value={manualCode}
          onChangeText={setManualCode}
          placeholder="Enter invitation code..."
          className="bg-neutral-800 text-white p-4 rounded-lg mb-6 border border-neutral-700 text-lg font-mono"
          placeholderTextColor="#6B7280"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          onPress={() => processInvitationCode(manualCode)}
          disabled={isProcessing || !manualCode.trim()}
          className={`p-4 rounded-lg items-center mb-4 ${
            isProcessing || !manualCode.trim()
              ? 'bg-neutral-700'
              : 'bg-blue-600'
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Accept Invitation</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode('menu')}
          className="p-3 items-center"
        >
          <Text className="text-neutral-400">Back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderSuccess = () => (
    <View className="flex-1 justify-center items-center p-6">
      <CheckCircle color="#10B981" size={64} />
      <Text className="text-white text-xl font-semibold mt-4 mb-2">
        Invitation Accepted!
      </Text>
      <Text className="text-neutral-400 text-center">
        You now have access to the vault
      </Text>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black">
        {mode === 'menu' && renderMenu()}
        {mode === 'manual' && renderManualEntry()}
        {mode === 'success' && renderSuccess()}
      </View>
    </Modal>
  );
}