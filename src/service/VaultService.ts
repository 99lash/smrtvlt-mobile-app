import { UserService } from './UserService';
import { API_CONFIG } from '../config/api';
import { ApiService } from './ApiService';
import { VaultMembersResponse } from '../types/UserTypes';
import { AccessLimits, AccessLimitsResponse } from '../types/AccessLimits';

export interface VaultMembership {
  vault_id: number;
  vault_name?: string | null;
  vault_device_id?: string | null;
  vault_location?: string | null;
  role: 'admin' | 'member' | 'guest';
  created_at: string;
  last_accessed_at?: string | null; // Timestamp of user's last successful access to this vault
}

export interface VaultCreateData {
  device_id: string;
  name: string;
  location?: string;
}

export interface VaultCreationResult {
  id: string;
  device_id: string;
  name: string;
  location?: string;
  status: string;
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

export type TransferType = 'full_transfer' | 'shared_access';

export interface TransferInitiateRequest {
  new_owner_user_id: number;
  transfer_type: TransferType;
}

export interface TransferInitiateResponse {
  success: boolean;
  data?: {
    invitation_code: string;
    expires_at: string;
    vault_id: number;
    new_owner_user_id: number;
    transfer_type: string;
  };
  detail: string;
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
      console.log('🔍 VaultService: Making API call to /vault-memberships/user/vaults');
      const data = await ApiService.get<VaultMembersResponse>('/vault-memberships/user/vaults', token);
      console.log('🔍 VaultService: Raw API response:', data);

      if (!data.success) {
        console.error('❌ VaultService: API call failed:', data);
        throw new Error(data.detail || 'Failed to load accessible vaults');
      }

      console.log('✅ VaultService: API call successful, processing data...');

      // Transform API response to match VaultMembership interface
      const transformedData = data.data.map(item => ({
        vault_id: item.vault_id,
        vault_name: item.vault_name,
        vault_device_id: item.vault_device_id,
        vault_location: item.vault_location,
        role: item.role as 'admin' | 'member' | 'guest',
        created_at: item.created_at,
        last_accessed_at: item.last_access || null
      }));

      console.log('🔍 VaultService - API Response:', data.data);
      console.log('🔍 VaultService - Transformed Data:', transformedData);

      return transformedData;
    } catch (error) {
      console.error('❌ VaultService: Error loading user vaults:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error
      });

