import type { ESPDevice } from '@orbital-systems/react-native-esp-idf-provisioning';

/**
 * Type definitions for provisioning-related data
 */
export interface ProvisioningError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface WiFiNetwork {
  ssid: string;
  rssi: number;
  security?: string;
}

export interface ProvisioningState {
  isScanning: boolean;
  isProvisioning: boolean;
  selectedDevice: ESPDevice | null;
  selectedNetwork: string | null;
  error: ProvisioningError | null;
}