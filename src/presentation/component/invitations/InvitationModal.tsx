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
import { CheckCircle, UserPlus, Copy, Shield, User, ChevronDown } from 'lucide-react-native';
import CustomModal from '../modals/CustomModal';
import { useAuthContext } from '../../context/AuthContext';
import { useVaultInvitation } from '../../screens/settings/hooks/useVaultInvitation';
import { UserService } from '../../../service/UserService';
import { VaultMembership } from '../../../service/VaultService';
import { Clipboard } from 'react-native';
import { InfoMessage } from '../common/InfoMessage';

interface InvitationModalProps {
  visible: boolean;
  onClose: () => void;
  onInvitationAccepted?: (vaultId: number, role: string) => void;
  // Generation mode props
  mode?: 'accept' | 'generate';
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

  const { user } = useAuthContext();
  const { validateInvitation, acceptInvitation, createInvitation } = useVaultInvitation();

  // Get the selected vault details
  const selectedVault = vaults.find(vault => vault.vault_id === selectedVaultId);

  // Role options configuration
  const roleOptions = [
    { 
      value: 'member' as const, 
      label: 'Member', 
      description: 'Can access vault and manage their own settings' 
    },
    { 
      value: 'admin' as const, 
      label: 'Admin', 
      description: 'Full access to vault management and user controls' 
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
    onClose();
  };

  const getVaultDisplayName = () => {
    if (!selectedVault) return 'Selected Vault';
    return selectedVault.vault_name || `Vault ID: ${selectedVault.vault_id}`;
  };

  const getModalTitle = () => {
    return mode === 'generate' ? 'Generate Invitation' : 'Join Vault';
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
            <View className="flex-1">
              <Text className="text-text-dark font-medium text-base">
                {selectedOption?.label}
              </Text>
              <Text className="text-muted-default text-sm">
                {selectedOption?.description}
              </Text>
            </View>
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
                      <Text className="text-muted-default text-sm">
                        {option.description}
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

        {mode === 'accept' && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full"
          >
            <View className="w-full">
              <Text className="text-text-dark mb-4">
                Enter the invitation code you received.
              </Text>

              <TextInput
                value={invitationCode}
                onChangeText={setInvitationCode}
                placeholder="Enter invitation code..."
                className="bg-surface-light text-text-dark p-3 rounded-2xl mb-6 border border-border-dark text-base font-mono"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isProcessing}
              />
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </CustomModal>
  );
}
