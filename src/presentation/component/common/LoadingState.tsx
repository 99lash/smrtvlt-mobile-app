import React from 'react';
import { Text } from 'react-native';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  className = "text-muted-default mb-4"
}) => {
  return (
    <Text className={className}>
      {message}
    </Text>
  );
};