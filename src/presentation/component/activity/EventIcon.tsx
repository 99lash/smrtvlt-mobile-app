import React from 'react';
import { Shield, Settings, Smartphone, User } from 'lucide-react-native';
import { ActivityEventType } from '../../../types/ActivityTypes';
import { ACTIVITY_COLORS, ICON_SIZES, EVENT_TYPE_ICONS } from '../../../utils/activityConstants';

interface EventIconProps {
  eventType: ActivityEventType;
  size?: number;
}

export const EventIcon: React.FC<EventIconProps> = React.memo(({
  eventType,
  size = ICON_SIZES.medium
}) => {
  const renderIcon = () => {
    switch (eventType) {
      case 'vault_unlock':
      case 'failed_unlock':
      case 'failed_pin':
        return <Shield size={size} color={ACTIVITY_COLORS.neutral} />;
      case 'user_added':
      case 'settings_updated':
      case 'tamper_alert':
        return <Settings size={size} color={ACTIVITY_COLORS.neutral} />;
      case 'remote_unlock':
        return <Smartphone size={size} color={ACTIVITY_COLORS.neutral} />;
      default:
        return <User size={size} color={ACTIVITY_COLORS.neutral} />;
    }
  };

  return renderIcon();
});