import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Wifi, Eye, EyeOff } from 'lucide-react-native';
import CustomModal from '../modals/CustomModal';
import ProvisioningHeader from './ProvisioningHeader';
import ButtonPrimary from '../buttons/ButtonPrimary';
import DeviceList from './DeviceList';
import SuccessBanner from '../banner/SuccessBanner';
import { PROVISIONING_CONSTANTS } from '../../../types/provisioningConstants';
import type { ESPDevice } from '@orbital-systems/react-native-esp-idf-provisioning';
import type { WiFiNetwork } from '../../hooks/provisioning/useWiFiScanning';

interface WiFiCredentialsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDevice: ESPDevice | null;
  // WiFi provisioning state and actions
  selectedSSID: string | null;
  wifiPassword: string;
  showPassword: boolean;
  isProvisioning: boolean;
  provisioningError: { message: string; code?: string; details?: unknown } | null;
  wifiNetworks: WiFiNetwork[];
  scanning: boolean;
  wifiScanError: string | null;
  // Actions
  setWifiPassword: (password: string) => void;
  handleNetworkSelect: (ssid: string) => void;
  togglePasswordVisibility: () => void;
  handleProvisionWiFi: () => void;
  startWiFiScan: () => void;
  isFormValid: boolean;
}

const WiFiCredentialsModal: React.FC<WiFiCredentialsModalProps> = ({
  visible,
  onClose,
  selectedDevice,
  selectedSSID,
  wifiPassword,
  showPassword,
  isProvisioning,
  provisioningError,
  wifiNetworks,
  scanning,
  wifiScanError,
  setWifiPassword,
  handleNetworkSelect,
  togglePasswordVisibility,
  handleProvisionWiFi,
  startWiFiScan,
  isFormValid,
}) => {
  React.useEffect(() => {
    if (visible) {
      startWiFiScan();
    }
  }, [visible, startWiFiScan]);

  // Debug logging for troubleshooting
  React.useEffect(() => {
    console.log('=== WIFI MODAL RENDER DEBUG ===');
    console.log('Modal is visible:', visible);
    console.log('Modal Props:', {
      selectedDevice: selectedDevice ? `Device: ${selectedDevice.name}` : 'No device',
      selectedSSID: selectedSSID || 'No SSID',
      wifiPassword: wifiPassword,
      passwordLength: wifiPassword.length,
      minPasswordLength: 8,
      isFormValid: isFormValid,
      isProvisioning: isProvisioning,
      buttonDisabled: !isFormValid
    });
    console.log('==============================');
  }, [visible, selectedDevice, selectedSSID, wifiPassword, isFormValid, isProvisioning]);

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={PROVISIONING_CONSTANTS.MESSAGES.WIFI_CREDENTIALS_TITLE}
      icon={<Wifi size={PROVISIONING_CONSTANTS.UI.ICON_SIZE} color={PROVISIONING_CONSTANTS.UI.ICON_COLOR} />}
      iconPosition="left"
      primaryAction={{
        label: PROVISIONING_CONSTANTS.MESSAGES.CONFIRM,
        onPress: () => {
          console.log('=== BUTTON CLICKED ===');
          console.log('Button was clicked!');
          handleProvisionWiFi();
        },
        disabled: false, // Force enable to test
        loading: isProvisioning,
      }}
      secondaryAction={{
        label: PROVISIONING_CONSTANTS.MESSAGES.BACK,
        onPress: onClose,
      }}
    >
      <View className="mb-3">
        <ProvisioningHeader
          message={selectedDevice
            ? `${PROVISIONING_CONSTANTS.MESSAGES.SEND_WIFI_CREDENTIALS}: ${selectedDevice.name}`
            : PROVISIONING_CONSTANTS.MESSAGES.MAKE_SURE_DEVICE_POWERED_ON
          }
        />

        {/* Scanning indicator */}
        {scanning && (
          <View className="flex-row items-center justify-center py-3">
            <ActivityIndicator size="small" color={PROVISIONING_CONSTANTS.UI.SIGNAL_COLOR} />
            <Text className="ml-2 text-gray-700">{PROVISIONING_CONSTANTS.MESSAGES.SCANNING}</Text>
          </View>
        )}

        {/* WiFi scan error */}
        {!scanning && wifiScanError && (
          <Text className="text-red-500 mt-2">{wifiScanError}</Text>
        )}

        {/* No networks found */}
        {!scanning && !wifiScanError && wifiNetworks.length === 0 && (
          <Text className="text-gray-500 mt-2">{PROVISIONING_CONSTANTS.MESSAGES.NO_NETWORKS_FOUND}</Text>
        )}

        {/* WiFi networks list */}
        {!scanning && wifiNetworks.length > 0 && (
          <DeviceList
            devices={wifiNetworks}
            getId={d => d.ssid}
            getName={d => d.ssid}
            onDevicePress={d => handleNetworkSelect(d.ssid)}
            getSignal={d => d.rssi || 0}
            selectedId={selectedSSID ?? undefined}
            renderItem={(d, isSelected) => (
              <View
                className={`px-3 py-2 rounded ${isSelected ? 'bg-blue-100' : ''}`}
              >
                <Text
                  className={`${isSelected ? 'text-blue-800' : 'text-neutral-text'} font-medium`}
                >
                  {d.ssid}
                </Text>
              </View>
            )}
            title="Available Wi-Fi"
          />
        )}

        {/* Password input */}
        {selectedSSID && (
          <View className="mt-3 relative">
            <Text className="text-gray-700 mb-1">
              {PROVISIONING_CONSTANTS.MESSAGES.ENTER_WIFI_PASSWORD}
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded px-3 py-2">
              <TextInput
                value={wifiPassword}
                onChangeText={setWifiPassword}
                secureTextEntry={!showPassword}
                placeholder={PROVISIONING_CONSTANTS.MESSAGES.ENTER_WIFI_PASSWORD}
                className="flex-1 text-neutral-text"
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                className="ml-2"
              >
                {showPassword ? (
                  <Eye size={PROVISIONING_CONSTANTS.UI.ICON_SIZE} color={PROVISIONING_CONSTANTS.UI.GRAY_COLOR} />
                ) : (
                  <EyeOff size={PROVISIONING_CONSTANTS.UI.ICON_SIZE} color={PROVISIONING_CONSTANTS.UI.GRAY_COLOR} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* No device selected warning */}
        {!selectedDevice && (
          <View className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Text className="text-yellow-700">Please select a device first before provisioning WiFi.</Text>
          </View>
        )}

        {/* Provisioning error */}
        {provisioningError && (
          <Text className="text-red-500 mt-2">{provisioningError.message}</Text>
        )}
      </View>
    </CustomModal>
  );
};

export default WiFiCredentialsModal;