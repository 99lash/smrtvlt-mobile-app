import React, { useState } from "react";
import { View, FlatList, Text } from "react-native";
import { getWifiNetworks, WifiEntry } from "../utils/wifi";
import PrimaryButton from "./PrimaryButton";
import ListItem from "./ListItem";

export default function WifiScanner() {
  const [networks, setNetworks] = useState<WifiEntry[]>([]);

  const scanWifi = async () => {
    const wifiList = await getWifiNetworks();
    setNetworks(wifiList);
  };

  const handleNetworkPress = (network: WifiEntry) => {
    console.log("Selected network:", network.SSID); // I have something to do here 
  };

  return (
    <View className="flex p-2 gap-5">
      <PrimaryButton title="Scan Wi-Fi" onPress={scanWifi} />
      <Text className="text-neutral text-xl">Available Wi-Fi Networks:</Text>

      {networks.length === 0 && <Text className="self-center">No networks found</Text>}

      <FlatList
        data={networks}
        keyExtractor={(item, index) => item.BSSID || index.toString()}
        renderItem={({ item }) => (
          <ListItem
            title={item.SSID || "Hidden Network"}
            subtitle={`Signal: ${item.level} dBm`}
            onPress={() => handleNetworkPress(item)}
          />
        )}
      />
    </View>
  );
}
