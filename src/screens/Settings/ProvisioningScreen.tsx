import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Platform } from 'react-native';
import {
  ESPProvisionManager,
  ESPDevice,
  ESPTransport,
  ESPSecurity,
} from '@orbital-systems/react-native-esp-idf-provisioning';
import {
  checkMultiple,
  requestMultiple,
  RESULTS,
  PERMISSIONS,
  Permission,
} from 'react-native-permissions';

const ProvisioningScreen = () => {
  const [devices, setDevices] = useState<ESPDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<ESPDevice | null>(null);
  const [ssid, setSsid] = useState<string>('');
  const [passphrase, setPassphrase] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  // ✅ Use PERMISSIONS constants instead of raw strings
  const permissions: Permission[] =
    Platform.select({
      android: [
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      ],
    }) || [];

  const requestPermissions = async () => {
    try {
      const statuses = await requestMultiple(permissions);
      const allGranted = Object.values(statuses).every(
        (status) => status === RESULTS.GRANTED,
      );

      if (!allGranted) {
        Alert.alert(
          'Permission Denied',
          'Please grant all required permissions (Bluetooth and Location) to scan for devices.',
          [{ text: 'OK' }],
        );
        return false;
      }
      return true;
    } catch (error) {
      setStatus(`Permission request error: ${(error as Error).message}`);
      return false;
    }
  };

  const scanDevices = async () => {
    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) {
      setStatus('Cannot scan: Permissions not granted');
      return;
    }
    try {
      setStatus('Scanning...');
      const prefix = 'PROV_';
      const transport = ESPTransport.ble;
      const security = ESPSecurity.secure2;
      const foundDevices = await ESPProvisionManager.searchESPDevices(
        prefix,
        transport,
        security,
      );
      setDevices(foundDevices);
      setStatus(foundDevices.length > 0 ? 'Devices found' : 'No devices found');
    } catch (error) {
      setStatus(`Scan error: ${(error as Error).message}`);
    }
  };

  const connectAndProvision = async (device: ESPDevice) => {
    try {
      setStatus('Connecting...');
      const proofOfPossession = 'your_pop_here';
      await device.connect(proofOfPossession);

      setStatus('Provisioning WiFi...');
      await device.provision(ssid, passphrase);

      setStatus('Sending API key...');
      const customData = apiKey;
      await device.sendData('api-key', customData);

      setStatus('Provisioning complete');
      device.disconnect();
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
      device.disconnect();
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Scan for ESP32" onPress={scanDevices} />
      {devices.map((device, index) => (
        <Button
          key={index}
          title={`Provision ${device.name}`}
          onPress={() => {
            setSelectedDevice(device);
            connectAndProvision(device);
          }}
        />
      ))}
      <TextInput
        placeholder="WiFi SSID"
        value={ssid}
        onChangeText={setSsid}
      />
      <TextInput
        placeholder="WiFi Passphrase"
        value={passphrase}
        onChangeText={setPassphrase}
        secureTextEntry
      />
      <TextInput
        placeholder="API Key"
        value={apiKey}
        onChangeText={setApiKey}
      />
      <Text>{status}</Text>
    </View>
  );
};

export default ProvisioningScreen;
