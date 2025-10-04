import { useState, useMemo, useCallback } from 'react';
import type { User, UserManagementHookReturn } from '../../../types/UserTypes';
import { UserService } from '../../../service/UserService';
import { useAuthContext } from '../../context/AuthContext';

export const useUserManagement = (): UserManagementHookReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuthContext();

  // Memoized sorted users for performance
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const nameA = a.lastName || a.username || `User ${a.id}`;
      const nameB = b.lastName || b.username || `User ${b.id}`;
      return nameA.localeCompare(nameB);
    });
  }, [users]);

  const toggleUserEnabled = useCallback((userId: string) => {
    const numericUserId = parseInt(userId, 10);
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === numericUserId
          ? { ...user, enabled: !user.enabled }
          : user
      )
    );
    setError(null);
  }, []);

  const removeUser = useCallback((userId: string) => {
    try {
      const numericUserId = parseInt(userId, 10);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== numericUserId));
      setError(null);
    } catch (err) {
      setError('Failed to remove user');
    }
  }, []);

  const refreshUsers = useCallback(async (): Promise<void> => {
    // Don't fetch if no current user
    if (!currentUser) {
      console.log('useUserManagement - No current user, skipping fetch');
      console.log('useUserManagement - Current user is null/undefined');
      setUsers([]);
      setError('Authentication required to view users');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('useUserManagement - Fetching shared vault users for user ID:', currentUser.id);
      console.log('useUserManagement - Current user details:', {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        username: currentUser.username,
        role: currentUser.role
      });

      if (!currentUser.id) {
        console.error('useUserManagement - Current user ID is missing!');
        setError('User ID is missing - please log in again');
        setUsers([]);
        return;
      }

      const fetchedUsers = await UserService.fetchSharedVaultUsers(currentUser.id);
      console.log('useUserManagement - Successfully fetched shared vault users:', fetchedUsers.length);
      console.log('useUserManagement - Fetched users:', fetchedUsers);

      // If no users found, this might be normal (user has no vault associations)
      if (fetchedUsers.length === 0) {
        console.log('useUserManagement - No shared vault users found - this may be normal if user has no vault associations');
        console.log('useUserManagement - This could mean:');
        console.log('useUserManagement - 1. User has no vaults assigned');
        console.log('useUserManagement - 2. User has vaults but no other users share them');
        console.log('useUserManagement - 3. Backend returned empty array (check server logs)');
        console.log('useUserManagement - This is expected behavior for a new user with no vault associations');
      }

      setUsers(fetchedUsers);
    } catch (err) {
      console.error('useUserManagement - Failed to fetch shared vault users:', err);
      console.error('useUserManagement - Error details:', err instanceof Error ? err.stack : err);

      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh shared vault users';

      // Provide more specific error messages based on the error type
      if (errorMessage.includes('fetch')) {
        console.error('useUserManagement - Network error - backend may be unreachable');
        setError('Unable to connect to server. Please check your internet connection and try again.');
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        console.error('useUserManagement - Authentication error - token may be invalid');
        setError('Authentication failed. Please log in again.');
      } else if (errorMessage.includes('500')) {
        console.error('useUserManagement - Server error - backend may have issues');
        setError('Server error occurred. Please try again later.');
      } else {
        setError(errorMessage);
      }

      setUsers([]); // Clear users on error
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  return {
    users,
    sortedUsers,
    isLoading,
    error,
    toggleUserEnabled,
    removeUser,
    refreshUsers,
  };
};