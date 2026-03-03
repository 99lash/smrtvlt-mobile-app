import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, Activity, Settings } from 'lucide-react-native';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ActivityScreen from '../screens/ActivityScreen';
import SettingsScreen from '../screens/SettingsScreen';

const HomeScreenWithHeader = () => (
  <View className="flex-1 bg-bg-default">
    <HomeScreen
      isConnected={true}
      vaultStatus="locked"
      setVaultStatus={() => {}}
      hasActiveAlarm={false}
      setHasActiveAlarm={() => {}}
    />
  </View>
);

const ActivityScreenWithHeader = () => {
  return (
    <View className="flex-1 bg-bg-default">
      <ActivityScreen />
    </View>
  );
};

const SettingsScreenWithHeader = () => (
  <View className="flex-1 bg-bg-default">
    <SettingsScreen />
  </View>
);

const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      style={{ bottom: Math.max(insets.bottom, 24) }}
      className="absolute left-0 right-0 items-center px-4"
    >
      <View
        style={styles.container}
        className="bg-white rounded-full px-2 py-2 flex-row items-center justify-between"
      >
        <View className="flex-row items-center justify-center gap-1">
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key]; 
            const label =
              options.tabBarLabel !== undefined
                ? (options.tabBarLabel as string)
                : options.title !== undefined
                ? options.title
                : route.name;
            
            const isFocused = state.index === index;
            
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };
            
            let Icon = House;
            if (route.name === 'Activity') Icon = Activity;
            if (route.name === 'Settings') Icon = Settings;
            
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                className={`items-center justify-center rounded-full ${
                  isFocused ? 'bg-black px-6 py-3' : 'px-4 py-3'
                }`}
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}
              >
                <View className="flex-row items-center justify-center">
                  <Icon 
                    color={isFocused ? '#FFFFFF' : '#000000'} 
                    size={20}
                    strokeWidth={isFocused ? 2.5 : 2}
                  />
                  {isFocused && (
                    <Text 
                      className="text-xs font-black text-white ml-2 uppercase tracking-tighter"
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: '90%',
  },
});

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' } 
      }}
    >
      <Tab.Screen name="Home" component={HomeScreenWithHeader} />
      <Tab.Screen name="Activity" component={ActivityScreenWithHeader} />
      <Tab.Screen name="Settings" component={SettingsScreenWithHeader} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;