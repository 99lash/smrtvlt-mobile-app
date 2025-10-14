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
      if (this.isNetworkError(error)) {
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
    }

    try {
      const token = await this.getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Unable to get current user information');
      }

      const userVaults = await this.fetchUserVaults(token);
      const sharedUsers = await this.collectSharedUsers(userVaults, currentUser.id, token);

      if (__DEV__) {
        console.log('UserDataService - Successfully fetched shared vault users:', sharedUsers.length);
      }

      return sharedUsers;

    } catch (error) {
      this.logError('fetchSharedVaultUsers', error, { userId });

      // Handle network errors gracefully
      if (this.isNetworkError(error)) {
        if (__DEV__) {
          console.warn('UserDataService - Network error detected, returning empty array');
        }
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
      throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch user's vault memberships
   * @private
   */
  private static async fetchUserVaults(token: string): Promise<VaultMembershipResponse[]> {
    const vaultsData = await ApiService.get<VaultMembersResponse>(
      '/vault-memberships/user/vaults',
      token
    );

    if (__DEV__) {
      console.log('UserDataService - User vaults count:', vaultsData.data?.length || 0);
    }

    return vaultsData.data || [];
  }

  /**
   * Collect all users from shared vaults
   * @private
   */
  private static async collectSharedUsers(
    vaults: VaultMembershipResponse[],
    currentUserId: number,
    token: string
  ): Promise<User[]> {
    const sharedUsersMap = new Map<number, User>();

    for (const vaultMembership of vaults) {
      try {
        const members = await this.fetchVaultMembers(vaultMembership.vault_id, token);
        
        for (const member of members) {
          if (member.user_id !== currentUserId) {
            const user = this.transformMemberToUser(member);
            sharedUsersMap.set(user.id, user);
          }
        }
      } catch (error) {
        // Log but continue to next vault
        if (__DEV__) {
          console.warn(`UserDataService - Failed to fetch members for vault ${vaultMembership.vault_id}`, error);
        }
      }
    }

    return Array.from(sharedUsersMap.values());
  }

  /**
   * Fetch members of a specific vault
   * @private
   */
  private static async fetchVaultMembers(vaultId: number, token: string): Promise<any[]> {
    if (__DEV__) {
      console.log('UserDataService - Fetching members for vault ID:', vaultId, 'Type:', typeof vaultId);
    }

    try {
      // Use direct fetch instead of ApiService to handle the response format better
      const membersUrl = `${API_CONFIG.BASE_URL}/vault-memberships/vault/${vaultId}`;
      console.log('UserDataService - Making direct fetch to:', membersUrl);

      const response = await fetch(membersUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('UserDataService - Response status:', response.status);
      console.log('UserDataService - Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('UserDataService - Response error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const membersData = await response.json();
      console.log('UserDataService - Raw response data:', membersData);

      // Handle different response formats
      if (membersData.success && membersData.data) {
        console.log('UserDataService - Success format, data length:', membersData.data.length);
        return membersData.data;
      } else if (Array.isArray(membersData)) {
        console.log('UserDataService - Array format, length:', membersData.length);
        return membersData;
      } else {
        console.error('UserDataService - Unexpected response format:', membersData);
        return [];
      }
    } catch (error) {
      console.error('UserDataService - fetchVaultMembers error:', error);
      throw error;
    }
  }

  /**
   * Transform vault member data to User format
   * @private
   */
  private static transformMemberToUser(memberData: any): User {
    return {
      id: memberData.user_id,
      firstName: memberData.first_name || undefined,
      lastName: memberData.last_name || undefined,
      username: memberData.username || undefined,
      role: memberData.role === 'admin' ? 'admin' : 'user',
      status: 'active',
      lastAccess: memberData.created_at,
      enabled: true
    };
  }

  /**
   * Check if error is a network error
   * @private
   */
  private static isNetworkError(error: any): boolean {
    return error instanceof TypeError && error.message.includes('fetch');
  }

  /**
   * Get stored authentication token
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
   * Centralized error logging
   * @private
   */
  private static logError(operation: string, error: any, context?: any): void {
    if (!__DEV__) return;

    console.error(`UserDataService - ${operation} error:`, error);

    if (error instanceof Error) {
      console.error(`UserDataService - Error message:`, error.message);
    }

    if (context) {
      console.error('UserDataService - Context:', context);
    }

    if (this.isNetworkError(error)) {
      console.error('UserDataService - Network connectivity issue detected');
    }
  }
}