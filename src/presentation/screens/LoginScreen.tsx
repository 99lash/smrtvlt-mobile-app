import React from 'react';
import { View } from 'react-native';
import Login from '../component/users/login/Login';
import { useAuthContext } from '../context/AuthContext';

const LoginScreen = () => {
  const { checkAuthStatus } = useAuthContext();

  const handleLoginSuccess = async () => {
    console.log('LoginScreen - Login successful - refreshing auth status');
    // Refresh the authentication status to update the app state
    await checkAuthStatus();
  };

  return (
    <View className="flex-1 bg-white">
      <Login onLoginSuccess={handleLoginSuccess} />
    </View>
  );
};

export default LoginScreen;