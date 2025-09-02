// src/shared/components/SecondaryButton.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function SecondaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
}: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className={`px-6 py-3 rounded-[10px] flex-row justify-center items-center ${
        disabled ? 'bg-neutral-muted' : ' bg-secondary'
      }`}
      style={style}
    >
      {loading && (
        <ActivityIndicator color="#fff" className="mr-2" />
      )}
      <Text className="text-white font-semibold text-base">{title}</Text>
    </TouchableOpacity>
  );
}
