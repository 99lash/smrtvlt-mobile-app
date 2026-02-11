import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Loader } from 'lucide-react-native';

// Extracted components
import { TabNavigation } from './users/components/TabNavigation';
import { TabContent } from './users/components/TabContent';
import { FloatingActionButton } from '../component/buttons/FloatingActionButton';
import { EnhancedEmptyState } from '../component/common/EnhancedEmptyState';

const DUMMY_USERS = [
  { 
    id: 1, 
    username: 'admin', 
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com', 
    role: 'admin', 
    status: 'active', 
    lastAccess: new Date().toISOString() 
  },
  { 
    id: 2, 
    username: 'guest', 
    firstName: 'Guest',
    lastName: 'User',
    email: 'guest@example.com', 
    role: 'guest', 
    status: 'pending', 
    lastAccess: new Date().toISOString() 
  }
];

const DUMMY_VAULTS = [
  { vault_id: 1, vault_name: 'Main Vault', role: 'admin', created_at: new Date().toISOString() },
  { vault_id: 2, vault_name: 'Secondary Vault', role: 'member', created_at: new Date().toISOString() }
];

export default function UsersScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'users' | 'vaults'>('users');
  const [loading, setLoading] = useState(false);

  const handleUserPress = (userId: string) => console.log('User pressed:', userId);
  const handleVaultSelect = (id: number) => console.log('Vault selected:', id);
  const handleTransferOwnership = (user: any) => console.log('Transfer to:', user.username);
  const loadData = async () => {
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

  const renderHeader = () => (
    <View className="pt-4">
      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab as any} />

      {/* Tab Content */}
      <TabContent
        activeTab={activeTab}
        users={DUMMY_USERS as any}
        vaults={DUMMY_VAULTS as any}
        onUserPress={handleUserPress}
        onVaultSelect={handleVaultSelect}
        onRefresh={loadData}
        onTransferOwnership={handleTransferOwnership}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-bg-default">
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => console.log('FAB pressed')} />
    </View>
  );
}