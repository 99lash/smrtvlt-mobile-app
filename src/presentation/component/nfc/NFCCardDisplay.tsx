import React from 'react';
import { View, Text } from 'react-native';
import { NFCLogData } from '../../hooks/useNFCLogs';
import { formatNFCCardDisplay } from '../../../utils/nfcUtils';

interface NFCCardDisplayProps {
  nfcData: NFCLogData;
  title?: string;
}

export const NFCCardDisplay: React.FC<NFCCardDisplayProps> = React.memo(({ nfcData, title }) => {
  const formatDate = (dateString: string): string => {
    // Handle null, undefined, or empty string
    if (!dateString || dateString.trim() === '') {
      return 'Unknown time';
    }

    try {
      // Handle different ISO format variations
      let normalizedDateString = dateString.trim();

      // Handle different date formats
      if (normalizedDateString.includes('T')) {
        // Already in ISO format with T separator
        normalizedDateString = normalizedDateString;
      } else if (normalizedDateString.includes(' ')) {
        // Convert space separator to T
        normalizedDateString = normalizedDateString.replace(' ', 'T');
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedDateString)) {
        // Just date, add current time
        normalizedDateString = normalizedDateString + 'T' + new Date().toTimeString().slice(0, 8);
      }

      const date = new Date(normalizedDateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  return (
    <>
      {/* <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 bg-blue-400 rounded-full items-center justify-center mr-3">
          <Text className="text-white text-sm font-bold">NFC</Text>
        </View> 
        <View className="flex-1">
          <Text className="text-white text-base font-medium">
            Card ID: {formatNFCCardDisplay(nfcData.uid)}
          </Text>
          <Text className="text-muted-default text-sm">
            Device: {nfcData.device_id}
          </Text>
        </View>
      </View> */}

      <View className="bg-gray-700 rounded-lg p-3 mt-2">
        <Text className="text-white text-sm mb-1">
          <Text className="font-medium">NFC UID:</Text> {nfcData.uid}
        </Text>
        <Text className="text-white text-sm mb-1">
          <Text className="font-medium">Detected:</Text> {formatDate(nfcData.created_at)}
        </Text>
        {nfcData.vault_id && (
          <Text className="text-white text-sm">
            <Text className="font-medium">Vault:</Text> {nfcData.vault_id}
          </Text>
        )}
      </View>

      {/* <View className="mt-3 px-3 py-2 bg-blue-900 rounded-lg">
        <Text className="text-blue-100 text-sm text-center">
          Tap "Register" to add this NFC card to your vault
        </Text>
      </View> */}
    </>
  );
});