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
      className={`p-5 border-b border-border-default ${
        item.key === selectedOption.key
          ? 'bg-primary-default/20'
          : 'bg-surface-default'
      }`}
      onPress={() => handleOptionSelect(item)}
      disabled={disabled}
    >
      <Text
        className={`text-base font-bold ${
          item.key === selectedOption.key
            ? 'text-primary-default'
            : 'text-text-default'
        }`}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        className={`flex-row items-center justify-between p-4 rounded-2xl border border-border-default bg-surface-default ${
          disabled ? 'opacity-50' : ''
        }`}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center gap-3">
          <Calendar size={18} color="#1055C9" />
          <Text className="text-text-default text-sm font-bold tracking-wide">
            {selectedOption.label}
          </Text> 
        </View>
        <ChevronDown size={18} color="#64748b" />
      </TouchableOpacity>

      <CustomModal
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        title="Select Time Range"
      >
        <View className="bg-bg-default rounded-3xl overflow-hidden">
            <FlatList
            data={DATE_FILTER_OPTIONS}
            renderItem={renderOption}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // CustomModal already has ScrollView
            />
        </View>
      </CustomModal>
    </>
  );
};