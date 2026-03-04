import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Plus } from 'lucide-react-native';
import ButtonSecondary from '../buttons/ButtonSecondary';
import CustomModal from '../modals/CustomModal';
import { useWiFiProvisioning } from '../../screens/settings/hooks/provisioning/useWiFiProvisioning';
import { useVaultManagement } from '../../hooks/VaultContext';

interface ProvisioningProps {
  visible?: boolean;
  onClose?: () => void;
}

const Provisioning = ({ visible: externalVisible, onClose: externalOnClose }: ProvisioningProps = {}) => {
  const controlled = externalVisible !== undefined;
  const [internalVisible, setInternalVisible] = React.useState(false);
  const provisioning = useWiFiProvisioning();
  const { forceRefreshVaults, selectVault } = useVaultManagement();

  const modalVisible = controlled ? externalVisible! : internalVisible;

  const closeModal = React.useCallback(() => {
    provisioning.stopPolling();
    provisioning.reset();
    if (controlled) {
      externalOnClose?.();
    } else {
      setInternalVisible(false);
    }
  }, [controlled, externalOnClose]);

  // Controlled mode: react to external visibility changes
  React.useEffect(() => {
    if (!controlled) return;
    if (externalVisible) {
      provisioning.reset();
      provisioning.fetchToken();
    } else {
      provisioning.stopPolling();
      provisioning.reset();
    }
  }, [externalVisible]);

  const handleOpen = () => {
    provisioning.reset();
    setInternalVisible(true);
    provisioning.fetchToken();
  };

  // Auto-refresh and select vault when registration is detected via polling
  React.useEffect(() => {
    if (provisioning.step === 'done' && provisioning.foundVault) {
      forceRefreshVaults().then(() => {
        if (provisioning.foundVault) {
          selectVault(parseInt(String(provisioning.foundVault.vault_id)));
        }
      });
    }
  }, [provisioning.step]);

  const renderContent = () => {
    switch (provisioning.step) {
      case 'fetching_token':
        return (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="mt-4 text-zinc-400 text-sm">Generating provisioning token...</Text>
          </View>
        );

      case 'showing_token':
      case 'polling':
        return (
          <View>
            <Text className="text-zinc-300 text-sm mb-5">
              Follow these steps to connect your SmartVault device to WiFi:
            </Text>

            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3">
              <Text className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Step 1</Text>
              <Text className="text-white text-sm">
                Connect your phone to the{' '}
                <Text className="font-bold text-white">SmartVault-XXYYZZ</Text> WiFi network
              </Text>
            </View>

            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3">
              <Text className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Step 2</Text>
              <Text className="text-white text-sm">
                Open a browser and go to{' '}
                <Text className="font-bold text-white">192.168.4.1</Text>
              </Text>
            </View>

            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-5">
              <Text className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Step 3</Text>
              <Text className="text-white text-sm mb-4">
                Fill in your WiFi credentials and enter this token:
              </Text>
              <View className="items-center py-2">
                <Text className="text-5xl font-black tracking-widest text-white">
                  {provisioning.token}
                </Text>
              </View>
            </View>

            {provisioning.step === 'polling' && (
              <View className="flex-row items-center justify-center gap-2">
                <ActivityIndicator size="small" color="#71717a" />
                <Text className="text-zinc-500 text-sm">Waiting for device registration...</Text>
              </View>
            )}
          </View>
        );

      case 'done':
        return (
          <View className="items-center py-6">
            <View className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 items-center justify-center mb-4">
              <Text className="text-3xl">✓</Text>
            </View>
            <Text className="text-white font-bold text-lg mb-2">Device registered!</Text>
            <Text className="text-zinc-400 text-sm text-center">
              {provisioning.foundVault?.vault_name || 'Your new vault'} is ready to use.
            </Text>
          </View>
        );

      case 'error':
        return (
          <View className="items-center py-6">
            <Text className="text-red-400 text-sm text-center">{provisioning.error}</Text>
          </View>
        );

      default:
        return null;
    }
  };

  const getPrimaryAction = () => {
    switch (provisioning.step) {
      case 'error':
        return { label: 'Retry', onPress: provisioning.fetchToken };
      case 'showing_token':
        return {
          label: "I've filled the form — check for device",
          onPress: provisioning.startPolling,
        };
      case 'polling':
        return {
          label: 'Done',
          onPress: async () => {
            provisioning.stopPolling();
            await forceRefreshVaults();
            provisioning.reset();
            closeModal();
          },
        };
      case 'done':
        return {
          label: 'Done',
          onPress: () => {
            provisioning.reset();
            closeModal();
          },
        };
      default:
        return undefined;
    }
  };

  return (
    <>
      {!controlled && (
        <ButtonSecondary
          title="Provision New Device"
          onPress={handleOpen}
          icon={<Plus size={16} color="white" />}
          className="w-full"
        />
      )}

      <CustomModal
        visible={modalVisible}
        onClose={closeModal}
        title="Add New Vault"
        primaryAction={getPrimaryAction()}
        secondaryAction={{ label: 'Cancel', onPress: closeModal }}
      >
        {renderContent()}
      </CustomModal>
    </>
  );
};

export default Provisioning;
