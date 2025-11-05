import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Shield,
  Unlock,
  Battery,
  AlertTriangle,
  CheckCircle,
  Clock,
  Smartphone,
  Activity,
  User,
  Bell
} from 'lucide-react-native';

// Import new components
import { VaultGrid } from '../components/home/VaultGrid';
import { AnalyticsCards } from '../components/home/AnalyticsCards';
import { ActivityFeed } from '../components/home/ActivityFeed';
import { QuickActions } from '../components/home/QuickActions';
import { DateFilterDropdown } from '../components/home/DateFilterDropdown';

// Import hooks and services
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { useVaultManagement } from '../hooks/VaultContext';
import { useAuthContext } from '../context/AuthContext';

interface HomeScreenProps {
  isConnected: boolean;
  vaultStatus: string;
  setVaultStatus: (status: string) => void;
  hasActiveAlarm: boolean;
  setHasActiveAlarm: (status: boolean) => void;
  onNavigateToSettings?: () => void;
  onNavigateToActivity?: () => void;
}

export default function HomeScreen({
  isConnected,
  vaultStatus,
  setVaultStatus,
  hasActiveAlarm,
  setHasActiveAlarm,
  onNavigateToSettings,
  onNavigateToActivity,
}: HomeScreenProps) {
  const navigation = useNavigation();
  const { user } = useAuthContext();
  const { currentVault, selectVault, availableVaults } = useVaultManagement();
  const {
    metrics,
    recentActivity,
    refreshData,
    isRefreshing,
    selectedDateFilter,
    setSelectedDateFilter
  } = useHomeDashboard();

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isClearingAlarm, setIsClearingAlarm] = useState(false);

  const handleRemoteUnlock = () => {
    if (!isConnected || vaultStatus === 'unlocked') return;

    setIsUnlocking(true);
    Alert.alert(
      'Remote Unlock',
      'Confirm vault unlock request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setIsUnlocking(false),
        },
        {
          text: 'Unlock',
          style: 'destructive',
          onPress: () => {
            setVaultStatus('unlocked');
            setIsUnlocking(false);
            setTimeout(() => {
              setVaultStatus('locked');
            }, 30000);
          },
        },
      ]
    );
  };

  const handleClearAlarm = () => {
    if (!hasActiveAlarm) return;

    setIsClearingAlarm(true);
    Alert.alert(
      'Clear Alarm',
      'Are you sure you want to clear the security alarm?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setIsClearingAlarm(false),
        },
        {
          text: 'Clear',
          onPress: () => {
            setHasActiveAlarm(false);
            setIsClearingAlarm(false);
          },
        },
      ]
    );
  };

  const handleVaultPress = (vault: any) => {
    selectVault(vault.vault_id);
    console.log('🏠 HomeScreen: Selected vault:', vault.vault_name || vault.vault_id);
  };

  const handleViewAllActivity = () => {
    // Navigate to Activity tab
    navigation.navigate('Activity' as never);
  };

  const handleSettingsPress = () => {
    if (onNavigateToSettings) {
      onNavigateToSettings();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-default dark:bg-bg-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-text-dark text-2xl font-bold">
                🏠 SmartVault
              </Text>
              <Text className="text-text-dark text-base mt-1 opacity-70">
                Welcome back, {user?.username || 'User'}!
              </Text>
            </View>
            
          </View>
        </View>

        {/* Date Filter */}
        <View className="px-6 mb-4">
          <DateFilterDropdown
            selectedOption={selectedDateFilter}
            onOptionChange={setSelectedDateFilter}
            disabled={isRefreshing}
          />
        </View>

        {/* Dashboard Metrics */}
        <AnalyticsCards
          metrics={metrics}
          onRefresh={refreshData}
          isRefreshing={isRefreshing}
        />

        {/* Vault Grid */}
        <VaultGrid
          vaults={availableVaults}
          onVaultPress={handleVaultPress}
          isLoading={metrics.isLoading}
        />

        {/* Quick Actions */}
        <QuickActions
          onRemoteUnlock={handleRemoteUnlock}
          onClearAlarm={handleClearAlarm}
          onSettings={handleSettingsPress}
          isConnected={isConnected}
          vaultStatus={vaultStatus}
          hasActiveAlarm={hasActiveAlarm}
          isUnlocking={isUnlocking}
          isClearingAlarm={isClearingAlarm}
        />

        {/* Recent Activity */}
        <ActivityFeed
          activities={recentActivity}
          onViewAll={handleViewAllActivity}
          onRefresh={refreshData}
          isLoading={metrics.isLoading}
          isRefreshing={isRefreshing}
        />

        {/* Connection Status */}
        <View
          className="mx-6 mb-6 p-4 bg-surface-default dark:bg-surface-dark rounded-xl border border-border-default dark:border-border-dark"
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
      </ScrollView>
    </SafeAreaView>
  );
}