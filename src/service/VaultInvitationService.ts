import { ApiService } from './ApiService';
import { API_CONFIG } from '../config/api';
import { UserService } from './UserService';
import { VaultMembersResponse } from '../types/UserTypes';

// Types for vault invitations
export interface InvitationData {
  vault_id: number;
  device_id?: string;
  role: 'admin' | 'member' | 'guest';
  expires_in_hours: number;
}

export interface InvitationResponse {
  id: number;
  vault_id: number;
  invited_by: number;
  invite_code: string;
  role: string;
  expires_at: string;
  accepted: boolean;
  created_at: string;
  is_expired: boolean;
  is_valid: boolean;
}

export interface ValidationResponse {
  valid: boolean;
  reason?: string;
  expired?: boolean;
  accepted?: boolean;
  vault_id?: number;
  role?: string;
  expires_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  detail?: string;
}

export class VaultInvitationService {
  /**
   * Check if user is admin of a vault
   */
  static async checkVaultAdmin(vaultId: number, token: string): Promise<boolean> {
    try {
      const currentUser = await UserService.getCurrentUser();
      if (!currentUser) {
        return false;
      }

      const membersResponse = await ApiService.get<VaultMembersResponse>(
        API_CONFIG.ENDPOINTS.VAULTS.MEMBERS(vaultId),
        token
      );

      const members = Array.isArray(membersResponse)
        ? membersResponse
        : (membersResponse.data || []);
      const member = members.find(m => m.user_id === currentUser.id);
      return member?.role === 'admin';
    } catch (error: any) {
      if (error.status === 403) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Create a new vault invitation
   */
  static async createInvitation(
    invitationData: InvitationData,
    token: string
  ): Promise<InvitationResponse> {
    // First verify admin access
    const isAdmin = await this.checkVaultAdmin(invitationData.vault_id, token);
    if (!isAdmin) {
      throw new Error('Admin access required to create invitations');
    }

    const response = await ApiService.post<ApiResponse<InvitationResponse>>(
      API_CONFIG.ENDPOINTS.VAULT_INVITATIONS.CREATE,
      invitationData,
      token
    );

    if (!response.success) {
      throw new Error(response.detail || 'Failed to create invitation');
    }

    return response.data;
  }

  /**
   * Validate an invitation code
   */
  static async validateInvitation(inviteCode: string): Promise<ValidationResponse> {
    try {
      const response = await ApiService.getPublic<ApiResponse<InvitationResponse>>(
        API_CONFIG.ENDPOINTS.VAULT_INVITATIONS.VALIDATE(inviteCode)
      );

      if (response.success) {
        return {
          valid: response.data.is_valid,
          reason: response.data.is_valid ? 'Invitation is valid' : 'Invitation is invalid',
          expired: response.data.is_expired,
          accepted: response.data.accepted,
          vault_id: response.data.vault_id,
          role: response.data.role,
          expires_at: response.data.expires_at,
        };
      } else {
        return {
          valid: false,
          reason: response.detail || 'Invalid invitation',
        };
      }
    } catch (error) {
      return {
        valid: false,
        reason: 'Network error occurred',
      };
    }
  }

  /**
   * Accept an invitation
   */
  static async acceptInvitation(
    inviteCode: string,
    userToken: string
  ): Promise<{ success: boolean; vault_id?: number; role?: string }> {
    const response = await ApiService.post<ApiResponse<InvitationResponse>>(
      API_CONFIG.ENDPOINTS.VAULT_INVITATIONS.ACCEPT(inviteCode),
      {},
      userToken
    );

    if (!response.success) {
      throw new Error(response.detail || 'Failed to accept invitation');
    }

    return {
      success: true,
      vault_id: response.data.vault_id,
      role: response.data.role,
    };
  }

  /**
   * Get all invitations for a vault (admin only)
   */
  static async getVaultInvitations(
    vaultId: number,
    adminToken: string
  ): Promise<InvitationResponse[]> {
    const response = await ApiService.get<ApiResponse<{ invitations: InvitationResponse[] }>>(
      API_CONFIG.ENDPOINTS.VAULT_INVITATIONS.BY_VAULT(vaultId),
      adminToken
    );

    if (!response.success) {
      throw new Error(response.detail || 'Failed to get invitations');
    }

    return response.data.invitations;
  }
}