      // Re-throw with more context
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Network error: ${String(error)}`);
      }
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

  /**
   * Get member vaults only
   */
  static getMemberVaults(vaults: VaultMembership[]): VaultMembership[] {
    return vaults.filter(v => v.role === 'member');
  }

  /**
   * Get access limits for a specific vault
   */
  static async getAccessLimits(
    vaultId: number,
    token?: string
  ): Promise<AccessLimits> {
    try {
      console.log('🔍 VaultService: Fetching access limits for vault', vaultId);
      const response = await ApiService.get<AccessLimitsResponse>(
        `/vault-memberships/vaults/${vaultId}/access-limits`,
        token
      );

      if (!response.success) {
        throw new Error(response.detail || 'Failed to fetch access limits');
      }

      console.log('✅ VaultService: Access limits fetched successfully', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ VaultService: Error fetching access limits:', error);
      throw error;
    }
  }

  /**
   * Create a new vault
   */
  static async createVault(
    vaultData: VaultCreateData,
    token?: string
  ): Promise<VaultCreationResult> {
    try {
      console.log('🔍 VaultService: Creating vault with data:', vaultData);

      const response = await ApiService.post<ApiResponse<VaultCreationResult>>(
        API_CONFIG.ENDPOINTS.VAULTS.CREATE,
        vaultData,
        token
      );

      if (!response.success) {
        throw new Error(response.detail || 'Failed to create vault');
      }

      console.log('✅ VaultService: Vault created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ VaultService: Error creating vault:', error);
      throw error;
    }
  }

  /**
   * Initiate vault ownership transfer
   */
  static async initiateOwnershipTransfer(
    vaultId: number,
    newOwnerUserId: number,
    transferType: TransferType,
    token?: string
  ): Promise<TransferInitiateResponse> {
    try {
      console.log('🔍 VaultService: Initiating ownership transfer', {
        vaultId,
        newOwnerUserId,
        transferType
      });

      const requestData: TransferInitiateRequest = {
        new_owner_user_id: newOwnerUserId,
        transfer_type: transferType,
      };

      const response = await ApiService.post<TransferInitiateResponse>(
        API_CONFIG.ENDPOINTS.VAULTS.TRANSFER_INITIATE(vaultId),
        requestData,
        token
      );

      console.log('✅ VaultService: Ownership transfer initiated successfully');
      return response;
    } catch (error) {
      console.error('❌ VaultService: Error initiating ownership transfer:', error);
      throw error;
    }
  }

  /**
   * Accept vault ownership transfer
   */
  static async acceptOwnershipTransfer(
    vaultId: number,
    invitationCode: string,
    token?: string
  ): Promise<ApiResponse<{
    vault_id: number;
    new_owner_user_id: number;
    transfer_type: string;
    accepted_at: string;
  }>> {
    try {
      console.log('🔍 VaultService: Accepting ownership transfer', {
        vaultId,
        invitationCode
      });

      const requestData = {
        invite_code: invitationCode,
      };

      const response = await ApiService.post<ApiResponse<{
        vault_id: number;
        new_owner_user_id: number;
        transfer_type: string;
        accepted_at: string;
      }>>(
        API_CONFIG.ENDPOINTS.VAULTS.TRANSFER_ACCEPT(vaultId),
        requestData,
        token
      );

      if (!response.success) {
        throw new Error(response.detail || 'Failed to accept ownership transfer');
      }

      console.log('✅ VaultService: Ownership transfer accepted successfully');
      return response;
    } catch (error) {
      console.error('❌ VaultService: Error accepting ownership transfer:', error);
      throw error;
    }
  }

  /**
   * Accept vault ownership transfer with optional vault property updates
   */
  static async acceptOwnershipTransferWithProperties(
    vaultId: number,
    transferData: {
      invite_code: string;
      device_id?: string;
      name?: string;
      location?: string;
      status?: 'locked' | 'unlocked' | 'tampered';
    },
    token?: string
  ): Promise<ApiResponse<{
    vault_id: number;
    new_owner_user_id: number;
    vault_properties_updated: string[];
    accepted_at: string;
  }>> {
    try {
      console.log('🔍 VaultService: Accepting ownership transfer with properties', {
        vaultId,
        transferData
      });

      const response = await ApiService.post<ApiResponse<{
        vault_id: number;
        new_owner_user_id: number;
        vault_properties_updated: string[];
        accepted_at: string;
      }>>(
        API_CONFIG.ENDPOINTS.VAULTS.TRANSFER_ACCEPT(vaultId),
        transferData,
        token
      );

      if (!response.success) {
        throw new Error(response.detail || 'Failed to accept ownership transfer');
      }

      console.log('✅ VaultService: Ownership transfer accepted with properties successfully');
      return response;
    } catch (error) {
      console.error('❌ VaultService: Error accepting ownership transfer with properties:', error);
      throw error;
    }
  }

  /**
   * Validate ownership transfer invitation code
   */
  static async validateOwnershipTransfer(
    invitationCode: string
  ): Promise<{
    valid: boolean;
    reason?: string;
    vault_id?: number;
    transfer_type?: string;
    expires_at?: string;
  }> {
    try {
      console.log('🔍 VaultService: Validating ownership transfer code');

      const response = await ApiService.getPublic<ApiResponse<{
        valid: boolean;
        vault_id?: number;
        transfer_type?: string;
        expires_at?: string;
        vault_name?: string;
      }>>(
        `/vaults/transfer/validate/${invitationCode}`
      );

      if (response.success && response.data.valid) {
        return {
          valid: true,
          vault_id: response.data.vault_id,
          transfer_type: response.data.transfer_type,
          expires_at: response.data.expires_at,
        };
      } else {
        return {
          valid: false,
          reason: response.detail || 'Invalid transfer code',
        };
      }
    } catch (error) {
      console.error('❌ VaultService: Error validating transfer code:', error);
      return {
        valid: false,
        reason: 'Network error occurred',
      };
    }
  }
}