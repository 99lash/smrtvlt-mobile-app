import React from 'react';
import { FlatList, View, Text } from 'react-native';
import { ActivityCard } from './activity';
import { ActivityLog } from '../../types/ActivityTypes';

const DUMMY_LOGS: ActivityLog[] = [
  {
    id: '1',
    status: 'success',
    eventType: 'remote_unlock',
    title: 'REMOTE UNLOCK',
    description: 'Protocol execution successful. Access granted.',
    timestamp: '2m ago',
    user: { initials: 'AD', name: 'ADMIN' }
  },
  {
    id: '2',
    status: 'failed',
    eventType: 'failed_pin',
    title: 'AUTH FAILURE',
    description: 'Multiple invalid credentials detected.',
    timestamp: '1h ago',
    user: { initials: 'UN', name: 'UNKNOWN' }
  },
  {
    id: '3',
    status: 'success',
    eventType: 'vault_unlock',
    title: 'UNIT ACCESS',
    description: 'Manual biometric verification successful.',
    timestamp: '3h ago',
    user: { initials: 'JD', name: 'J. DOE' }
  },
  {
    id: '4',
    status: 'warning',
    eventType: 'tamper_alert',
    title: 'SYSTEM ALERT',
    description: 'Unusual vibration detected in Sector 7.',
    timestamp: '5h ago',
    user: { initials: 'SV', name: 'SMARTVAULT' }
  }
];

export default function ActivityScreen({ navigation }: any) {
  const renderHeader = () => (
    <View className="px-6 mb-10 pt-10">
        <Text className="text-white text-5xl font-black tracking-tighter uppercase leading-[48px]">LOGS</Text>
        <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[3px] mt-2">Historical Event Stream</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-bg-default">
      <FlatList
        data={DUMMY_LOGS}
        renderItem={({ item }) => <ActivityCard log={item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}