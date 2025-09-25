import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { LogIn } from 'lucide-react-native';
import ButtonPrimary from '../../buttons/ButtonPrimary';
import LoginModal from './LoginModal';

const Login = () => {
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const handleLoginSuccess = () => {
    console.log('Login successful - user authenticated');
    //TODO
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

export default Login;