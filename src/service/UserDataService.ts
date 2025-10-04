import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, VaultMembersResponse, VaultMembershipResponse } from '../types/UserTypes';
import { API_CONFIG } from '../config/api';
import { ApiService } from './ApiService';

/**
 * User Data Service
 *
 * Handles user data fetching, current user information, and user discovery.
 * Follows Single Responsibility Principle - only handles user data concerns.
 */
export class UserDataService {

  /**
   * Get current user information from token
   * @returns Promise<User | null>
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.getStoredToken();
      if (!token) {
        if (__DEV__) {
          console.log('UserDataService - No stored token found for getCurrentUser');
        }
        return null;
      }

      const userData = await ApiService.get<User>('/users/test/me', token);

      if (__DEV__) {
        console.log('UserDataService - Successfully fetched current user:', userData);
      }

      return userData;
    } catch (error) {
      this.logError('getCurrentUser', error);

      // If network error or server unreachable, don't clear token
      if (error instanceof Error && error.message.includes('fetch')) {
        return null;
      }

      // For other errors, clear token as it might be invalid
      await this.clearToken();
      return null;
    }
  }

  /**
   * Fetch users who share vault access with the specified user
   * @param userId - The user ID to find shared vault access for
   * @returns Promise<User[]>
   * @throws Error with specific message based on API response
   */
  static async fetchSharedVaultUsers(userId: number): Promise<User[]> {
    if (__DEV__) {
      console.log('UserDataService - Fetching shared vault users for user ID:', userId);
      console.log('UserDataService - Token preview:', (await this.getStoredToken())?.substring(0, 20) + '...');
    }

    try {
      const token = await this.getStoredToken();
      if (!token) {
        if (__DEV__) {
          console.error('UserDataService - No authentication token found');
        }
        throw new Error('No authentication token found');
      }

      // First, get the current user's vaults to find shared access
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Unable to get current user information');
      }

      // Get current user's vault memberships
      const vaultsData = await ApiService.get<VaultMembersResponse>('/vault-memberships/user/vaults', token);
      const userVaults = vaultsData.data || [];

      if (__DEV__) {
        console.log('UserDataService - Current user vaults:', userVaults.length);
      }

      // Collect all users from shared vaults (excluding current user)
      const sharedUsersMap = new Map<number, User>();

      for (const vaultMembership of userVaults) {
        const vaultId = vaultMembership.vault_id;

        if (__DEV__) {
          console.log('UserDataService - Fetching members for vault ID:', vaultId);
        }

        const membersUrl = `${API_CONFIG.BASE_URL}/vault-memberships/vault/${vaultId}`;

        const membersResponse = await fetch(membersUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (membersResponse.ok) {
          const membersData: VaultMembersResponse = await membersResponse.json();

          if (membersData.success && membersData.data) {
            for (const memberData of membersData.data) {
              // Skip the current user
              if (memberData.user_id !== currentUser.id) {
                // Convert membership data to User format
                const user: User = {
                  id: memberData.user_id,
                  firstName: memberData.first_name || undefined,
                  lastName: memberData.last_name || undefined,
                  username: memberData.username || undefined,
                  role: memberData.role === 'admin' ? 'admin' : 'user',
                  status: 'active', // Default status since not provided by API
                  lastAccess: memberData.created_at,
                  enabled: true // Default enabled since not provided by API
                };

                sharedUsersMap.set(user.id, user);
              }
            }
          }
        }
      }

      const sharedUsers = Array.from(sharedUsersMap.values());

      if (__DEV__) {
        console.log('UserDataService - Successfully fetched shared vault users:', sharedUsers.length);
        console.log('UserDataService - Users sharing vault access:', sharedUsers.map(u => `${u.firstName || u.username || `User ${u.id}`}`));
      }

      return sharedUsers;

    } catch (error) {
      this.logError('fetchSharedVaultUsers', error, { userId });

      // Handle network errors gracefully
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('UserDataService - Network error detected, backend may be unavailable');
        console.warn('UserDataService - Returning empty array as fallback');
        return [];
      }

      throw error;
    }
  }

  /**
   * @deprecated Use fetchSharedVaultUsers instead for vault-specific user fetching
   * Fetch all users from the backend
   * @returns Promise<User[]>
   * @throws Error with specific message based on API response
   */
  static async fetchUsers(): Promise<User[]> {
    if (__DEV__) {
      console.log('UserDataService - Fetching users');
    }

    try {
      const token = await this.getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const users = await ApiService.get<User[]>('/users', token);

      if (__DEV__) {
        console.log('UserDataService - Successfully fetched users:', users.length);
      }

      return users;

    } catch (error) {
      this.logError('fetchUsers', error);
      throw this.processError(error, 'fetching users');
    }
  }

  /**
   * Get stored authentication token
   * @returns Promise<string | null>
   * @private
   */
  private static async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      if (__DEV__) {
        console.error('UserDataService - Error getting stored token:', error);
      }
      return null;
    }
  }

  /**
   * Clear stored authentication token
   * @returns Promise<void>
   * @private
   */
  private static async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      if (__DEV__) {
        console.log('UserDataService - Token cleared successfully');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('UserDataService - Error clearing token:', error);
      }
    }
  }

  /**
   * Handle users endpoint errors
   * @private
   */
  private static handleUsersError(status: number): never {
    switch (status) {
      case 401:
        throw new Error('Authentication required to fetch users');
      case 403:
        throw new Error('Insufficient permissions to view users');
      case 500:
        throw new Error('Server error occurred while fetching users');
      default:
        throw new Error(`Failed to fetch users: ${status}`);
    }
  }

  /**
   * Centralized error logging
   * @private
   */
  private static logError(operation: string, error: any, context?: any): void {
    if (__DEV__) {
      console.error(`UserDataService - ${operation} error:`, error);

      if (error instanceof Error) {
        console.error(`UserDataService - Error type:`, error.constructor.name);
        console.error(`UserDataService - Error message:`, error.message);
        console.error(`UserDataService - Error stack:`, error.stack);
      } else {
        console.error('UserDataService - Non-Error object thrown:', error);
      }

      if (context) {
        console.error('UserDataService - Operation context:', context);
      }

      // Check if it's a network error
      if (error instanceof TypeError && 'message' in error && error.message.includes('fetch')) {
        console.error('UserDataService - This appears to be a network connectivity error');
        console.error('UserDataService - Possible causes:');
        console.error('UserDataService - 1. Server is not running');
        console.error('UserDataService - 2. Incorrect BASE_URL');
        console.error('UserDataService - 3. Network connectivity issues');
        console.error('UserDataService - 4. Firewall blocking the request');
      }
    }
  }

  /**
   * Process and enhance error messages
   * @private
   */
  private static processError(error: any, operation: string): Error {
    if (error instanceof Error) {
      return error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new Error(`Network error occurred during ${operation}`);
    }

    return new Error(`Unknown error occurred during ${operation}`);
  }
}