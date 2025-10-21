import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { NFCManagerService } from '../../../../service/NFCManagerService';
import { NFCCard, NFCManagerState, NFCRegistrationState } from '../../../../types/NFCCardTypes';

interface UseNFCCardManagementProps {
  currentVaultId: number | null;
  onRegistrationSuccess?: (card: NFCCard) => void;
  onDeleteSuccess?: () => void;
}

export const useNFCCardManagement = ({
  currentVaultId,
  onRegistrationSuccess,
  onDeleteSuccess,
}: UseNFCCardManagementProps) => {
  // NFC Cards state
  const [nfcCards, setNfcCards] = useState<NFCCard[]>([]);
  const [nfcCardsLoading, setNfcCardsLoading] = useState(false);
  const [nfcCardsError, setNfcCardsError] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<number | null>(null);

  // Registration state
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [nfcCardName, setNfcCardName] = useState<string>('');

  /**
   * Fetches NFC cards for the current vault
   */
  const fetchNfcCards = useCallback(async () => {
    if (!currentVaultId) {
      console.log('⚠️ fetchNfcCards: No currentVaultId provided');
      setNfcCards([]);
      return;
    }

    try {
      console.log('🔍 fetchNfcCards: Starting fetch for vault:', currentVaultId);
      setNfcCardsLoading(true);
      setNfcCardsError(null);

      const result = await NFCManagerService.fetchNFCCards(currentVaultId);
      console.log('📱 fetchNfcCards: API response:', result);

      if (result.success && result.data) {
        console.log('✅ fetchNfcCards: Successfully fetched', result.data.length, 'NFC cards');
        setNfcCards(result.data);
      } else {
        console.error('❌ fetchNfcCards: API error:', result.error);
        setNfcCardsError(result.error || 'Failed to fetch NFC cards');
        setNfcCards([]);
      }
    } catch (error) {
      console.error('❌ fetchNfcCards: Exception occurred:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch NFC cards';
      setNfcCardsError(errorMessage);
      setNfcCards([]);
    } finally {
      setNfcCardsLoading(false);
    }
  }, [currentVaultId]);

  /**
   * Deletes an NFC card
   */
  const deleteNfcCard = useCallback(async (card: NFCCard) => {
    Alert.alert(
      'Permanently Delete NFC Card',
      `⚠️ WARNING: This will permanently delete NFC card "${card.nfc_card_name || card.nfc_card_uid}" from the database.\n\nThis action cannot be undone!`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => confirmDeleteNfcCard(card.nfc_card_id),
        },
      ],
    );
  }, []);

  /**
   * Confirms and executes NFC card deletion
   */
  const confirmDeleteNfcCard = useCallback(async (cardId: number) => {
    try {
      setDeletingCardId(cardId);

      const result = await NFCManagerService.deleteNFCCard(cardId);

      if (result.success) {
        Alert.alert('Success', 'NFC card permanently deleted!');
        await fetchNfcCards(); // Refresh the list after deletion
        onDeleteSuccess?.(); // Refresh access limits
      } else {
        Alert.alert('Error', result.error || 'Failed to delete NFC card');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete NFC card';
      Alert.alert('Error', errorMessage);
    } finally {
      setDeletingCardId(null);
    }
  }, [fetchNfcCards]);

  /**
   * Registers a new NFC card
   */
  const registerNfcCard = useCallback(async (
    uid: string,
    userId: number,
    retryCount: number = 0
  ) => {
    try {
      setRegistrationLoading(true);
      setRegistrationError(null);

      const result = await NFCManagerService.registerNFCCard(
        uid,
        userId,
        currentVaultId || undefined,
        nfcCardName.trim() || undefined,
      );

      if (result.success && result.data) {
        // Reset form and show success message
        setNfcCardName('');
        setRegistrationError(null);

        const cardName = nfcCardName.trim() || 'NFC Card';
        Alert.alert(
          'Success',
          `${cardName} "${result.data.nfc_card_uid}" registered successfully to your account!`,
          [{ text: 'OK' }],
        );

        console.log('🎯 Calling onRegistrationSuccess callback with card:', result.data.nfc_card_uid);
        onRegistrationSuccess?.(result.data);
        return true;
      } else {
        setRegistrationError(result.error || 'Failed to register NFC card');
        Alert.alert(
          'Registration Failed',
          result.error || 'Failed to register NFC card',
        );
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      setRegistrationError(errorMessage);
      Alert.alert('Error', `Registration failed: ${errorMessage}`);
      return false;
    } finally {
      setRegistrationLoading(false);
    }
  }, [currentVaultId, nfcCardName, onRegistrationSuccess]);

  /**
   * Resets the registration form
   */
  const resetRegistrationForm = useCallback(() => {
    setNfcCardName('');
    setRegistrationError(null);
  }, []);

  // Load NFC cards when vault changes or manage modal opens
  useEffect(() => {
    fetchNfcCards();
  }, [fetchNfcCards]);

  const nfcManagerState: NFCManagerState = {
    nfcCards,
    loading: nfcCardsLoading,
    error: nfcCardsError,
    deletingCardId,
  };

  const registrationState: NFCRegistrationState = {
    loading: registrationLoading,
    error: registrationError,
    cardName: nfcCardName,
  };

  return {
    // State
    nfcManagerState,
    registrationState,

    // Actions
    fetchNfcCards,
    deleteNfcCard,
    registerNfcCard,
    resetRegistrationForm,

    // Setters
    setNfcCardName,
  };
};