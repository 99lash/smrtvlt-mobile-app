import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Search, AlertTriangle, RefreshCw } from 'lucide-react-native';

import { ActivityLog } from '../../types/ActivityTypes';
import { VaultService, transformActivity, ActivityLogEntry } from '../../service/VaultService';

// ─── Status dot ─────────────────────────────────────────────────────────────

function statusDot(status: string): string {
  switch (status) {
    case 'success': return 'bg-status-success';
    case 'failed':  return 'bg-status-danger';
    case 'warning': return 'bg-status-warning';
    default:        return 'bg-status-neutral';
  }
}

// ─── Log Row ─────────────────────────────────────────────────────────────────

const LogRow = ({ log, index }: { log: ActivityLog; index: number }) => (
  <Animated.View
    entering={FadeInRight.delay(Math.min(index * 40, 300)).springify()}
    className="flex-row items-start px-6 py-4 border-b border-zinc-900"
  >
    <View className={`w-2 h-2 rounded-full mt-1 mr-4 ${statusDot(log.status)}`} />
    <View className="flex-1">
      <Text className="text-white text-sm font-black tracking-tight uppercase">
        {log.title}
      </Text>
      <Text className="text-zinc-500 text-[11px] font-medium mt-0.5" numberOfLines={2}>
        {log.description}
      </Text>
      <Text className="text-zinc-700 text-[10px] font-black uppercase tracking-widest mt-1">
        {log.user?.name ?? 'SYSTEM'}
      </Text>
    </View>
    <Text className="text-zinc-600 text-[10px] font-medium ml-3 mt-0.5">{log.timestamp}</Text>
  </Animated.View>
);

// ─── ActivityScreen ──────────────────────────────────────────────────────────

export default function ActivityScreen() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadLogs = useCallback(async () => {
    setError(null);
    try {
      const vaults = await VaultService.getUserVaults();
      const allEntries: ActivityLogEntry[] = [];
      for (const v of vaults) {
        try {
          const entries = await VaultService.getVaultActivity(String(v.vault_id), 50);
          allEntries.push(...entries);
        } catch {
          // skip failed vaults, show whatever we got
        }
      }
      allEntries.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setLogs(allEntries.map(transformActivity));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load activity.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLogs();
    setIsRefreshing(false);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        (l.user?.name ?? '').toLowerCase().includes(q)
    );
  }, [logs, search]);

  const renderHeader = () => (
    <View className="px-6 pt-14 pb-6 bg-bg-default">
      <Text className="text-white text-5xl font-black tracking-tighter uppercase leading-[48px]">
        LOGS
      </Text>
      <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[3px] mt-2 mb-5">
        Historical Event Stream
      </Text>

      {/* Search */}
      <View className="flex-row items-center bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3">
        <Search size={14} color="#52525B" strokeWidth={2.5} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search events..."
          placeholderTextColor="#52525B"
          className="flex-1 text-white text-sm font-medium ml-3"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-bg-default">
        {renderHeader()}
        {[0, 1, 2, 3, 4].map((i) => (
          <Animated.View
            key={i}
            entering={FadeInRight.delay(i * 50).springify()}
            className="mx-6 h-16 bg-zinc-900 rounded-2xl mb-3"
          />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-bg-default">
        {renderHeader()}
        <View className="mx-6 flex-row items-center bg-zinc-950 border border-zinc-800 rounded-[24px] p-5">
          <AlertTriangle size={16} color="#EF4444" strokeWidth={2.5} />
          <Text className="text-zinc-400 text-sm font-medium ml-3 flex-1">{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); loadLogs(); }}>
            <RefreshCw size={16} color="#71717A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg-default">
      <FlatList
        data={filtered}
        renderItem={({ item, index }) => <LogRow log={item} index={index} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text className="text-zinc-600 text-sm font-medium px-6 mt-2">
            {search ? 'No matching events.' : 'No activity yet.'}
          </Text>
        }
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
