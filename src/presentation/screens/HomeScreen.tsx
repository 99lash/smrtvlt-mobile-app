import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Shield, Activity as ActivityIcon } from 'lucide-react-native';

// Import existing UI components
import { VaultGrid } from '../components/home/VaultGrid';
import { AnalyticsCards } from '../components/home/AnalyticsCards';
import { ActivityFeed } from '../components/home/ActivityFeed';
import { QuickActions } from '../components/home/QuickActions';
import { DateFilterDropdown, DATE_FILTER_OPTIONS } from '../components/home/DateFilterDropdown';

// Dummy Data
const DUMMY_METRICS = {
  totalVaults: 2,
  todayAccessCount: 124,
  successRate: 98,
  failedAttempts: 2,
  lastActivity: new Date().toISOString(),
  isLoading: false,
  error: null
};

const DUMMY_VAULTS = [
  { vault_id: 1, vault_name: 'Main Vault', role: 'admin', vault_location: 'Home', created_at: new Date().toISOString() },
  { vault_id: 2, vault_name: 'Office Safe', role: 'member', vault_location: 'Office', created_at: new Date().toISOString() }
];

const DUMMY_ACTIVITY = [
  { id: 1, type: 'success', title: 'Remote Unlock', description: 'Main Vault access granted.', timestamp: '2m ago', user: 'ADMIN' },
  { id: 2, type: 'failed', title: 'Auth Failure', description: 'Invalid credentials detected.', timestamp: '1h ago', user: 'SYSTEM' },
  { id: 3, type: 'info', title: 'Sync Done', description: 'System database updated.', timestamp: '3h ago', user: 'AUTO' }
];

export default function HomeScreen({
  isConnected = true,
  vaultStatus = 'locked',
  setVaultStatus = () => {},
  hasActiveAlarm = false,
  setHasActiveAlarm = () => {},
  onNavigateToSettings,
  onNavigateToActivity,
}: any) {
  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState(DATE_FILTER_OPTIONS[0]);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleVaultPress = (vault: any) => {
    console.log('🏠 HomeScreen: Selected vault:', vault.vault_name);
  };

  const renderHeader = () => (
    <View className="px-6 pt-12 bg-bg-default">
      {/* Hero Section */}
      <View className="mb-12">
        <View className="flex-row items-center justify-between">
            <View>
                <Text className="text-zinc-600 text-[10px] font-black uppercase tracking-[5px] mb-1">
                    System.Status.v2
                </Text>
                <Text className="text-white text-5xl font-black tracking-tighter leading-[48px]">
                    DASHBOARD
                </Text>
            </View>
            <View className="w-14 h-14 bg-white rounded-[20px] items-center justify-center shadow-2xl">
                <Shield size={28} color="black" strokeWidth={2.5} />
            </View>
        </View>
        
        <View className="flex-row items-center gap-2 mt-6 p-3 bg-zinc-950 border border-zinc-900 rounded-2xl self-start">
            <View className={`w-2 h-2 rounded-full ${isConnected ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-700'} animate-pulse`} />
            <Text className="text-white text-[10px] font-black uppercase tracking-widest ml-1">
                {isConnected ? 'Network: Active' : 'Network: Offline'}
            </Text>
        </View>
      </View>

      {/* Primary Metrics */}
      <View className="mb-12">
        <AnalyticsCards
            metrics={DUMMY_METRICS as any}
            onRefresh={refreshData}
            isRefreshing={isRefreshing}
        />
      </View>

      {/* Vault Units */}
      <View className="mb-12">
        <VaultGrid
            vaults={DUMMY_VAULTS as any}
            onVaultPress={handleVaultPress}
            isLoading={false}
        />
      </View>

      {/* Control Shortcuts */}
      <View className="mb-12">
        <QuickActions
            onRemoteUnlock={() => Alert.alert('Command', 'Unlock request sent.')}
            onClearAlarm={() => Alert.alert('Command', 'Alarm buffer cleared.')}
            onSettings={() => navigation.navigate('Settings' as never)}
            isConnected={isConnected}
            vaultStatus={vaultStatus}
            hasActiveAlarm={hasActiveAlarm}
            isUnlocking={false}
            isClearingAlarm={false}
        />
      </View>

      {/* Log Feed */}
      <View className="mb-12">
        <ActivityFeed
            activities={DUMMY_ACTIVITY as any}
            onViewAll={() => navigation.navigate('Activity' as never)}
            onRefresh={refreshData}
            isLoading={false}
            isRefreshing={isRefreshing}
        />
      </View>

      {/* Safety Info Footer */}
      <View className="mb-24 px-2 items-center">
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
            onRefresh={refreshData}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
            progressBackgroundColor="#000000"
          />
        }
      />
    </View>
  );
}