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
    className={`flex-1 flex-row items-center justify-center py-4 px-2 rounded-full ${
      isActive ? 'bg-cards-default' : 'bg-transparent'
    }`}
    accessible={true}
    accessibilityRole="tab"
    accessibilityState={{ selected: isActive }}
    accessibilityLabel={`${label} tab ${isActive ? 'selected' : 'unselected'}`}

    
  >
    <Icon size={20} color={isActive ? '#EEEEEE' : '#0c0a09'} />
    <Text
      className={`ml-2 font-medium ${
        isActive ? 'text-text-dark' : 'text-text-default'
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <View className="px-4 py-2">
      <View 
        className="rounded-full"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <View className="border border-surface-default rounded-full p-1.5 bg-white">
          <View className="flex-row">
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
    </View>
  );
};