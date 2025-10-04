import React from 'react';
import { View } from 'react-native';
import Login from '../component/users/login/Login';
import { useAuthContext } from '../context/AuthContext';

const LoginScreen = () => {
  const { login } = useAuthContext();

  const handleLoginSuccess = async () => {
    console.log('LoginScreen - Login successful - user authenticated');
    // Auth context will automatically update and AppNavigator will show BottomTabNavigator
  };

  return (
    <View className="flex-1 bg-white">
      <Login onLoginSuccess={handleLoginSuccess} />
    </View>
  );
};

export default LoginScreen;