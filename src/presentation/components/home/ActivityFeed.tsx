import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Info,
  RefreshCw,
  Activity
} from 'lucide-react-native';

interface RecentActivity {
  id: number;
  type: 'success' | 'failed' | 'info';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface ActivityFeedProps {
  activities: RecentActivity[];
  onViewAll?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
}

interface ActivityItemProps {
  activity: RecentActivity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    const iconSize = 20;
    switch (type) {
      case 'success':
        return <CheckCircle size={iconSize} color="#22c55e" />;
      case 'failed':
        return <AlertTriangle size={iconSize} color="#ef4444" />;
      case 'info':
        return <Info size={iconSize} color="#3b82f6" />;
      default:
        return <Clock size={iconSize} color="#64748b" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success-light/20';
      case 'failed':
        return 'bg-error-light/20';
      case 'info':
        return 'bg-info-light/20';
      default:
        return 'bg-surface-active dark:bg-border-dark';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <View className={`flex-row items-start gap-3 p-3 rounded-lg ${getActivityBgColor(activity.type)}`}>
      <View className="mt-0.5">
        {getActivityIcon(activity.type)}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-text-default dark:text-text-dark font-medium text-sm">
            {activity.title}
          </Text>
          <Text className="text-muted-default dark:text-muted-dark text-xs">
            {formatTimestamp(activity.timestamp)}
          </Text>
        </View>

        <Text className="text-muted-default dark:text-muted-dark text-sm mb-1">
          {activity.description}
        </Text>

        {activity.user && (
          <Text className="text-muted-default dark:text-muted-dark text-xs">
            by {activity.user}
          </Text>
        )}
      </View>
    </View>
  );
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onViewAll,
  onRefresh,
  isLoading = false,
  isRefreshing = false
}) => {
  if (isLoading) {
    return (
      <View className="bg-surface-default dark:bg-surface-dark rounded-xl p-6 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Activity size={20} color="#2563eb" />
            <Text className="text-text-default dark:text-text-dark text-lg font-semibold">
              Recent Activity
            </Text>
          </View>
          {onRefresh && (
            <TouchableOpacity onPress={onRefresh} disabled={isRefreshing}>
              <RefreshCw size={20} color={isRefreshing ? '#64748b' : '#2563eb'} />
            </TouchableOpacity>
          )}
        </View>

        <View className="gap-3">
          {[1, 2, 3].map((i) => (
            <View key={i} className="flex-row items-start gap-3 p-3 bg-surface-active dark:bg-border-dark rounded-lg animate-pulse">
              <View className="w-5 h-5 bg-border-default dark:bg-border-dark rounded mt-0.5" />
              <View className="flex-1">
                <View className="h-4 bg-border-default dark:bg-border-dark rounded mb-2" />
                <View className="h-3 bg-border-default dark:bg-border-dark rounded w-3/4" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View className="bg-surface-default dark:bg-surface-dark rounded-xl p-6 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Activity size={20} color="#2563eb" />
            <Text className="text-text-default dark:text-text-dark text-lg font-semibold">
              Recent Activity
            </Text>
          </View>
          {onRefresh && (
            <TouchableOpacity onPress={onRefresh} disabled={isRefreshing}>
              <RefreshCw size={20} color={isRefreshing ? '#64748b' : '#2563eb'} />
            </TouchableOpacity>
          )}
        </View>

        <View className="items-center py-8">
          <Clock size={48} color="#64748b" />
          <Text className="text-muted-default dark:text-muted-dark text-center mt-4">
            No recent activity
          </Text>
          <Text className="text-muted-default dark:text-muted-dark text-center text-sm mt-2">
            Activity will appear here when vaults are accessed
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-surface-default dark:bg-surface-dark rounded-xl p-6 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Activity size={20} color="#2563eb" />
          <Text className="text-text-default dark:text-text-dark text-lg font-semibold">
            Recent Activity ({activities.length})
          </Text>
        </View>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} disabled={isRefreshing}>
            <RefreshCw size={20} color={isRefreshing ? '#64748b' : '#2563eb'} />
          </TouchableOpacity>
        )}
      </View>

      <View className="gap-3 mb-4">
        {activities.slice(0, 5).map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </View>

      {onViewAll && activities.length >= 5 && (
        <TouchableOpacity
          className="p-3 rounded-lg border border-border-default dark:border-border-dark items-center"
          onPress={onViewAll}
          activeOpacity={0.7}
        >
          <Text className="text-text-default dark:text-text-dark text-sm font-medium">
            View All Activity
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};