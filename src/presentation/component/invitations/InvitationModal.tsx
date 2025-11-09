import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { CheckCircle, Copy, Shield, User, ChevronDown } from 'lucide-react-native';
import CustomModal from '../modals/CustomModal';
import { useAuthContext } from '../../context/AuthContext';
import { useVaultInvitation } from '../../screens/settings/hooks/useVaultInvitation';
import { UserService } from '../../../service/UserService';
import { VaultMembership, VaultService } from '../../../service/VaultService';
import { Clipboard } from 'react-native';
import { InfoMessage } from '../common/InfoMessage';

interface InvitationModalProps {
  visible: boolean;
  onClose: () => void;
  onInvitationAccepted?: (vaultId: number, role: string) => void;
  // Generation mode props
  mode?: 'accept' | 'generate' | 'accept_transfer';
  selectedVaultId?: number | null;
  vaults?: VaultMembership[];
  onInvitationGenerated?: () => void;
}

export default function InvitationModal({
  visible,
  onClose,
  onInvitationAccepted,
  mode = 'accept',
  selectedVaultId,
  vaults = [],
  onInvitationGenerated
}: InvitationModalProps) {
  const [invitationCode, setInvitationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'member' | 'admin'>('member');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  
  // Vault property fields for ownership transfer
  const [vaultDeviceId, setVaultDeviceId] = useState('');
  const [vaultName, setVaultName] = useState('');
  const [vaultLocation, setVaultLocation] = useState('');
  const [vaultValidationData, setVaultValidationData] = useState<any>(null);

  const { user } = useAuthContext();
  const { validateInvitation, acceptInvitation, createInvitation } = useVaultInvitation();

  // Get the selected vault details
  const selectedVault = vaults.find(vault => vault.vault_id === selectedVaultId);

  // Role options configuration
  const roleOptions = [
    { 
      value: 'member' as const, 
      label: 'Member'
    },
    { 
      value: 'admin' as const, 
      label: 'Admin'
    }
  ];

  const handleGenerateInvitation = async () => {
    if (!selectedVaultId) {
      Alert.alert('Error', 'No vault selected');
      return;
    }

    setIsProcessing(true);

    try {
      const token = await UserService.getStoredToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Create invitation with selected role
      const invitationData = {
        vault_id: selectedVaultId,
        role: selectedRole,
        expires_in_hours: 24 // 24 hours expiry
      };

      const result = await createInvitation(invitationData, token);

      if (result?.invite_code) {
        setGeneratedCode(result.invite_code);
        onInvitationGenerated?.();
      } else {
        throw new Error('Failed to generate invitation code');
      }

    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to generate invitation code'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await Clipboard.setString(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  // Function to pre-fill vault properties from transfer validation
  const prefillVaultProperties = async () => {
    if (!invitationCode.trim()) {
      return; // Don't validate if no code entered yet
    }

    try {
      // Validate the transfer code to get vault info
      const validation = await VaultService.validateOwnershipTransfer(invitationCode.trim());

      if (!validation.valid) {
        return; // Don't show error, just don't pre-fill
      }

      if (!validation.vault_id) {
        return; // Invalid validation, don't pre-fill
      }

      // Store validation data for pre-filling vault properties
      setVaultValidationData(validation);

      // Pre-fill vault properties with current vault data (handle new fields with type assertion)
      const validationData = validation as any;
      setVaultDeviceId(validationData.vault_device_id || '');
      setVaultName(validationData.vault_name || '');
      setVaultLocation(validationData.vault_location || '');
    } catch (error) {
      // Silent fail - just don't pre-fill on error
      console.log('Pre-filling failed:', error);
    }
  };

  // Auto-pre-fill when invitation code changes (debounced)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode === 'accept_transfer' && invitationCode.trim().length > 10) {
        prefillVaultProperties();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [invitationCode, mode]);

  const processOwnershipTransferCode = async () => {
    if (!invitationCode.trim()) {
      Alert.alert('Error', 'Please enter a transfer code');
      return;
    }

    setIsProcessing(true);

    try {
      // Ensure we have validation data (try to get it again if not present)
      if (!vaultValidationData) {
        await prefillVaultProperties();
      }

      // Get token
      const token = await UserService.getStoredToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Validate vault properties if provided
      const vaultUpdates: any = {};
      
      // Validate device_id
      if (vaultDeviceId.trim()) {
        const deviceId = vaultDeviceId.trim();
        if (deviceId.length < 1) {
          Alert.alert('Validation Error', 'Device ID cannot be empty');
          return;
        }
        if (!/^[A-Za-z0-9_-]+$/.test(deviceId)) {
          Alert.alert('Validation Error', 'Device ID can only contain letters, numbers, underscores, and hyphens');
          return;
        }
        vaultUpdates.device_id = deviceId;
      }
      
      // Validate name
      if (vaultName.trim()) {
        const nameValue = vaultName.trim();
        if (nameValue.length < 1 || nameValue.length > 100) {
          Alert.alert('Validation Error', 'Vault name must be between 1 and 100 characters');
          return;
        }
        vaultUpdates.name = nameValue;
      }
      
      // Validate location
      if (vaultLocation.trim()) {
        const location = vaultLocation.trim();
        if (location.length > 200) {
          Alert.alert('Validation Error', 'Location cannot exceed 200 characters');
          return;
        }
        vaultUpdates.location = location;
      }
      
      // Accept ownership transfer with vault properties
      const transferData = {
        invite_code: invitationCode.trim(),
        ...vaultUpdates
      };

      // Get vault_id from validation data
      const vaultId = vaultValidationData?.vault_id;
      if (!vaultId) {
        throw new Error('Invalid transfer code - no vault ID');
      }

      const result = await VaultService.acceptOwnershipTransferWithProperties(
        vaultId,
        transferData,
        token
      );

      // Show success message
      const transferTypeDisplay = vaultValidationData?.transfer_type === 'full_transfer'
        ? 'full ownership'
        : 'shared ownership';

      let successMessage = `You are now the owner of this vault with ${transferTypeDisplay}!`;
      if (result.data.vault_properties_updated && result.data.vault_properties_updated.length > 0) {
        successMessage += `\n\nVault properties updated: ${result.data.vault_properties_updated.join(', ')}`;
      }

      Alert.alert(
        'Transfer Accepted!',
        successMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              onInvitationAccepted?.(result.data.vault_id, 'admin');
              handleClose();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Ownership transfer error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to accept ownership transfer'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const processInvitationCode = async () => {
    if (!invitationCode.trim()) {
      Alert.alert('Error', 'Please enter an invitation code');
      return;
    }

    setIsProcessing(true);

    try {
      // Validate invitation
      const validation = await validateInvitation(invitationCode.trim());

      if (!validation.valid) {
        throw new Error(validation.reason || 'Invalid invitation');
      }

      // Get token directly from UserService instead of user object
      const token = await UserService.getStoredToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Accept invitation
      const result = await acceptInvitation(invitationCode.trim(), token);

      // Show success message
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

    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to process invitation'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setInvitationCode('');
    setGeneratedCode('');
    setCopied(false);
    setIsProcessing(false);
    setSelectedRole('member');
    setIsRoleDropdownOpen(false);
    setVaultDeviceId('');
    setVaultName('');
    setVaultLocation('');
    onClose();
  };

  const getVaultDisplayName = () => {
    if (!selectedVault) return 'Selected Vault';
    return selectedVault.vault_name || `Vault ID: ${selectedVault.vault_id}`;
  };

  const getModalTitle = () => {
    if (mode === 'generate') return 'Generate Invitation';
    if (mode === 'accept_transfer') return 'Accept Ownership Transfer';
    return 'Join Vault';
  };



  const getPrimaryAction = () => {
    if (mode === 'generate') {
      return {
        label: generatedCode
          ? 'Generate New Code'
          : isProcessing
            ? 'Generating...'
            : 'Generate Invitation',
        onPress: handleGenerateInvitation,
        disabled: isProcessing,
        loading: isProcessing
      };
    } else if (mode === 'accept_transfer') {
      return {
        label: isProcessing ? 'Processing...' : 'Accept Transfer',
        onPress: processOwnershipTransferCode,
        disabled: isProcessing || !invitationCode.trim(),
        loading: isProcessing,
      };
    } else {
      return {
        label: isProcessing ? 'Processing...' : 'Accept Invitation',
        onPress: processInvitationCode,
        disabled: isProcessing || !invitationCode.trim(),
        loading: isProcessing,
      };
    }
  };

  const RoleDropdown = () => {
    const selectedOption = roleOptions.find(option => option.value === selectedRole);

    return (
      <View className="space-y-2">
        <Text className="text-text-dark font-medium text-base">Invitation Role</Text>
        
        <TouchableOpacity
          className="bg-surface-light rounded-xl border border-border-dark p-4"
          onPress={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
        >
          <View className="flex-row items-center justify-between">
              <Text className="text-text-dark font-medium text-base">
                {selectedOption?.label}
              </Text>
            <ChevronDown 
              size={20} 
              color="#5e5e5e" 
              style={{ transform: [{ rotate: isRoleDropdownOpen ? '180deg' : '0deg' }] }}
            />
          </View>
        </TouchableOpacity>

        {isRoleDropdownOpen && (
          <View className="bg-surface-light rounded-xl border border-border-dark overflow-hidden">
            {roleOptions.map((option) => {
              const isSelected = option.value === selectedRole;
              
              return (
                <TouchableOpacity
                  key={option.value}
                  className={`p-4 border-b border-border-dark ${
                    isSelected ? 'bg-primary-light' : ''
                  }`}
                  onPress={() => {
                    setSelectedRole(option.value);
                    setIsRoleDropdownOpen(false);
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className={`font-medium text-base ${
                        isSelected ? 'text-primary-dark' : 'text-text-dark'
                      }`}>
                        {option.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <CheckCircle size={20} color="#3B82F6" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      title={getModalTitle()}
      primaryAction={getPrimaryAction()}
    >
      <View className="space-y-4">
        {mode === 'generate' && (
          <View className="space-y-4">
            {/* Selected Vault Info */}
            <View className="flex-col bg-surface-light rounded-2xl border border-border-dark p-2 mb-4">
              <View className="flex-row items-center gap-2 ml-2">
                <Shield size={20} color="#5e5e5e" className="mr-2" />
                <Text className="text-text-dark font-medium text-base">
                  {getVaultDisplayName()}
                </Text>
              </View>
              <View className="flex-row items-center gap-2 ml-2">
                <User size={20} color="#5e5e5e" className="mr-2" />
                <Text className="text-text-dark text-base">
                  Role: {selectedVault?.role || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Role Selection Dropdown */}
            <RoleDropdown />

            {/* Generated Code Section */}
            {generatedCode && (
              <View className="space-y-3 gap-2">           
                <View className="bg-surface-light p-4 rounded-xl border border-border-dark">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-primary-dark font-mono text-lg flex-1 mr-3">
                      {generatedCode}
                    </Text>
                    <View 
                      className="p-2 rounded-lg bg-primary-light"
                      onTouchEnd={handleCopyCode}
                    >
                      {copied ? (
                        <CheckCircle size={20} color="#10B981" />
                      ) : (
                        <Copy size={20} color="#3B82F6" />
                      )}
                    </View>
                  </View>
                  
                  {/* {copied && (
                    <Text className="text-text-dark text-sm mt-2">
                      Code copied to clipboard!
                    </Text>
                  )} */}
                </View>
                <InfoMessage message={`Share this code with the person you want to invite. They will receive ${selectedRole} access to this vault.`} />
              </View>
            )}

            {/* Instructions */}
            {!generatedCode && (
              <View className="bg-surface-light p-4 rounded-xl">
                <Text className="text-muted-default text-sm text-center">
                  This will generate a unique invitation code that expires in 24 hours. 
                  The invited user will receive {selectedRole} access to this vault.
                </Text>
              </View>
            )}
          </View>
        )}

        {(mode === 'accept' || mode === 'accept_transfer') && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full"
          >
            <View className="w-full">
              {mode === 'accept_transfer' && (
                <View className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 mb-4">
                  <Text className="text-yellow-800 dark:text-yellow-200 font-medium text-sm mb-1">
                    👑 Ownership Transfer
                  </Text>
                  <Text className="text-yellow-700 dark:text-yellow-300 text-sm">
                    You're about to accept ownership of a vault. This will make you the new owner with full administrative control.
                  </Text>
                </View>
              )}

              <Text className="text-text-dark mb-4">
                {mode === 'accept_transfer'
                  ? 'Enter the ownership transfer code you received.'
                  : 'Enter the invitation code you received.'}
              </Text>

              <TextInput
                value={invitationCode}
                onChangeText={setInvitationCode}
                placeholder={mode === 'accept_transfer' ? 'Enter transfer code...' : 'Enter invitation code...'}
                className="bg-surface-light text-text-dark p-3 rounded-2xl mb-6 border border-border-dark text-base font-mono"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isProcessing}
              />

              {mode === 'accept_transfer' && (
                <View className="space-y-4">
                 
                  <View className="space-y-3">
                    
                    {/* Vault Name Input */}
                    <View>
                      <Text className="text-text-dark font-medium text-sm mb-1">Vault Name</Text>
                      <TextInput
                        value={vaultName}
                        onChangeText={setVaultName}
                        placeholder="Enter vault name..."
                        className="bg-surface-light text-text-dark p-3 rounded-xl border border-border-dark text-base"
                        placeholderTextColor="#64748b"
                        autoCapitalize="words"
                      />
                    </View>

                    {/* Location Input */}
                    <View>
                      <Text className="text-text-dark font-medium text-sm mb-1">Location (Optional)</Text>
                      <TextInput
                        value={vaultLocation}
                        onChangeText={setVaultLocation}
                        placeholder="Enter vault location..."
                        className="bg-surface-light text-text-dark p-3 rounded-xl border border-border-dark text-base"
                        placeholderTextColor="#64748b"
                        autoCapitalize="words"
                      />
                    </View>

                  </View>

                  
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </CustomModal>
  );
}
