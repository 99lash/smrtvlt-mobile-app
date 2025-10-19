import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Shield,
  Unlock,
  Battery,
  AlertTriangle,
  CheckCircle,
  Clock,
  Smartphone,
  Settings,
  Activity,
} from 'lucide-react-native';

interface DashboardProps {
  isConnected: boolean;
  vaultStatus: string;
  setVaultStatus: (status: string) => void;
  hasActiveAlarm: boolean;
  setHasActiveAlarm: (status: boolean) => void;
}

export default function HomeScreen({
  isConnected,
  vaultStatus,
  setVaultStatus,
  hasActiveAlarm,
  setHasActiveAlarm,
}: DashboardProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);

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

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Vault Unlocked', time: '2 min ago', status: 'success' },
    { id: 2, user: 'Jane Smith', action: 'Face Recognition Failed', time: '15 min ago', status: 'error' },
    { id: 3, user: 'Admin', action: 'New User Added', time: '1 hour ago', status: 'info' },
  ];

  const getActivityIcon = (status: string) => {
    const iconSize = 16;
    switch (status) {
      case 'success':
        return <CheckCircle size={iconSize} color="#22c55e" />;
      case 'error':
        return <AlertTriangle size={iconSize} color="#f87171" />;
      default:
        return <Clock size={iconSize} color="#0ea5e9" />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-default dark:bg-bg-dark pt-6">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 16 }}>
        {/* Vault Status Card */}
        <View className="bg-surface-default dark:bg-surface-dark rounded-[10px] p-6 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  vaultStatus === 'locked'
                    ? 'bg-success-light/30'
                    : 'bg-error-light/30'
                }`}
              >
                {vaultStatus === 'locked' ? (
                  <Shield size={24} color="#22c55e" />
                ) : (
                  <Unlock size={24} color="#f87171" />
                )}
              </View>
              <View>
                <Text className="text-text-default dark:text-text-dark text-lg font-heading font-semibold">
                  Vault Status
                </Text>
                <Text className="text-muted-default dark:text-muted-dark text-sm">
                  Main Safe
                </Text>
              </View>
            </View>
            <View
              className={`px-3 py-1.5 rounded-full ${
                vaultStatus === 'locked' ? 'bg-success' : 'bg-error'
              }`}
            >
              <Text className="text-white text-xs font-semibold">
                {vaultStatus === 'locked' ? 'Secured' : 'Unlocked'}
              </Text>
            </View>
          </View>

          <View className="flex-row mb-4">
            <View className="flex-1 items-center">
              <Text className="text-text-default dark:text-text-dark text-2xl font-medium">
                4
              </Text>
              <Text className="text-muted-default dark:text-muted-dark text-sm mt-1">
                Authorized Users
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-text-default dark:text-text-dark text-2xl font-medium">
                12
              </Text>
              <Text className="text-muted-default dark:text-muted-dark text-sm mt-1">
                Access Today
              </Text>
            </View>
          </View>

          {/* Battery Status */}
          <View className="flex-row items-center gap-3 mb-4">
            <Battery size={16} color="#64748b" />
            <View className="flex-1">
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-text-default dark:text-text-dark text-sm">
                  Battery Level
                </Text>
                <Text className="text-text-default dark:text-text-dark text-sm font-medium">
                  85%
                </Text>
              </View>
              <View className="h-2 bg-border-default dark:bg-border-dark rounded-full overflow-hidden">
                <View className="h-full bg-primary rounded-full" style={{ width: '85%' }} />
              </View>
            </View>
          </View>

          {/* Connection Status */}
          <View className="flex-row items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle size={16} color="#22c55e" />
                <Text className="text-success text-sm">Connected to WiFi</Text>
              </>
            ) : (
              <>
                <AlertTriangle size={16} color="#eab308" />
                <Text className="text-warning text-sm">Offline - Using local mode</Text>
              </>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-surface-default dark:bg-surface-dark rounded-[10px] p-6 mb-4 shadow-sm">
          <View className="flex-row items-center gap-2 mb-4">
            <Smartphone size={20} color="#2563eb" />
            <Text className="text-text-default dark:text-text-dark text-lg font-heading font-semibold">
              Quick Actions
            </Text>
          </View>

          <View className="gap-3">
            <TouchableOpacity
              className={`flex-row items-center gap-2 p-4 bg-surface-active dark:bg-border-dark rounded-[10px] border border-border-default dark:border-border-dark ${
                (!isConnected || vaultStatus === 'unlocked' || isUnlocking) && 'opacity-50'
              }`}
              onPress={handleRemoteUnlock}
              disabled={!isConnected || vaultStatus === 'unlocked' || isUnlocking}
              activeOpacity={0.7}
            >
              <Unlock size={16} color={!isConnected || vaultStatus === 'unlocked' ? '#64748b' : '#0f172a'} />
              <Text className="text-text-default dark:text-text-dark text-sm font-medium">
                Remote Unlock
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center gap-2 p-4 bg-surface-active dark:bg-border-dark rounded-[10px] border border-border-default dark:border-border-dark ${
                !hasActiveAlarm && 'opacity-50'
              }`}
              onPress={() => setHasActiveAlarm(false)}
              disabled={!hasActiveAlarm}
              activeOpacity={0.7}
            >
              <AlertTriangle size={16} color={hasActiveAlarm ? '#0f172a' : '#64748b'} />
              <Text className="text-text-default dark:text-text-dark text-sm font-medium">
                Clear Alarm
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-2 p-4 bg-surface-active dark:bg-border-dark rounded-[10px] border border-border-default dark:border-border-dark"
              activeOpacity={0.7}
            >
              <Settings size={16} color="#0f172a" />
              <Text className="text-text-default dark:text-text-dark text-sm font-medium">
                Device Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="bg-surface-default dark:bg-surface-dark rounded-[10px] p-6 mb-4 shadow-sm">
          <View className="flex-row items-center gap-2 mb-4">
            <Activity size={20} color="#2563eb" />
            <Text className="text-text-default dark:text-text-dark text-lg font-heading font-semibold">
              Recent Activity
            </Text>
          </View>

          <View className="gap-3 mb-3">
            {recentActivity.map((activity) => (
              <View
                key={activity.id}
                className="flex-row items-center gap-3 p-3 bg-surface-active dark:bg-border-dark rounded-[10px]"
              >
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    activity.status === 'success'
                      ? 'bg-success-light/30'
                      : activity.status === 'error'
                      ? 'bg-error-light/30'
                      : 'bg-info-light/30'
                  }`}
                >
                  {getActivityIcon(activity.status)}
                </View>
                <View className="flex-1">
                  <Text className="text-text-default dark:text-text-dark text-sm font-medium">
                    {activity.action}
                  </Text>
                  <Text className="text-muted-default dark:text-muted-dark text-xs mt-0.5">
                    {activity.user}
                  </Text>
                </View>
                <Text className="text-muted-default dark:text-muted-dark text-xs">
                  {activity.time}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            className="p-3 rounded-[10px] border border-border-default dark:border-border-dark items-center"
            activeOpacity={0.7}
          >
            <Text className="text-text-default dark:text-text-dark text-sm font-medium">
              View All Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View className="bg-surface-default dark:bg-surface-dark rounded-[10px] p-6 mb-4 shadow-sm">
          <View className="flex-row items-center gap-2 mb-4">
            <AlertTriangle size={20} color="#2563eb" />
            <Text className="text-text-default dark:text-text-dark text-lg font-heading font-semibold">
              Notifications
            </Text>
          </View>

          <View className="p-3 bg-warning-light/20 rounded-[10px] mb-3">
            <View className="flex-row items-start gap-3">
              <AlertTriangle size={16} color="#eab308" />
              <View className="flex-1">
                <Text className="text-text-default dark:text-text-dark text-sm">
                  System check scheduled for tonight
                </Text>
                <Text className="text-muted-default dark:text-muted-dark text-xs mt-1">
                  2 hours ago
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className="p-3 rounded-[10px] border border-border-default dark:border-border-dark items-center"
            activeOpacity={0.7}
          >
            <Text className="text-text-default dark:text-text-dark text-sm font-medium">
              View All Notifications
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}