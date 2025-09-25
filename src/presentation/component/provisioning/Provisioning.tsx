import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useProvisioning } from '../../hooks/provisioning/useProvisioning';
import ButtonPrimary from '../buttons/ButtonPrimary';
import DeviceScanningModal from './DeviceScanningModal';
import WiFiCredentialsModal from './WiFiCredentialsModal';
import SuccessBanner from '../banner/SuccessBanner';
import FailureBanner from '../banner/FailureBanner';
import { useDeviceScanning } from '../../hooks/provisioning/useDeviceScanning';
import { useWiFiProvisioning } from '../../hooks/provisioning/useWiFiProvisioning';
import { useSuccessNotification } from '../../hooks/provisioning/useSuccessNotification';
import { useProvisioningFailure } from '../../hooks/provisioning/useProvisioningFailure';
import { PROVISIONING_CONSTANTS } from '../../../utils/provisioningConstants';
import type { ESPDevice } from '@orbital-systems/react-native-esp-idf-provisioning';

/**
 * Main Provisioning component
 *
 * Handles the overall provisioning flow by orchestrating:
 * - Device discovery and selection
 * - WiFi network selection and credential management
 * - Provisioning process coordination
 * - Success/error feedback
 *
 * This component focuses on UI orchestration and state management
 * while delegating business logic to custom hooks.
 */

