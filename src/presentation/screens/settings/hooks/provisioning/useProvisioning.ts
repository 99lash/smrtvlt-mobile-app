import React, { createContext, useContext, useState } from 'react';
import {
  ESPProvisionManager,
  ESPDevice,
  ESPTransport,
  ESPSecurity,
} from '@orbital-systems/react-native-esp-idf-provisioning';

// Create the context
const ProvisioningContext = createContext<any>(null);

// Context provider component
export const ProvisioningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<ESPDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<ESPDevice | null>(null);
  const [log, setLog] = useState('');

  const scanDevices = async () => {
    setLog('Scanning for devices...');
    try {
      const found = await ESPProvisionManager.searchESPDevices(
        'SV',
        ESPTransport.ble,
        ESPSecurity.secure2
      );
      setDevices(found);
      setLog(`Found ${found.length} device(s)`);
    } catch (err) {
      setLog(`Scan failed: ${err}`);
    }
  };

  const provisionDevice = async (
    ssid: string,
    password: string,
    pop: string,
    options?: { customData?: string }
  ) => {
    if (!selectedDevice) throw new Error('No device selected');

    setLog('Provisioning device...');
    try {
      await selectedDevice.connect(pop);

      // Send custom data to the ESP32's custom-data endpoint
      if (options?.customData) {
        setLog('📤 Sending custom data to ESP32...');
        try {
          const response = await selectedDevice.sendData('custom-data', options.customData);
          setLog(`✅ Custom data sent successfully: ${response}`);
          setLog(`📋 Custom data content: ${options.customData}`);
        } catch (customDataError) {
          setLog(`❌ Failed to send custom data: ${customDataError}`);
          setLog(`📋 Attempted custom data: ${options.customData}`);
          // Continue with provisioning even if custom data fails
        }
      }

      // Perform WiFi provisioning
      setLog('Provisioning WiFi credentials...');
      await selectedDevice.provision(ssid, password);
      setLog(`Provisioning successful for ${selectedDevice.name}`);
      selectedDevice.disconnect();
    } catch (err) {
      setLog(`Provisioning failed: ${err}`);
    }
  };

  const value = {
    devices,
    selectedDevice,
    setSelectedDevice,
    log,
    scanDevices,
    provisionDevice,
  };

  return React.createElement(ProvisioningContext.Provider, { value }, children);
};

// Custom hook to use the provisioning context
export function useProvisioning() {
  const context = useContext(ProvisioningContext);
  if (!context) {
    throw new Error('useProvisioning must be used within a ProvisioningProvider');
  }
  return context;
}
