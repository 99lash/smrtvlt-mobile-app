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

    <View className="bg-bg-default rounded-2xl p-3 mt-2">
      <Text className="text-text-dark text-sm mb-1">
        <Text className="font-medium">NFC UID:</Text> {nfcData.uid}
      </Text>
      <Text className="text-text-dark text-sm mb-1">
        <Text className="font-medium">Detected:</Text> {formatDate(nfcData.created_at)}
      </Text>
      {nfcData.vault_id && (
        <Text className="text-white text-sm">
          <Text className="font-medium">Vault:</Text> {nfcData.vault_id}
        </Text>
      )}
    </View>

  );
});