import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { CheckCircle, Crown, Copy, Shield, Share } from 'lucide-react-native';
import CustomModal from './CustomModal';
import { Clipboard } from 'react-native';

interface OwnershipTransferCodeModalProps {
  visible: boolean;
  onClose: () => void;
  invitationCode: string;
  expiresAt?: string;
  transferType?: string;
  newOwnerName?: string;
  vaultName?: string;
}

export default function OwnershipTransferCodeModal({
  visible,
  onClose,
  invitationCode,
  expiresAt,
  transferType,
  newOwnerName = 'New Owner',
  vaultName = 'Selected Vault'
}: OwnershipTransferCodeModalProps) {
  console.log('🔍 OwnershipTransferCodeModal: Rendering with props:', {
    visible,
    invitationCode,
    expiresAt,
    transferType,
    newOwnerName,
    vaultName
  });

  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await Clipboard.setString(invitationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleShareCode = async () => {
    try {
      const message = `Ownership Transfer Invitation for ${vaultName}

Invitation Code: ${invitationCode}

Transfer Type: ${transferType?.replace('_', ' ').toUpperCase() || 'Ownership Transfer'}

Please use this code to accept ownership of the vault. This code will expire on: ${expiresAt ? new Date(expiresAt).toLocaleDateString() : '24 hours'}

- SmartVault App`;
      
      await Clipboard.setString(message);
      Alert.alert('Code Copied', 'Invitation code and details copied to clipboard. You can now paste and share it.');
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const getTransferTypeDisplay = () => {
    switch (transferType) {
      case 'full_transfer':
        return 'Full Ownership Transfer';
      case 'shared_access':
        return 'Shared Ownership Transfer';
      default:
        return 'Ownership Transfer';
    }
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Ownership Transfer Invitation"
      icon={<Crown size={24} color="#FFD700" />}
      primaryAction={{
        label: 'Close',
        onPress: onClose,
      }}
    >
      <View className="space-y-6">
        {/* Success Header */}
        <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <View className="flex-row items-center gap-2 mb-2">
            <CheckCircle size={20} color="#10B981" />
            <Text className="text-green-800 dark:text-green-200 font-semibold text-base">
              Transfer Initiated Successfully
            </Text>
          </View>
          <Text className="text-green-700 dark:text-green-300 text-sm">
            The ownership transfer to {newOwnerName} has been initiated. 
            Share this invitation code to complete the transfer.
          </Text>
        </View>

        {/* Vault Info */}
        <View className="bg-surface-light rounded-xl border border-border-dark p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Shield size={16} color="#5e5e5e" />
            <Text className="text-text-dark font-medium text-sm">
              {vaultName}
            </Text>
          </View>
          <Text className="text-muted-default text-sm">
            {getTransferTypeDisplay()}
          </Text>
        </View>

        {/* Invitation Code Section */}
        <View className="space-y-3">
          <Text className="text-text-dark font-semibold text-base">
            Invitation Code
          </Text>
          
          <View className="bg-surface-light p-4 rounded-xl border border-border-dark">
            <View className="flex-row items-center justify-between">
              <Text className="text-text-dark font-mono text-lg flex-1 mr-3">
                {invitationCode}
              </Text>
              <TouchableOpacity 
                onPress={handleCopyCode}
                className="p-2 rounded-lg bg-primary-light"
              >
                {copied ? (
                  <CheckCircle size={20} color="#10B981" />
                ) : (
                  <Copy size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            </View>
            
            {copied && (
              <Text className="text-green-600 dark:text-green-400 text-sm mt-2">
                Code copied to clipboard!
              </Text>
            )}
          </View>

          {expiresAt && (
            <Text className="text-muted-default text-sm">
              Expires: {new Date(expiresAt).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Share Actions */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleCopyCode}
            className="flex-1 bg-primary-light p-3 rounded-xl border border-primary-default flex-row items-center justify-center gap-2"
          >
            <Copy size={16} color="#3B82F6" />
            <Text className="text-primary-dark font-medium text-sm">
              Copy Code
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShareCode}
            className="flex-1 bg-surface-light p-3 rounded-xl border border-border-dark flex-row items-center justify-center gap-2"
          >
            <Share size={16} color="#5e5e5e" />
            <Text className="text-text-dark font-medium text-sm">
              Share Details
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <Text className="text-blue-800 dark:text-blue-200 font-medium text-sm mb-2">
            📋 Instructions
          </Text>
          <Text className="text-blue-700 dark:text-blue-300 text-sm">
            1. Copy the invitation code above
          </Text>
          <Text className="text-blue-700 dark:text-blue-300 text-sm">
            2. Share it with {newOwnerName}
          </Text>
          <Text className="text-blue-700 dark:text-blue-300 text-sm">
            3. They can then use the SmartVault app to accept the ownership transfer
          </Text>
        </View>

        {/* Warning */}
        <View className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <Text className="text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ This code is unique and will expire. Keep it secure and share it only with the intended recipient.
          </Text>
        </View>
      </View>
    </CustomModal>
  );
}