import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Login from '../component/users/login/Login';

const LoginScreen = () => {
  const navigation = useNavigation();

  const handleLoginSuccess = () => {
    console.log('LoginScreen - Login successful - navigating to Main');
    // Navigate to Main stack
    navigation.navigate('Main' as never);
  };

  return (
    <View className="flex-1 bg-black">
      <Login onLoginSuccess={handleLoginSuccess} />
    </View>
  );
};

export default LoginScreen;