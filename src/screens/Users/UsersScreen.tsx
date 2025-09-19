// src/screens/Users/UsersScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UsersStackParamList } from '../../types/navigation';
import { Shield, Settings2, Trash2 } from 'lucide-react-native';

type Props = NativeStackScreenProps<UsersStackParamList, 'UsersMain'>;

type User = {
  id: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  lastAccess: string;
  enabled: boolean;
};

function getInitials(firstName: string, lastName: string): string {
  const first = firstName?.[0] ?? '';
  const last = lastName?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
}

function Badge({ label, variant = 'default' as 'default' | 'secondary' }: { label: string; variant?: 'default' | 'secondary' }) {
  const base = 'px-2 py-0.5 rounded-full text-xs';
  const color =
    variant === 'secondary'
      ? 'bg-neutral-800 text-neutral-200'
      : 'bg-neutral-700 text-white';
  return (
    <View className={`${base} ${color} mr-2`}>
      <Text className="text-[10px] text-white">{label}</Text>
    </View>
  );
}

export default function UsersScreen({ navigation }: Props) {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'u1',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin',
      status: 'active',
      lastAccess: '2 hours ago',
      enabled: true,
    },
    {
      id: 'u2',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'user',
      status: 'active',
      lastAccess: '1 day ago',
      enabled: false,
    },
    {
      id: 'u3',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'user',
      status: 'inactive',
      lastAccess: '1 week ago',
      enabled: true,
    },
  ]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [users]);

  function toggleEnabled(id: string) {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, enabled: !u.enabled } : u)));
  }

  function removeUser(id: string) {
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  function renderUser({ item }: { item: User }) {
    const initials = getInitials(item.firstName, item.lastName);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('UsersDetail', { userId: item.id })}
        className="mb-3 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
              <Text className="text-white font-semibold">{initials}</Text>
            </View>
            <View>
              <Text className="text-white text-base font-semibold">{item.firstName} {item.lastName}</Text>
              <View className="flex-row mt-1">
                <Badge label={item.role} />
                {item.status === 'inactive' && <Badge label="Inactive" variant="secondary" />}
              </View>
              <Text className="text-neutral-400 text-[12px] mt-1">Last access: {item.lastAccess}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Switch value={item.enabled} onValueChange={() => toggleEnabled(item.id)} />
            <TouchableOpacity onPress={() => navigation.navigate('UsersDetail', { userId: item.id })} className="ml-3">
              <Shield color="#cbd5e1" size={18} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('UsersDetail', { userId: item.id })} className="ml-3">
              <Settings2 color="#cbd5e1" size={18} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeUser(item.id)} className="ml-3">
              <Trash2 color="#fca5a5" size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-1 bg-black px-4 py-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white text-lg font-semibold">User Management</Text>
        <TouchableOpacity className="px-3 py-2 bg-neutral-800 rounded-lg" onPress={() => {}}>
          <Text className="text-white text-sm">Add User</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedUsers}
        keyExtractor={(u) => u.id}
        renderItem={renderUser}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}
