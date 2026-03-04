import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Shield, ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react-native';

import VaultUnlockModal from '../component/vault_access/VaultUnlockModal';
import { VaultMembership, VaultService, ActivityLogEntry, transformActivity } from '../../service/VaultService';
import { ActivityLog } from '../../types/ActivityTypes';
import { useVaultManagement } from '../hooks/VaultContext';

// ─── Status helpers ──────────────────────────────────────────────────────────

function getStatusDot(status: string) {
  switch (status) {
    case 'success': return 'bg-status-success';
    case 'failed':
    case 'danger': return 'bg-status-danger';
    case 'warning': return 'bg-status-warning';
    default: return 'bg-status-neutral';
  }
}

function getVaultStatusBadge(vault: VaultMembership): {
  label: string;
  textClass: string;
  borderClass: string;
} {
  // Derive a display status from last_accessed_at or role
  // Since the API doesn't return vault status directly, we show role/activity state
  const isAdmin = (vault.role as string).toLowerCase() === 'admin';
  return isAdmin
    ? { label: 'ADMIN', textClass: 'text-accent-default', borderClass: 'border-accent-dim' }
    : { label: 'MEMBER', textClass: 'text-zinc-500', borderClass: 'border-zinc-700' };
}

function formatRelative(isoOrNull: string | null | undefined): string {
  if (!isoOrNull) return '—';
  const diffMs = Date.now() - new Date(isoOrNull).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return `${Math.floor(diffMin / 1440)}d ago`;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

const SkeletonCard = ({ delay }: { delay: number }) => (
  <Animated.View
    entering={FadeInDown.delay(delay).springify()}
    className="bg-zinc-900 rounded-[24px] h-28 border border-zinc-800 mr-3"
    style={{ width: 160 }}
  />
);

// ─── Vault Card ──────────────────────────────────────────────────────────────

const VaultCard = ({
  vault,
  onPress,
  delay,
}: {
  vault: VaultMembership;
  onPress: () => void;
  delay: number;
}) => {
  const badge = getVaultStatusBadge(vault);
  const name = vault.vault_name ?? `UNIT-${vault.vault_id}`;
  const lastSeen = formatRelative(vault.last_accessed_at);

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Pressable
        onPress={onPress}
        className="bg-zinc-950 rounded-[24px] border border-zinc-800 p-5 mr-3"
        style={{ width: 160 }}
        android_ripple={{ color: 'rgba(34,211,238,0.1)' }}
      >
        <Text
          className="text-white text-base font-black tracking-tight uppercase"
          numberOfLines={1}
        >
          {name}
        </Text>
        <View
          className={`mt-2 self-start px-2 py-1 rounded-lg border ${badge.borderClass}`}
        >
          <Text className={`text-[9px] font-black uppercase tracking-widest ${badge.textClass}`}>
            {badge.label}
          </Text>
        </View>
        <Text className="text-zinc-600 text-[10px] font-medium mt-3">{lastSeen}</Text>
      </Pressable>
    </Animated.View>
  );
};

// ─── Activity Row ────────────────────────────────────────────────────────────

const ActivityRow = ({ log, index }: { log: ActivityLog; index: number }) => (
  <Animated.View
    entering={FadeInRight.delay(index * 50).springify()}
    className="flex-row items-center py-3 border-b border-zinc-900"
  >
    <View className={`w-2 h-2 rounded-full mr-3 ${getStatusDot(log.status)}`} />
    <View className="flex-1">
      <Text className="text-white text-sm font-black tracking-tight uppercase">
        {log.title}
      </Text>
      <Text className="text-zinc-500 text-[10px] font-medium mt-0.5" numberOfLines={1}>
        {log.description}
      </Text>
    </View>
    <Text className="text-zinc-600 text-[10px] font-medium ml-2">{log.timestamp}</Text>
  </Animated.View>
);

