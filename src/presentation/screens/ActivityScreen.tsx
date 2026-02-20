import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, View, Text, RefreshControl } from 'react-native';
import { ActivityCard } from './activity';
import { ActivityLog } from '../../types/ActivityTypes';
import { MockDataService } from '../../service/MockDataService';
import { VaultService, transformActivity, ActivityLogEntry } from '../../service/VaultService';
import { MOCK_MODE } from '../../config/env';

export default function ActivityScreen({ navigation }: any) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadLogs = useCallback(async () => {
    if (MOCK_MODE) {
      const data = await MockDataService.getActivityLogs();
      setLogs(data);
      return;
    }
    try {
      // Get vaults first, then load activity for all of them
      const vaults = await VaultService.getUserVaults();
      const allEntries: ActivityLogEntry[] = [];
      for (const v of vaults) {
        try {
          const entries = await VaultService.getVaultActivity(String(v.vault_id), 50);
          allEntries.push(...entries);
        } catch {}
      }
      // Sort by created_at descending
      allEntries.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setLogs(allEntries.map(transformActivity));
    } catch (e) {
      console.error('ActivityScreen: loadLogs failed', e);
    }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLogs();
    setIsRefreshing(false);
  };

  const renderHeader = () => (
    <View className="px-6 mb-10 pt-10">
        <Text className="text-white text-5xl font-black tracking-tighter uppercase leading-[48px]">LOGS</Text>
        <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[3px] mt-2">Historical Event Stream</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-bg-default">
      <FlatList
        data={logs}
        renderItem={({ item }) => <ActivityCard log={item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
            progressBackgroundColor="#000000"
          />
        }
      />
    </View>
  );
}