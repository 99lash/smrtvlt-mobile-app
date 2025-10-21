import React from 'react';
import { View, Text } from 'react-native';

interface UsageMeterProps {
  current: number;
  limit: number | null; // null means unlimited
  label: string;
  showProgressBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const UsageMeter: React.FC<UsageMeterProps> = ({
  current,
  limit,
  label,
  showProgressBar = true,
  size = 'md',
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          text: 'text-xs',
          progressHeight: 'h-1',
        };
      case 'md':
        return {
          text: 'text-sm',
          progressHeight: 'h-2',
        };
      case 'lg':
        return {
          text: 'text-base',
          progressHeight: 'h-3',
        };
      default:
        return {
          text: 'text-sm',
          progressHeight: 'h-2',
        };
    }
  };

  const getUsageColor = () => {
    if (limit === null) {
      return {
        text: 'text-blue-600',
        progress: 'bg-blue-500',
        background: 'bg-blue-100',
      };
    }

    const percentage = (current / limit) * 100;
    
    if (percentage >= 100) {
      return {
        text: 'text-red-600',
        progress: 'bg-red-500',
        background: 'bg-red-100',
      };
    } else if (percentage >= 80) {
      return {
        text: 'text-yellow-600',
        progress: 'bg-yellow-500',
        background: 'bg-yellow-100',
      };
    } else {
      return {
        text: 'text-green-600',
        progress: 'bg-green-500',
        background: 'bg-green-100',
      };
    }
  };

  const sizeConfig = getSizeConfig();
  const colorConfig = getUsageColor();
  
  const displayLimit = limit === null ? '∞' : limit.toString();
  const percentage = limit === null ? 0 : Math.min((current / limit) * 100, 100);

  return (
    <View className="w-full">
      <View className="flex-row justify-between items-center mb-1">
        <Text className={`font-medium ${sizeConfig.text} text-gray-700`}>
          {label}
        </Text>
        <Text className={`font-semibold ${sizeConfig.text} ${colorConfig.text}`}>
          {current}/{displayLimit}
        </Text>
      </View>
      
      {showProgressBar && (
        <View className={`w-full ${colorConfig.background} rounded-full overflow-hidden`}>
          <View
            className={`${colorConfig.progress} ${sizeConfig.progressHeight} rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </View>
      )}
      
      {limit !== null && current >= limit && (
        <Text className="text-red-500 text-xs mt-1 font-medium">
          Limit reached
        </Text>
      )}
      
      {limit !== null && current === limit - 1 && limit > 1 && (
        <Text className="text-yellow-600 text-xs mt-1 font-medium">
          Almost at limit
        </Text>
      )}
    </View>
  );
};