import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { X, QrCode, Clock, Users } from 'lucide-react-native';
// Conditional import for QR code generation
let QRCode: any;
try {
  QRCode = require('react-native-qrcode-svg').default;
} catch (error) {
  console.warn('react-native-qrcode-svg not available, QR code generation disabled');
  QRCode = null;
}
import { useAuthContext } from '../../../presentation/context/AuthContext';
import { useVaultInvitation } from '../../../presentation/hooks/useVaultInvitation';
import { UserService } from '../../../service/UserService';

interface InvitationModalProps {
  visible: boolean;
  onClose: () => void;
  vaultId: number;
  onInvitationCreated?: (inviteCode: string) => void;
}

export default function InvitationModal({
  visible,
  onClose,
  vaultId,
  onInvitationCreated
}: InvitationModalProps) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member' | 'guest'>('member');
  const [expiresInHours, setExpiresInHours] = useState('24');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState<'form' | 'qr'>('form');

  const { user } = useAuthContext();
  const { createInvitation, isLoading } = useVaultInvitation();

  const handleCreateInvitation = async () => {
    // Get token directly from UserService instead of user object
    const token = await UserService.getStoredToken();
    if (!token) {
      Alert.alert('Error', 'Authentication required. Please log in again.');
      return;
    }

    const hours = parseInt(expiresInHours);
    if (isNaN(hours) || hours < 1 || hours > 168) {
      Alert.alert('Error', 'Expiration must be between 1 and 168 hours');
      return;
    }

    setIsCreating(true);
    try {
      const invitation = await createInvitation(
        {
          vault_id: vaultId,
          role: selectedRole,
          expires_in_hours: hours,
        },
        token
      );

      if (invitation) {
        setInviteCode(invitation.invite_code);
        setStep('qr');
        onInvitationCreated?.(invitation.invite_code);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create invitation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setInviteCode(null);
    setSelectedRole('member');
    setExpiresInHours('24');
    onClose();
  };

  const renderFormStep = () => (
    <View className="p-6">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-white text-xl font-semibold">Invite User</Text>
        <TouchableOpacity onPress={handleClose} className="p-2">
          <X color="#9CA3AF" size={24} />
        </TouchableOpacity>
      </View>

      {/* Role Selection */}
      <Text className="text-neutral-300 mb-2">Select Role:</Text>
      <View className="mb-6">
        {[
          { key: 'member', label: 'Member', desc: 'Standard vault access' },
          { key: 'admin', label: 'Admin', desc: 'Full vault management' },
          { key: 'guest', label: 'Guest', desc: 'Limited access' },
        ].map((role) => (
          <TouchableOpacity
            key={role.key}
            onPress={() => setSelectedRole(role.key as any)}
            className={`p-3 rounded-lg mb-2 border ${
              selectedRole === role.key
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-neutral-700 bg-neutral-800'
            }`}
          >
            <Text className={`font-medium ${
              selectedRole === role.key ? 'text-blue-400' : 'text-white'
            }`}>
              {role.label}
            </Text>
            <Text className={`text-sm mt-1 ${
              selectedRole === role.key ? 'text-blue-300' : 'text-neutral-400'
            }`}>
              {role.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Expiration */}
      <Text className="text-neutral-300 mb-2">Expires in (hours):</Text>
      <TextInput
        value={expiresInHours}
        onChangeText={setExpiresInHours}
        placeholder="24"
        keyboardType="numeric"
        className="bg-neutral-800 text-white p-3 rounded-lg mb-6 border border-neutral-700"
        placeholderTextColor="#6B7280"
      />

      {/* Create Button */}
      <TouchableOpacity
        onPress={handleCreateInvitation}
        disabled={isCreating}
        className="bg-blue-600 p-4 rounded-lg items-center mb-4"
      >
        {isCreating ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold">Create Invitation</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderQRStep = () => (
    <View className="p-6">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-white text-xl font-semibold">Share Invitation</Text>
        <TouchableOpacity onPress={handleClose} className="p-2">
          <X color="#9CA3AF" size={24} />
        </TouchableOpacity>
      </View>

      {/* QR Code or Code Display */}
      <View className="items-center mb-6">
        {QRCode ? (
          <View className="bg-white p-4 rounded-lg mb-4">
            <QRCode
              value={`yourapp://invite/${inviteCode}`}
              size={200}
            />
          </View>
        ) : (
          <View className="w-48 h-48 bg-neutral-800 rounded-lg mb-4 items-center justify-center">
            <Text className="text-neutral-400 text-center">QR Code</Text>
            <Text className="text-neutral-500 text-xs mt-2">Install QR library</Text>
          </View>
        )}
        <Text className="text-neutral-300 text-sm text-center mb-2">
          {QRCode ? 'Scan this QR code or share the code below' : 'Share the invitation code below'}
        </Text>
        <Text className="text-blue-400 font-mono text-lg text-center bg-neutral-800 p-3 rounded-lg">
          {inviteCode}
        </Text>
      </View>

      {/* Share Options */}
      <View className="space-y-3">
        <TouchableOpacity className="flex-row items-center p-3 bg-neutral-800 rounded-lg">
          <QrCode color="#3B82F6" size={20} className="mr-3" />
          <Text className="text-white flex-1">Share QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center p-3 bg-neutral-800 rounded-lg">
          <Users color="#3B82F6" size={20} className="mr-3" />
          <Text className="text-white flex-1">Copy Invitation Code</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleClose}
        className="bg-blue-600 p-4 rounded-lg items-center mt-6"
      >
        <Text className="text-white font-semibold">Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black">
        {step === 'form' ? renderFormStep() : renderQRStep()}
      </View>
    </Modal>
  );
}