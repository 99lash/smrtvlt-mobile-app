import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ChevronDown, ChevronUp, Vault, LogOut } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import ButtonSecondary from '../component/buttons/ButtonSecondary';
import CustomModal from '../component/modals/CustomModal';
import BorderedList from '../component/lists/BorderedList';
import { useAuthContext } from '../context/AuthContext';
import { useBiometric } from '../hooks/useBiometric';
import { VaultMembership, VaultService } from '../../service/VaultService';
import Provisioning from '../component/provisioning/Provisioning';

const SettingsScreen = () => {
  const { logout } = useAuthContext();
  const [vaults, setVaults] = useState<VaultMembership[]>([]);
  const [currentVault, setCurrentVault] = useState<VaultMembership | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [vaultBiometricEnabled, setVaultBiometricEnabled] = useState(false);
  const [provisioningModalVisible, setProvisioningModalVisible] = useState(false);

  const loadVaults = useCallback(async () => {
    try {
      const raw = await VaultService.getUserVaults();
      setVaults(raw);
      if (raw.length > 0 && !currentVault) setCurrentVault(raw[0]);
    } catch (e) {
      console.error('SettingsScreen: loadVaults failed', e);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadVaults(); }, [loadVaults]);

  const {
    canPromptBiometrics,
    biometricLabel,
    isLoginEnabled,
    enableBiometricLogin,
    disableBiometricLogin,
    isVaultBiometricEnabled,
    enableVaultBiometric,
    disableVaultBiometric,
  } = useBiometric();

  useEffect(() => {
    let isMounted = true;
    if (currentVault?.vault_id) {
      isVaultBiometricEnabled(currentVault.vault_id).then(enabled => {
        if (isMounted) setVaultBiometricEnabled(enabled);
      });
    }
    return () => { isMounted = false; };
  }, [currentVault, isVaultBiometricEnabled]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try { await logout(); } catch (e) { console.error('Logout failed:', e); } finally { setIsLoggingOut(false); }
        },
      },
    ]);
  };

  const handleToggleBiometricLogin = async () => {
    if (!canPromptBiometrics) {
      Alert.alert('Biometrics unavailable', 'This device does not have biometric authentication configured.');
      return;
    }
    try {
      if (isLoginEnabled) await disableBiometricLogin();
      else await enableBiometricLogin();
    } catch (error) {
      Alert.alert('Biometric update failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleToggleVaultBiometric = () => {
    if (!canPromptBiometrics) {
      Alert.alert('Biometrics unavailable', 'This device does not have biometric authentication configured.');
      return;
    }
    if (vaultBiometricEnabled) {
      disableVaultBiometric(currentVault!.vault_id)
        .then(() => setVaultBiometricEnabled(false))
        .catch(error => Alert.alert('Biometric update failed', error instanceof Error ? error.message : 'Please try again.'));
    } else {
      Alert.alert('Not available', 'Vault biometric unlock setup is not yet available.');
    }
  };

  return (
    <View className="flex-1 bg-bg-default">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).springify()} className="px-6 pt-10 mb-10">
          <Text className="text-white text-4xl font-black uppercase tracking-tighter">SETTINGS</Text>
          <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[3px] mt-1">Global Configuration</Text>
        </Animated.View>

        {/* Vault Selector */}
        <Animated.View entering={FadeInDown.delay(50).springify()} className="px-6 mb-10">
          <Text className="text-zinc-600 text-[10px] font-black uppercase tracking-[4px] mb-3">Active Vault</Text>
          <ButtonSecondary
            title={currentVault
              ? `${currentVault.vault_name ?? `UNIT-${currentVault.vault_id}`}  ·  ${(currentVault.role as string).toUpperCase()}`
              : 'Select Vault'
            }
            onPress={() => setIsDropdownOpen(true)}
            icon={isDropdownOpen ? <ChevronUp size={20} color="#FFFFFF" /> : <ChevronDown size={20} color="#FFFFFF" />}
            iconPosition="right"
            className="w-full bg-black border-2 border-zinc-800 rounded-[24px] py-6"
            textClassName="text-left flex-1 text-white font-black uppercase tracking-tighter text-lg"
          />

          <CustomModal
            visible={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            title="SELECT UNIT"
          >
            <BorderedList
              data={vaults}
              keyExtractor={(vault: any) => vault.vault_id.toString()}
              selectedId={currentVault?.vault_id?.toString() ?? ''}
              getId={(vault: any) => vault.vault_id.toString()}
              onItemPress={(vault: any) => {
                setCurrentVault(vault);
                setIsDropdownOpen(false);
              }}
              iconExtractor={() => <Vault size={20} color="#FFFFFF" strokeWidth={2.5} />}
              renderItem={(vault: any) => (
                <View className="flex-1">
                  <Text className="text-text-default font-black uppercase tracking-tight text-lg">
                    {vault.vault_name ?? `UNIT-${vault.vault_id}`}
                  </Text>
                  <Text className="text-muted-default text-[10px] font-bold uppercase tracking-widest mt-1">
                    {(vault.role as string).toUpperCase()}
                  </Text>
                </View>
              )}
              scrollEnabled={false}
            />
          </CustomModal>
        </Animated.View>

        {/* Security */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="px-6 mb-10">
          <Text className="text-zinc-600 text-[10px] font-black uppercase tracking-[4px] mb-3">Security</Text>

          <View className="bg-zinc-950 p-6 rounded-[32px] border border-zinc-900 mb-4">
            <Text className="text-white font-black text-xl uppercase tracking-tighter">Biometric Login</Text>
            <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-2">
              Use {biometricLabel} to sign in faster
            </Text>
            <TouchableOpacity
              onPress={handleToggleBiometricLogin}
              className={`mt-4 px-4 py-3 rounded-2xl border ${isLoginEnabled ? 'bg-white border-white' : 'bg-black border-zinc-800'}`}
              activeOpacity={0.7}
            >
              <Text className={`text-[10px] font-black uppercase tracking-[2px] ${isLoginEnabled ? 'text-black' : 'text-white'}`}>
                {isLoginEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-zinc-950 p-6 rounded-[32px] border border-zinc-900">
            <Text className="text-white font-black text-xl uppercase tracking-tighter">Vault Unlock Biometric</Text>
            <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-2">
              Unlock {currentVault?.vault_name ?? 'vault'} with {biometricLabel}
            </Text>
            <TouchableOpacity
              onPress={handleToggleVaultBiometric}
              className={`mt-4 px-4 py-3 rounded-2xl border ${vaultBiometricEnabled ? 'bg-white border-white' : 'bg-black border-zinc-800'}`}
              activeOpacity={0.7}
            >
              <Text className={`text-[10px] font-black uppercase tracking-[2px] ${vaultBiometricEnabled ? 'text-black' : 'text-white'}`}>
                {vaultBiometricEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Device Management */}
        <Animated.View entering={FadeInDown.delay(150).springify()} className="px-6 mb-10">
          <Text className="text-zinc-600 text-[10px] font-black uppercase tracking-[4px] mb-3">Device Management</Text>

          <TouchableOpacity
            onPress={() => setProvisioningModalVisible(true)}
            activeOpacity={0.8}
            className="bg-zinc-950 p-6 rounded-[32px] border border-zinc-800"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white font-black text-xl uppercase tracking-tighter">Provision New Device</Text>
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-1">
                  Configure vault hardware
                </Text>
              </View>
              <Text className="text-accent-default text-xs font-black uppercase tracking-widest">START</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="px-6 mb-6">
          <Text className="text-zinc-600 text-[10px] font-black uppercase tracking-[4px] mb-3">Danger Zone</Text>
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-900/30 p-6 rounded-[32px] border border-red-800"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-4">
              <LogOut size={24} color="#EF4444" strokeWidth={2.5} />
              <View>
                <Text className="text-red-500 font-black text-xl uppercase tracking-tighter">
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Text>
                <Text className="text-red-500/50 text-[10px] font-bold uppercase tracking-[2px] mt-1">
                  End current session
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Provisioning
        visible={provisioningModalVisible}
        onClose={() => setProvisioningModalVisible(false)}
      />
    </View>
  );
};

export default SettingsScreen;
