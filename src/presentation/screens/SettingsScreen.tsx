import React from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';
import { useAuthContext } from '../context/AuthContext';
import ButtonPrimary from '../component/buttons/ButtonPrimary';
import Provisioning from '../component/provisioning/Provisioning'
const SettingsScreen = () => {
  const { logout } = useAuthContext();

  const handleLogout = () => {
    //TODO Refactor logout btn
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              console.log('User logged out successfully');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-gray-800">Settings</Text>
        </View>

        {/* Settings Content */}
        <View className="flex-1">
          <Provisioning/>

          {/* Logout Section */}
          <View className="mt-8 pt-8 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center justify-center bg-red-50 p-4 rounded-lg border border-red-200"
            >
              <LogOut size={20} color="#EF4444" />
              <Text className="text-red-600 font-medium ml-2">Logout</Text>
            </TouchableOpacity>

            <Text className="text-sm text-gray-500 text-center mt-2">
              Sign out of your account
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;