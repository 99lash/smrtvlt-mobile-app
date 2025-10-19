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
  iconPosition?: 'left' | 'right' | 'top'; 
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
        <View className="bg-surface-default p-6 rounded-2xl w-4/5 shadow-lg max-h-[90%] flex-col">
          {title && (
            <View className="items-center mb-4">
              {/* Icon on top (centered) */}
              {icon && iconPosition === 'top' && (
                <View className="mb-3">{icon}</View>
              )}
              
              {/* Icon and title in a row (centered) */}
              {iconPosition !== 'top' && (
                <View className="flex-row items-center justify-center">
                  {/* Icon on the left */}
                  {icon && iconPosition === 'left' && (
                    <View className="mr-2">{icon}</View>
                  )}
                  
                  <Text className="text-2xl font-bold text-center text-text-default">
                    {title}
                  </Text>
                  
                  {/* Icon on the right */}
                  {icon && iconPosition === 'right' && (
                    <View className="ml-2">{icon}</View>
                  )}
                </View>
              )}
              
              {/* Title when icon is on top */}
              {iconPosition === 'top' && (
                <Text className="text-2xl font-bold text-center text-text-dark">
                  {title}
                </Text>
              )}
            </View>
          )}
          
          {/* Content passed from parent */}
          <View className="mb-6">
            {children}
          </View>

          {/* Footer buttons */}
          <View className="gap-3 border-t border-gray-200 pt-4">
            {/* Primary button */}
            {primaryAction && (
              <View className="w-full">
                <ButtonPrimary
                  title={primaryAction.label}
                  onPress={primaryAction.onPress}
                  disabled={primaryAction.disabled}
                  loading={primaryAction.loading}
                />
              </View>
            )}
            {/* Secondary button (defaults to Close) */}
            <View className="w-full">
              <ButtonSecondary
                title={secondaryAction?.label ?? 'Close'}
                onPress={secondaryAction?.onPress ?? onClose}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;