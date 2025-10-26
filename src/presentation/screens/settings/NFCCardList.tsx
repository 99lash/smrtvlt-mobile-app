import React from 'react';
import { View, Text } from 'react-native';
import { CreditCard, User, RefreshCw, Trash2 } from 'lucide-react-native';
import { NFCCard } from '../../../types/NFCCardTypes';
import BorderedList from '../../component/lists/BorderedList';
import { WarningMessage } from '../../component/common/WarningMessage';

interface NFCCardListProps {
  cards: NFCCard[];
  loading: boolean;
  error: string | null;
  deletingCardId: number | null;
  onDeleteCard: (card: NFCCard) => void;
  onRefresh: () => void;
  isAdmin?: boolean;
  currentUserId?: number;
  currentVaultId?: number;
}

export const NFCCardList: React.FC<NFCCardListProps> = ({
  cards,
  loading,
  error,
  deletingCardId,
  onDeleteCard,
  onRefresh,
  isAdmin = false,
  currentUserId,
  currentVaultId,
}) => {
  // Filter cards based on user role and vault
  const filteredCards = React.useMemo(() => {
    console.log('🔍 NFCCardList: Filtering cards. Total cards:', cards.length, 'isAdmin:', isAdmin, 'currentUserId:', currentUserId, 'currentVaultId:', currentVaultId);
    
    // Add detailed card information logging
    console.log('📋 NFCCardList: All cards details:');
    cards.forEach((card, index) => {
      console.log(`  Card ${index + 1}:`, {
        id: card.nfc_card_id,
        uid: card.nfc_card_uid,
        name: card.nfc_card_name,
        vault_id: card.vault_id,
        user_id: card.user_id,
        username: card.username
      });
    });
    
    // Backend already handles authorization, so we just use the cards as returned
    console.log('🏠 NFCCardList: Using cards as returned by backend (authorization handled server-side)');
    return cards;
  }, [cards, isAdmin, currentUserId, currentVaultId]);

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

  if (filteredCards.length === 0) {
    const message = isAdmin 
      ? "No NFC cards found in this vault. Tap and scan your NFC card in your smartvault device to get started."
      : "No NFC cards found. You haven't registered any NFC cards in this vault yet.";
    return (
      <WarningMessage
        message={message}
      />
    );
  }

  return (
    <BorderedList
      data={filteredCards}
      keyExtractor={(card) => card.nfc_card_id.toString()}
      maxVisibleItems={5}
      itemHeight={90}
      renderItem={(card) => (
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <CreditCard size={16} color="#60a5fa" />
            <Text className="text-text-default font-mono text-lg ml-2">
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
      )}
      rightContentExtractor={(card) => 
        isAdmin ? (
          <View className="p-2">
            {deletingCardId === card.nfc_card_id ? (
              <RefreshCw size={16} color="#ef4444" />
            ) : (
              <Trash2 size={16} color="#ef4444" />
            )}
          </View>
        ) : null
      }
      onItemPress={isAdmin ? ((card) => onDeleteCard(card)) : undefined}
      className="max-h-96"
    />
  );
};