import React from 'react';
import { View, Text } from 'react-native';

interface ProvisioningHeaderProps {
  message: string; // the text to display
}

const ProvisioningHeader: React.FC<ProvisioningHeaderProps> = ({ message }) => (
  <View className="mb-4">
    <View className="border border-neutral-border rounded-xl p-3 flex-row items-start gap-x-2">
      <Text className="text-neutral-text text-xs flex-1">{message}</Text>
    </View>
  </View>
);

export default ProvisioningHeader;


