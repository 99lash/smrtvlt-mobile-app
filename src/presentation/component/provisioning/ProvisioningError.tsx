import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
interface ProvisioningErrorProps {
  error?: { message: string } | null;
  permissionGranted?: boolean | null;
}

const ProvisioningError: React.FC<ProvisioningErrorProps> = ({
  error,
  permissionGranted,
}) => {
  if (!error && permissionGranted !== false) return null;

  if (error) {
    return (
      <View className="border border-red-300 bg-red-50 rounded-xl p-3 flex-row items-center gap-x-2 mb-4">
        <AlertCircle size={16} color="#dc2626" />
        <Text className="text-red-700 text-xs flex-1">{error.message}</Text>
      </View>
    );
  }

  if (permissionGranted === false) {
    return (
      <View className="border border-orange-300 bg-orange-50 rounded-xl p-3 flex-row items-center gap-x-2 mb-4">
        <AlertCircle size={16} color="#ea580c" />
        <Text className="text-orange-700 text-xs flex-1">
          Bluetooth permissions required to scan for devices
        </Text>
      </View>
    );
  }

  return null;
};

export default ProvisioningError;
