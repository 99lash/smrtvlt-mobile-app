import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { Keyboard, Plus, Settings as SettingsIcon } from 'lucide-react-native';
import ButtonSecondary from '../../component/buttons/ButtonSecondary';
import { CreatePinModal } from '../../component/vault_access/CreatePinModal';
import { WarningMessage } from '../../component/common/WarningMessage';
import { KeypadPin } from '../../../types/KeypadPinTypes';
import { useKeypadPins } from './hooks/useKeypadPins';
import { VaultMembership } from '../../../service/VaultService';
import CustomModal from '../../component/modals/CustomModal';
import { KeypadPinService } from '../../../service/KeypadPinService';
import { StorageService } from '../../../service/StorageService';
import { useAccessLimits } from './hooks/useAccessLimits';
import { RoleBadge } from '../../component/common/RoleBadge';
import { UsageMeter } from '../../component/common/UsageMeter';
import { PinList } from './PinList';

interface PinManagerProps {
  currentVault: VaultMembership | null;
  vaultsLoading: boolean;
}

export const PinManager: React.FC<PinManagerProps> = ({
  currentVault,
  vaultsLoading,
}) => {
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [managePinsModalVisible, setManagePinsModalVisible] = useState(false);
  const [deletingPinId, setDeletingPinId] = useState<number | null>(null);
  
  // Current user state
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Get current user ID on component mount
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const userId = await StorageService.getCurrentUserId();
      setCurrentUserId(userId);
    };
    fetchCurrentUserId();
  }, []);

  // Use the keypad pins hook
  const { pins, loading, error, refreshPins, getPinsByVault } = useKeypadPins();

  // Extract vault ID from current vault
  const currentVaultId = currentVault?.vault_id || null;

  // Access limits hook
  const { 
    limits, 
    loading: limitsLoading, 
    error: limitsError,
    canCreatePin, 
    pinUsage, 
    isAdmin, 
    isMember, 
    isGuest,
    fetchLimits
  } = useAccessLimits(currentVaultId);

  // Load pins when manage modal opens
  useEffect(() => {
    if (managePinsModalVisible && currentVaultId) {
      console.log('🔍 PinManager - Loading pins for vault:', currentVaultId);
      getPinsByVault(currentVaultId).then((result) => {
        console.log('🔍 PinManager - getPinsByVault result:', result);
      }).catch((error) => {
        console.error('🔍 PinManager - getPinsByVault error:', error);
      });
    }
  }, [managePinsModalVisible, currentVaultId, getPinsByVault]);

  const handlePinCreated = (pin: KeypadPin) => {
    Alert.alert('Success', `PIN "${pin.pin_code}" created successfully!`);
    // Refresh the pins list after creating a new pin
    if (currentVaultId) {
      getPinsByVault(currentVaultId);
    }
    // Refresh access limits to update usage meter
    fetchLimits();
  };

  const handleManagePins = () => {
    setManagePinsModalVisible(true);
  };

  const handleDeletePin = (pin: KeypadPin) => {
    Alert.alert(
      'Permanently Delete PIN',
      `⚠️ WARNING: This will permanently delete PIN "${pin.pin_code}" from the database.\n\nThis action cannot be undone!`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => confirmDeletePin(pin.id),
        },
      ]
    );
  };

  const confirmDeletePin = async (pinId: number) => {
    try {
      setDeletingPinId(pinId);
      const token = await StorageService.getAccessToken();
      await KeypadPinService.hardDeletePin(pinId, token || undefined);

      Alert.alert('Success', 'PIN permanently deleted!');
      // Refresh the list after deletion
      if (currentVaultId) {
        getPinsByVault(currentVaultId);
      }
      fetchLimits(); // Refresh access limits to update usage meter
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete PIN';
      Alert.alert('Error', errorMessage);
    } finally {
      setDeletingPinId(null);
    }
  };

  // Check if create button should be disabled (but manage should always be enabled)
  const shouldDisableCreateButton = vaultsLoading || !canCreatePin;
  const shouldDisableManageButton = vaultsLoading; // Only disable if vaults are loading
  

  return (
    <>
      <View 
        className="bg-surface-default rounded-3xl p-4 mb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Keyboard size={26} color="#5e5e5e" />
            <Text className="text-text-default text-lg font-semibold ml-2">PIN Management</Text>
          </View>
          {limits && <RoleBadge role={limits.role} size="sm" />}
        </View>

        {/* Usage information */}
        {limits && (
          <View className="mb-3">
            <UsageMeter
              current={limits.keypad_pins.current_count}
              limit={limits.keypad_pins.limit}
              label="Keypad PINs"
            />
            {isMember && (
              <Text className="text-muted-default text-sm mb-2">
                As a member, you can create up to 1 keypad PIN per vault
              </Text>
            )}
            {isGuest && (
              <Text className="text-muted-default text-sm mb-2">
                Guest users have read-only access to vault resources
              </Text>
            )}
          </View>
        )}

        {/* Warning message when no access */}
        {shouldDisableCreateButton && !limitsLoading && (
          <WarningMessage
            message={
              !limits?.is_member
                ? "You are not a member of this vault. Please contact an admin to add you to this vault."
                : isGuest 
                ? "Guest users cannot create keypad PINs"
                : limits?.keypad_pins.current_count === limits?.keypad_pins.limit
                ? "You've reached your limit for this vault"
                : "No access to create keypad PINs in this vault"
            }
          />
        )}
        <View className="flex-row gap-2">
          <View className="flex-1">
            <ButtonSecondary
              title='Add new Pin'
              onPress={() => setPinModalVisible(true)}
              icon={<Plus size={20} />}
              disabled={shouldDisableCreateButton}
            />
          </View>
          <View className="flex-1">
            <ButtonSecondary
              title="Manage Pins"
              onPress={handleManagePins}
              icon={<SettingsIcon size={20} />}
              disabled={shouldDisableManageButton}
            />
          </View>
        </View>
      </View>

      {/* PIN Creation Modal */}
      <CreatePinModal
        visible={pinModalVisible}
        onClose={() => setPinModalVisible(false)}
        onPinCreated={handlePinCreated}
        limits={limits}
        currentVault={currentVault}
      />

      {/* Manage Pins Modal */}
      <CustomModal
        visible={managePinsModalVisible}
        onClose={() => setManagePinsModalVisible(false)}
        title="Manage PINs"
        primaryAction={{
          label: "Refresh",
          onPress: () => currentVaultId && getPinsByVault(currentVaultId),
          loading: loading
        }}
      >
        <PinList
          pins={pins}
          loading={loading}
          error={error}
          deletingPinId={deletingPinId}
          onDeletePin={handleDeletePin}
          onRefresh={() => currentVaultId && getPinsByVault(currentVaultId)}
          isAdmin={isAdmin}
          currentUserId={currentUserId || undefined}
          currentVaultId={currentVaultId || undefined}
        />
      </CustomModal>
    </>
  );
};