import { useState, useEffect, useCallback } from 'react';
import { useWiFiScanning } from '../provisioning/useWiFiScanning';
import { useProvisioning } from '../provisioning/useProvisioning';
import { PROVISIONING_CONSTANTS } from '../../../utils/provisioningConstants';
import type { ProvisioningError } from '../../../types/ProvisioningTypes';

/**
 * Custom hook for WiFi provisioning logic
 * Handles WiFi network selection, credential management, and provisioning flow
 */
export const useWiFiProvisioning = () => {
  const { provisionDevice, selectedDevice } = useProvisioning();
  const {
    wifiNetworks,
    scanning,
    error: wifiScanError,
    startScan,
  } = useWiFiScanning();

  // WiFi provisioning state
  const [selectedSSID, setSelectedSSID] = useState<string | null>(null);
  const [wifiPassword, setWifiPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [provisioningError, setProvisioningError] =
    useState<ProvisioningError | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Reset form when SSID changes
  useEffect(() => {
    setWifiPassword('');
    setShowPassword(false);
    setProvisioningError(null);
  }, [selectedSSID]);

  // Auto-start WiFi scan when needed
  const startWiFiScan = useCallback(() => {
    setProvisioningError(null);
    startScan();
  }, [startScan]);

  // Handle WiFi network selection
  const handleNetworkSelect = useCallback((ssid: string) => {
    setSelectedSSID(ssid);
    setProvisioningError(null);
  }, []);

  // Handle password visibility toggle
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Handle WiFi provisioning
  const handleProvisionWiFi = useCallback(async () => {
    if (!selectedDevice) {
      setProvisioningError({
        message: 'No device selected. Please select a device first.',
        code: 'NO_DEVICE_SELECTED',
      });
      return;
    }

    if (!selectedSSID || !wifiPassword) {
      setProvisioningError({
        message: 'Please select a WiFi network and enter the password',
        code: 'MISSING_CREDENTIALS',
      });
      return;
    }

    // Basic password validation
    if (
      wifiPassword.length <
      PROVISIONING_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH
    ) {
      setProvisioningError({
        message: `Password must be at least ${PROVISIONING_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters long`,
        code: 'INVALID_PASSWORD',
      });
      return;
    }

    setIsProvisioning(true);
    setProvisioningError(null);

    try {
      // Use the POP key from constants - must match ESP32 firmware
      const devicePassword = PROVISIONING_CONSTANTS.ESP32.PROOF_OF_POSSESSION;

      // Prepare custom data in the format expected by ESP32 firmware
      const customData = `vault_id:2;endpoint:ws://192.168.1.8:8000/logs/ws;ssid:${selectedSSID};password:${wifiPassword};`;

      console.log('=== CUSTOM DATA DEBUG ===');
      console.log('Custom data to send:', customData);
      console.log('SSID:', selectedSSID);
      console.log('Password length:', wifiPassword.length);
      console.log('Device password:', devicePassword);
      console.log('=======================');

      // Use WiFi provisioning with custom data
      await provisionDevice(selectedSSID, wifiPassword, devicePassword, {
        customData: customData
      });

      // Reset form on success
      setSelectedSSID(null);
      setWifiPassword('');
      setShowPassword(false);
    } catch (error) {
      console.error('WiFi provisioning failed:', error);
      setProvisioningError({
        message: 'Failed to provision device. Please try again.',
        code: 'PROVISIONING_FAILED',
        details: error,
      });
    } finally {
      setIsProvisioning(false);
    }
  }, [selectedSSID, wifiPassword, provisionDevice, selectedDevice]);

  // Reset all WiFi provisioning state
  const resetProvisioning = useCallback(() => {
    console.log('=== RESETTING WIFI PROVISIONING STATE ===');
    setSelectedSSID(null);
    setWifiPassword('');
    setShowPassword(false);
    setProvisioningError(null);
    setIsProvisioning(false);
    console.log('=== WIFI PROVISIONING STATE RESET ===');
  }, []);

  // Validate form - simplified for debugging
  const hasDevice = Boolean(selectedDevice);
  const hasSSID = Boolean(selectedSSID);
  const hasValidPassword =
    wifiPassword.length >=
    PROVISIONING_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH;
  const isFormValid = hasDevice && hasSSID && hasValidPassword;

  // Debug logging for form validation
  console.log('=== FORM VALIDATION DEBUG ===');
  console.log('Individual checks:', {
    hasDevice,
    hasSSID,
    hasValidPassword,
    passwordLength: wifiPassword.length,
    minPasswordLength: PROVISIONING_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH,
  });
  console.log('Final result:', { isFormValid });
  console.log('============================');

  return {
    // State
    selectedSSID,
    wifiPassword,
    showPassword,
    isProvisioning,
    provisioningError,
    wifiNetworks,
    scanning,
    wifiScanError,

    // Actions
    setWifiPassword,
    handleNetworkSelect,
    togglePasswordVisibility,
    handleProvisionWiFi,
    startWiFiScan,
    resetProvisioning,

    // Computed
    isFormValid,
  };
};
