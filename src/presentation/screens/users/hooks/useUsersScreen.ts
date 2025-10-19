import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useUsersData } from '../../../hooks/user/useUsersData';

type TabType = 'users' | 'vaults';

export const useUsersScreen = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [showActionModal, setShowActionModal] = useState(false);

  // Use extracted data hook
  const { users, vaults, loading, error, loadData } = useUsersData(isAuthenticated);

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

    // Data state
    users,
    vaults,
    loading,
    error,
    loadData,
  };
};