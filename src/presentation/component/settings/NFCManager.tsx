import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  Plus,
  CreditCard,
  Settings,
  RefreshCw,
  Trash2,
  User,
} from 'lucide-react-native';
import ButtonSecondary from '../buttons/ButtonSecondary';
import { useAuthContext } from '../../context/AuthContext';
import { useNFCLogs } from '../../hooks/useNFCLogs';
import { NFCCardDisplay } from '../nfc/NFCCardDisplay';
import CustomModal from '../modals/CustomModal';
import { NFCCardService } from '../../../service/NFCCardService';
import { StorageService } from '../../../config/api';
import { ApiError } from '../../../service/ApiService';

interface NFCManagerProps {
  currentVaultId: number | null;
  vaultsLoading: boolean;
}

export const NFCManager: React.FC<NFCManagerProps> = ({
  currentVaultId,
  vaultsLoading,
}) => {
  const { user } = useAuthContext();
  const [nfcModalVisible, setNfcModalVisible] = useState(false);
  const [manageNfcModalVisible, setManageNfcModalVisible] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null,
  );
  const [nfcCardName, setNfcCardName] = useState<string>('');
  const [nfcCards, setNfcCards] = useState<any[]>([]);
  const [nfcCardsLoading, setNfcCardsLoading] = useState(false);
  const [nfcCardsError, setNfcCardsError] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<number | null>(null);

  const {
    getMostRecentNFC,
    loading: nfcLoading,
    error: nfcError,
    isAuthenticated,
    refreshNFCLogs,
    forceRefresh,
    handleLogout: handleNFCLogout,
  } = useNFCLogs(currentVaultId || undefined);

  const handleRegisterNFC = async () => {
    if (!currentVaultId) {
      Alert.alert(
        'No Vault Selected',
        'Please wait for vaults to load or select a vault first.',
      );
      return;
    }

    try {
      await refreshNFCLogs();
      await new Promise(resolve => setTimeout(resolve, 500));
      setNfcModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh NFC logs. Please try again.');
    }
  };

  const handleRetryLogin = () => {
    handleNFCLogout();
    Alert.alert(
      'Authentication Required',
      'Please log in again to access NFC card data.',
      [{ text: 'OK' }],
    );
  };

  const resetForm = () => {
    setNfcCardName('');
    setRegistrationError(null);
  };

  const handleManageNFC = () => {
    if (!currentVaultId) {
      Alert.alert(
        'No Vault Selected',
        'Please wait for vaults to load or select a vault first.',
      );
      return;
    }

    setManageNfcModalVisible(true);
  };

  const fetchNfcCards = async () => {
    if (!currentVaultId) return;

    try {
      setNfcCardsLoading(true);
      setNfcCardsError(null);

      const token = await StorageService.getAccessToken();
      const result = await NFCCardService.getCardsByVault(
        currentVaultId,
        token || undefined,
      );

      if (result.success && result.data) {
        setNfcCards(result.data || []);
      } else {
        setNfcCardsError(result.error || 'Failed to fetch NFC cards');
        setNfcCards([]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch NFC cards';
      setNfcCardsError(errorMessage);
    } finally {
      setNfcCardsLoading(false);
    }
  };

  const handleDeleteNfcCard = (card: any) => {
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
  };

  const confirmDeleteNfcCard = async (cardId: number) => {
    try {
      setDeletingCardId(cardId);
      const token = await StorageService.getAccessToken();
      await NFCCardService.hardDeleteCard(cardId, token || undefined);

      Alert.alert('Success', 'NFC card permanently deleted!');
      fetchNfcCards(); // Refresh the list after deletion
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete NFC card';
      Alert.alert('Error', errorMessage);
    } finally {
      setDeletingCardId(null);
    }
  };

  // Load NFC cards when manage modal opens
  useEffect(() => {
    if (manageNfcModalVisible) {
      fetchNfcCards();
    }
  }, [manageNfcModalVisible, currentVaultId]);

  // Helper function to validate JWT token format and basic structure
  const validateTokenFormat = (token: string): boolean => {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Check if token looks like a JWT (basic validation)
    try {
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // Helper function to get a valid token with retry logic and validation
  const getValidToken = async (retries: number = 2): Promise<string | null> => {
    for (let i = 0; i <= retries; i++) {
      try {
        const token = await StorageService.getAccessToken();

        if (!token) {
          if (i < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }

        if (validateTokenFormat(token)) {
          return token;
        } else {
          if (i < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    return null;
  };

  const handleNFCRegistered = async (retryCount: number = 0) => {
    if (!getMostRecentNFC()) {
      Alert.alert('Error', 'No NFC card data available for registration.');
      return;
    }

    if (!user?.id) {
      Alert.alert(
        'Authentication Error',
        'Please log in again to register NFC cards.',
      );
      return;
    }

    try {
      setRegistrationLoading(true);
      setRegistrationError(null);

      // Use the robust token fetching helper
      const token = await getValidToken();

      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in again to register NFC cards.',
        );
        return;
      }

      const result = await NFCCardService.registerCard(
        getMostRecentNFC()!.uid,
        user?.id,
        token,
        currentVaultId || undefined, // Add vault_id parameter, handle null case
        nfcCardName.trim() || undefined, // Add name parameter, trim whitespace and send undefined if empty
      );

      if (result.success && result.data) {
        // Force refresh the NFC logs to update registration status and filter out registered cards
        await forceRefresh();

        // Reset form and close modal since the card should no longer be available for registration
        resetForm();
        setNfcModalVisible(false);

        const cardName = nfcCardName.trim() || 'NFC Card';
        Alert.alert(
          'Success',
          `${cardName} "${result.data.uid}" registered successfully to your account!`,
          [{ text: 'OK' }],
        );
      } else {
        setRegistrationError(result.error || 'Failed to register NFC card');
        Alert.alert(
          'Registration Failed',
          result.error || 'Failed to register NFC card',
        );
      }
    } catch (error) {
      console.error('❌ NFC Registration failed with error:', error);

      // Enhanced error handling for ApiError
      if (error instanceof ApiError) {
        console.error('❌ === API ERROR DEBUG ===');
        console.error('❌ ApiError status:', error.status);
        console.error('❌ ApiError message:', error.message);
        console.error('❌ ApiError body:', error.body);

        if (error.status === 401) {
          console.log('🚫 Authentication token expired or invalid');
          console.log(
            '🔍 This suggests the backend rejected the token despite it being present',
          );

          if (retryCount < 1) {
            console.log('🔄 Retrying NFC registration with fresh token...');
            setRegistrationLoading(false);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
            return handleNFCRegistered(retryCount + 1);
          } else {
            console.log('❌ Max retries reached, prompting user to login');
            Alert.alert(
              'Authentication Required',
              'Your session has expired. Please log in again to register NFC cards.',
            );
          }
        } else {
          // Other API errors
          const errorMessage = error.message || 'Unknown API error occurred';
          console.error('❌ === API ERROR DEBUG END ===');
          setRegistrationError(errorMessage);
          Alert.alert('Error', `Registration failed: ${errorMessage}`);
        }
      } else {
        // Handle non-API errors
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('❌ Non-API error:', errorMessage);
        console.error('❌ Error type:', error?.constructor?.name);
        setRegistrationError(errorMessage);
        Alert.alert('Error', `Registration failed: ${errorMessage}`);
      }
    } finally {
      setRegistrationLoading(false);
    }
  };

  const renderModalContent = () => {
    if (!currentVaultId) {
      return (
        <View className="items-center py-8">
          <Text className="text-white text-lg mb-2">No Vault Selected</Text>
          <Text className="text-muted-default text-center mb-4">
            Please select a vault first before registering NFC cards.
          </Text>
        </View>
      );
    }

    if (nfcLoading) {
      return (
        <View className="items-center py-8">
          <Text className="text-white text-lg">Loading NFC data...</Text>
        </View>
      );
    }

    if (!isAuthenticated) {
      return (
        <View className="items-center py-8">
          <Text className="text-white text-lg mb-2">
            Authentication Required
          </Text>
          <Text className="text-muted-default text-center mb-4">
            {nfcError ||
              'Your session has expired. Please log in again to access NFC card data.'}
          </Text>
          <View className="flex-row space-x-3 w-full mt-4">
            <TouchableOpacity
              className="flex-1 bg-primary px-4 py-3 rounded-lg items-center"
              onPress={handleRetryLogin}
            >
              <Text className="text-white font-medium">Log In Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-gray-600 px-4 py-3 rounded-lg items-center"
              onPress={() => setNfcModalVisible(false)}
            >
              <Text className="text-white font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (getMostRecentNFC()) {
      return (
        <View className="py-4">
          {registrationError && (
            <View className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4">
              <Text className="text-red-400 text-sm text-center mb-2">
                {registrationError}
              </Text>
            </View>
          )}
          <NFCCardDisplay
            nfcData={getMostRecentNFC()!}
            title="Recent NFC Card Detected"
          />

          {/* NFC Card Name Input */}
          <View className="mt-4">
            {/* <Text className="text-white text-sm mb-2">Card Name (Optional)</Text> */}
            <TextInput
              className="bg-surface-dark border border-gray-600 rounded-lg px-3 py-2 text-white"
              placeholder="Enter Card Name"
              placeholderTextColor="#9ca3af"
              value={nfcCardName}
              onChangeText={setNfcCardName}
              maxLength={50}
            />
            <Text className="text-muted-default text-xs mt-1">
              Give your NFC card a memorable name to easily identify it later
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="items-center py-8">
        <Text className="text-white text-lg mb-2">
          No Unregistered NFC Cards Found
        </Text>
        <Text className="text-muted-default text-center mb-4">
          All recent NFC cards are already registered, or no new NFC card
          activity was detected. Please ensure an unregistered NFC card was
          recently presented to the vault.
        </Text>
      </View>
    );
  };

  // // Add retry function for NFC registration
  // const retryNFCRegistration = async () => {
  //   console.log('🔄 Retrying NFC registration...');
  //   await handleNFCRegistered();
  // };

  const getModalActions = () => {
    if (!isAuthenticated) {
      return {
        primaryAction: undefined,
        secondaryAction: {
          label: 'Close',
          onPress: () => setNfcModalVisible(false),
        },
      };
    }

    if (!currentVaultId || nfcLoading) {
      return {
        primaryAction: undefined,
        secondaryAction: {
          label: 'Close',
          onPress: () => setNfcModalVisible(false),
        },
      };
    }

    if (getMostRecentNFC()) {
      return {
        primaryAction: {
          label: registrationLoading ? 'Registering...' : 'Register Card',
          onPress: handleNFCRegistered,
          loading: registrationLoading,
          disabled: registrationLoading,
        },
        secondaryAction: {
          label: 'Cancel',
          onPress: () => setNfcModalVisible(false),
        },
      };
    }

    return {
      primaryAction: undefined,
      secondaryAction: {
        label: 'Close',
        onPress: () => setNfcModalVisible(false),
      },
    };
  };

  return (
    <>
      <View className="bg-surface-dark rounded-lg p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <CreditCard size={20} color="#60a5fa" />
          <Text className="text-white text-lg font-semibold ml-2">
            NFC-Card Management
          </Text>
        </View>
        <Text className="text-muted-default mb-4">
          Create and manage NFC-Card id for vault access
        </Text>

        {/* Button Container */}
        <View className="gap-3">
          <ButtonSecondary
            title="Register New NFC-Card"
            onPress={handleRegisterNFC}
            icon={<Plus size={20} />}
            disabled={!currentVaultId || vaultsLoading}
          />

          <ButtonSecondary
            title="Manage NFC-Cards"
            onPress={handleManageNFC}
            icon={<Settings size={20} />}
            disabled={!currentVaultId || vaultsLoading}
          />
        </View>
      </View>

      <CustomModal
        visible={nfcModalVisible}
        onClose={() => {
          setNfcModalVisible(false);
          resetForm();
        }}
        title="Register NFC Card"
        icon={<CreditCard size={24} color="#60a5fa" />}
        iconPosition="left"
        primaryAction={getModalActions().primaryAction}
        secondaryAction={getModalActions().secondaryAction}
      >
        {renderModalContent()}
      </CustomModal>

      {/* Manage NFC Cards Modal */}
      <CustomModal
        visible={manageNfcModalVisible}
        onClose={() => setManageNfcModalVisible(false)}
        title="Manage NFC Cards"
        icon={<Settings size={20} color="#60a5fa" />}
        primaryAction={{
          label: 'Refresh',
          onPress: fetchNfcCards,
          loading: nfcCardsLoading,
        }}
      >
        <View className="max-h-96">
          {nfcCardsLoading ? (
            <View className="py-8 items-center">
              <Text className="text-muted-default">Loading NFC cards...</Text>
            </View>
          ) : nfcCardsError ? (
            <View className="py-8 items-center">
              <Text className="text-red-400 mb-2">Error loading NFC cards</Text>
              <Text className="text-muted-default text-sm">
                {nfcCardsError}
              </Text>
            </View>
          ) : nfcCards.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-muted-default mb-2">
                No NFC cards found
              </Text>
              <Text className="text-muted-default text-sm">
                Register your first NFC card to get started
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {nfcCards.map(card => (
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
                      onPress={() => handleDeleteNfcCard(card)}
                      disabled={deletingCardId === card.id}
                    >
                      {deletingCardId === card.id ? (
                        <RefreshCw size={16} color="#ef4444" />
                      ) : (
                        <Trash2 size={16} color="#ef4444" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </CustomModal>
    </>
  );
};
