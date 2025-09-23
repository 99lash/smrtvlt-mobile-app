import React from 'react';
import { View, Text } from 'react-native';
import BorderedList from '../lists/BorderedList';
import { SignalIndicator } from '../signal';

interface DeviceListProps<T> {
  devices: T[];
  onDevicePress: (device: T) => void;
  getId: (device: T) => string;
  getName: (device: T) => string;
  getSignal?: (device: T) => number | undefined;
  renderIcon?: (device: T) => React.ReactElement | null;
  renderItem?: (device: T, isSelected: boolean) => React.ReactElement;
  selectedId?: string;
  title?: string;
  maxVisibleItems?: number;
  itemHeight?: number;
}

const DeviceList = <T,>({
  devices,
  onDevicePress,
  getId,
  getName,
  getSignal,
  renderIcon,
  renderItem,
  selectedId,
  title = 'Available Devices',
  maxVisibleItems = 5,
  itemHeight = 56,
}: DeviceListProps<T>) => {
  return (
    <View className="mt-4">
      <Text className="text-sm font-semibold mb-2 text-neutral-text">
        {title} ({devices.length})
      </Text>

      <BorderedList<T>
        data={devices}
        keyExtractor={d => getId(d)}
        getId={getId} // important
        selectedId={selectedId} // highlight
        renderItem={(item, index, isSelected) =>
          renderItem ? (
            renderItem(item, false)
          ) : (
            <Text
              className={`font-medium text-neutral-text`}
            >
              {getName(item)}
            </Text>
          )
        }
        onItemPress={(_, index) => onDevicePress(devices[index])}
        iconExtractor={d => (renderIcon ? renderIcon(d) : null)}
        rightContentExtractor={d =>
          getSignal && getSignal(d) !== undefined ? (
            <SignalIndicator rssi={getSignal(d)!} compact showPercentage />
          ) : null
        }
        maxVisibleItems={maxVisibleItems}
        itemHeight={itemHeight}
      />
    </View>
  );
};

export default DeviceList;
