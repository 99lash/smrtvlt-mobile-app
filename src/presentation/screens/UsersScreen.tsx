import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Loader } from 'lucide-react-native';

import { TabNavigation } from './users/components/TabNavigation';
import { TabContent } from './users/components/TabContent';
import { FloatingActionButton } from '../component/buttons/FloatingActionButton';
import CustomModal from '../component/modals/CustomModal';
import { MockDataService } from '../../service/MockDataService';
import { User, UserRole } from '../../types/UserTypes';
import { VaultMembership, VaultService } from '../../service/VaultService';
import { VaultMembershipService } from '../../service/VaultMembershipService';
import { MOCK_MODE } from '../../config/env';

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Both',   value: 'admin'  },
  { label: 'Access', value: 'user'   },
  { label: 'View',   value: 'viewer' },
];

export default function UsersScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'users' | 'vaults'>('users');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [vaults, setVaults] = useState<VaultMembership[]>([]);

  // Add Member modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [isSaving, setIsSaving] = useState(false);

  const handleUserPress = (userId: string) => console.log('User pressed:', userId);
  const handleVaultSelect = (id: number) => console.log('Vault selected:', id);
  const handleTransferOwnership = (user: any) => console.log('Transfer to:', user.username);

  const handleDeleteUser = async (userId: string) => {
    Alert.alert('Remove Member', 'Remove this member from the vault?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        if (MOCK_MODE) {
          await MockDataService.deleteUser(Number(userId));
        } else {
          if (vaults.length > 0) {
            await VaultMembershipService.removeUserFromVault(vaults[0].vault_id, Number(userId));
          }
        }
        await loadData();
      }},
    ]);
  };

  const handleArchiveUser = async (userId: string) => {
    if (MOCK_MODE) {
      Alert.alert('Archive User', 'Set this user as inactive?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', onPress: async () => {
          await MockDataService.archiveUser(Number(userId));
          await loadData();
        }},
      ]);
      return;
    }
    Alert.alert('Not Available', 'Archive is only available in offline mode. Use Remove to remove the member from this vault.');
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    if (MOCK_MODE) {
      const [u, v] = await Promise.all([
        MockDataService.getUsers(),
        MockDataService.getVaults(),
      ]);
      setUsers(u);
      setVaults(v);
      setLoading(false);
      return;
    }
    try {
      const rawVaults = await VaultService.getUserVaults();
      const mappedVaults = rawVaults.map(item => ({
        vault_id: parseInt(String(item.vault_id), 10) || 0,
        vault_name: item.vault_name ?? `UNIT-${item.vault_id}`,
        vault_device_id: null,
        vault_location: null,
        role: (['OWNER', 'ADMIN'].includes((item.role as string).toUpperCase()) ? 'admin' : 'member') as 'admin' | 'member' | 'guest',
        created_at: new Date().toISOString(),
        last_accessed_at: (item as any).last_seen_at ?? null,
      }));
      setVaults(mappedVaults);

      if (mappedVaults.length > 0) {
        const allMemberArrays = await Promise.all(
          mappedVaults.map(v =>
            VaultMembershipService.fetchVaultMembers(v.vault_id).catch(() => [])
          )
        );
        const allMembers = allMemberArrays.flat();
        const seen = new Set<string>();
        const uniqueMembers = allMembers.filter((m: any) => {
          const key = String(m.user_id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const users: User[] = uniqueMembers.map((m: any) => {
          const nameParts = (m.full_name ?? '').split(' ');
          return {
            id: parseInt(m.user_id, 10) || m.user_id,
            firstName: nameParts[0] ?? '',
            lastName: nameParts.slice(1).join(' ') || undefined,
            username: m.email?.split('@')[0] ?? m.user_id,
            email: m.email ?? '',
            role: (['ADMIN', 'OWNER'].includes((m.role ?? '').toUpperCase()) ? 'admin' : 'user') as any,
            status: 'active' as const,
            lastAccess: m.granted_at ?? new Date().toISOString(),
            enabled: true,
          };
        });
        setUsers(users);
      }
    } catch (e) {
      console.error('UsersScreen: loadData failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openAddModal = () => {
    setFullName('');
    setSelectedRole('user');
    setAddModalVisible(true);
  };

  const handleAddUser = async () => {
    const emailTrimmed = fullName.trim(); // reuse state, treat it as email input
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      Alert.alert('Required', 'Please enter a valid email address.');
      return;
    }

    if (MOCK_MODE) {
      const parts = emailTrimmed.split('@')[0].split('.');
      const firstName = parts[0] ?? emailTrimmed;
      const lastName = parts.slice(1).join(' ') || undefined;
      const username = emailTrimmed.split('@')[0];

      setIsSaving(true);
      const newUser: User = {
        id: Date.now(),
        firstName,
        lastName,
        username,
        email: emailTrimmed,
        role: selectedRole,
        status: 'active',
        lastAccess: new Date().toISOString(),
        enabled: true,
      };

      await MockDataService.addUser(newUser);
      await loadData();
      setIsSaving(false);
      setAddModalVisible(false);
      setFullName('');
      return;
    }

    setIsSaving(true);
    try {
      if (vaults.length === 0) throw new Error('No vault selected');
      // Search for user by email
      const found = await VaultMembershipService.searchUserByEmail(emailTrimmed);
      if (!found) {
        Alert.alert('User Not Found', 'No account with that email address exists.');
        return;
      }
      // Add them to the first vault
      const roleMap: Record<string, 'ADMIN' | 'MEMBER' | 'VIEWER'> = {
        admin:  'ADMIN',
        user:   'MEMBER',
        viewer: 'VIEWER',
      };
      await VaultMembershipService.addMember(String(vaults[0].vault_id), found.user_id, roleMap[selectedRole] ?? 'MEMBER');
      await loadData();
      setAddModalVisible(false);
      setFullName('');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not add member.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-bg-default justify-center items-center">
        <Loader size={48} color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg-default">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mb-10">
          <Text className="text-white text-5xl font-black tracking-tighter uppercase leading-[48px]">ARCHIVE</Text>
          <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[3px] mt-2">Personnel & Unit Registry</Text>
        </View>

        <View className="mb-10">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab as any} />
        </View>

        <View className="px-2">
          <TabContent
            activeTab={activeTab}
            users={users as any}
            vaults={vaults as any}
            onUserPress={handleUserPress}
            onVaultSelect={handleVaultSelect}
            onRefresh={loadData}
            onTransferOwnership={handleTransferOwnership}
            onDeleteUser={handleDeleteUser}
            onArchiveUser={handleArchiveUser}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <FloatingActionButton onPress={openAddModal} />

      {/* Add Member Modal */}
      <CustomModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        title="Add Member"
        primaryAction={{
          label: isSaving ? 'Adding...' : 'Add Member',
          onPress: handleAddUser,
          disabled: isSaving || (MOCK_MODE ? !fullName.trim() : !fullName.trim() || !fullName.includes('@')),
          loading: isSaving,
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setAddModalVisible(false),
        }}
      >
        <View className="gap-6">
          {/* Email Address */}
          <View>
            <Text className="text-zinc-400 text-[10px] font-black uppercase tracking-[2px] mb-2">
              Email Address
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. user@smartvault.io"
              placeholderTextColor="#52525B"
              autoCapitalize="none"
              keyboardType="email-address"
              className="bg-zinc-900 text-white px-4 py-4 rounded-2xl border border-zinc-800 text-base"
            />
          </View>

          {/* Role Selector */}
          <View>
            <Text className="text-zinc-400 text-[10px] font-black uppercase tracking-[2px] mb-3">
              Role
            </Text>
            <View className="flex-row gap-3">
              {ROLE_OPTIONS.map((opt) => {
                const active = selectedRole === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setSelectedRole(opt.value)}
                    className={`flex-1 py-4 rounded-2xl border items-center ${
                      active ? 'bg-white border-white' : 'bg-black border-zinc-800'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-[11px] font-black uppercase tracking-[2px] ${active ? 'text-black' : 'text-white'}`}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </CustomModal>
    </View>
  );
}
