import { useState, useCallback } from 'react';
import { useProvisioning } from './useProvisioning';
import { PROVISIONING_CONSTANTS } from '../../../utils/provisioningConstants';
import type { ProvisioningError } from '../../../types/ProvisioningTypes';
import type { ESPDevice } from '@orbital-systems/react-native-esp-idf-provisioning';

/**
 * Custom hook for device scanning logic
 * Handles device discovery, selection, and scanning state management
 */
export const useDeviceScanning = () => {
  const { devices, scanDevices, setSelectedDevice } = useProvisioning();

  // Device scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanningError, setScanningError] = useState<ProvisioningError | null>(null);

  // Handle device scan
  const handleScan = useCallback(async () => {
    setIsScanning(true);
    setScanningError(null);

    try {
      await scanDevices();
      setHasScanned(true);
    } catch (error) {
      console.error('Device scanning failed:', error);
      setScanningError({
        message: 'Failed to scan for devices. Please check your Bluetooth connection and try again.',
        code: 'SCAN_FAILED',
        details: error
      });
    } finally {
      setIsScanning(false);
    }
  }, [scanDevices]);

  // Handle device selection
  const handleDeviceSelect = useCallback((device: ESPDevice) => {
    setSelectedDevice(device);
    setScanningError(null);
  }, [setSelectedDevice]);

  // Reset scanning state
  const resetScanning = useCallback(() => {
    setHasScanned(false);
    setScanningError(null);
  }, []);

  // Computed values
  const hasDevices = devices.length > 0;
  const isLoading = isScanning;

  return {
    // State
    devices,
    isScanning,
    hasScanned,
    scanningError,
    hasDevices,
    isLoading,

    // Actions
    handleScan,
    handleDeviceSelect,
    resetScanning,
  };
};