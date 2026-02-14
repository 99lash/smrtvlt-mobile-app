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
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/90 justify-center px-4">
        <SafeAreaView className="max-h-[85%] bg-zinc-950 border border-zinc-800 rounded-[40px] overflow-hidden">
            {/* Header */}
            <View className="flex-row items-center justify-between p-8 border-b border-zinc-900">
                <View className="flex-row items-center">
                {icon && iconPosition === 'left' && <View className="mr-3">{icon}</View>}
                <Text className="text-2xl font-black text-white uppercase tracking-tighter">{title}</Text>
                </View>
                <TouchableOpacity 
                    onPress={onClose} 
                    className="bg-zinc-900 p-2 rounded-full border border-zinc-800"
                >
                <X size={20} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView 
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>

            {/* Footer */}
            {(primaryAction || secondaryAction) && (
                <View className="p-8 border-t border-zinc-900 bg-black">
                <View className="gap-4">
                    {primaryAction && (
                    <ButtonPrimary
                        title={primaryAction.label}
                        onPress={primaryAction.onPress}
                        disabled={primaryAction.disabled}
                        loading={primaryAction.loading}
                    />
                    )}
                    <ButtonSecondary
                    title={secondaryAction?.label ?? 'DISMISS'}
                    onPress={secondaryAction?.onPress ?? onClose}
                    className="border-zinc-800"
                    />
                </View>
                </View>
            )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default CustomModal;