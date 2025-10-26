import React from 'react';
import { View } from 'react-native';
import Login from '../component/users/login/Login';
import { useAuthContext } from '../context/AuthContext';

const LoginScreen = () => {
  const { updateAuthState } = useAuthContext();

  const handleLoginSuccess = async () => {
    console.log('LoginScreen - Login successful - updating auth state');
    // Update auth state after login flow completes
    await updateAuthState();
  };

  return (
    <View className="flex-1 bg-white">
      <Login onLoginSuccess={handleLoginSuccess} />
    </View>
  );
};

export default LoginScreen;