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

interface NFCManagerProps {
  currentVaultId: number | null;
  vaultsLoading: boolean;
}

export const NFCManager: React.FC<NFCManagerProps> = ({
  currentVaultId,
  vaultsLoading
}) => {
  const { user } = useAuthContext();
  const [nfcModalVisible, setNfcModalVisible] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const {
    getMostRecentNFC,
    loading: nfcLoading,
    error: nfcError,
    isAuthenticated,
    refreshNFCLogs,
    handleLogout: handleNFCLogout
  } = useNFCLogs(currentVaultId || undefined);

  const handleRegisterNFC = async () => {
    if (!currentVaultId) {
      Alert.alert('No Vault Selected', 'Please wait for vaults to load or select a vault first.');
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
      [{ text: 'OK' }]
    );
  };

  const handleNFCRegistered = async () => {
    if (!getMostRecentNFC()) {
      Alert.alert('Error', 'No NFC card data available for registration.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Authentication Error', 'Please log in again to register NFC cards.');
      return;
    }

    try {
      setRegistrationLoading(true);
      setRegistrationError(null);

      const token = await StorageService.getAccessToken();
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again to register NFC cards.');
        return;
      }

      const result = await NFCCardService.registerCard(
        getMostRecentNFC()!.uid,
        user?.id,
        token
      );

      if (result.success && result.data) {
        setNfcModalVisible(false);
        await refreshNFCLogs();
        
        Alert.alert(
          'Success',
          `NFC Card "${result.data.uid}" registered successfully to your account!`,
          [{ text: 'OK' }]
        );
      } else {
        setRegistrationError(result.error || 'Failed to register NFC card');
        Alert.alert('Registration Failed', result.error || 'Failed to register NFC card');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setRegistrationError(errorMessage);
      Alert.alert('Error', `Registration failed: ${errorMessage}`);
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
          <Text className="text-white text-lg mb-2">Authentication Required</Text>
          <Text className="text-muted-default text-center mb-4">
            {nfcError || 'Your session has expired. Please log in again to access NFC card data.'}
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
              <Text className="text-red-400 text-sm text-center">
                {registrationError}
              </Text>
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
        <Text className="text-white text-lg mb-2">No NFC Cards Found</Text>
        <Text className="text-muted-default text-center mb-4">
          No recent NFC card activity detected in the logs. Please ensure an NFC card was recently presented to the vault.
        </Text>
      </View>
    );
  };

  const getModalActions = () => {
    if (!isAuthenticated) {
      return {
        primaryAction: undefined,
        secondaryAction: {
          label: 'Close',
          onPress: () => setNfcModalVisible(false)
        }
      };
    }

    if (!currentVaultId || nfcLoading) {
      return {
        primaryAction: undefined,
        secondaryAction: {
          label: 'Close',
          onPress: () => setNfcModalVisible(false)
        }
      };
    }

    if (getMostRecentNFC()) {
      return {
        primaryAction: {
          label: registrationLoading ? 'Registering...' : 'Register Card',
          onPress: handleNFCRegistered,
          loading: registrationLoading,
          disabled: registrationLoading
        },
        secondaryAction: {
          label: 'Cancel',
          onPress: () => setNfcModalVisible(false)
        }
      };
    }

    return {
      primaryAction: undefined,
      secondaryAction: {
        label: 'Close',
        onPress: () => setNfcModalVisible(false)
      }
    };
  };

  return (
    <>
      <View className="bg-surface-dark rounded-lg p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <CreditCard size={20} color="#60a5fa" />
          <Text className="text-white text-lg font-semibold ml-2">NFC-Card Management</Text>
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