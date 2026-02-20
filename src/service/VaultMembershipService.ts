import { ApiService } from './ApiService';
import { VaultMembershipResponse } from '../types/UserTypes';
import { API_CONFIG } from '../config/api';

/**
 * VaultMembershipService handles interactions related to vault members.
 */
export class VaultMembershipService {
  /**
   * Fetch all members of a specified vault.
   * @param vaultId - The ID of the vault to fetch members for.
   */
  static async fetchVaultMembers(vaultId: number): Promise<VaultMembershipResponse[]> {
    const endpoint = API_CONFIG.ENDPOINTS.VAULTS.MEMBERS(vaultId);
    try {
      const response: any = await ApiService.get(endpoint);
      // Some ApiService implementations return only the data object instead of a response with "ok"
      const data = response?.data ?? response;

      if (!data) {
        throw new Error('Empty response when fetching vault members.');
      }

      return Array.isArray(data) ? data : (data.data ?? []);
    } catch (error: any) {
      const message =
        error?.message ||
        `Failed to fetch vault members: ${error?.status || 'unknown status'}`;
      throw new Error(message);
    }
  }

  /**
   * Remove a specific user from a vault.
   * @param vaultId - The ID of the vault.
   * @param userId - The ID of the user to remove.
   */
  static async removeUserFromVault(vaultId: number, userId: number): Promise<void> {
    const endpoint = API_CONFIG.ENDPOINTS.VAULTS.REMOVE_MEMBER(vaultId, userId);
    try {
      const response: any = await ApiService.delete(endpoint);
      // ApiService.delete returns parsed JSON. Check for success field from backend Response schema
      if (!response || response.success === false) {
        throw new Error(response?.detail || `Failed to remove user ${userId} from vault ${vaultId}`);
      }
    } catch (error: any) {
      // Re-throw with better error message
      const message = error?.message || `Failed to remove user ${userId} from vault ${vaultId}`;
      throw new Error(message);
    }
  }

  /**
   * Add a user to a vault with a specific role.
   * @param vaultId - The ID of the vault.
   * @param userId - The user_id of the user to add.
   * @param role - The role to grant: 'ADMIN' | 'MEMBER' | 'VIEWER'
   */
  static async addMember(vaultId: string, userId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER'): Promise<void> {
    const endpoint = API_CONFIG.ENDPOINTS.VAULTS.ADD_MEMBER(vaultId);
    try {
      await ApiService.post(endpoint, { user_id: userId, role });
    } catch (error: any) {
      const message = error?.message || `Failed to add user ${userId} to vault ${vaultId}`;
      throw new Error(message);
    }
  }

  /**
   * Search for a user by email address.
   * @param email - The email address to search for.
   * @returns The matched user or null if not found.
   */
  static async searchUserByEmail(email: string): Promise<{ user_id: string; email: string; full_name: string | null } | null> {
    const endpoint = API_CONFIG.ENDPOINTS.USERS.SEARCH(email);
    try {
      const data: any = await ApiService.get(endpoint);
      return data ?? null;
    } catch (error: any) {
      // Return null on 404 (user not found)
      if (error?.status === 404) {
        return null;
      }
      const message = error?.message || `Failed to search for user with email ${email}`;
      throw new Error(message);
    }
  }
}

export default VaultMembershipService;
