// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import UsersStack from './UsersStack';
import ActivityStack from './ActivityStack';
import SettingsStack from './SettingsStack';
import { MainTabParamList } from '../types/navigation';
import { useColorScheme } from 'react-native';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const scheme = useColorScheme();
  const navTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} sceneContainerStyle={{ backgroundColor: navTheme.colors.background }}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Users" component={UsersStack} />
      <Tab.Screen name="Activity" component={ActivityStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
}
