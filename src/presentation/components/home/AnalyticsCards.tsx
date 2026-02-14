import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Activity,
  TrendingUp,
  RefreshCw,
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

const MetricCard = ({ title, value, icon: Icon, variant = 'dark' }: any) => (
    <View className={`flex-1 p-6 rounded-[24px] border ${variant === 'light' ? 'bg-white border-white' : 'bg-zinc-950 border-zinc-900'}`}>
        <View className="flex-row items-center justify-between mb-4">
            <Text className={`text-[10px] font-black uppercase tracking-widest ${variant === 'light' ? 'text-zinc-500' : 'text-zinc-600'}`}>
                {title}
            </Text>
            <Icon size={16} color={variant === 'light' ? 'black' : 'white'} strokeWidth={2.5} />
        </View>
        <Text className={`text-4xl font-black tracking-tighter ${variant === 'light' ? 'text-black' : 'text-white'}`}>
            {value}
        </Text>
    </View>
);

export const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({
  metrics,
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-2">
          <View className="w-1.5 h-6 bg-white rounded-full" />
          <Text className="text-white text-xl font-black uppercase tracking-tighter ml-1">
            System Data
          </Text>
        </View>
        {onRefresh && (
          <TouchableOpacity 
            onPress={onRefresh} 
            disabled={isRefreshing}
            className="bg-white p-2 rounded-lg"
          >
            <RefreshCw
              size={14}
              color="black"
              strokeWidth={3}
              style={isRefreshing ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row gap-4">
        <MetricCard 
            title="Total Access"
            value={metrics.isLoading ? '--' : metrics.todayAccessCount}
            icon={Activity}
            variant="light"
        />
        <MetricCard 
            title="Stability"
            value={metrics.isLoading ? '--' : `${metrics.successRate}%`}
            icon={TrendingUp}
        />
      </View>
    </View>
  );
};