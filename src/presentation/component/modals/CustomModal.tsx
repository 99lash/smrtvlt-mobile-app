import React from 'react';
import { Modal, View, Text } from 'react-native';
import ButtonPrimary from '../buttons/ButtonPrimary';
import ButtonSecondary from '../buttons/ButtonSecondary';

type CustomModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  primaryAction?: {  
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean; 
  };
  icon?: React.ReactNode; 
  iconPosition?: 'left' | 'right'; 
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
};

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  children,
  title,
  primaryAction,
  secondaryAction,
  icon,
  iconPosition = 'left',
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-bg-default dark:bg-bg-dark p-6 rounded-2xl w-4/5 shadow-lg">
          {title && (
            <View className="flex-row items-center mb-4">
              {/* Icon on the left */}
              {icon && iconPosition === 'left' && (
                <View className="mr-2">{icon}</View>
              )}

              <Text className="text-lg font-bold text-left flex-1 text-text-default dark:text-text-dark">
                {title}
              </Text>

              {/* Icon on the right */}
              {icon && iconPosition === 'right' && (
                <View className="ml-2">{icon}</View>
              )}
            </View>
          )}

          {/* Content passed from parent */}
          {children}

          {/* Footer buttons */}
          <View className="flex-row gap-x-2 mt-4">
            {/* Secondary button (defaults to Close) */}
            <ButtonSecondary
              title={secondaryAction?.label ?? 'Close'}
              onPress={secondaryAction?.onPress ?? onClose}
              className="flex-1"
            />

            {/* Optional primary button */}
            {primaryAction && (
              <ButtonPrimary
                title={primaryAction.label}
                onPress={primaryAction.onPress}
                className="flex-1"
                disabled= {primaryAction.disabled}
                loading={primaryAction.loading}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;
