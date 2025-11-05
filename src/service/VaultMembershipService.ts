import { ApiService } from './ApiService';
import { VaultMembershipResponse } from '../types/UserTypes';

/**
 * VaultMembershipService handles interactions related to vault members.
 */
export class VaultMembershipService {
  /**
   * Fetch all members of a specified vault.
   * @param vaultId - The ID of the vault to fetch members for.
   */
  static async fetchVaultMembers(vaultId: number): Promise<VaultMembershipResponse[]> {
    // Updated endpoint to match backend route definitions
    const endpoint = `/vault-memberships/vault/${vaultId}`;
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
    // Endpoint matches backend route: DELETE /vault-memberships/{user_id}/vault/{vault_id}
    const endpoint = `/vault-memberships/${userId}/vault/${vaultId}`;
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
}

export default VaultMembershipService;