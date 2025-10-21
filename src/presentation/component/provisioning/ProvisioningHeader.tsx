import React from 'react';
import { View, Text } from 'react-native';

interface ProvisioningHeaderProps {
  message: string; // the text to display
}

const ProvisioningHeader: React.FC<ProvisioningHeaderProps> = ({ message }) => (
  <View className="mb-4">
    <View className="border border-border-dark rounded-xl p-3 flex-row items-center gap-x-2">
      <Text className="text-muted-default dark:text-text-dark text-xs flex-1 text-center">{message}</Text>
    </View>
  </View>
);

export default ProvisioningHeader;


