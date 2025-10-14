import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, Users, Activity, Settings } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import UsersScreen from '../screens/UsersScreen';
import ActivityScreen from '../screens/ActivityScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row bg-white dark:bg-surface-dark border-border-default dark:border-border-dark">
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
            className="flex-1 items-center justify-center py-2"
            android_ripple={{ color: colors.primary, borderless: true }}
          >
            <Icon color={isFocused ? colors.primary : colors.text} size={22} />
            <Text
              className={    
                isFocused
                  ? 'text-primary'
                  : 'text-gray-500 dark:text-muted-dark'
              }
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator tabBar={(props) => <MyTabBar {...props} /> } screenOptions={{headerShown: false}}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Users" component={UsersScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
