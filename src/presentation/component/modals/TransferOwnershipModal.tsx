import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { Crown, Users, Shield, Copy, CheckCircle, Share } from 'lucide-react-native';
import CustomModal from './CustomModal';
import BorderedList from '../lists/BorderedList';
import { VaultMembership } from '../../../service/VaultService';
import { User } from '../../../types/UserTypes';

type TransferType = 'full_transfer' | 'shared_access';

interface TransferOwnershipModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    role: string;
    status: string;
    lastAccess: string;
    enabled: boolean;
  };
  adminVaults: VaultMembership[];
  onInitiateTransfer: (vaultId: number, newOwnerId: number, transferType: TransferType) => Promise<{
    invitation_code?: string;
    expires_at?: string;
    transfer_type?: string;
  }>;
  onRefreshData?: () => Promise<void>;
  loading?: boolean;
}

const TransferOwnershipModal: React.FC<TransferOwnershipModalProps> = ({
  visible,
  onClose,
  user,
  adminVaults,
  onInitiateTransfer,
  onRefreshData,
  loading = false,
}) => {
  const [selectedVault, setSelectedVault] = useState<VaultMembership | null>(null);
  const [selectedTransferType, setSelectedTransferType] = useState<TransferType | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [invitationCode, setInvitationCode] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [transferType, setTransferType] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const transferTypeOptions = [
    {
      id: 'full_transfer' as TransferType,
      title: 'Full Transfer',
      description: 'Transfer complete ownership. You will lose all access to this vault.',
      icon: <Crown size={20} color="#FFD700" />,
    },
    {
      id: 'shared_access' as TransferType,
      title: 'Shared Access',
      description: 'Transfer ownership but keep access as a member.',
      icon: <Users size={20} color="#3B82F6" />,
    },
  ];

  const handleInitiateTransfer = async () => {
    if (!selectedVault || !selectedTransferType) {
      Alert.alert('Selection Required', 'Please select a vault and transfer type.');
      return;
    }

    try {
      console.log('🔄 TransferOwnershipModal: Initiating transfer...', {
        vaultId: selectedVault.vault_id,
        newOwnerId: user.id,
        transferType: selectedTransferType
      });
      
      const response = await onInitiateTransfer(selectedVault.vault_id, user.id, selectedTransferType);
      console.log('✅ TransferOwnershipModal: Transfer response received:', response);
      
      if (response.invitation_code) {
        // Store the response data and show success view immediately
        const invitationCode = response.invitation_code;
        const expiresAt = response.expires_at || '';
        const transferTypeResult = response.transfer_type || '';
        
        console.log('🔍 TransferOwnershipModal: Setting success state with code:', invitationCode);
        
        setInvitationCode(invitationCode);
        setExpiresAt(expiresAt);
        setTransferType(transferTypeResult);
        setShowSuccess(true);
        setRefreshKey(prev => prev + 1); // Force re-render
        
        console.log('🔍 TransferOwnershipModal: State updated successfully');
      } else {
        console.warn('⚠️ TransferOwnershipModal: No invitation code in response:', response);
      }
    } catch (error) {
      console.error('❌ TransferOwnershipModal: Transfer failed:', error);
      Alert.alert(
        'Transfer Failed',
        error instanceof Error ? error.message : 'Failed to initiate ownership transfer.'
      );
    }
  };

  // Ensure success state persists even if component re-renders
  useEffect(() => {
    console.log('🔍 TransferOwnershipModal: useEffect triggered', { showSuccess, invitationCode, refreshKey });
  }, [showSuccess, invitationCode, refreshKey]);

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
      const message = `Ownership Transfer Invitation for ${selectedVault?.vault_name || 'Vault'}

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

  const resetFormState = () => {
    setSelectedVault(null);
    setSelectedTransferType(null);
    setInvitationCode('');
    setExpiresAt('');
    setTransferType('');
    setCopied(false);
  };

  const resetState = () => {
    resetFormState();
    setShowSuccess(false);
  };

  const handleClose = async () => {
    console.log('🔍 TransferOwnershipModal: Closing modal, showSuccess:', showSuccess);
    
    // Only refresh data if we're NOT in success state to avoid interfering with the success display
    if (!showSuccess && onRefreshData) {
      console.log('🔄 TransferOwnershipModal: Refreshing data before closing');
      await onRefreshData();
    }
    
    resetState();
    onClose();
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

  const renderVaultItem = (item: VaultMembership, index: number, isSelected: boolean) => (
    <View className="flex-1">
      <Text className={`font-semibold text-base ${isSelected ? 'text-text-default' : 'text-text-dark'}`}>
        {item.vault_name || `Vault ${item.vault_id}`}
      </Text>
      <Text className={`text-sm ${isSelected ? 'text-text-default/80' : 'text-neutral-400'}`}>
        Device: {item.vault_device_id}
      </Text>
    </View>
  );

  const renderTransferTypeItem = (option: typeof transferTypeOptions[0], index: number, isSelected: boolean) => (
    <View className="flex-1">
      <View className="flex-row items-center gap-2 mb-1">
        {option.icon}
        <Text className={`font-semibold text-base ${isSelected ? 'text-text-default' : 'text-text-dark'}`}>
          {option.title}
        </Text>
      </View>
      <Text className={`text-sm ${isSelected ? 'text-text-default/80' : 'text-neutral-400'}`}>
        {option.description}
      </Text>
    </View>
  );

  // Success View Content
  const renderSuccessView = () => (
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
          The ownership transfer to {user.firstName || user.username || 'the new owner'} has been initiated. 
          Share this invitation code to complete the transfer.
        </Text>
      </View>

      {/* Vault Info */}
      <View className="bg-surface-light rounded-xl border border-border-dark p-4">
        <View className="flex-row items-center gap-2 mb-2">
          <Shield size={16} color="#5e5e5e" />
          <Text className="text-text-dark font-medium text-sm">
            {selectedVault?.vault_name || `Vault ${selectedVault?.vault_id}`}
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
          2. Share it with {user.firstName || user.username || 'the new owner'}
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
  );

  // Form View Content
  const renderFormView = () => (
    <View className="space-y-6">
      {/* User Info */}
      <View className="bg-surface-default p-4 rounded-xl">
        <Text className="text-sm text-neutral-400 mb-2">Transfer ownership to:</Text>
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary-default items-center justify-center">
            <Text className="text-text-default font-semibold text-sm">
              {(user.firstName || user.username || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text className="font-semibold text-text-dark">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username || `User ${user.id}`}
            </Text>
            <Text className="text-sm text-neutral-400">{user.email}</Text>
          </View>
        </View>
      </View>

      {/* Vault Selection */}
      <View>
        <Text className="text-base font-semibold text-text-dark mb-3">
          Select Vault to Transfer
        </Text>
        <BorderedList
          data={adminVaults}
          keyExtractor={(vault) => vault.vault_id.toString()}
          renderItem={renderVaultItem}
          onItemPress={(vault) => setSelectedVault(vault)}
          selectedId={selectedVault?.vault_id.toString()}
          getId={(vault) => vault.vault_id.toString()}
          maxVisibleItems={3}
          itemHeight={70}
          className="mb-4"
        />
      </View>

      {/* Transfer Type Selection */}
      <View>
        <Text className="text-base font-semibold text-text-dark mb-3">
          Transfer Type
        </Text>
        <BorderedList
          data={transferTypeOptions}
          keyExtractor={(option) => option.id}
          renderItem={renderTransferTypeItem}
          onItemPress={(option) => setSelectedTransferType(option.id)}
          selectedId={selectedTransferType || ''}
          getId={(option) => option.id}
          maxVisibleItems={2}
          itemHeight={80}
        />
      </View>

      {/* Warning */}
      <View className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <Text className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
          ⚠️ Important Notice
        </Text>
        <Text className="text-sm text-yellow-700 dark:text-yellow-300">
          This action cannot be undone. The selected user will need to accept the transfer before it takes effect.
        </Text>
      </View>
    </View>
  );

  console.log('🔍 TransferOwnershipModal: RENDER', {
    showSuccess,
    hasInvitationCode: !!invitationCode,
    selectedVault: selectedVault?.vault_id,
    transferType: selectedTransferType
  });

  return (
    <CustomModal
      key={refreshKey} // Force re-render when needed
      visible={visible}
      onClose={handleClose}
      title={showSuccess ? "Ownership Transfer Invitation" : "Transfer Ownership"}
      icon={showSuccess ? <Crown size={24} color="#FFD700" /> : <Shield size={24} color="#FFD700" />}
      primaryAction={showSuccess ? {
        label: 'Close',
        onPress: handleClose,
      } : {
        label: 'Initiate Transfer',
        onPress: handleInitiateTransfer,
        disabled: !selectedVault || !selectedTransferType || loading,
        loading,
      }}
      secondaryAction={showSuccess ? undefined : {
        label: 'Cancel',
        onPress: handleClose,
      }}
    >
      {showSuccess ? renderSuccessView() : renderFormView()}
    </CustomModal>
  );
};

export default TransferOwnershipModal;