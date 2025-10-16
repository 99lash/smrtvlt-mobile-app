import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Plus, CreditCard } from 'lucide-react-native';
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
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null,
  );

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

  // Helper function to validate JWT token format and basic structure
  const validateTokenFormat = (token: string): boolean => {
    if (!token || typeof token !== 'string') {
      console.log('❌ Token validation failed: Token is not a string or is empty');
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ Token validation failed: Token does not have 3 parts');
      console.log('❌ Token parts:', parts.length, 'expected: 3');
      return false;
    }

    // Check if token looks like a JWT (basic validation)
    try {
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      console.log('🔍 Token payload preview:', {
        exp: payload.exp,
        iat: payload.iat,
        currentTime: currentTime,
        isExpired: payload.exp ? payload.exp < currentTime : 'no-exp-field'
      });

      if (payload.exp && payload.exp < currentTime) {
        console.log('❌ Token validation failed: Token is expired');
        console.log(`❌ Expired at: ${new Date(payload.exp * 1000)}`);
        console.log(`❌ Current time: ${new Date(currentTime * 1000)}`);
        return false;
      }

      return true;
    } catch (error) {
      console.log('❌ Token validation failed: Cannot decode token payload');
      console.error('❌ Decode error:', error);
      return false;
    }
  };

  // Helper function to get a valid token with retry logic and validation
  const getValidToken = async (retries: number = 2): Promise<string | null> => {
    for (let i = 0; i <= retries; i++) {
      try {
        console.log(`🔑 Token fetch attempt ${i + 1}/${retries + 1}`);
        const token = await StorageService.getAccessToken();

        if (!token) {
          console.log('⚠️ No token found in storage');
          if (i < retries) {
            console.log('⏳ Waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }

        console.log('🔍 Validating token format and expiration...');
        console.log('🔑 Token length:', token.length);
        console.log('🔑 Token preview:', `${token.substring(0, 30)}...`);

        if (validateTokenFormat(token)) {
          console.log('✅ Token validation passed');
          return token;
        } else {
          console.log('❌ Token validation failed');
          if (i < retries) {
            console.log('⏳ Waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error(`❌ Token fetch attempt ${i + 1} failed:`, error);
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    console.log('❌ All token fetch attempts failed');
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

      // Enhanced token debugging
      console.log('🔍 === NFC REGISTRATION DEBUG ===');
      console.log('🔑 Attempting to get valid token for registration...');

      // Use the robust token fetching helper
      const token = await getValidToken();

      if (!token) {
        console.log('❌ No valid token available for NFC registration');
        Alert.alert(
          'Authentication Required',
          'Please log in again to register NFC cards.',
        );
        return;
      }

      console.log('🔑 NFC Registration - Token obtained successfully');
      console.log('🔑 NFC Registration - Token preview:', `${token.substring(0, 20)}...`);
      console.log('🔑 NFC Registration - Token length:', token.length);

      // Additional token debugging before API call
      console.log('🔍 === PRE-REGISTRATION TOKEN DEBUG ===');
      console.log('🔑 Full token (first 50 chars):', token.substring(0, 50));
      console.log('🔑 Token structure check:', token.split('.').length === 3 ? 'Valid JWT structure' : 'Invalid JWT structure');
      console.log('🔍 === END PRE-REGISTRATION DEBUG ===');

      const result = await NFCCardService.registerCard(
        getMostRecentNFC()!.uid,
        user?.id,
        token,
        currentVaultId || undefined, // Add vault_id parameter, handle null case
      );

      if (result.success && result.data) {
        console.log('✅ NFC Registration successful');
        // Force refresh the NFC logs to update registration status and filter out registered cards
        await forceRefresh();

        // The useNFCLogs hook will automatically filter out the registered card
        // Close modal since the card should no longer be available for registration
        setNfcModalVisible(false);

        Alert.alert(
          'Success',
          `NFC Card "${result.data.uid}" registered successfully to your account!`,
          [{ text: 'OK' }],
        );
      } else {
        console.log('❌ NFC Registration failed:', result.error);
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
          console.log('🔍 This suggests the backend rejected the token despite it being present');

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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
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
              <TouchableOpacity
                onPress={retryNFCRegistration}
                className="bg-blue-600 px-3 py-2 rounded-lg"
              >
                <Text className="text-white text-sm text-center">Retry Registration</Text>
              </TouchableOpacity>
            </View>
          )}
          <NFCCardDisplay
            nfcData={getMostRecentNFC()!}
            title="Recent NFC Card Detected"
          />
        </View>
      );
    }

    return (
      <View className="items-center py-8">
        <Text className="text-white text-lg mb-2">No Unregistered NFC Cards Found</Text>
        <Text className="text-muted-default text-center mb-4">
          All recent NFC cards are already registered, or no new NFC card activity was detected. Please ensure an unregistered NFC card was recently presented to the vault.
        </Text>
      </View>
    );
  };

  // Add retry function for NFC registration
  const retryNFCRegistration = async () => {
    console.log('🔄 Retrying NFC registration...');
    await handleNFCRegistered();
  };

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
        secondaryAction: registrationError ? {
          label: 'Retry',
          onPress: retryNFCRegistration,
        } : {
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
        <ButtonSecondary
          title="Register New NFC-Card"
          onPress={handleRegisterNFC}
          icon={<Plus size={20} />}
          disabled={!currentVaultId || vaultsLoading}
        />
      </View>

      <CustomModal
        visible={nfcModalVisible}
        onClose={() => setNfcModalVisible(false)}
        title="Register NFC Card"
        icon={<CreditCard size={24} color="#60a5fa" />}
        iconPosition="left"
        primaryAction={getModalActions().primaryAction}
        secondaryAction={getModalActions().secondaryAction}
      >
        {renderModalContent()}
      </CustomModal>
    </>
  );
};
