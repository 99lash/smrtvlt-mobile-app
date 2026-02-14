import React from 'react';
import { View, Text } from 'react-native';
import { ActivityLog } from '../../../types/ActivityTypes';

interface ActivityCardProps {
  log: ActivityLog;
}

export const ActivityCard: React.FC<ActivityCardProps> = React.memo(({ log }) => {
  const isFailed = log.status === 'failed';

  return (
    <View 
      className="bg-surface-default rounded-3xl p-6 mb-4 border border-zinc-800 shadow-xl"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      <View className="flex-row items-start">
        <View className="flex-1">
          {/* Header Row */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-default text-xl font-black uppercase tracking-tighter">
              {log.title}
            </Text>
            <View className={`${isFailed ? 'bg-white' : 'bg-zinc-800'} px-3 py-1 rounded-lg`}>
              <Text className={`${isFailed ? 'text-black' : 'text-white'} text-[10px] font-black uppercase tracking-widest`}>
                {log.status}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text className="text-muted-default text-sm font-medium mb-4 leading-5">
            {log.description}
          </Text>

          {/* Footer Row */}
          <View className="flex-row items-center justify-between border-t border-zinc-800 pt-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-black border border-zinc-700 rounded-full items-center justify-center mr-3">
                <Text className="text-white text-xs font-black">
                  {log.user.initials}
                </Text>
              </View>
              <View>
                <Text className="text-text-default text-sm font-black uppercase tracking-tighter">
                    {log.user.name}
                </Text>
                <Text className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                    Authorized User
                </Text>
              </View>
            </View>
            <Text className="text-zinc-500 text-[10px] font-black uppercase">
              {log.timestamp}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});