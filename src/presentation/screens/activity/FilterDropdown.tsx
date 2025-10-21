import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, Calendar } from 'lucide-react-native';
import { ACTIVITY_COLORS, ICON_SIZES } from '../../../utils/activityConstants';

interface FilterDropdownProps {
  value: string;
  onPress: () => void;
  placeholder: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  onPress,
  placeholder,
  showIcon = false,
  icon
}) => {
  return (
    <TouchableOpacity
      className="bg-neutral-surface rounded-lg px-3 py-3 flex-row items-center"
      onPress={onPress}
    >
      {showIcon && icon && (
        <View className="mr-1">
          {icon}
        </View>
      )}
      <Text className="text-white text-sm mr-1 flex-1">{value}</Text>
      <ChevronDown size={ICON_SIZES.small} color={ACTIVITY_COLORS.neutral} />
    </TouchableOpacity>
  );
};

interface DateFilterProps {
  value: string;
  onPress: () => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ value, onPress }) => {
  return (
    <FilterDropdown
      value={value}
      onPress={onPress}
      placeholder="Date"
      showIcon={true}
      icon={<Calendar size={ICON_SIZES.small} color={ACTIVITY_COLORS.neutral} />}
    />
  );
};