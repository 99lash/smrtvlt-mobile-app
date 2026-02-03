import React from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityCard } from './activity';

const DUMMY_LOGS = [
  { id: '1', user: 'admin', action: 'UNLOCK', vault_name: 'Main Vault', timestamp: new Date().toISOString(), status: 'SUCCESS', details: 'Remote unlock' },
  { id: '2', user: 'guest', action: 'ACCESS_DENIED', vault_name: 'Office Safe', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'FAILURE', details: 'Invalid PIN' },
  { id: '3', user: 'admin', action: 'SETTINGS_CHANGE', vault_name: 'Main Vault', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'SUCCESS', details: 'Changed alarm sensitivity' }
];

export default function ActivityScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-bg-default">
      {/* Activity Logs */}
      <FlatList
        data={DUMMY_LOGS}
        renderItem={({ item }) => <ActivityCard log={item} />}
        keyExtractor={(item) => item.id}
        className="flex-1 px-3 pt-6"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}