import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress: () => void;
}

export default function ListItem({ title, subtitle, icon, onPress }: ListItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200"
    >
      <View className="flex-row items-center">
        {icon && <View className="mr-4">{icon}</View>}
        <View>
          <Text className="text-neutral text-base font-medium">{title}</Text>
          {subtitle && <Text className="text-neutral-muted text-xs">{subtitle}</Text>}
        </View>
      </View>
      
        <ChevronRight className="w-25 h-25"/>
    </TouchableOpacity>
  );
}
