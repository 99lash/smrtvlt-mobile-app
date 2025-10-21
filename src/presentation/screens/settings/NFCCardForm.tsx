import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { NFCCardDisplay } from '../../component/nfc/NFCCardDisplay';
import { AccessLimits } from '../../../types/AccessLimits';

interface NFCCardFormProps {
  nfcData: any; // NFC data from the hook
  cardName: string;
  error: string | null;
  loading: boolean;
  onCardNameChange: (name: string) => void;
  limits?: AccessLimits | null;
}

export const NFCCardForm: React.FC<NFCCardFormProps> = ({
  nfcData,
  cardName,
  error,
  loading,
  onCardNameChange,
  limits,
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
          className="bg-surface-default border border-gray-600 rounded-2xl px-3 py-3 text-text-default"
          placeholder="Enter Card Name"
          placeholderTextColor="#64748b"
          value={cardName}
          onChangeText={onCardNameChange}
          maxLength={50}
          editable={!loading}
        />
        <Text className="text-muted-default text-xs mt-1">
          {limits?.role === 'member' 
            ? 'This card will be assigned to you automatically'
            : 'Give your NFC card a memorable name to easily identify it later'
          }
        </Text>
      </View>
    </View>
  );
};