import { useState, useCallback } from "react";
import WifiManager from "react-native-wifi-reborn";

export interface WiFiNetwork {
  ssid: string;
  rssi?: number;
  security?: string;
}

interface UseWiFiScanningReturn {
  wifiNetworks: WiFiNetwork[];
  scanning: boolean;
  error: string | null;
  startScan: () => Promise<void>;
  clearNetworks: () => void;
  clearError: () => void;
}

export const useWiFiScanning = (): UseWiFiScanningReturn => {
  const [wifiNetworks, setWifiNetworks] = useState<WiFiNetwork[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScan = useCallback(async () => {
    setScanning(true);
    setError(null);
    setWifiNetworks([]);

    try {
      const networks = await WifiManager.reScanAndLoadWifiList();
      setWifiNetworks(
        networks.map(n => ({
          ssid: n.SSID,
          rssi: n.level,
          security: n.capabilities,
        }))
      );
    } catch (err: any) {
      console.error("Wi-Fi scan failed:", err);
      setError(err.message || "Wi-Fi scan failed");
    } finally {
      setScanning(false);
    }
  }, []);

  const clearNetworks = useCallback(() => setWifiNetworks([]), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    wifiNetworks,
    scanning,
    error,
    startScan,
    clearNetworks,
    clearError,
  };
};
