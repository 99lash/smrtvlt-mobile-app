import React, { useState, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { Plus, CreditCard, Settings } from 'lucide-react-native';
import ButtonSecondary from '../buttons/ButtonSecondary';
import { WarningMessage } from '../common/WarningMessage';
import { useAuthContext } from '../../context/AuthContext';
import { useNFCLogs } from '../../hooks/useNFCLogs';
import { NFCCardDisplay } from '../nfc/NFCCardDisplay';
import CustomModal from '../modals/CustomModal';
import { useNFCCardManagement } from '../../hooks/settings/useNFCCardManagement';
import { useErrorHandler } from '../../hooks/common/useErrorHandler';
import { NFCCardList } from './NFCCardList';
import { NFCCardForm } from './NFCCardForm';

interface NFCManagerProps {
  currentVaultId: number | null;
  vaultsLoading: boolean;
}

export const NFCManager: React.FC<NFCManagerProps> = ({
  currentVaultId,
  vaultsLoading,
}) => {
  const { user } = useAuthContext();
  const { handleError, handleAPIError } = useErrorHandler();

  // Modal state
  const [nfcModalVisible, setNfcModalVisible] = useState(false);
  const [manageNfcModalVisible, setManageNfcModalVisible] = useState(false);

  // NFC logs hook for registration flow
  const {
    getMostRecentNFC,
    loading: nfcLoading,
    error: nfcError,
    isAuthenticated,
    refreshNFCLogs,
    forceRefresh,
    handleLogout: handleNFCLogout,
  } = useNFCLogs(currentVaultId || undefined);

  // NFC card management hook
  const {
    nfcManagerState,
    registrationState,
    fetchNfcCards,
    deleteNfcCard,
    registerNfcCard,
    resetRegistrationForm,
    setNfcCardName,
  } = useNFCCardManagement({
    currentVaultId,
    onRegistrationSuccess: card => {
      forceRefresh(); // Refresh NFC logs after successful registration
      setNfcModalVisible(false); // Close modal
    },
  });

  /**
   * Handles the register NFC button press
   */
  const handleRegisterNFC = useCallback(async () => {
    if (!currentVaultId || vaultsLoading) {
      // Warning message is shown in UI, no need for additional alert
      return;
    }

    try {
      await refreshNFCLogs();
      // Brief delay to allow NFC data to be processed
      setTimeout(() => {
        setNfcModalVisible(true);
      }, 500);
    } catch (error) {
      handleError(error, {
        action: 'NFC Logs Refresh',
        context: 'Register NFC Card',
      });
    }
  }, [currentVaultId, vaultsLoading, refreshNFCLogs, handleError]);

  /**
   * Handles opening the manage NFC modal
   */
  const handleManageNFC = useCallback(() => {
    if (!currentVaultId || vaultsLoading) {
      // Warning message is shown in UI, no need for additional alert
      return;
    }

    setManageNfcModalVisible(true);
  }, [currentVaultId, vaultsLoading]);

  /**
   * Handles NFC card registration with proper error handling
   */
  const handleNFCRegistration = useCallback(async () => {
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

    const success = await registerNfcCard(getMostRecentNFC()!.uid, user.id);

    if (success) {
      resetRegistrationForm();
      setNfcModalVisible(false);
    }
  }, [getMostRecentNFC, user?.id, registerNfcCard, resetRegistrationForm]);

  /**
   * Handles retry login for authentication errors
   */
  const handleRetryLogin = useCallback(() => {
    handleNFCLogout();
    Alert.alert(
      'Authentication Required',
      'Please log in again to access NFC card data.',
      [{ text: 'OK' }],
    );
  }, [handleNFCLogout]);

  /**
   * Determines modal actions based on current state
   */
  const getModalActions = useCallback(() => {
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
          label: registrationState.loading ? 'Registering...' : 'Register Card',
          onPress: handleNFCRegistration,
          loading: registrationState.loading,
          disabled: registrationState.loading,
        },
        secondaryAction: {
          label: 'Cancel',
          onPress: () => {
            setNfcModalVisible(false);
            resetRegistrationForm();
          },
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
  }, [
    isAuthenticated,
    currentVaultId,
    nfcLoading,
    getMostRecentNFC,
    registrationState.loading,
    handleNFCRegistration,
    resetRegistrationForm,
  ]);

  /**
   * Renders the registration modal content
   */
  const renderRegistrationModalContent = useCallback(() => {
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
        </View>
      );
    }

    if (getMostRecentNFC()) {
      return (
        <NFCCardForm
          nfcData={getMostRecentNFC()!}
          cardName={registrationState.cardName}
          error={registrationState.error}
          loading={registrationState.loading}
          onCardNameChange={setNfcCardName}
        />
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
  }, [
    currentVaultId,
    nfcLoading,
    isAuthenticated,
    nfcError,
    getMostRecentNFC,
    registrationState,
    setNfcCardName,
  ]);

  return (
    <>
      {/* Main NFC Manager Card */}
      <View
        className="bg-surface-default rounded-3xl p-4 mb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center mb-3">
          <CreditCard size={26} color="#5e5e5e" />
          <Text className="text-text-default text-lg font-semibold ml-2">
            NFC-Card Management
          </Text>
        </View>

        {/* Warning message when no vault is selected */}
        {(!currentVaultId || vaultsLoading) && (
          <WarningMessage
            message="No vaults available. Please create or join a vault first to manage NFC cards."
          />
        )}

        {/* Button Container */}
        <View className="flex-row space-x-3 gap-2">
          <View className="flex-1">
            <ButtonSecondary
              title="Add NFC-Card"
              onPress={handleRegisterNFC}
              icon={<Plus size={20} />}
              disabled={!currentVaultId || vaultsLoading}
            />
          </View>
          <View className="flex-1">
            <ButtonSecondary
              title="Manage Cards"
              onPress={handleManageNFC}
              icon={<Settings size={20} />}
              disabled={!currentVaultId || vaultsLoading}
            />
          </View>
        </View>
      </View>

      {/* Registration Modal */}
      <CustomModal
        visible={nfcModalVisible}
        onClose={() => {
          setNfcModalVisible(false);
          resetRegistrationForm();
        }}
        title="Register NFC Card"
        icon={<CreditCard size={24} color="#60a5fa" />}
        iconPosition="left"
        primaryAction={getModalActions().primaryAction}
        secondaryAction={getModalActions().secondaryAction}
      >
        {renderRegistrationModalContent()}
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
          loading: nfcManagerState.loading,
        }}
      >
        <NFCCardList
          cards={nfcManagerState.nfcCards}
          loading={nfcManagerState.loading}
          error={nfcManagerState.error}
          deletingCardId={nfcManagerState.deletingCardId}
          onDeleteCard={deleteNfcCard}
          onRefresh={fetchNfcCards}
        />
      </CustomModal>
    </>
  );
};
