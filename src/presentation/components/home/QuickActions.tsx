import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Unlock,
  AlertTriangle,
  Settings,
  Smartphone,
  RefreshCw
} from 'lucide-react-native';

interface QuickActionsProps {
  onRemoteUnlock?: () => void;
  onClearAlarm?: () => void;
  onSettings?: () => void;
  isConnected: boolean;
  vaultStatus: string;
  hasActiveAlarm: boolean;
  isUnlocking?: boolean;
  isClearingAlarm?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onRemoteUnlock,
  onClearAlarm,
  onSettings,
  isConnected,
  vaultStatus,
  hasActiveAlarm,
  isUnlocking = false,
  isClearingAlarm = false,
}) => {
  const isUnlockDisabled = !isConnected || vaultStatus === 'unlocked' || isUnlocking;
  const isAlarmDisabled = !hasActiveAlarm || isClearingAlarm;

  return (
    <View
      className="bg-surface-default dark:bg-surface-dark rounded-xl p-6 mb-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center gap-2 mb-4">
        <Smartphone size={20} color="#2563eb" />
        <Text className="text-text-dark dark:text-text-dark text-lg font-semibold">
          Quick Actions
        </Text>
      </View>

      <View className="gap-3">
        {/* Remote Unlock */}
        <TouchableOpacity
          className={`flex-row items-center gap-3 p-4 rounded-lg border ${
            isUnlockDisabled
              ? 'bg-surface-active/50 dark:bg-border-dark/50 border-border-default/50 dark:border-border-dark/50'
              : 'bg-surface-active dark:bg-border-dark border-border-default dark:border-border-dark active:bg-surface-active/80 dark:active:bg-border-dark/80'
          }`}
          onPress={onRemoteUnlock}
          disabled={isUnlockDisabled}
          activeOpacity={0.7}
        >
          <View className={`p-2 rounded-full ${isUnlockDisabled ? 'bg-border-default/50 dark:bg-border-dark/50' : 'bg-primary/20'}`}>
            <Unlock
              size={16}
              color={isUnlockDisabled ? '#64748b' : '#2563eb'}
            />
          </View>
          <View className="flex-1">
            <Text className={`text-sm font-medium ${isUnlockDisabled ? 'text-muted-default dark:text-muted-dark' : 'text-text-dark dark:text-text-dark'}`}>
              Remote Unlock
            </Text>
            <Text className="text-xs text-muted-default dark:text-muted-dark mt-0.5">
              {isUnlocking
                ? 'Unlocking...'
                : isUnlockDisabled
                  ? vaultStatus === 'unlocked'
                    ? 'Vault already unlocked'
                    : 'Vault offline'
                  : 'Unlock vault remotely'
              }
            </Text>
          </View>
          {isUnlocking && <RefreshCw size={16} color="#2563eb" className="animate-spin" />}
        </TouchableOpacity>

        {/* Clear Alarm */}
        <TouchableOpacity
          className={`flex-row items-center gap-3 p-4 rounded-lg border ${
            isAlarmDisabled
              ? 'bg-surface-active/50 dark:bg-border-dark/50 border-border-default/50 dark:border-border-dark/50'
              : 'bg-surface-active dark:bg-border-dark border-border-default dark:border-border-dark active:bg-surface-active/80 dark:active:bg-border-dark/80'
          }`}
          onPress={onClearAlarm}
          disabled={isAlarmDisabled}
          activeOpacity={0.7}
        >
          <View className={`p-2 rounded-full ${isAlarmDisabled ? 'bg-border-default/50 dark:bg-border-dark/50' : 'bg-warning/20'}`}>
            <AlertTriangle
              size={16}
              color={isAlarmDisabled ? '#64748b' : '#f59e0b'}
            />
          </View>
          <View className="flex-1">
            <Text className={`text-sm font-medium ${isAlarmDisabled ? 'text-muted-default dark:text-muted-dark' : 'text-text-dark dark:text-text-dark'}`}>
              Clear Alarm
            </Text>
            <Text className="text-xs text-muted-default dark:text-muted-dark mt-0.5">
              {isClearingAlarm
                ? 'Clearing...'
                : isAlarmDisabled
                  ? 'No active alarms'
                  : 'Dismiss security alarm'
              }
            </Text>
          </View>
          {isClearingAlarm && <RefreshCw size={16} color="#f59e0b" className="animate-spin" />}
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          className="flex-row items-center gap-3 p-4 rounded-lg border bg-surface-active dark:bg-border-dark border-border-default dark:border-border-dark active:bg-surface-active/80 dark:active:bg-border-dark/80"
          onPress={onSettings}
          activeOpacity={0.7}
        >
          <View className="p-2 rounded-full bg-primary/20">
            <Settings size={16} color="#2563eb" />
          </View>
          <View className="flex-1">
            <Text className="text-text-dark dark:text-text-dark text-sm font-medium">
              Device Settings
            </Text>
            <Text className="text-xs text-muted-default dark:text-muted-dark mt-0.5">
              Configure vault preferences
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};