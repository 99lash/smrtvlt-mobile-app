import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
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
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-surface-default">
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              {icon && iconPosition === 'left' && <View className="mr-2">{icon}</View>}
              <Text className="text-lg font-bold text-text-dark">{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {children}
          </ScrollView>

          {/* Footer */}
          {(primaryAction || secondaryAction) && (
            <View className="p-4 border-t border-gray-200">
              <View className="gap-3">
                {primaryAction && (
                  <ButtonPrimary
                    title={primaryAction.label}
                    onPress={primaryAction.onPress}
                    disabled={primaryAction.disabled}
                    loading={primaryAction.loading}
                  />
                )}
                <ButtonSecondary
                  title={secondaryAction?.label ?? 'Close'}
                  onPress={secondaryAction?.onPress ?? onClose}
                />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CustomModal;