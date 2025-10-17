import { useState, useEffect } from 'react';
import { UserDataService } from '../../../service/UserDataService';
import { VaultService, VaultMembership } from '../../../service/VaultService';
import { User } from '../../../types/UserTypes';

interface UseUsersDataReturn {
  users: User[];
  vaults: VaultMembership[];
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
}

export const useUsersData = (isAuthenticated: boolean): UseUsersDataReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [vaults, setVaults] = useState<VaultMembership[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user's vaults
      const userVaults = await VaultService.getUserVaults();
      setVaults(userVaults);

      // Load current user to get user ID for fetching shared users
      const currentUser = await UserDataService.getCurrentUser();
      if (currentUser) {
        try {
          // Load shared vault users using current user's ID
          const sharedUsers = await UserDataService.fetchSharedVaultUsers(currentUser.id);
          setUsers(sharedUsers);
        } catch (userError) {
          // Set empty array if user fetching fails, but don't fail the entire load
          setUsers([]);
        }
      } else {
        setUsers([]);
      }

    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load users and vaults on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  return {
    users,
    vaults,
    loading,
    error,
    loadData,
  };
};