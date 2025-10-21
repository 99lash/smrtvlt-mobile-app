import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useProvisioning } from '../../screens/settings/hooks/provisioning/useProvisioning';
import ButtonSecondary from '../buttons/ButtonSecondary';
import DeviceScanningModal from './DeviceScanningModal';
import WiFiCredentialsModal from './WiFiCredentialsModal';
import VaultConfigurationModal from './VaultConfigurationModal';
import { useDeviceScanning } from '../../screens/settings/hooks/provisioning/useDeviceScanning';
import { useWiFiProvisioning } from '../../screens/settings/hooks/provisioning/useWiFiProvisioning';
import { useSuccessNotification } from '../../screens/settings/hooks/provisioning/useSuccessNotification';
import { useProvisioningFailure } from '../../screens/settings/hooks/provisioning/useProvisioningFailure';
import { useVaultCreation } from '../../screens/settings/hooks/provisioning/useVaultCreation';
import { useVaultManagement } from '../../hooks/VaultContext';
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
  const [vaultConfigModalVisible, setVaultConfigModalVisible] = useState(false);
  const [pendingDevice, setPendingDevice] = useState<ESPDevice | null>(null);

  // Custom hooks for business logic
  const deviceScanning = useDeviceScanning();
  const wifiProvisioning = useWiFiProvisioning();
  const vaultCreation = useVaultCreation();
  const { showFailure, hideFailure } = useProvisioningFailure(log);
  
  // Vault management for refreshing vault list after creation
  const { forceRefreshVaults, selectVault } = useVaultManagement();

  // Centralized modal reset functionality
  const resetAllModals = () => {
    // Hide all modals
    setScanModalVisible(false);
    setWifiModalVisible(false);
    setVaultConfigModalVisible(false);

    // Clear device state
    setSelectedDevice(null);
    setPendingDevice(null);

    // Reset scanning state
    deviceScanning.resetScanning();

    // Reset WiFi provisioning state
    wifiProvisioning.resetProvisioning();

    // Reset vault creation state
    vaultCreation.resetCreation();
  };


  const { showSuccess, hideSuccess, resetSuccessTrigger } = useSuccessNotification(log, resetAllModals, false);


  // Handle device selection from scanning modal
  const handleDeviceSelect = (device: ESPDevice) => {
    setPendingDevice(device); // Store device locally first
    setSelectedDevice(device); // Set the device in the provisioning context
    setScanModalVisible(false);
    // Open WiFi modal immediately - will be synchronized by useEffect
    setWifiModalVisible(true);
  };

  // Handle WiFi provisioning completion
  const handleWiFiProvisioned = () => {

    setWifiModalVisible(false);
    // Don't clear device yet - we need it for vault configuration
    deviceScanning.resetScanning();
    wifiProvisioning.resetProvisioning();

    // Show vault configuration modal
    setVaultConfigModalVisible(true);
    console.log('✅ Vault configuration modal should now be visible');
  };

  // Set up WiFi provisioning success handler
  React.useEffect(() => {
    console.log('=== PROVISIONING SUCCESS DETECTION ===');
    console.log('Current provisioning error:', wifiProvisioning.provisioningError);

    if (wifiProvisioning.provisioningError?.code === 'PROVISIONING_SUCCESS') {
      console.log('🎉 WiFi provisioning success detected! Opening vault config modal...');
      handleWiFiProvisioned();
    } else if (wifiProvisioning.provisioningError?.code) {
      console.log('❌ Provisioning error detected:', wifiProvisioning.provisioningError.code);
    }
  }, [wifiProvisioning.provisioningError]);

  // Ensure WiFi modal only opens when device is selected
  React.useEffect(() => {
    if (wifiModalVisible && !selectedDevice) {
      console.log('WARNING: WiFi modal opened but no device selected!');
      setWifiModalVisible(false);
    }
  }, [wifiModalVisible, selectedDevice]);

  // Handle vault creation completion
  const handleVaultCreated = async (vaultData: any) => {
    console.log('=== VAULT CREATED SUCCESSFULLY ===');
    console.log('Vault data:', vaultData);

    // Close WiFi modal (which now contains vault config)
    setWifiModalVisible(false);

    // Clear device state
    setSelectedDevice(null);
    setPendingDevice(null);

    // Refresh vault list to include the new vault
    try {
      console.log('🔄 Refreshing vault list after vault creation...');
      console.log('📊 Vault data for selection:', {
        id: vaultData.id,
        name: vaultData.name,
        device_id: vaultData.device_id
      });
      
      await forceRefreshVaults();
      console.log('✅ Vault list refreshed successfully');
      
      // Select the newly created vault if we have its ID
      if (vaultData.id) {
        console.log('🎯 Selecting newly created vault:', vaultData.id);
        selectVault(parseInt(vaultData.id));
        console.log('✅ Vault selection completed');
      } else {
        console.log('⚠️ No vault ID found in vault data, skipping auto-selection');
      }
    } catch (error) {
      console.error('❌ Failed to refresh vault list:', error);
      // Don't block the success flow if refresh fails
    }

    // Show success message
    Alert.alert(
      'Success!',
      `Vault "${vaultData.name}" has been created successfully!\n\nVault ID: ${vaultData.device_id}\nYou are now the admin of this vault.`,
      [{ text: 'OK' }]
    );
  };

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
    <>
      <ButtonSecondary
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

      {/* Vault Configuration Modal */}
      <VaultConfigurationModal
        visible={vaultConfigModalVisible}
        onClose={() => setVaultConfigModalVisible(false)}
        selectedDevice={selectedDevice}
        onVaultCreated={handleVaultCreated}
        isCreating={vaultCreation.isCreating}
      />
    </>
  );
};

export default Provisioning;
