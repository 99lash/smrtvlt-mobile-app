import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CreditCard, User, RefreshCw, Trash2 } from 'lucide-react-native';
import { NFCCard } from '../../../types/NFCCardTypes';

interface NFCCardListProps {
  cards: NFCCard[];
  loading: boolean;
  error: string | null;
  deletingCardId: number | null;
  onDeleteCard: (card: NFCCard) => void;
  onRefresh: () => void;
}

export const NFCCardList: React.FC<NFCCardListProps> = ({
  cards,
  loading,
  error,
  deletingCardId,
  onDeleteCard,
  onRefresh,
}) => {
  if (loading) {
    return (
      <View className="py-8 items-center">
        <Text className="text-muted-default">Loading NFC cards...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-8 items-center">
        <Text className="text-red-400 mb-2">Error loading NFC cards</Text>
        <Text className="text-muted-default text-sm">{error}</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View className="py-8 items-center">
        <Text className="text-muted-default mb-2">No NFC cards found</Text>
        <Text className="text-muted-default text-sm">
          Register your first NFC card to get started
        </Text>
      </View>
    );
  }

  return (
    <View className="max-h-96">
      <ScrollView showsVerticalScrollIndicator={false}>
        {cards.map(card => (
          <View
            key={card.nfc_card_id}
            className="bg-surface-dark rounded-lg p-3 mb-2"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <CreditCard size={16} color="#60a5fa" />
                  <Text className="text-white font-mono text-lg ml-2">
                    {card.nfc_card_name || card.nfc_card_uid}
                  </Text>
                </View>

                {/* Display username - always show if available */}
                {card.username && card.username !== 'Unassigned' && (
                  <View className="flex-row items-center mb-1">
                    <User size={12} color="#60a5fa" />
                    <Text className="text-muted-default text-xs ml-1">
                      Assigned to: {card.username}
                    </Text>
                  </View>
                )}

                <Text className="text-muted-default text-xs">
                  UID: {card.nfc_card_uid}
                </Text>
              </View>
              <TouchableOpacity
                className="p-2"
                onPress={() => onDeleteCard(card)}
                disabled={deletingCardId === card.nfc_card_id}
              >
                {deletingCardId === card.nfc_card_id ? (
                  <RefreshCw size={16} color="#ef4444" />
                ) : (
                  <Trash2 size={16} color="#ef4444" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};