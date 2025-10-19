import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { NFCCardDisplay } from '../nfc/NFCCardDisplay';

interface NFCCardFormProps {
  nfcData: any; // NFC data from the hook
  cardName: string;
  error: string | null;
  loading: boolean;
  onCardNameChange: (name: string) => void;
}

export const NFCCardForm: React.FC<NFCCardFormProps> = ({
  nfcData,
  cardName,
  error,
  loading,
  onCardNameChange,
}) => {
  return (
    <View className="py-4">
      {error && (
        <View className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4">
          <Text className="text-red-400 text-sm text-center mb-2">
            {error}
          </Text>
        </View>
      )}

      <NFCCardDisplay
        nfcData={nfcData}
        title="Recent NFC Card Detected"
      />

      {/* NFC Card Name Input */}
      <View className="mt-4">
        <TextInput
          className="bg-surface-dark border border-gray-600 rounded-lg px-3 py-2 text-white"
          placeholder="Enter Card Name"
          placeholderTextColor="#9ca3af"
          value={cardName}
          onChangeText={onCardNameChange}
          maxLength={50}
          editable={!loading}
        />
        <Text className="text-muted-default text-xs mt-1">
          Give your NFC card a memorable name to easily identify it later
        </Text>
      </View>
    </View>
  );
};