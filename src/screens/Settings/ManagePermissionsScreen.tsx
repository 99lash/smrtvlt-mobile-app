import React from 'react';
import { View, Text, Switch, FlatList } from 'react-native';

type PermissionItem = {
  id: string;
  label: string;
  value: boolean;
};

export default function ManagePermissionsScreen() {
  const [permissions, setPermissions] = React.useState<PermissionItem[]>([
    { id: 'unlock', label: 'Unlock Vault', value: true },
    { id: 'view_logs', label: 'View Activity Logs', value: false },
    { id: 'manage_users', label: 'Manage Users', value: false },
  ]);

  const toggle = (id: string) => {
    setPermissions(prev => prev.map(p => (p.id === id ? { ...p, value: !p.value } : p)));
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Manage Permissions</Text>
      <FlatList
        data={permissions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
            <Text style={{ fontSize: 16 }}>{item.label}</Text>
            <Switch value={item.value} onValueChange={() => toggle(item.id)} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#e5e7eb' }} />}
      />
    </View>
  );
}


