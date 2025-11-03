import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { Plus, CreditCard, Settings } from 'lucide-react-native';
import ButtonSecondary from '../../component/buttons/ButtonSecondary';
import { WarningMessage } from '../../component/common/WarningMessage';
import { useAuthContext } from '../../context/AuthContext';
import { useNFCLogs } from '../../hooks/useNFCLogs';
import { NFCCardDisplay } from '../../component/nfc/NFCCardDisplay';
import CustomModal from '../../component/modals/CustomModal';
import { useNFCCardManagement } from './hooks/useNFCCardManagement';
import { useErrorHandler } from '../../hooks/common/useErrorHandler';
import { NFCCardList } from './NFCCardList';
import { NFCCardForm } from './NFCCardForm';
import { VaultMembership } from '../../../service/VaultService';
import { useAccessLimits } from './hooks/useAccessLimits';
import { RoleBadge } from '../../component/common/RoleBadge';
import { UsageMeter } from '../../component/common/UsageMeter';
import { StorageService } from '../../../service/StorageService';

interface NFCManagerProps {
  currentVault: VaultMembership | null;
  vaultsLoading: boolean;
}

export const NFCManager: React.FC<NFCManagerProps> = ({
  currentVault,
  vaultsLoading,
}) => {
  const { user } = useAuthContext();
  const { handleError, handleAPIError } = useErrorHandler();
  
  // Extract vault ID from current vault
  const currentVaultId = currentVault?.vault_id || null;

  // Access limits hook
  const { 
    limits, 
    loading: limitsLoading, 
    error: limitsError,
    canCreateNFC, 
    nfcUsage, 
    isAdmin, 
    isMember, 
    isGuest,
    fetchLimits
  } = useAccessLimits(currentVaultId);

  // Modal state
  const [nfcModalVisible, setNfcModalVisible] = useState(false);
  const [manageNfcModalVisible, setManageNfcModalVisible] = useState(false);
  
  // Current user state
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Get current user ID on component mount
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const userId = await StorageService.getCurrentUserId();
      setCurrentUserId(userId);
    };
    fetchCurrentUserId();
  }, []);

  // NFC logs hook for registration flow
  const {
    getMostRecentNFC,
    loading: nfcLoading,
    error: nfcError,
    isAuthenticated,
    refreshNFCLogs,
    forceRefresh,
    clearNFCLogs,
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
      console.log('🎉 Registration success callback triggered for card:', card.nfc_card_uid);
      // Clear NFC logs immediately after successful registration
      clearNFCLogs();
      // Reset the registration form
      resetRegistrationForm();
      // Refresh access limits to update usage meter
      fetchLimits();
      // Close modal after a brief delay to ensure state is cleared
      setTimeout(() => {
        console.log('🚪 Closing NFC modal after registration success');
        setNfcModalVisible(false);
      }, 100);
    },
    onDeleteSuccess: () => {
      // Refresh access limits to update usage meter after deletion
      fetchLimits();
    },
  });

  // Fetch NFC cards when manage modal opens
  useEffect(() => {
    if (manageNfcModalVisible && currentVaultId) {
      console.log('🔄 Manage modal opened, fetching NFC cards for vault:', currentVaultId);
      fetchNfcCards();
    }
  }, [manageNfcModalVisible, currentVaultId, fetchNfcCards]);

  /**
   * Handles the register NFC button press
   */
  const handleRegisterNFC = useCallback(async () => {
    if (!currentVaultId || vaultsLoading || !canCreateNFC) {
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
  }, [currentVaultId, vaultsLoading, canCreateNFC, refreshNFCLogs, handleError]);

  /**
   * Handles opening the manage NFC modal
   */
  const handleManageNFC = useCallback(() => {
    if (!currentVaultId || vaultsLoading) {
      console.warn('⚠️ Cannot open manage modal: vault not selected or still loading');
      return;
    }

    console.log('🔄 Opening manage NFC modal for vault:', currentVaultId);
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
    if (!currentVaultId || !canCreateNFC) {
      return (
        <View className="items-center py-8">
          <Text className="text-white text-lg mb-2">
            {isGuest ? 'Guest Access' : 'No Access Available'}
          </Text>
          <Text className="text-muted-default text-center mb-4">
            {isGuest 
              ? 'Guest users cannot create NFC cards'
              : 'You need appropriate access to register NFC cards in this vault.'
            }
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

    const mostRecentNFC = getMostRecentNFC();
    if (mostRecentNFC) {
      console.log('📱 Rendering NFCCardForm with NFC data:', mostRecentNFC.uid);
      return (
        <NFCCardForm
          nfcData={mostRecentNFC}
          cardName={registrationState.cardName}
          error={registrationState.error}
          loading={registrationState.loading}
          onCardNameChange={setNfcCardName}
          limits={limits}
        />
      );
    }

    return (
      <WarningMessage
        message="No unregistered NFC cards found. Please register a new NFC card to get started."
      />
    );
  }, [
    currentVaultId,
    canCreateNFC,
    isGuest,
    nfcLoading,
    isAuthenticated,
    nfcError,
    getMostRecentNFC,
    registrationState,
    setNfcCardName,
    limits,
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
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <CreditCard size={26} color="#5e5e5e" />
            <Text className="text-text-dark text-lg font-semibold ml-2">
              NFC-Card Management
            </Text>
          </View>
          {limits && <RoleBadge role={limits.role} size="sm" />}
        </View>

        {/* Usage information */}
        {limits && (
          <View className="mb-3">
            <UsageMeter
              current={limits.nfc_cards.current_count}
              limit={limits.nfc_cards.limit}
              label="NFC Cards"
            />
            {isMember && (
              <Text className="text-muted-default text-sm mb-2">
                As a member, you can register up to 1 NFC card per vault
              </Text>
            )}
            {isGuest && (
              <Text className="text-muted-default text-sm mb-2">
                Guest users have read-only access to vault resources
              </Text>
            )}
          </View>
        )}

        {/* Warning message when no access */}
        {(!currentVaultId || vaultsLoading || !canCreateNFC) && !limitsLoading && (
          <WarningMessage
            message={
              !limits?.is_member
                ? "You are not a member of this vault. Please contact an admin to add you to this vault."
                : isGuest 
                ? "Guest users cannot create NFC cards"
                : limits?.nfc_cards.current_count === limits?.nfc_cards.limit
                ? "You've reached your limit for this vault"
                : "No access to create NFC cards in this vault"
            }
          />
        )}

        {/* Button Container */}
        <View className="flex-row space-x-3 gap-2">
          <View className="flex-1">
            <ButtonSecondary
              title='Add NFC-Card'
              onPress={handleRegisterNFC}
              icon={<Plus size={20} />}
              disabled={!currentVaultId || vaultsLoading || !canCreateNFC}
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
        onClose={() => {
          console.log('🚪 Closing manage NFC modal');
          setManageNfcModalVisible(false);
        }}
        title="Manage NFC Cards"
        primaryAction={{
          label: nfcManagerState.loading ? 'Refreshing...' : 'Refresh',
          onPress: () => {
            console.log('🔄 Manual refresh triggered');
            fetchNfcCards();
          },
          loading: nfcManagerState.loading,
          disabled: nfcManagerState.loading,
        }}
      >
        <NFCCardList
          cards={nfcManagerState.nfcCards}
          loading={nfcManagerState.loading}
          error={nfcManagerState.error}
          deletingCardId={nfcManagerState.deletingCardId}
          onDeleteCard={deleteNfcCard}
          onRefresh={fetchNfcCards}
          isAdmin={isAdmin}
          currentUserId={currentUserId || undefined}
          currentVaultId={currentVaultId || undefined}
        />
      </CustomModal>
    </>
  );
};