const Provisioning = () => {
  const { log, setSelectedDevice, selectedDevice } = useProvisioning();

  // Modal state
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [wifiModalVisible, setWifiModalVisible] = useState(false);
  const [pendingDevice, setPendingDevice] = useState<ESPDevice | null>(null);

  // Custom hooks for business logic
  const deviceScanning = useDeviceScanning();
  const wifiProvisioning = useWiFiProvisioning();
  const { showFailure, hideFailure } = useProvisioningFailure(log);

  // Centralized modal reset functionality
  const resetAllModals = () => {
    console.log('=== RESETTING ALL MODALS ===');

    // Hide all modals
    setScanModalVisible(false);
    setWifiModalVisible(false);

    // Clear device state
    setSelectedDevice(null);
    setPendingDevice(null);

    // Reset scanning state
    deviceScanning.resetScanning();

    // Reset WiFi provisioning state
    wifiProvisioning.resetProvisioning();

    console.log('=== ALL MODALS RESET ===');
  };


  const { showSuccess, hideSuccess, resetSuccessTrigger } = useSuccessNotification(log, resetAllModals, false);
  

  // Handle device selection from scanning modal
  const handleDeviceSelect = (device: ESPDevice) => {
    console.log('=== DEVICE SELECTED ===');
    console.log('Setting device:', device.name);
    setPendingDevice(device); // Store device locally first
    setSelectedDevice(device); // Set the device in the provisioning context
    setScanModalVisible(false);
    // Open WiFi modal immediately - will be synchronized by useEffect
    setWifiModalVisible(true);
  };

  // Handle WiFi provisioning completion
  const handleWiFiProvisioned = () => {
    console.log('=== WIFI PROVISIONING COMPLETED ===');
    setWifiModalVisible(false);
    setSelectedDevice(null); // Clear the selected device
    setPendingDevice(null); // Clear the pending device
    deviceScanning.resetScanning();
  };

  // Set up WiFi provisioning success handler
  React.useEffect(() => {
    if (wifiProvisioning.provisioningError?.code === 'PROVISIONING_SUCCESS') {
      handleWiFiProvisioned();
    }
  }, [wifiProvisioning.provisioningError]);

  // Ensure WiFi modal only opens when device is selected
  React.useEffect(() => {
    if (wifiModalVisible && !selectedDevice) {
      console.log('WARNING: WiFi modal opened but no device selected!');
      setWifiModalVisible(false);
    }
  }, [wifiModalVisible, selectedDevice]);

  // Handle successful provisioning - allow new device provisioning
  React.useEffect(() => {
    if (showSuccess) {
      console.log('=== PROVISIONING SUCCESS DETECTED ===');
      console.log('Success banner shown, ready for new device provisioning');
      // Don't reset anything here - let user start fresh when they want
    }
  }, [showSuccess]);

  // Synchronize device selection for WiFi modal
  React.useEffect(() => {
    if (pendingDevice && wifiModalVisible) {
      console.log('=== DEVICE SYNCHRONIZATION ===');
      console.log('Pending device:', pendingDevice.name);
      console.log('Current selected device:', selectedDevice?.name || 'None');
      console.log(
        'Devices match:',
        pendingDevice.name === selectedDevice?.name,
      );
      console.log('=============================');

      // If devices don't match, update the selected device
      if (pendingDevice.name !== selectedDevice?.name) {
        console.log('Updating selected device...');
        setSelectedDevice(pendingDevice);
      }
    }
  }, [pendingDevice, selectedDevice, wifiModalVisible]);

  // Debug logging for button state
  React.useEffect(() => {
    console.log('=== PROVISIONING DEBUG ===');
    console.log(
      'Selected Device:',
      selectedDevice ? `Device: ${selectedDevice.name}` : 'No device selected',
    );
    console.log('Scan Modal Visible:', scanModalVisible);
    console.log('WiFi Modal Visible:', wifiModalVisible);
    console.log('WiFi Provisioning State:', {
      selectedSSID: wifiProvisioning.selectedSSID,
      wifiPassword: wifiProvisioning.wifiPassword,
      passwordLength: wifiProvisioning.wifiPassword.length,
      minPasswordLength: 8,
      isFormValid: wifiProvisioning.isFormValid,
      isProvisioning: wifiProvisioning.isProvisioning,
    });
    console.log('========================');
  }, [
    selectedDevice,
    scanModalVisible,
    wifiModalVisible,
    wifiProvisioning.selectedSSID,
    wifiProvisioning.wifiPassword,
    wifiProvisioning.isFormValid,
    wifiProvisioning.isProvisioning,
  ]);

  return (
    <View className="flex-1 bg-white px-4 py-6">
      <View className="flex-1 justify-center items-center">
        {/* Main Action Button */}
        <View className="w-full max-w-sm mb-4">
          <ButtonPrimary
            title={PROVISIONING_CONSTANTS.MESSAGES.PROVISION_NEW_DEVICE}
            onPress={() => {
              resetSuccessTrigger(); // Reset success trigger for new session
              setScanModalVisible(true);
              console.log('Set scanModalVisible to true');
            }}
            icon={
              <Plus
                size={PROVISIONING_CONSTANTS.UI.ICON_SIZE}
                color="white"
              />
            }
            className="w-full"
          />
        </View>
      </View>

      {/* Success Banner */}
      {showSuccess && (
        <SuccessBanner
          message={log}
          duration={PROVISIONING_CONSTANTS.TIMING.BANNER_DURATION}
          onHide={hideSuccess}
        />
      )}

      {/* Failure Banner */}
      {showFailure && (
        <FailureBanner
          message="Provisioning failed"
          duration={PROVISIONING_CONSTANTS.TIMING.BANNER_DURATION}
          onHide={hideFailure}
        />
      )}

      {/* Device Scanning Modal */}
      <DeviceScanningModal
        visible={scanModalVisible}
        onClose={() => setScanModalVisible(false)}
        onDeviceSelect={handleDeviceSelect}
        devices={deviceScanning.devices}
        isScanning={deviceScanning.isScanning}
        hasScanned={deviceScanning.hasScanned}
        scanningError={deviceScanning.scanningError}
        hasDevices={deviceScanning.hasDevices}
        handleScan={deviceScanning.handleScan}
      />

      {/* WiFi Credentials Modal */}
      <WiFiCredentialsModal
        key={selectedDevice?.name || 'no-device'} // Force re-render when device changes
        visible={wifiModalVisible}
        onClose={() => setWifiModalVisible(false)}
        selectedDevice={selectedDevice}
        selectedSSID={wifiProvisioning.selectedSSID}
        wifiPassword={wifiProvisioning.wifiPassword}
        showPassword={wifiProvisioning.showPassword}
        isProvisioning={wifiProvisioning.isProvisioning}
        provisioningError={wifiProvisioning.provisioningError}
        wifiNetworks={wifiProvisioning.wifiNetworks}
        scanning={wifiProvisioning.scanning}
        wifiScanError={wifiProvisioning.wifiScanError}
        setWifiPassword={wifiProvisioning.setWifiPassword}
        handleNetworkSelect={wifiProvisioning.handleNetworkSelect}
        togglePasswordVisibility={wifiProvisioning.togglePasswordVisibility}
        handleProvisionWiFi={wifiProvisioning.handleProvisionWiFi}
        startWiFiScan={wifiProvisioning.startWiFiScan}
        isFormValid={wifiProvisioning.isFormValid}
      />
    </View>
  );
};

export default Provisioning;
