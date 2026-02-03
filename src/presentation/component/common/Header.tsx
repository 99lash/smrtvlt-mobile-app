import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UserCircle } from 'lucide-react-native';
import { HEADER_CONSTANTS } from './HeaderConstants';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  titleClassName?: string;
  containerClassName?: string;
  userName?: string;
  userInitials?: string;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showBackButton = false,
  rightComponent,
  titleClassName = HEADER_CONSTANTS.DEFAULT_TITLE_CLASS,
  containerClassName = HEADER_CONSTANTS.DEFAULT_CONTAINER_CLASS,
  userName,
  userInitials,
  onProfilePress,
  onSettingsPress,
}) => {
  const displayName = userName || HEADER_CONSTANTS.DEFAULT_USER_NAME;
  const displayInitials = userInitials || HEADER_CONSTANTS.DEFAULT_USER_INITIALS;

  return (
    <View className={`flex-row items-center justify-between ${containerClassName}`}>
      {/* Title on the left */}
      <Text className='text-text-default text-l font-semibold'>
        SMARTVAULT
      </Text>
      
      {/* Right side container */}
      <View className="flex-row items-center gap-3">
        {rightComponent && (
          <View>
            {rightComponent}
          </View>
        )}
        
        {/* User Icon Button */}
        <TouchableOpacity
          onPress={() => console.log('User profile pressed')}
          className="w-10 h-10 rounded-full bg-primary-default items-center justify-center"
          style={{
            borderWidth: 1,
            borderColor: HEADER_CONSTANTS.BORDER_COLOR,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={HEADER_CONSTANTS.USER_BUTTON_ACCESSIBILITY_LABEL}
        >
          <UserCircle size={HEADER_CONSTANTS.USER_ICON_SIZE} color={HEADER_CONSTANTS.ICON_COLOR} />
        </TouchableOpacity>
      </View>
    </View>
  );
};