import { UserService } from './UserService';
import { API_CONFIG } from '../config/api';
import { ApiService } from './ApiService';
import { VaultMembersResponse } from '../types/UserTypes';

export interface VaultMembership {
  vault_id: number;
  role: 'admin' | 'member' | 'viewer';
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  detail?: string;
}

export interface AdminCheckResponse {
  success: boolean;
  data: {
    is_admin: boolean;
  };
}

export class VaultService {
  private static getBaseUrl(): string {
    return API_CONFIG.BASE_URL;
  }

  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await UserService.getStoredToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async getUserVaults(token?: string): Promise<VaultMembership[]> {
    try {
      const data = await ApiService.get<VaultMembersResponse>('/vault-memberships/user/vaults', token);

      if (!data.success) {
        throw new Error(data.detail || 'Failed to load accessible vaults');
      }

      // Transform API response to match VaultMembership interface
      return data.data.map(item => ({
        vault_id: item.vault_id,
        role: item.role as 'admin' | 'member' | 'viewer',
        created_at: item.created_at
      }));
    } catch (error) {
      console.error('Error loading user vaults:', error);
      throw error;
    }
  }

  static async checkAdminAccess(vaultId: number, token?: string): Promise<boolean> {
    try {
      const data = await ApiService.get<AdminCheckResponse>(`/vault-memberships/vaults/${vaultId}/admin-check`, token);
      return data.success && data.data.is_admin;
    } catch (error) {
      console.error('Admin check error:', error);
      throw error;
    }
  }

  /**
   * Get admin vaults only
   */
  static getAdminVaults(vaults: VaultMembership[]): VaultMembership[] {
    return vaults.filter(v => v.role === 'admin');
  }
}