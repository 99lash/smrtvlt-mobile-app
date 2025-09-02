  // src/shared/components/PrimaryButton.tsx
  import React from 'react';
  import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, View } from 'react-native';

  interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    icon?: React.ReactNode; 
  }

  export default function PrimaryButton({
    title,
    onPress,
    disabled = false,
    loading = false,
    style,
    icon,
  }: PrimaryButtonProps) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        className={`px-6 py-3 rounded-[10px] flex-row justify-center items-center ${
          disabled ? 'bg-neutral-muted' : 'bg-primary'
        }`}
        style={style}
      >
        {loading && (
          <ActivityIndicator color="#fff" className="mr-2" />
        )}
        {icon && <View className="mr-4 ">{icon}</View>}
        
        <Text className="text-neutral-text font-semibold text-base">{title}</Text>
      </TouchableOpacity>
    );
  }
