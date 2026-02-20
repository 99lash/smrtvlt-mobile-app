import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import CustomModal from '../modals/CustomModal';
import { VaultMembership } from '../../../service/VaultService';
import { useBiometric } from '../../hooks/useBiometric';

interface VaultUnlockModalProps {
  visible: boolean;
  vault: VaultMembership | null;
  onClose: () => void;
  onUnlock: (vault: VaultMembership, pin: string) => Promise<void> | void;
}

const VaultUnlockModal: React.FC<VaultUnlockModalProps> = ({
  visible,
  vault,
  onClose,
  onUnlock,
}) => {
  const [pin, setPin] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [vaultBiometricEnabled, setVaultBiometricEnabled] = useState(false);
  const [enableBiometricNextTime, setEnableBiometricNextTime] = useState(false);

  const {
    canPromptBiometrics,
    biometricLabel,
    isVaultBiometricEnabled,
    enableVaultBiometric,
    getVaultPinWithBiometrics,
  } = useBiometric();

  useEffect(() => {
    if (!vault) return;
    let isMounted = true;
    isVaultBiometricEnabled(vault.vault_id).then(enabled => {
      if (isMounted) {
        setVaultBiometricEnabled(enabled);
        setEnableBiometricNextTime(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [vault, isVaultBiometricEnabled]);

  useEffect(() => {
    if (!visible) {
      setPin('');
      setIsUnlocking(false);
      setEnableBiometricNextTime(false);
    }
  }, [visible]);

  const handleUnlock = async () => {
    if (!vault) return;
    if (!pin.trim()) {
      Alert.alert('PIN required', 'Please enter your vault PIN.');
      return;
    }

    setIsUnlocking(true);
    try {
      await onUnlock(vault, pin.trim());

      if (enableBiometricNextTime && canPromptBiometrics) {
        try {
          await enableVaultBiometric(vault.vault_id, pin.trim());
          setVaultBiometricEnabled(true);
        } catch (error) {
          Alert.alert(
            'Biometric setup failed',
            error instanceof Error ? error.message : 'Unable to enable biometric unlock.'
          );
        }
      }

      onClose();
    } catch (error) {
      Alert.alert(
        'Unlock failed',
        error instanceof Error ? error.message : 'Unable to unlock vault.'
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleBiometricUnlock = async () => {
    if (!vault) return;

    setIsUnlocking(true);
    try {
      const storedPin = await getVaultPinWithBiometrics(vault.vault_id);
      if (!storedPin) {
        Alert.alert('Biometric unlock unavailable', 'Please enter your PIN to continue.');
        return;
      }

      await onUnlock(vault, storedPin);
      onClose();
    } catch (error) {
      Alert.alert(
        'Biometric unlock failed',
        error instanceof Error ? error.message : 'Please try your PIN instead.'
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!vault) return null;

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={`UNLOCK ${vault.vault_name || `UNIT-${vault.vault_id}`}`}
      primaryAction={{
        label: isUnlocking ? 'Unlocking...' : 'Unlock',
        onPress: handleUnlock,
        disabled: isUnlocking || !pin.trim(),
        loading: isUnlocking,
      }}
      secondaryAction={{
        label: 'Cancel',
        onPress: onClose,
      }}
    >
      <View className="mb-6">
        <Text className="text-white font-black uppercase tracking-[2px] text-[10px] mb-2">
          Vault PIN
        </Text>
        <TextInput
          value={pin}
          onChangeText={setPin}
          placeholder="Enter vault PIN"
          placeholderTextColor="#52525B"
          secureTextEntry={true}
          keyboardType="number-pad"
          className="bg-zinc-900 text-white px-4 py-4 rounded-2xl border border-zinc-800"
        />
      </View>

      {canPromptBiometrics && vaultBiometricEnabled && (
        <TouchableOpacity
          onPress={handleBiometricUnlock}
          className="bg-black border border-zinc-800 rounded-2xl px-4 py-4 mb-6"
          activeOpacity={0.7}
        >
          <Text className="text-white text-center font-black uppercase tracking-[2px] text-[10px]">
            Unlock with {biometricLabel}
          </Text>
        </TouchableOpacity>
      )}

      {canPromptBiometrics && !vaultBiometricEnabled && (
        <TouchableOpacity
          onPress={() => setEnableBiometricNextTime(prev => !prev)}
          className={`px-4 py-3 rounded-2xl border ${enableBiometricNextTime ? 'bg-white border-white' : 'bg-black border-zinc-800'}`}
          activeOpacity={0.7}
        >
          <Text className={`text-[10px] font-black uppercase tracking-[2px] text-center ${enableBiometricNextTime ? 'text-black' : 'text-white'}`}>
            {enableBiometricNextTime ? `${biometricLabel} enabled for next time` : `Enable ${biometricLabel} for next time`}
          </Text>
        </TouchableOpacity>
      )}
    </CustomModal>
  );
};

export default VaultUnlockModal;
