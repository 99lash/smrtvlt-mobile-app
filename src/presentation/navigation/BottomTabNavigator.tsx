import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, Users, Activity, Settings } from 'lucide-react-native';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import UsersScreen from '../screens/UsersScreen';
import ActivityScreen from '../screens/ActivityScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Header } from '../component/common/Header';
import { useScreenVisibility } from '../hooks/useScreenVisibility';
import { useVaultManagement } from '../hooks/VaultContext';

// Wrapper components with header
const HomeScreenWithHeader = () => (
  <View className="flex-1">
    <Header/>
    <HomeScreen
      isConnected={true}
      vaultStatus="locked"
      setVaultStatus={() => {}}
      hasActiveAlarm={false}
      setHasActiveAlarm={() => {}}
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

interface MyTabBarProps extends BottomTabBarProps {
  screenVisibility: ReturnType<typeof useScreenVisibility>;
}

function MyTabBar({ state, descriptors, navigation, screenVisibility }: MyTabBarProps) {
  const { colors } = useTheme();
  
  // Debug logging
  if (__DEV__) {
    console.log('🔍 MyTabBar - All routes:', state.routes.map(r => r.name));
    console.log('🔍 MyTabBar - screenVisibility:', screenVisibility);
  }
  
  // Filter routes based on screen visibility
  const visibleRoutes = state.routes.filter(route => {
    let shouldShow = false;
    switch (route.name) {
      case 'Home':
        shouldShow = screenVisibility.canAccessHome;
        break;
      case 'Users':
        shouldShow = screenVisibility.canAccessUsers;
        break;
      case 'Activity':
        shouldShow = screenVisibility.canAccessActivity;
        break;
      case 'Settings':
        shouldShow = screenVisibility.canAccessSettings;
        break;
      default:
        shouldShow = true;
    }
    
    if (__DEV__) {
      console.log(`🔍 MyTabBar - Route ${route.name}: ${shouldShow ? 'SHOW' : 'HIDE'}`);
    }
    
    return shouldShow;
  });
  
  if (__DEV__) {
    console.log('🔍 MyTabBar - Visible routes:', visibleRoutes.map(r => r.name));
  }
  
  return (
    <View className="absolute bottom-6 left-0 right-0 items-center px-4">
      <View
        style={styles.container}
        className="bg-[#1055C9] rounded-full px-4 py-3"
      >
        <View className="flex-row items-center gap-2">
          {visibleRoutes.map((route) => {
            const { options } = descriptors[route.key]; 
            const label =
              options.tabBarLabel !== undefined
                ? (options.tabBarLabel as string)
                : options.title !== undefined
                ? options.title
                : route.name;
            
            const isFocused = state.routes[state.index].key === route.key;
            
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
  const screenVisibility = useScreenVisibility();
  const { currentVault } = useVaultManagement();
  
  // Create a key that changes when visibility or vault changes to force navigation re-render
  const navigatorKey = React.useMemo(() => {
    const vaultId = currentVault?.vault_id || 'none';
    const role = currentVault?.role || 'none';
    return `nav-${vaultId}-${role}-${screenVisibility.canAccessUsers}-${screenVisibility.canAccessActivity}`;
  }, [currentVault?.vault_id, currentVault?.role, screenVisibility.canAccessUsers, screenVisibility.canAccessActivity]);
  
  // Debug logging
  if (__DEV__) {
    console.log('🔍 BottomTabNavigator - screenVisibility:', screenVisibility);
    console.log('🔍 BottomTabNavigator - currentVault:', currentVault);
    console.log('🔍 BottomTabNavigator - navigatorKey:', navigatorKey);
  }
  
  return (
    <Tab.Navigator
      key={navigatorKey}
      tabBar={(props) => <MyTabBar {...props} screenVisibility={screenVisibility} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' } // Hide default tab bar completely
      }}
      screenListeners={{
        tabPress: (e) => {
          const routeName = e.target?.split('-')[0];
          
          // Prevent navigation to restricted screens
          if (routeName === 'Users' && !screenVisibility.canAccessUsers) {
            e.preventDefault();
            if (__DEV__) {
              console.log('🚫 Blocked navigation to Users screen');
            }
          }
          if (routeName === 'Activity' && !screenVisibility.canAccessActivity) {
            e.preventDefault();
            if (__DEV__) {
              console.log('🚫 Blocked navigation to Activity screen');
            }
          }
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreenWithHeader} />
      {screenVisibility.canAccessUsers && (
        <Tab.Screen name="Users" component={UsersScreenWithHeader} />
      )}
      {screenVisibility.canAccessActivity && (
        <Tab.Screen name="Activity" component={ActivityScreenWithHeader} />
      )}
      <Tab.Screen name="Settings" component={SettingsScreenWithHeader} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;