import { BleManager } from "react-native-ble-plx";
import { PermissionsAndroid, Platform } from "react-native";
import { BLEDevice, BLEScanError } from "../types/ble.types";

export class BLEService {
  private static manager = new BleManager();
  private static readonly SCAN_TIMEOUT_MS = 10000;

  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "android" && Platform.Version >= 23) {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        return Object.values(granted).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.error("Permission request failed:", error);
        return false;
      }
    }
    return true;
  }

  static startDeviceScan(
    onDeviceFound: (device: BLEDevice) => void,
    onError: (error: BLEScanError) => void,
    onComplete: () => void
  ): () => void {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        onError({ message: error.message, code: error.errorCode?.toString() });
        return;
      }

      if (device && device.name) {
        onDeviceFound({
          id: device.id,
          name: device.name,
          rssi: device.rssi ?? undefined,
        });
      }
    });

    const timeoutId = setTimeout(() => {
      this.stopDeviceScan();
      onComplete();
    }, this.SCAN_TIMEOUT_MS);

    // Return cleanup function
    return () => {
      clearTimeout(timeoutId);
      this.stopDeviceScan();
    };
  }

  static stopDeviceScan(): void {
    this.manager.stopDeviceScan();
  }

  static destroy(): void {
    this.manager.destroy();
  }
}
