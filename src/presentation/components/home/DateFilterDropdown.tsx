import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { ChevronDown, Calendar } from 'lucide-react-native';
import CustomModal from '../../component/modals/CustomModal';

export interface DateFilterOption {
  label: string;
  value: number;
  key: string;
}

export const DATE_FILTER_OPTIONS: readonly DateFilterOption[] = [
  { label: 'Last 24 Hours', value: 1, key: '1day' },
  { label: 'Last 7 Days', value: 7, key: '7days' },
  { label: 'Last 30 Days', value: 30, key: '30days' },
  { label: 'Last 90 Days', value: 90, key: '90days' }
] as const;

interface DateFilterDropdownProps {
  selectedOption: DateFilterOption;
  onOptionChange: (option: DateFilterOption) => void;
  disabled?: boolean;
}

export const DateFilterDropdown: React.FC<DateFilterDropdownProps> = ({
  selectedOption,
  onOptionChange,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const handleOptionSelect = (option: DateFilterOption) => {
    onOptionChange(option);
    setIsVisible(false);
  };

  const renderOption = ({ item }: { item: DateFilterOption }) => (
    <TouchableOpacity
      className={`p-4 border-b border-border-light dark:border-border-dark ${
        item.key === selectedOption.key
          ? 'bg-primary-light/10 dark:bg-primary-dark/10'
          : 'bg-surface-default dark:bg-surface-dark'
      }`}
      onPress={() => handleOptionSelect(item)}
      disabled={disabled}
    >
      <Text
        className={`text-sm font-medium ${
          item.key === selectedOption.key
            ? 'text-primary'
            : 'text-text-default dark:text-text-dark'
        }`}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        className={`flex-row items-center justify-between p-3 rounded-lg border border-border-light dark:border-border-dark bg-surface-default dark:bg-surface-dark ${
          disabled ? 'opacity-50' : ''
        }`}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
      >
        <View className="flex-row items-center gap-2">
          <Calendar size={16} color="#64748b" />
          <Text className="text-text-default dark:text-text-dark text-sm font-medium">
            {selectedOption.label}
          </Text>
        </View>
        <ChevronDown size={16} color="#64748b" />
      </TouchableOpacity>

      <CustomModal
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        title="Select Time Range"
      >
        <FlatList
          data={DATE_FILTER_OPTIONS}
          renderItem={renderOption}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          className="max-h-64"
        />
      </CustomModal>
    </>
  );
};