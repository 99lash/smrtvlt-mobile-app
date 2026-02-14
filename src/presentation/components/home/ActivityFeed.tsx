import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Clock,
  RefreshCw,
  Activity,
  ChevronRight
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

const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const isFailed = activity.type === 'failed';

  return (
    <View className="flex-row items-center gap-4 p-6 rounded-[24px] border bg-zinc-950 border-zinc-900 mb-4">
      <View className={`w-14 h-14 rounded-2xl items-center justify-center bg-black border ${isFailed ? 'border-white' : 'border-zinc-800'}`}>
        <View className={`w-2 h-2 rounded-full ${isFailed ? 'bg-white' : 'bg-zinc-600'}`} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-white font-black text-sm uppercase tracking-tight">
            {activity.title}
          </Text>
          <Text className="text-zinc-600 text-[9px] font-black uppercase">
            {activity.timestamp}
          </Text>
        </View>

        <Text className="text-zinc-500 text-xs font-medium leading-4 mb-1">
          {activity.description}
        </Text>

        {activity.user && (
          <Text className="text-zinc-700 text-[8px] font-black uppercase tracking-widest">
            AUTH: {activity.user}
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
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-2">
          <View className="w-1.5 h-6 bg-white rounded-full" />
          <Text className="text-white text-xl font-black uppercase tracking-tighter ml-1">
            Activity
          </Text>
        </View>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} disabled={isRefreshing}>
            <RefreshCw size={14} color="white" strokeWidth={3} style={isRefreshing ? { transform: [{ rotate: '180deg' }] } : undefined} />
          </TouchableOpacity>
        )}
      </View>

      <View>
        {isLoading ? (
          <View>
            {[1, 2].map((i) => (
              <View key={i} className="h-24 bg-zinc-950 rounded-[24px] mb-4 animate-pulse border border-zinc-900" />
            ))}
          </View>
        ) : activities.length === 0 ? (
          <View className="py-12 items-center bg-zinc-950 rounded-[24px] border border-dashed border-zinc-900">
            <Clock size={32} color="#27272A" />
            <Text className="text-zinc-700 font-black uppercase text-[10px] tracking-widest mt-4">Buffer Empty</Text>
          </View>
        ) : (
          <View>
            {activities.slice(0, 3).map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
        )}
      </View>

      {onViewAll && activities.length >= 3 && (
        <TouchableOpacity
          className="p-5 rounded-[24px] border border-zinc-900 items-center bg-zinc-950 active:bg-zinc-900 flex-row justify-center gap-2 mt-2"
          onPress={onViewAll}
          activeOpacity={0.7}
        >
          <Text className="text-white text-[10px] font-black uppercase tracking-[3px]">
            SYSTEM LOGS
          </Text>
          <ChevronRight size={14} color="white" strokeWidth={3} />
        </TouchableOpacity>
      )}
    </View>
  );
};