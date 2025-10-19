import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
import { ACTIVITY_COLORS, ICON_SIZES } from '../../../utils/activityConstants';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search activities..."
}) => {
  return (
    <View className="flex-1 bg-bg-default rounded-lg px-3 py-3 flex-row items-center border border-border-default">
      <Search size={ICON_SIZES.small} color={ACTIVITY_COLORS.neutral} />
      <TextInput
        className="flex-1 text-neutral-text ml-2"
        placeholder={placeholder}
        placeholderTextColor={ACTIVITY_COLORS.neutral}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};