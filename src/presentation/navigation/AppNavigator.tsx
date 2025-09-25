import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/LoginScreen';

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show main app if authenticated
  return <BottomTabNavigator />;
};

export default AppNavigator;