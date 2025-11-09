import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useUsersData } from '../../../hooks/user/useUsersData';

interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role: string;
  status: string;
  lastAccess: string;
  enabled: boolean;
}

type TabType = 'users' | 'vaults';

export const useUsersScreen = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [showActionModal, setShowActionModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedUserForTransfer, setSelectedUserForTransfer] = useState<User | null>(null);

  // Use extracted data hook
  const { users, vaults, loading, error, loadData } = useUsersData(isAuthenticated);

  const handleTransferOwnership = (user: User) => {
    setSelectedUserForTransfer(user);
    setShowTransferModal(true);
  };

  const handleCloseTransferModal = async () => {
    setShowTransferModal(false);
    setSelectedUserForTransfer(null);
    // Refresh data when modal closes
    await loadData();
  };

  const handleRefreshAfterTransfer = async () => {
    console.log('🔄 useUsersScreen: Refreshing data after transfer');
    await loadData();
  };

  return {
    // Authentication state
    isAuthenticated,
    authLoading,

    // Tab state
    activeTab,
    setActiveTab,

    // Modal state
    showActionModal,
    setShowActionModal,
    showTransferModal,
    selectedUserForTransfer,
    handleTransferOwnership,
    handleCloseTransferModal,
    handleRefreshAfterTransfer,

    // Data state
    users,
    vaults,
    loading,
    error,
    loadData,
  };
};