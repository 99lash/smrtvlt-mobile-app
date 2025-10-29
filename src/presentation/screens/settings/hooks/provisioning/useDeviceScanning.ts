import { useState, useCallback } from 'react';
import { useProvisioning } from './useProvisioning';
import { PROVISIONING_CONSTANTS } from '../../../../../utils/provisioningConstants';
import type { ProvisioningError } from '../../../../../types/ProvisioningTypes';
import type { ESPDevice } from '@orbital-systems/react-native-esp-idf-provisioning';
import { BLEService } from '../../../../../service/BLEService';

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
    console.log('🔍 useDeviceScanning: Starting scan...');
    setIsScanning(true);
    setScanningError(null);

    try {
      // Request permissions first
      console.log('🔐 useDeviceScanning: Requesting Bluetooth and Location permissions...');
      const permissionsGranted = await BLEService.requestPermissions();
      
      if (!permissionsGranted) {
        console.error('❌ useDeviceScanning: Permissions not granted');
        setScanningError({
          message: 'Bluetooth and Location permissions are required to scan for devices. Please grant these permissions in your device settings.',
          code: 'PERMISSION_DENIED',
          details: null
        });
        return;
      }
      
      console.log('✅ useDeviceScanning: Permissions granted');
      console.log('🔍 useDeviceScanning: Calling scanDevices()...');
      await scanDevices();
      console.log('✅ useDeviceScanning: Scan completed successfully');
      setHasScanned(true);
    } catch (error) {
      console.error('❌ useDeviceScanning: Device scanning failed:', error);
      console.error('❌ useDeviceScanning: Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ useDeviceScanning: Error message:', error instanceof Error ? error.message : String(error));
      
      setScanningError({
        message: 'Failed to scan for devices. Please check your Bluetooth connection and try again.',
        code: 'SCAN_FAILED',
        details: error
      });
    } finally {
      console.log('🏁 useDeviceScanning: Scan finished, setting isScanning to false');
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