// ─── HomeScreen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation();
  const { availableVaults, loading: vaultLoading, error: vaultError, retryLoadVaults } = useVaultManagement();

  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedVault, setSelectedVault] = useState<VaultMembership | null>(null);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);

  const loadActivity = useCallback(async (vaults: VaultMembership[]) => {
    if (vaults.length === 0) { setActivity([]); return; }
    setActivityLoading(true);
    setActivityError(null);
    try {
      const entries: ActivityLogEntry[] = await VaultService.getVaultActivity(
        String(vaults[0].vault_id),
        5
      );
      setActivity(entries.map(transformActivity).slice(0, 5));
    } catch {
      setActivityError('Could not load activity.');
    } finally {
      setActivityLoading(false);
    }
  }, []);

  // Load activity whenever vaults become available
  React.useEffect(() => {
    if (!vaultLoading && availableVaults.length > 0) {
      loadActivity(availableVaults);
    }
  }, [vaultLoading, availableVaults, loadActivity]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await retryLoadVaults();
    if (availableVaults.length > 0) await loadActivity(availableVaults);
    setIsRefreshing(false);
  };

  const handleVaultPress = (vault: VaultMembership) => {
    setSelectedVault(vault);
    setUnlockModalVisible(true);
  };

  const handleUnlockVault = async (vault: VaultMembership, pin: string) => {
    try {
      await VaultService.unlockWithPin(String(vault.vault_id), pin);
      Alert.alert('Access Granted', `${vault.vault_name ?? `UNIT-${vault.vault_id}`} unlocked.`);
      await loadActivity(availableVaults);
    } catch (e) {
      Alert.alert('Unlock Failed', e instanceof Error ? e.message : 'Could not unlock vault.');
    }
  };

  const renderHeader = () => (
    <View className="px-6 pt-14 bg-bg-default">
      {/* ── Header ── */}
      <Animated.View entering={FadeInDown.delay(0).springify()} className="mb-10">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-zinc-600 text-[10px] font-black uppercase tracking-[5px] mb-1">
              System.Status.v2
            </Text>
            <Text className="text-white text-5xl font-black tracking-tighter leading-[48px]">
              DASHBOARD
            </Text>
          </View>
          <View className="w-14 h-14 bg-white rounded-[20px] items-center justify-center">
            <Shield size={28} color="black" strokeWidth={2.5} />
          </View>
        </View>

        <View className="flex-row items-center mt-6 p-3 bg-zinc-950 border border-zinc-900 rounded-2xl self-start">
          <View className="w-2 h-2 rounded-full bg-accent-default mr-2" />
          <Text className="text-white text-[10px] font-black uppercase tracking-widest">
            Network: Active
          </Text>
        </View>
      </Animated.View>

      {/* ── Vault Units ── */}
      <Animated.View entering={FadeInDown.delay(50).springify()} className="mb-10">
        <Text className="text-zinc-600 text-[10px] font-black uppercase tracking-[4px] mb-4">
          Vault Units
        </Text>

        {vaultError ? (
          <View className="bg-zinc-950 border border-zinc-800 rounded-[24px] p-5 flex-row items-center">
            <AlertTriangle size={16} color="#EF4444" strokeWidth={2.5} />
            <Text className="text-zinc-400 text-sm font-medium ml-3 flex-1">{vaultError}</Text>
            <TouchableOpacity onPress={retryLoadVaults}>
              <RefreshCw size={16} color="#71717A" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        ) : vaultLoading ? (
          <View className="flex-row">
            <SkeletonCard delay={0} />
            <SkeletonCard delay={80} />
          </View>
        ) : availableVaults.length === 0 ? (
          <View className="bg-zinc-950 border border-zinc-800 rounded-[24px] p-5">
            <Text className="text-zinc-500 text-sm font-medium">No vaults found.</Text>
          </View>
        ) : (
          <FlatList
            data={availableVaults}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(v) => String(v.vault_id)}
            renderItem={({ item, index }) => (
              <VaultCard
                vault={item}
                onPress={() => handleVaultPress(item)}
                delay={index * 50}
              />
            )}
          />
        )}
      </Animated.View>

      {/* ── Actions Strip ── */}
      {!vaultLoading && availableVaults.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="flex-row gap-3 mb-10"
        >
          <TouchableOpacity
            onPress={() => handleVaultPress(availableVaults[0])}
            className="flex-1 bg-white rounded-[20px] py-4 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-black text-[11px] font-black uppercase tracking-widest">
              Unlock
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Activity' as never)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[20px] py-4 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-zinc-300 text-[11px] font-black uppercase tracking-widest">
              View Logs
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Recent Activity ── */}
      <Animated.View entering={FadeInDown.delay(150).springify()} className="mb-10">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-zinc-600 text-[10px] font-black uppercase tracking-[4px]">
            Recent Activity
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Activity' as never)}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mr-1">
              View All
            </Text>
            <ChevronRight size={12} color="#71717A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {activityError ? (
          <Text className="text-zinc-600 text-sm font-medium">{activityError}</Text>
        ) : activityLoading ? (
          <>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 40).springify()}
                className="h-12 bg-zinc-900 rounded-2xl mb-2"
              />
            ))}
          </>
        ) : activity.length === 0 ? (
          <Text className="text-zinc-600 text-sm font-medium">No recent activity.</Text>
        ) : (
          activity.map((log, i) => (
            <ActivityRow key={log.id} log={log} index={i} />
          ))
        )}
      </Animated.View>

      {/* Footer */}
      <View className="mb-24 items-center">
        <View className="w-8 h-[1px] bg-zinc-800 mb-4" />
        <Text className="text-zinc-700 text-[9px] font-black uppercase tracking-[3px] text-center">
          Secured via RSA-4096 Protocol • v2.4.0
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-bg-default">
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 160 }}
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

      <VaultUnlockModal
        visible={unlockModalVisible}
        vault={selectedVault}
        onClose={() => setUnlockModalVisible(false)}
        onUnlock={handleUnlockVault}
      />
    </View>
  );
}
