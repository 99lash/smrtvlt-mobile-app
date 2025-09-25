import React from 'react';
import { CheckCircle, X, AlertTriangle } from 'lucide-react-native';
import { ActivityStatus } from '../../../types/ActivityTypes';
import { ACTIVITY_COLORS, ICON_SIZES } from '../../../utils/activityConstants';

interface StatusIconProps {
  status: ActivityStatus;
  size?: number;
}

export const StatusIcon: React.FC<StatusIconProps> = React.memo(({
  status,
  size = ICON_SIZES.medium
}) => {
  const renderIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={size} color={ACTIVITY_COLORS.success} />;
      case 'failed':
        return <X size={size} color={ACTIVITY_COLORS.failed} />;
      case 'warning':
        return <AlertTriangle size={size} color={ACTIVITY_COLORS.warning} />;
      default:
        return <CheckCircle size={size} color={ACTIVITY_COLORS.success} />;
    }
  };

  return renderIcon();
});