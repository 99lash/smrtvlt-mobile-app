import React from 'react';
import { View, Text } from 'react-native';
import type { BadgeProps, BadgeVariantType } from '../../../types/UserTypes';
import { BADGE_STYLES, USER_CONSTANTS } from '../../../utils/userConstants';

const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const badgeStyle = BADGE_STYLES[variant] || BADGE_STYLES.default;

  return (
    <View className={`${USER_CONSTANTS.UI.BADGE_PADDING} ${USER_CONSTANTS.UI.BADGE_ROUNDED} ${badgeStyle} mr-2`}>
      <Text className={`${USER_CONSTANTS.UI.BADGE_TEXT_SIZE} text-white`}>
        {label}
      </Text>
    </View>
  );
};

export default Badge;