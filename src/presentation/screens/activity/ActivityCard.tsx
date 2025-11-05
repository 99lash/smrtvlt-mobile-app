import React from 'react';
import { View, Text } from 'react-native';
import { ActivityLog, ActivityStatus } from '../../../types/ActivityTypes';
import { ACTIVITY_COLORS, ACTIVITY_STATUS_LABELS } from '../../../utils/activityConstants';
import { StatusIcon } from './StatusIcon';
import { EventIcon } from './EventIcon';

interface ActivityCardProps {
  log: ActivityLog;
}

export const ActivityCard: React.FC<ActivityCardProps> = React.memo(({ log }) => {
  const getStatusColor = (): string => {
    switch (log.status) {
      case 'success':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusText = (): string => {
    return ACTIVITY_STATUS_LABELS[log.status];
  };

  return (
    <View className="bg-bg-default rounded-lg p-4 mb-3"
    style={{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderRadius: 24,
      paddingVertical: 12,
      paddingHorizontal: 16,
    }}
    >
      <View className="flex-row items-start">
        <View className="flex-1 ml-2">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-text-dark text-base font-medium">
              {log.title}
            </Text>
            <View className={`${getStatusColor()} px-2 py-1 rounded-full`}>
              <Text className="text-white text-xs font-medium">
                {getStatusText()}
              </Text>
            </View>
          </View>
          <Text className="text-text-dark text-xs mb-1">
            {log.description}
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-2">
                <Text className="text-white text-xs font-bold">
                  {log.user.initials}
                </Text>
              </View>
              <Text className="text-text-dark text-sm">
                {log.user.name}
              </Text>
            </View>
            <Text className="text-text-dark text-sm opacity-70">
              {log.timestamp}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});