import React from 'react';
import { View } from 'react-native';
import { User } from '../../../../types/UserTypes';
import { VaultMembership } from '../../../../service/VaultService';
import { UserList } from './UserList';
import { VaultList } from './VaultList';

type TabType = 'users' | 'vaults';

interface TabContentProps {
  activeTab: TabType;
  users: User[];
  vaults: VaultMembership[];
  onUserPress: (userId: string) => void;
  onVaultSelect: (vaultId: number) => void;
  onRefresh: () => Promise<void>;
  onTransferOwnership?: (user: User) => void;
}

export const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  users,
  vaults,
  onUserPress,
  onVaultSelect,
  onRefresh,
  onTransferOwnership,
}) => {
  return (
    <View>
      {activeTab === 'users' ? (
        <UserList
          users={users}
          onUserPress={onUserPress}
          onRefresh={onRefresh}
          onTransferOwnership={onTransferOwnership}
        />
      ) : (
        <VaultList
          vaults={vaults}
          onVaultSelect={onVaultSelect}
        />
      )}
    </View>
  );
};