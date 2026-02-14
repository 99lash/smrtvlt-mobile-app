import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Unlock,
  AlertTriangle,
  Settings,
  ChevronRight
} from 'lucide-react-native';

interface QuickActionsProps {
  onRemoteUnlock?: () => void;
  onClearAlarm?: () => void;
  onSettings?: () => void;
  isConnected: boolean;
  vaultStatus: string;
  hasActiveAlarm: boolean;
  isUnlocking?: boolean;
  isClearingAlarm?: boolean;
}

const ActionCard = ({ icon: Icon, title, subtitle, onPress, disabled, variant = 'dark' }: any) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        className={`p-6 rounded-[24px] border flex-row items-center gap-4 ${
            variant === 'light' 
            ? 'bg-white border-white' 
            : 'bg-zinc-950 border-zinc-900'
        } ${disabled ? 'opacity-30' : 'active:bg-zinc-900'} mb-4`}
    >
        <View className={`w-14 h-14 rounded-2xl items-center justify-center ${variant === 'light' ? 'bg-black' : 'bg-zinc-900 border border-zinc-800'}`}>
            <Icon size={24} color="white" strokeWidth={2.5} />
        </View>
        <View className="flex-1">
            <Text className={`text-lg font-black uppercase tracking-tight leading-5 ${variant === 'light' ? 'text-black' : 'text-white'}`}>
                {title}
            </Text>
            <Text className={`text-[10px] font-black uppercase tracking-widest mt-1 ${variant === 'light' ? 'text-zinc-500' : 'text-zinc-600'}`}>
                {subtitle}
            </Text>
        </View>
        <ChevronRight size={20} color={variant === 'light' ? '#E4E4E7' : '#27272A'} />
    </TouchableOpacity>
);

export const QuickActions: React.FC<QuickActionsProps> = ({
  onRemoteUnlock,
  onClearAlarm,
  onSettings,
  isConnected,
  vaultStatus,
  hasActiveAlarm,
  isUnlocking = false,
  isClearingAlarm = false,
}) => {
  return (
    <View className="mb-4">
      <View className="flex-row items-center gap-2 mb-6">
        <View className="w-1.5 h-6 bg-white rounded-full" />
        <Text className="text-white text-xl font-black uppercase tracking-tighter ml-1">
            Shortcuts
        </Text>
      </View>

      <View>
        <ActionCard 
            icon={Unlock}
            title={isUnlocking ? "Wait..." : "Remote Unlock"}
            subtitle="Access Control"
            onPress={onRemoteUnlock}
            disabled={!isConnected || vaultStatus === 'unlocked' || isUnlocking}
            variant="light"
        />
        <ActionCard 
            icon={AlertTriangle}
            title="Clear Alarm"
            subtitle="Security Reset"
            onPress={onClearAlarm}
            disabled={!hasActiveAlarm || isClearingAlarm}
        />
        <ActionCard 
            icon={Settings}
            title="System Config"
            subtitle="Parameters"
            onPress={onSettings}
        />
      </View>
    </View>
  );
};