import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { User, LogOut, Settings, UserCircle, Mail } from 'lucide-react-native';
import CustomModal from './CustomModal';
import { User as UserType, getUserDisplayName } from '../../../types/UserTypes';

interface UserMenuModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserType | null;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
  onLogout: () => void;
  isLoading?: boolean;
}

const UserMenuModal: React.FC<UserMenuModalProps> = ({
  visible,
  onClose,
  user,
  onProfilePress,
  onSettingsPress,
  onLogout,
  isLoading = false,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const displayName = user ? getUserDisplayName(user) : 'User';
  const displayEmail = user?.email || '';
  const displayUsername = user?.username || '';
  const displayInitials = displayName.charAt(0).toUpperCase();

  const handleProfile = () => {
    onClose();
    onProfilePress?.();
  };

  const handleSettings = () => {
    onClose();
    onSettingsPress?.();
  };

  const handleLogout = () => {
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
            setIsLoggingOut(true);
            onClose();
            await onLogout();
            setIsLoggingOut(false);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="User Menu"
    >
      <View className="py-2">
        {/* User Info */}
        <View className="flex-row justify-start mb-6 gap-4 border border-border-dark rounded-2xl p-2">
          <View 
            className="w-16 h-16 rounded-full bg-primary-default items-center justify-center"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
            accessibilityLabel={`User avatar for ${displayName}`}
          >
            <UserCircle size={40} color="#ffffff" />
          </View>
          <View className="flex-col items-start justify-center">
            {displayEmail && (
              <View className="flex-row items-center">
                <Mail size={14} color="#9ca3af" />
                <Text 
                  className="text-text-light ml-1 text-sm"
                  accessibilityRole="text"
                  accessibilityLabel={`User email: ${displayEmail}`}
                >
                  {displayEmail}
                </Text>
              </View>
            )}
            {displayUsername && (
              <View className="flex-row items-center">
                <User size={14} color="#9ca3af" />
                <Text 
                  className="text-text-light ml-1 text-sm"
                  accessibilityRole="text"
                  accessibilityLabel={`Username: ${displayUsername}`}
                >
                  {displayUsername}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu Options */}
        <View className="gap-2">
          {onProfilePress && (
            <TouchableOpacity
              onPress={handleProfile}
              className="flex-row items-center px-4 py-3 rounded-xl bg-surface-light active:bg-surface-medium"
              accessibilityRole="button"
              accessibilityLabel="View Profile"
              accessibilityHint="Opens your profile information"
            >
              <User size={20} color="#9ca3af" />
              <Text className="text-text-dark ml-3 text-base">
                View Profile
              </Text>
            </TouchableOpacity>
          )}

          {onSettingsPress && (
            <TouchableOpacity
              onPress={handleSettings}
              className="flex-row items-center px-4 py-3 rounded-xl bg-surface-light active:bg-surface-medium"
              accessibilityRole="button"
              accessibilityLabel="Settings"
              accessibilityHint="Opens application settings"
            >
              <Settings size={20} color="#9ca3af" />
              <Text className="text-text-dark ml-3 text-base">
                Settings
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center px-4 py-3 rounded-3xl bg-red-500/10 active:bg-red-500/20"
            accessibilityRole="button"
            accessibilityLabel="Logout"
            accessibilityHint="Signs you out of the application"
            disabled={isLoggingOut || isLoading}
          >
            <LogOut size={20} color="#ef4444" />
            <Text className="text-red-500 ml-3 text-base">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
};

export default UserMenuModal;
