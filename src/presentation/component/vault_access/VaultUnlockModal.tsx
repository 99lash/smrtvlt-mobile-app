import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import CustomModal from '../modals/CustomModal';
import { VaultMembership } from '../../../service/VaultService';
import { useBiometric } from '../../hooks/useBiometric';
import { useThemeColors } from '../../context/ThemeContext';

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

  const colors = useThemeColors();

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
      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: colors.text.default, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10, marginBottom: 8 }}>
          Vault PIN
        </Text>
        <TextInput
          value={pin}
          onChangeText={setPin}
          placeholder="Enter vault PIN"
          placeholderTextColor={colors.muted.default}
          secureTextEntry={true}
          keyboardType="number-pad"
          style={{ backgroundColor: colors.surface.default, color: colors.text.default, paddingHorizontal: 16, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border.default }}
        />
      </View>

      {canPromptBiometrics && vaultBiometricEnabled && (
        <TouchableOpacity
          onPress={handleBiometricUnlock}
          style={{ backgroundColor: colors.cards.default, borderWidth: 1, borderColor: colors.border.default, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 24 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.text.default, textAlign: 'center', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 }}>
            Unlock with {biometricLabel}
          </Text>
        </TouchableOpacity>
      )}

      {canPromptBiometrics && !vaultBiometricEnabled && (
        <TouchableOpacity
          onPress={() => setEnableBiometricNextTime(prev => !prev)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            borderWidth: 1,
            backgroundColor: enableBiometricNextTime ? colors.accent.default : colors.cards.default,
            borderColor: enableBiometricNextTime ? colors.accent.default : colors.border.default,
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', color: enableBiometricNextTime ? '#000000' : colors.text.default }}>
            {enableBiometricNextTime ? `${biometricLabel} enabled for next time` : `Enable ${biometricLabel} for next time`}
          </Text>
        </TouchableOpacity>
      )}
    </CustomModal>
  );
};

export default VaultUnlockModal;
