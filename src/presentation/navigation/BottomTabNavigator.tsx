import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, Users, Activity, Settings } from 'lucide-react-native';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import UsersScreen from '../screens/UsersScreen';
import ActivityScreen from '../screens/ActivityScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Header } from '../component/common/Header';

// Wrapper components with header
const HomeScreenWithHeader = () => (
  <View className="flex-1">
    <Header/>
    <HomeScreen
      isConnected={true}
      vaultStatus="locked"
      setVaultStatus={() => console.log('setVaultStatus')}
      hasActiveAlarm={false}
      setHasActiveAlarm={() => console.log('setHasActiveAlarm')}
    />
  </View>
);

const UsersScreenWithHeader = () => {
  return (
    <View className="flex-1 bg-black">
      <Header title="SmartVault"/>
      <UsersScreen />
    </View>
  );
};

const ActivityScreenWithHeader = () => {
  return (
    <View className="flex-1 bg-black">
      <Header title="SmartVault" />
      <ActivityScreen />
    </View>
  );
};

const SettingsScreenWithHeader = () => (
  <View className="flex-1 bg-black">
    <Header title="SmartVault" />
    <SettingsScreen />
  </View>
);

const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  
  return (
    <View className="absolute bottom-6 left-0 right-0 items-center px-4">
      <View
        style={styles.container}
        className="bg-[#1055C9] rounded-full px-4 py-3"
      >
        <View className="flex-row items-center gap-2">
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
            if (route.name === 'Users') Icon = Users;
            if (route.name === 'Activity') Icon = Activity;
            if (route.name === 'Settings') Icon = Settings;
            
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${
                  isFocused ? 'bg-white' : ''
                }`}
                android_ripple={{ color: colors.primary, borderless: true }}
              >
                <Icon 
                  color={isFocused ? '#1a0f3e' : 'rgba(255, 255, 255, 0.7)'} 
                  size={20}
                  strokeWidth={2}
                />
                {isFocused && (
                  <Text 
                    className="text-sm font-medium text-[#1a0f3e]"
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                )}
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' } // Hide default tab bar completely
      }}
    >
      <Tab.Screen name="Home" component={HomeScreenWithHeader} />
      <Tab.Screen name="Users" component={UsersScreenWithHeader} />
      <Tab.Screen name="Activity" component={ActivityScreenWithHeader} />
      <Tab.Screen name="Settings" component={SettingsScreenWithHeader} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;