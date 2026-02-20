import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Vault } from 'lucide-react-native';

interface WaitingForVaultModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
}

export const WaitingForVaultModal: React.FC<WaitingForVaultModalProps> = ({ visible, onClose, title }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/90 justify-end">
        <SafeAreaView className="bg-zinc-950 border-t border-zinc-800 rounded-t-[40px] overflow-hidden">
          {/* Handle */}
          <View className="items-center pt-4 pb-2">
            <View className="w-12 h-1 bg-zinc-700 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-8 pt-4 pb-6">
            <View>
              <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[3px]">System</Text>
              <Text className="text-white text-3xl font-black uppercase tracking-tighter mt-1">{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="bg-zinc-900 border border-zinc-800 p-2 rounded-full" activeOpacity={0.7}>
              <X size={20} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="items-center px-8 pb-16 gap-6">
            <View className="w-28 h-28 bg-zinc-900 border border-zinc-800 rounded-[32px] items-center justify-center">
              <Vault size={48} color="#FFFFFF" strokeWidth={1.5} />
            </View>
            <ActivityIndicator color="#FFFFFF" size="large" />
            <View className="items-center gap-2">
              <Text className="text-white text-2xl font-black uppercase tracking-tighter">
                Waiting for Vault{dots}
              </Text>
              <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] text-center">
                Power on the vault unit and bring it close to this device.
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="mt-4 px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl" activeOpacity={0.7}>
              <Text className="text-white font-black text-[11px] uppercase tracking-[2px]">Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};
