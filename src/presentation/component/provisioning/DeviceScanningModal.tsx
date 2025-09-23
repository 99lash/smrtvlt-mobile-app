import React from 'react';
import { View, Text } from 'react-native';
import { Bluetooth, Search } from 'lucide-react-native';
import CustomModal from '../modals/CustomModal';
import ProvisioningHeader from './ProvisioningHeader';
import ButtonPrimary from '../buttons/ButtonPrimary';
import DeviceList from './DeviceList';
import { PROVISIONING_CONSTANTS } from '../../../types/provisioningConstants';
import type { ESPDevice } from '@orbital-systems/react-native-esp-idf-provisioning';

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
      title={PROVISIONING_CONSTANTS.MESSAGES.SCAN_DEVICES_TITLE}
      icon={<Bluetooth size={PROVISIONING_CONSTANTS.UI.ICON_SIZE} color={PROVISIONING_CONSTANTS.UI.ICON_COLOR} />}
      iconPosition="left"
      secondaryAction={{
        label: PROVISIONING_CONSTANTS.MESSAGES.CLOSE,
        onPress: onClose,
      }}
    >
      <ProvisioningHeader message={PROVISIONING_CONSTANTS.MESSAGES.MAKE_SURE_DEVICE_POWERED_ON} />

      <View className="mb-3">
        <ButtonPrimary
          title={isScanning ? PROVISIONING_CONSTANTS.MESSAGES.SCANNING_DEVICES : PROVISIONING_CONSTANTS.MESSAGES.SCAN_FOR_DEVICES}
          onPress={handleScan}
          loading={isScanning}
          disabled={isScanning}
          icon={<Search size={PROVISIONING_CONSTANTS.UI.ICON_SIZE} color={PROVISIONING_CONSTANTS.UI.ICON_COLOR} />}
        />
      </View>

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
            <View className="py-4 px-2 border border-gray-200 rounded-lg items-center">
              <Text className="text-gray-500">{PROVISIONING_CONSTANTS.MESSAGES.NO_DEVICES_FOUND}</Text>
            </View>
          )}
        </View>
      )}
    </CustomModal>
  );
};

export default DeviceScanningModal;