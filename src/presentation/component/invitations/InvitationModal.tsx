import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Clipboard
} from 'react-native';
import { QrCode, Clock, Users, UserCheck } from 'lucide-react-native';
// Conditional import for QR code generation
let QRCode: any;
try {
  QRCode = require('react-native-qrcode-svg').default;
} catch (error) {
  console.warn('react-native-qrcode-svg not available, QR code generation disabled');
  QRCode = null;
}
import CustomModal from '../modals/CustomModal';
import { useAuthContext } from '../../../presentation/context/AuthContext';
import { useVaultInvitation } from '../../hooks/vault/useVaultInvitation';
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
  const [copied, setCopied] = useState(false);

  const { user } = useAuthContext();
  const { createInvitation, isLoading } = useVaultInvitation();

  const handleCreateInvitation = async () => {
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
    setCopied(false);
    onClose();
  };

  const handleCopyInvitationCode = async () => {
    if (inviteCode) {
      try {
        await Clipboard.setString(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      } catch (error) {
        Alert.alert('Error', 'Failed to copy invitation code');
      }
    }
  };

  const handleNext = () => {
    if (step === 'form') {
      handleCreateInvitation();
    } else {
      handleClose();
    }
  };

  const getModalTitle = () => {
    return step === 'form' ? 'Invite User' : 'Share Invitation';
  };

  const getPrimaryButtonLabel = () => {
    if (step === 'form') {
      return isCreating ? 'Creating...' : 'Create Invitation';
    }
    return 'Done';
  };

  const isPrimaryButtonDisabled = () => {
    if (step === 'form') {
      return isCreating;
    }
    return false;
  };

  const renderContent = () => (
    <View className="w-full">
      {step === 'form' ? (
        // Form Step Content
        <>
          {/* Role Selection */}
          <Text className="text-gray-700 mb-2 font-medium">Select Role:</Text>
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
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <Text className={`font-medium ${
                  selectedRole === role.key ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  {role.label}
                </Text>
                <Text className={`text-sm mt-1 ${
                  selectedRole === role.key ? 'text-blue-500' : 'text-gray-500'
                }`}>
                  {role.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Expiration */}
          <Text className="text-gray-700 mb-2 font-medium">Expires in (hours):</Text>
          <TextInput
            value={expiresInHours}
            onChangeText={setExpiresInHours}
            placeholder="24"
            keyboardType="numeric"
            className="bg-gray-50 text-gray-800 p-3 rounded-lg mb-6 border border-gray-300"
            placeholderTextColor="#9CA3AF"
          />
        </>
      ) : (
        // QR Step Content
        <>
          {/* QR Code Display */}
          <View className="items-center mb-6">
            {QRCode ? (
              <View className="bg-white p-4 rounded-lg mb-4">
                <QRCode
                  value={`yourapp://invite/${inviteCode}`}
                  size={200}
                />
              </View>
            ) : (
              <View className="w-48 h-48 bg-gray-100 rounded-lg mb-4 items-center justify-center">
                <Text className="text-gray-500 text-center">QR Code</Text>
                <Text className="text-gray-400 text-xs mt-2">Install QR library</Text>
              </View>
            )}
            <Text className="text-gray-600 text-sm text-center mb-2">
              {QRCode ? 'Scan this QR code or share the code below' : 'Share the invitation code below'}
            </Text>
            <Text className="text-blue-600 font-mono text-lg text-center bg-gray-50 p-3 rounded-lg w-full">
              {inviteCode}
            </Text>
          </View>

          {/* Share Options */}
          <View className="space-y-3">
            <TouchableOpacity className="flex-row items-center p-3 bg-gray-50 rounded-lg border border-gray-300">
              <QrCode color="#3B82F6" size={20} className="mr-3" />
              <Text className="text-gray-800 flex-1">Share QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCopyInvitationCode}
              className={`flex-row items-center p-3 rounded-lg border ${
                copied
                  ? 'bg-green-50 border-green-500'
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <Users color={copied ? "#10B981" : "#3B82F6"} size={20} className="mr-3" />
              <Text className={`flex-1 ${copied ? 'text-green-700' : 'text-gray-800'}`}>
                {copied ? 'Copied!' : 'Copy Invitation Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      title={getModalTitle()}
      icon={<UserCheck size={24} color="#3B82F6" />}
      primaryAction={{
        label: getPrimaryButtonLabel(),
        onPress: handleNext,
        disabled: isPrimaryButtonDisabled(),
        loading: isCreating,
      }}
    >
      {renderContent()}
    </CustomModal>
  );
}
