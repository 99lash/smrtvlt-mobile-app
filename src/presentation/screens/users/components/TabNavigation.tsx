import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Users, Shield } from 'lucide-react-native';

type TabType = 'users' | 'vaults';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface TabButtonProps {
  tab: TabType;
  isActive: boolean;
  onPress: () => void;
  icon: any;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, isActive, onPress, icon: Icon, label }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-1 flex-row items-center justify-center py-4 px-2 rounded-2xl ${
      isActive ? 'bg-primary-default shadow-sm' : 'bg-transparent'
    }`}
    accessible={true}
    accessibilityRole="tab"
    accessibilityState={{ selected: isActive }}
    accessibilityLabel={`${label} tab ${isActive ? 'selected' : 'unselected'}`}
  >
    <Icon size={18} color={isActive ? '#FFFFFF' : '#9CA3AF'} />
    <Text
      className={`ml-2.5 text-sm font-black tracking-tight ${
        isActive ? 'text-text-default' : 'text-muted-default'
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <View className="px-6 py-2">
      <View 
        className="rounded-[24px] bg-surface-default border border-border-default p-1.5"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <View className="flex-row gap-1">
          <TabButton
            tab="users"
            isActive={activeTab === 'users'}
            onPress={() => onTabChange('users')}
            icon={Users}
            label="Users"
          />
          <TabButton
            tab="vaults"
            isActive={activeTab === 'vaults'}
            onPress={() => onTabChange('vaults')}
            icon={Shield}
            label="My Vaults"
          />
        </View>
      </View>
    </View>
  );
};