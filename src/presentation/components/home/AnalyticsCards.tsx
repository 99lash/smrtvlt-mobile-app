import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react-native';

interface AnalyticsCardsProps {
  metrics: {
    totalVaults: number;
    todayAccessCount: number;
    successRate: number;
    failedAttempts: number;
    lastActivity: string | null;
    isLoading: boolean;
    error: string | null;
  };
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({
  metrics,
  onRefresh,
  isRefreshing = false
}) => {
  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return 'No recent activity';

    const date = new Date(lastActivity);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return '#22c55e'; // Green
    if (rate >= 80) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const getSuccessRateIcon = (rate: number) => {
    if (rate >= 95) return <TrendingUp size={20} color="#22c55e" />;
    if (rate >= 80) return <Activity size={20} color="#eab308" />;
    return <AlertTriangle size={20} color="#ef4444" />;
  };

  if (metrics.error) {
    return (
      <View className="bg-surface-default dark:bg-surface-dark rounded-xl p-6 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <AlertTriangle size={20} color="#ef4444" />
            <Text className="text-text-dark dark:text-text-dark text-lg font-semibold">
              Dashboard Error
            </Text>
          </View>
          {onRefresh && (
            <TouchableOpacity onPress={onRefresh} disabled={isRefreshing}>
              <RefreshCw size={20} color={isRefreshing ? '#64748b' : '#2563eb'} />
            </TouchableOpacity>
          )}
        </View>

        <View className="bg-error-light/20 rounded-lg p-4">
          <Text className="text-error text-sm mb-2">Failed to load dashboard data</Text>
          <Text className="text-muted-default dark:text-muted-dark text-sm">
            {metrics.error}
          </Text>
        </View>
      </View>
    );
  }

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
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Activity size={20} color="#2563eb" />
          <Text className="text-text-dark dark:text-text-dark text-lg font-semibold">
            Dashboard Summary
          </Text>
        </View>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} disabled={isRefreshing}>
            <RefreshCw
              size={20}
              color={isRefreshing ? '#64748b' : '#2563eb'}
              style={isRefreshing ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Metrics Grid */}
      <View className="flex-row flex-wrap gap-3 mb-4">
        {/* Total Vaults */}
        <View className="flex-1 min-w-[100px] bg-surface-active dark:bg-border-dark rounded-lg p-4 items-center">
          <Shield size={24} color="#2563eb" />
          <Text className="text-text-dark dark:text-text-dark text-xl font-bold mt-2">
            {metrics.isLoading ? '...' : metrics.totalVaults}
          </Text>
          <Text className="text-muted-default dark:text-muted-dark text-xs mt-1">
            Total Vaults
          </Text>
        </View>

        {/* Today's Access */}
        <View className="flex-1 min-w-[100px] bg-surface-active dark:bg-border-dark rounded-lg p-4 items-center">
          <Activity size={24} color="#10b981" />
          <Text className="text-text-dark dark:text-text-dark text-xl font-bold mt-2">
            {metrics.isLoading ? '...' : metrics.todayAccessCount}
          </Text>
          <Text className="text-muted-default dark:text-muted-dark text-xs mt-1">
            Today
          </Text>
        </View>

        {/* Success Rate */}
        <View className="flex-1 min-w-[100px] bg-surface-active dark:bg-border-dark rounded-lg p-4 items-center">
          {getSuccessRateIcon(metrics.successRate)}
          <Text
            className="text-xl font-bold mt-2"
            style={{ color: getSuccessRateColor(metrics.successRate) }}
          >
            {metrics.isLoading ? '...' : `${metrics.successRate}%`}
          </Text>
          <Text className="text-muted-default dark:text-muted-dark text-xs mt-1">
            Success Rate
          </Text>
        </View>

        {/* Failed Attempts */}
        <View className="flex-1 min-w-[100px] bg-surface-active dark:bg-border-dark rounded-lg p-4 items-center">
          <AlertTriangle size={24} color="#f59e0b" />
          <Text className="text-text-dark dark:text-text-dark text-xl font-bold mt-2">
            {metrics.isLoading ? '...' : metrics.failedAttempts}
          </Text>
          <Text className="text-muted-default dark:text-muted-dark text-xs mt-1">
            Failed Today
          </Text>
        </View>
      </View>

      {/* Last Activity */}
      <View className="flex-row items-center gap-2 p-3 bg-surface-active dark:bg-border-dark rounded-lg">
        <Info size={16} color="#64748b" />
        <Text className="text-muted-default dark:text-muted-dark text-sm flex-1">
          Last activity: {formatLastActivity(metrics.lastActivity)}
        </Text>
      </View>
    </View>
  );
};