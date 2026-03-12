import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import CustomModal from '../modals/CustomModal';
import { VaultMembership } from '../../../service/VaultService';
import { BiometricService } from '../../../service/BiometricService';
import { AuthService } from '../../../service/AuthService';
import { useBiometric } from '../../hooks/useBiometric';
import { useThemeColors } from '../../context/ThemeContext';

interface VaultUnlockModalProps {
  visible: boolean;
  vault: VaultMembership | null;
  accountEmail?: string;
  onClose: () => void;
  onUnlock: (vault: VaultMembership, pin: string) => Promise<void> | void;
  onOpenFaceCapture: (vault: VaultMembership, mode: 'enroll' | 'verify') => void;
}

const VaultUnlockModal: React.FC<VaultUnlockModalProps> = ({
  visible,
  vault,
  accountEmail,
  onClose,
  onUnlock,
  onOpenFaceCapture,
}) => {
  const [pin, setPin] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [vaultBiometricEnabled, setVaultBiometricEnabled] = useState(false);
  const [enableBiometricNextTime, setEnableBiometricNextTime] = useState(false);
  const [faceEnrolled, setFaceEnrolled] = useState(false);
  const [pendingSensitiveAction, setPendingSensitiveAction] = useState<'enroll' | 'delete' | null>(null);
  const [reauthPassword, setReauthPassword] = useState('');
  const [isReauthenticating, setIsReauthenticating] = useState(false);

  const {
    canPromptBiometrics,
    biometricLabel,
    isVaultBiometricEnabled,
    enableVaultBiometric,
    getVaultPinWithBiometrics,
  } = useBiometric();

  useEffect(() => {
    if (!visible || !vault) return;
    let isMounted = true;

    Promise.all([
      isVaultBiometricEnabled(vault.vault_id),
      BiometricService.isFaceEnrolled(),
    ]).then(([biometricEnabled, faceIsEnrolled]) => {
      if (isMounted) {
        setVaultBiometricEnabled(biometricEnabled);
        setFaceEnrolled(faceIsEnrolled);
        setEnableBiometricNextTime(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [visible, vault, isVaultBiometricEnabled]);

  useEffect(() => {
    if (!visible) {
      setPin('');
      setIsUnlocking(false);
      setEnableBiometricNextTime(false);
      setPendingSensitiveAction(null);
      setReauthPassword('');
      setIsReauthenticating(false);
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

  const handleFaceUnlock = () => {
    if (!vault) return;
    onOpenFaceCapture(vault, 'verify');
  };

  const handleFaceEnroll = () => {
    startSensitiveAction('enroll');
  };

  const runSensitiveAction = async (action: 'enroll' | 'delete') => {
    if (!vault) {
      return;
    }

    if (action === 'enroll') {
      onOpenFaceCapture(vault, 'enroll');
      return;
    }

    await BiometricService.deleteFace();
    setFaceEnrolled(false);
  };

  const startSensitiveAction = async (action: 'enroll' | 'delete') => {
    if (!vault || isReauthenticating) {
      return;
    }

    const biometricsConfirmed = await BiometricService.authenticateSensitiveAction(
      action === 'delete' ? 'Confirm face deletion' : 'Confirm face enrollment update'
    );

    if (biometricsConfirmed) {
      try {
        await runSensitiveAction(action);
      } catch (error) {
        Alert.alert('Action failed', error instanceof Error ? error.message : 'Could not complete action.');
      }
      return;
    }

    if (!accountEmail) {
      Alert.alert('Verification unavailable', 'Account email is missing. Please sign in again.');
      return;
    }

    setPendingSensitiveAction(action);
    setReauthPassword('');
  };

  const handlePasswordReauth = async () => {
    if (!pendingSensitiveAction || !accountEmail || !reauthPassword.trim() || isReauthenticating) {
      return;
    }

    setIsReauthenticating(true);
    try {
      await AuthService.verifyCredentials(accountEmail, reauthPassword.trim());
      const action = pendingSensitiveAction;
      setPendingSensitiveAction(null);
      setReauthPassword('');
      await runSensitiveAction(action);
    } catch (error) {
      Alert.alert('Verification failed', error instanceof Error ? error.message : 'Invalid password.');
    } finally {
      setIsReauthenticating(false);
    }
  };

  const promptDeleteFace = () => {
    Alert.alert(
      'Delete face',
      'Remove your enrolled face? You can re-enroll at any time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            startSensitiveAction('delete').catch(() => undefined);
          },
        },
      ]
    );
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

      {pendingSensitiveAction && (
        <View style={{ marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border.default, backgroundColor: colors.cards.default }}>
          <Text style={{ color: colors.text.default, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10, marginBottom: 8 }}>
            Confirm identity
          </Text>
          <Text style={{ color: colors.muted.default, fontSize: 12, marginBottom: 12 }}>
            Enter your account password to {pendingSensitiveAction === 'delete' ? 'delete face enrollment' : 're-take face enrollment'}.
          </Text>
          <TextInput
            value={reauthPassword}
            onChangeText={setReauthPassword}
            placeholder="Account password"
            placeholderTextColor={colors.muted.default}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={{ backgroundColor: colors.surface.default, color: colors.text.default, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border.default, marginBottom: 12 }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => {
                if (isReauthenticating) {
                  return;
                }
                setPendingSensitiveAction(null);
                setReauthPassword('');
              }}
              style={{ flex: 1, borderWidth: 1, borderColor: colors.border.default, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
              activeOpacity={0.7}
            >
              <Text style={{ color: colors.text.default, fontSize: 12, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePasswordReauth}
              style={{ flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.accent.default, opacity: isReauthenticating || !reauthPassword.trim() ? 0.6 : 1 }}
              disabled={isReauthenticating || !reauthPassword.trim()}
              activeOpacity={0.7}
            >
              <Text style={{ color: '#000000', fontSize: 12, fontWeight: '900' }}>
                {isReauthenticating ? 'Verifying...' : 'Verify'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Face recognition unlock */}
      {!pendingSensitiveAction && faceEnrolled && (
        <>
          <TouchableOpacity
            onPress={handleFaceUnlock}
            style={{ backgroundColor: colors.cards.default, borderWidth: 1, borderColor: colors.border.default, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, marginTop: 8 }}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.text.default, textAlign: 'center', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 }}>
              Unlock with Face Recognition
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 16 }}>
            <TouchableOpacity onPress={handleFaceEnroll} activeOpacity={0.7}>
              <Text style={{ color: colors.muted.default, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>
                Re-take photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={promptDeleteFace}
              activeOpacity={0.7}
            >
              <Text style={{ color: colors.muted.default, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>
                Delete face
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {!pendingSensitiveAction && !faceEnrolled && (
        <TouchableOpacity
          onPress={handleFaceEnroll}
          style={{ paddingHorizontal: 16, paddingVertical: 12, marginTop: 8, borderRadius: 14, borderWidth: 1, borderColor: colors.border.default, backgroundColor: colors.cards.default }}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.muted.default, textAlign: 'center', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>
            Set up Face Recognition
          </Text>
        </TouchableOpacity>
      )}
    </CustomModal>
  );
};

export default VaultUnlockModal;
