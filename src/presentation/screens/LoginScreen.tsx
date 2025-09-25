import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { LogIn } from 'lucide-react-native';
import ButtonPrimary from '../component/buttons/ButtonPrimary';
import LoginModal from '../component/users/login/LoginModal';
import { useAuthContext } from '../context/AuthContext';

const LoginScreen = () => {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const { login } = useAuthContext();

  const handleLoginSuccess = async () => {
    console.log('LoginScreen - Login successful - user authenticated');
    // Auth context will automatically update and AppNavigator will show BottomTabNavigator
  };

  const handleLoginError = (error: string) => {
    console.error('LoginScreen - Login error:', error);
    Alert.alert('Login Failed', error);
  };

  return (
    <View className="flex-1 bg-white px-4 py-6">
      <View className="flex-1 justify-center items-center">
        {/* Main Action Button */}
        <View className="w-full max-w-sm mb-4">
          <ButtonPrimary
            title="Login to SmartVault"
            onPress={() => setLoginModalVisible(true)}
            icon={
              <LogIn
                size={24}
                color="white"
              />
            }
            className="w-full"
          />
        </View>

        {/* Welcome Text */}
        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Welcome Back
          </Text>
          <Text className="text-gray-600 text-center px-4">
            Sign in to access your SmartVault account and manage your devices
          </Text>
        </View>

        {/* Additional Info */}
        <View className="items-center">
          <Text className="text-sm text-gray-500 text-center px-4">
            Connect and manage your IoT devices securely
          </Text>
        </View>
      </View>

      {/* Login Modal */}
      <LoginModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </View>
  );
};

export default LoginScreen;