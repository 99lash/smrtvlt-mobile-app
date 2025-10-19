import React from 'react';
import { View, Text } from 'react-native';
import { Bluetooth, Search } from 'lucide-react-native';
import CustomModal from '../modals/CustomModal';
import ProvisioningHeader from './ProvisioningHeader';
import ButtonPrimary from '../buttons/ButtonPrimary';
import DeviceList from './DeviceList';
import { PROVISIONING_CONSTANTS } from '../../../utils/provisioningConstants';
import type { ESPDevice } from '@orbital-systems/react-native-esp-idf-provisioning';
import {WarningMessage} from '../../component/common/WarningMessage';

interface DeviceScanningModalProps {
  visible: boolean;
  onClose: () => void;
  onDeviceSelect: (device: ESPDevice) => void;
  // Device scanning state
  devices: ESPDevice[];
  isScanning: boolean;
  hasScanned: boolean;
  scanningError: { message: string; code?: string; details?: unknown } | null;
  hasDevices: boolean;
  // Actions
  handleScan: () => void;
}

const DeviceScanningModal: React.FC<DeviceScanningModalProps> = ({
  visible,
  onClose,
  onDeviceSelect,
  devices,
  isScanning,
  hasScanned,
  scanningError,
  hasDevices, 
  handleScan,
}) => {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title='SmartVault Devices'
      icon={<Bluetooth size={20} color='#5e5e5e' />}
      iconPosition="left"
      primaryAction={{
        label: isScanning ? PROVISIONING_CONSTANTS.MESSAGES.SCANNING_DEVICES : PROVISIONING_CONSTANTS.MESSAGES.SCAN_FOR_DEVICES,
        onPress: handleScan,
        loading: isScanning,
        disabled: isScanning,
      }}
      secondaryAction={{
        label: 'Close',
        onPress: onClose,
      }}
    >
      <ProvisioningHeader message='Make sure your SmartVault device is powered on and in pairing mode (LED blinking green).' />

      {/* Scanning error */}
      {scanningError && (
        <View className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Text className="text-red-700">{scanningError.message}</Text>
        </View>
      )}

      {/* Device list */}
      {hasScanned && (
        <View className="mt-4">
          {hasDevices ? (
            <DeviceList
              devices={devices}
              onDevicePress={onDeviceSelect}
              getId={d => d.name}
              getName={d => d.name}
              title="Scanned Devices"
            />
          ) : (
            <WarningMessage message="No devices found" />
          )}
        </View>
      )}
    </CustomModal>
  );
};

export default DeviceScanningModal;