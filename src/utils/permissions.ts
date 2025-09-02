import { PermissionsAndroid, Platform } from "react-native";

export default async function requestLocationPermission() {
  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location permission required",
        message: "We need your location permission to scan Wi-Fi networks.",
        buttonPositive: "OK",
        buttonNegative: "Cancel",
        buttonNeutral: "Ask Me Later",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}
