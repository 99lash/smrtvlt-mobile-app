import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Loader } from 'lucide-react-native';

// Extracted components
import { TabNavigation } from './users/components/TabNavigation';
import { TabContent } from './users/components/TabContent';
import { FloatingActionButton } from '../component/buttons/FloatingActionButton';
import { EnhancedEmptyState } from '../component/common/EnhancedEmptyState';

const DUMMY_USERS = [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', status: 'active', lastAccess: new Date().toISOString() },
  { id: 2, username: 'guest', email: 'guest@example.com', role: 'guest', status: 'pending', lastAccess: new Date().toISOString() }
];

const DUMMY_VAULTS = [
  { vault_id: 1, vault_name: 'Main Vault', role: 'admin', created_at: new Date().toISOString() },
  { vault_id: 2, vault_name: 'Secondary Vault', role: 'member', created_at: new Date().toISOString() }
];

export default function UsersScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);

  const handleUserPress = (user: any) => console.log('User pressed:', user.username);
  const handleVaultSelect = (id: any) => console.log('Vault selected:', id);
  const handleTransferOwnership = (user: any) => console.log('Transfer to:', user.username);
  const loadData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-bg-default">
        <EnhancedEmptyState
          icon={Loader}
          title="Loading"
          message="Please wait..."
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg-default pt-4">
      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <TabContent
        activeTab={activeTab}
        users={DUMMY_USERS}
        vaults={DUMMY_VAULTS}
        onUserPress={handleUserPress}
        onVaultSelect={handleVaultSelect}
        onRefresh={loadData}
        onTransferOwnership={handleTransferOwnership}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => console.log('FAB pressed')} />
    </View>
  );
}