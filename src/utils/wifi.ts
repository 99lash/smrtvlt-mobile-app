import { PermissionsAndroid, Platform, Alert } from "react-native";
import WifiManager from "react-native-wifi-reborn";
import DeviceInfo from "react-native-device-info";
import requestLocationPermission from './permissions';
export type WifiEntry = {
  SSID: string;
  BSSID: string;
  level: number;
};

// This function will check if Location services are ON
export async function isLocationEnabled() {
  if (Platform.OS === "android") {
    return await DeviceInfo.isLocationEnabled();
  }
  return true;
}

// This one gets the Wi-Fi list
export async function getWifiNetworks(): Promise<WifiEntry[]> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    Alert.alert("Permission Denied", "Location permission is required to scan Wi-Fi networks.");
    return [];
  }

  const locationOn = await isLocationEnabled();
  if (!locationOn) {
    Alert.alert("Location is Off", "Please turn on Location services to scan Wi-Fi networks.");
    return [];
  }

  try {
    const networks = await WifiManager.loadWifiList();
    return networks;
  } catch (e) {
    console.log("Error loading Wi-Fi networks:", e);
    Alert.alert("Error", "Failed to scan Wi-Fi networks. Make sure Wi-Fi is ON.");
    return [];
  }
}
