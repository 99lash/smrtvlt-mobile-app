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
    <View className="bg-neutral-surface rounded-lg p-4 mb-3">
      <View className="flex-row items-start">
        <View className="mr-3 mt-1">
          <StatusIcon status={log.status} />
        </View>
        <View className="mr-3 mt-1">
          <EventIcon eventType={log.eventType} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-bg-default text-base font-medium">
              {log.title}
            </Text>
            <View className={`${getStatusColor()} px-2 py-1 rounded-full`}>
              <Text className="text-white text-xs font-medium">
                {getStatusText()}
              </Text>
            </View>
          </View>
          <Text className="text-bg-default text-sm mb-1">
            {log.description}
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-2">
                <Text className="text-white text-xs font-bold">
                  {log.user.initials}
                </Text>
              </View>
              <Text className="text-neutral-muted text-sm">
                {log.user.name}
              </Text>
            </View>
            <Text className="text-neutral-muted text-sm">
              {log.timestamp}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});