import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { ChevronDown, ChevronUp, Vault, LogOut } from 'lucide-react-native';
import ButtonSecondary from '../component/buttons/ButtonSecondary';
import CustomModal from '../component/modals/CustomModal';
import BorderedList from '../component/lists/BorderedList';
import { useAuthContext } from '../context/AuthContext';
import { useBiometric } from '../hooks/useBiometric';
import { MockDataService } from '../../service/MockDataService';
import { VaultMembership, VaultService } from '../../service/VaultService';
import { MOCK_MODE } from '../../config/env';
import { MockPinManager } from './settings/MockPinManager';
import { MockNFCManager } from './settings/MockNFCManager';
import { WaitingForVaultModal } from './settings/WaitingForVaultModal';


const SettingsScreen = () => {
  const { logout } = useAuthContext();
  const [vaults, setVaults] = useState<VaultMembership[]>([]);
  const [currentVault, setCurrentVault] = useState<VaultMembership | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [vaultBiometricEnabled, setVaultBiometricEnabled] = useState(false);
  const [vaultPinModalVisible, setVaultPinModalVisible] = useState(false);
  const [vaultPin, setVaultPin] = useState('');
  const [isSavingVaultPin, setIsSavingVaultPin] = useState(false);
  const [enrollmentModalVisible, setEnrollmentModalVisible] = useState(false);
  const [provisioningModalVisible, setProvisioningModalVisible] = useState(false);

  const loadVaults = useCallback(async () => {
    if (MOCK_MODE) {
      const v = await MockDataService.getVaults();
      setVaults(v);
      if (v.length > 0 && !currentVault) setCurrentVault(v[0]);
      return;
    }
    try {
      const raw = await VaultService.getUserVaults();
      const v = raw.map(item => ({
        vault_id: item.vault_id,
        vault_name: item.vault_name ?? `UNIT-${item.vault_id}`,
        vault_device_id: null,
        vault_location: null,
        role: (['OWNER', 'ADMIN'].includes((item.role as string).toUpperCase()) ? 'admin' : 'member') as 'admin' | 'member' | 'guest',
        created_at: new Date().toISOString(),
        last_accessed_at: (item as any).last_seen_at ?? null,
      }));
      setVaults(v);
      if (v.length > 0 && !currentVault) setCurrentVault(v[0]);
    } catch (e) {
      console.error('SettingsScreen: loadVaults failed', e);
    }
  }, []);

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
        if (isMounted) {
          setVaultBiometricEnabled(enabled);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [currentVault, isVaultBiometricEnabled]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              console.error('Logout failed:', error);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleBiometricLogin = async () => {
    if (!canPromptBiometrics) {
      Alert.alert('Biometrics unavailable', 'This device does not have biometric authentication configured.');
      return;
    }

    try {
      if (isLoginEnabled) {
        await disableBiometricLogin();
      } else {
        await enableBiometricLogin();
      }
    } catch (error) {
      Alert.alert(
        'Biometric update failed',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const handleToggleVaultBiometric = () => {
    if (!canPromptBiometrics) {
      Alert.alert('Biometrics unavailable', 'This device does not have biometric authentication configured.');
      return;
    }

    if (vaultBiometricEnabled) {
      disableVaultBiometric(currentVault!.vault_id).then(() => {
        setVaultBiometricEnabled(false);
      }).catch(error => {
        Alert.alert(
          'Biometric update failed',
          error instanceof Error ? error.message : 'Please try again.'
        );
      });
    } else {
      setVaultPin('');
      setVaultPinModalVisible(true);
    }
  };

  const handleEnableVaultBiometric = async () => {
    if (!vaultPin.trim()) {
      Alert.alert('PIN required', 'Enter your vault PIN to enable biometric unlock.');
      return;
    }

    setIsSavingVaultPin(true);
    try {
      await enableVaultBiometric(currentVault!.vault_id, vaultPin.trim());
      setVaultBiometricEnabled(true);
      setVaultPinModalVisible(false);
      setVaultPin('');
    } catch (error) {
      Alert.alert(
        'Biometric update failed',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setIsSavingVaultPin(false);
    }
  };

  return (
    <View className="flex-1 bg-bg-default">
      <ScrollView
        className="flex-1 gap-2"
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mb-10">
            <Text className="text-white text-4xl font-black uppercase tracking-tighter">SETTINGS</Text>
            <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[3px] mt-1">Global Configuration</Text>
        </View>

        {/* Vault Selection Dropdown */}
        <View className="px-6 mb-10">
          <ButtonSecondary
            title={`${currentVault?.vault_name ?? 'Select Vault'} / ${currentVault?.role ?? ''}`}
            onPress={() => setIsDropdownOpen(true)}
            icon={isDropdownOpen ? <ChevronUp size={20} color="#FFFFFF" /> : <ChevronDown size={20} color="#FFFFFF" />}
            iconPosition="right"
            className="w-full bg-black border-2 border-zinc-800 rounded-[24px] py-6"
            textClassName="text-left flex-1 text-white font-black uppercase tracking-tighter text-lg"
          />
          
          {/* Dropdown Modal */}
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
                    {vault.vault_name}
                  </Text>
                  <Text className="text-muted-default text-[10px] font-bold uppercase tracking-widest mt-1">
                    {vault.role} • {vault.vault_location}
                  </Text>
                </View>
              )}
              scrollEnabled={false}
            />
          </CustomModal>
        </View>
        
        {/* Biometrics */}
        <View className="px-6 mb-10">
          <View className="bg-zinc-950 p-6 rounded-[32px] border border-zinc-900 mb-6">
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
            <Text className="text-white font-black text-xl uppercase tracking-tighter">Vault Unlock</Text>
            <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-2">
              Unlock {currentVault?.vault_name ?? 'Select Vault'} with {biometricLabel}
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
        </View>

        {/* Sections */}
        <View className="px-6">
          {/* Unit Enrollment */}
          <TouchableOpacity
            onPress={() => setEnrollmentModalVisible(true)}
            activeOpacity={0.8}
            className="bg-zinc-950 p-6 rounded-[32px] border border-zinc-800 mb-6"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white font-black text-xl uppercase tracking-tighter">Unit Enrollment</Text>
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-1">Pair a new vault unit</Text>
              </View>
              <Text className="text-zinc-600 text-xs font-black uppercase tracking-widest">START</Text>
            </View>
          </TouchableOpacity>

          <MockPinManager />

          <MockNFCManager />

          {currentVault?.role === 'admin' && (
            <View className="bg-zinc-950 p-6 rounded-[32px] border border-zinc-800 mb-6">
              <Text className="text-white font-black text-xl uppercase tracking-tighter">User Archive</Text>
              <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-1">Manage vault members in the Users tab</Text>
            </View>
          )}

          {/* Provisioning */}
          <TouchableOpacity
            onPress={() => setProvisioningModalVisible(true)}
            activeOpacity={0.8}
            className="bg-zinc-950 p-6 rounded-[32px] border border-zinc-800 mb-6"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white font-black text-xl uppercase tracking-tighter">Provisioning</Text>
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-1">Configure vault hardware</Text>
              </View>
              <Text className="text-zinc-600 text-xs font-black uppercase tracking-widest">START</Text>
            </View>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-900/30 p-6 rounded-[32px] border border-red-800 mb-6"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
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
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomModal
        visible={vaultPinModalVisible}
        onClose={() => setVaultPinModalVisible(false)}
        title="Enable Biometric Unlock"
        primaryAction={{
          label: isSavingVaultPin ? 'Enabling...' : 'Enable',
          onPress: handleEnableVaultBiometric,
          disabled: isSavingVaultPin || !vaultPin.trim(),
          loading: isSavingVaultPin,
        }}
      >
        <View className="mb-4">
          <Text className="text-white font-black uppercase tracking-[2px] text-[10px] mb-2">
            Vault PIN
          </Text>
          <TextInput
            value={vaultPin}
            onChangeText={setVaultPin}
            placeholder="Enter vault PIN"
            placeholderTextColor="#52525B"
            secureTextEntry={true}
            keyboardType="number-pad"
            className="bg-zinc-900 text-white px-4 py-4 rounded-2xl border border-zinc-800"
          />
          <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-[2px] mt-3">
            This PIN will be stored securely and require {biometricLabel} to access.
          </Text>
        </View>
      </CustomModal>

      <WaitingForVaultModal
        visible={enrollmentModalVisible}
        onClose={() => setEnrollmentModalVisible(false)}
        title="Unit Enrollment"
      />
      <WaitingForVaultModal
        visible={provisioningModalVisible}
        onClose={() => setProvisioningModalVisible(false)}
        title="Provisioning"
      />

    </View>
  );
};

export default SettingsScreen;
