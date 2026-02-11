import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle, AlertTriangle } from 'lucide-react-native';

// Import existing UI components
import { VaultGrid } from '../components/home/VaultGrid';
import { AnalyticsCards } from '../components/home/AnalyticsCards';
import { ActivityFeed } from '../components/home/ActivityFeed';
import { QuickActions } from '../components/home/QuickActions';
import { DateFilterDropdown } from '../components/home/DateFilterDropdown';

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
  { id: 1, type: 'success', title: 'Remote Unlock', description: 'Main Vault was unlocked remotely', timestamp: new Date().toISOString(), user: 'John Doe' },
  { id: 2, type: 'failed', title: 'Access Denied', description: 'Invalid PIN entered at Office Safe', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Unknown' },
  { id: 3, type: 'info', title: 'Settings Updated', description: 'Alarm sensitivity changed', timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'Admin' }
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
  const [selectedDateFilter, setSelectedDateFilter] = useState('today');

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleVaultPress = (vault: any) => {
    console.log('🏠 HomeScreen: Selected vault:', vault.vault_name);
  };

  const handleRemoteUnlock = () => {
    console.log('Remote unlock pressed');
    Alert.alert('Remote Unlock', 'Unlock simulated');
  };

  const handleClearAlarm = () => {
    console.log('Clear alarm pressed');
  };

  const renderHeader = () => (
    <View className="px-6 pt-6">
      <View>
        <Text className="text-text-dark text-2xl font-bold">
          🏠 SmartVault
        </Text>
        <Text className="text-text-dark text-base mt-1 opacity-70">
          Welcome back, User!
        </Text>
      </View>

      {/* Date Filter */}
      <View className="mt-4 mb-4">
        <DateFilterDropdown
          selectedOption={selectedDateFilter}
          onOptionChange={setSelectedDateFilter}
          disabled={isRefreshing}
        />
      </View>

      {/* Dashboard Metrics */}
      <AnalyticsCards
        metrics={DUMMY_METRICS as any}
        onRefresh={refreshData}
        isRefreshing={isRefreshing}
      />

      {/* Vault Grid */}
      <VaultGrid
        vaults={DUMMY_VAULTS as any}
        onVaultPress={handleVaultPress}
        isLoading={false}
      />

      {/* Quick Actions */}
      <QuickActions
        onRemoteUnlock={handleRemoteUnlock}
        onClearAlarm={handleClearAlarm}
        onSettings={() => navigation.navigate('Settings' as never)}
        isConnected={isConnected}
        vaultStatus={vaultStatus}
        hasActiveAlarm={hasActiveAlarm}
        isUnlocking={false}
        isClearingAlarm={false}
      />

      {/* Recent Activity */}
      <ActivityFeed
        activities={DUMMY_ACTIVITY as any}
        onViewAll={() => navigation.navigate('Activity' as never)}
        onRefresh={refreshData}
        isLoading={false}
        isRefreshing={isRefreshing}
      />

      {/* Connection Status */}
      <View
        className="mb-6 p-4 bg-surface-default dark:bg-surface-dark rounded-xl border border-border-default dark:border-border-dark"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center gap-3">
          {isConnected ? (
            <>
              <CheckCircle size={20} color="#22c55e" />
              <View className="flex-1">
                <Text className="text-text-dark font-medium">
                  Connected to Vault Network
                </Text>
                <Text className="text-text-dark text-sm mt-0.5 opacity-70">
                  All features available
                </Text>
              </View>
            </>
          ) : (
            <>
              <AlertTriangle size={20} color="#eab308" />
              <View className="flex-1">
                <Text className="text-text-dark font-medium">
                  Offline Mode
                </Text>
                <Text className="text-text-dark text-sm mt-0.5 opacity-70">
                  Limited functionality available
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg-default dark:bg-bg-dark" edges={['top', 'left', 'right']}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      />
    </SafeAreaView>
  );
}