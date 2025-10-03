import { useState, useCallback } from 'react';

// Use environment variable for API base URL with fallback
const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://192.168.1.8:8000'
    : 'https://quenchlessly-headachy-enriqueta.ngrok-free.dev',
};

interface InvitationData {
  vault_id: number;  // This is the integer vault ID
  device_id?: string; // Add device_id as optional for admin check
  role: 'admin' | 'member' | 'guest';
  expires_in_hours: number;
}

interface InvitationResponse {
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

interface ValidationResponse {
  valid: boolean;
  reason?: string;
  expired?: boolean;
  accepted?: boolean;
  vault_id?: number;
  role?: string;
  expires_at?: string;
}

export const useVaultInvitation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInvitation = useCallback(async (
    invitationData: InvitationData,
    token: string
  ): Promise<InvitationResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // First, check if user is admin of the vault (use device_id, not vault_id)
      console.log("vault id : " + invitationData.vault_id);
      const adminCheckResponse = await fetch(`${API_CONFIG.BASE_URL}/vault-memberships/vaults/${invitationData.vault_id}/admin-check`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!adminCheckResponse.ok) {
        if (adminCheckResponse.status === 403) {
          throw new Error('Admin access required to create invitations 1');
        } else {
          throw new Error('Failed to verify admin access');
        }
      }

      const adminCheckResult = await adminCheckResponse.json();
      console.log('Admin check result structure:', adminCheckResult);

      // Handle both old format (is_admin at root) and new format (is_admin in data)
      const isAdmin = adminCheckResult.is_admin || (adminCheckResult.data && adminCheckResult.data.is_admin);

      if (!isAdmin) {
        throw new Error('Admin access required to create invitations 2');
      }

      // If admin check passes, create the invitation
      const response = await fetch(`${API_CONFIG.BASE_URL}/vault-invitations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(invitationData),
      });

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.detail || 'Failed to create invitation');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateInvitation = useCallback(async (inviteCode: string): Promise<ValidationResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/vault-invitations/${inviteCode}`);
      const result = await response.json();

      if (result.success) {
        return {
          valid: result.data.is_valid,
          reason: result.data.is_valid ? 'Invitation is valid' : 'Invitation is invalid',
          expired: result.data.is_expired,
          accepted: result.data.accepted,
          vault_id: result.data.vault_id,
          role: result.data.role,
          expires_at: result.data.expires_at,
        };
      } else {
        return {
          valid: false,
          reason: result.detail || 'Invalid invitation',
        };
      }
    } catch (err) {
      return {
        valid: false,
        reason: 'Network error occurred',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptInvitation = useCallback(async (
    inviteCode: string,
    userToken: string
  ): Promise<{ success: boolean; vault_id?: number; role?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/vault-invitations/${inviteCode}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          vault_id: result.data.vault_id,
          role: result.data.role,
        };
      } else {
        throw new Error(result.detail || 'Failed to accept invitation');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkVaultAdmin = useCallback(async (
    vaultId: number,
    token: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/vault-memberships/vaults/${vaultId}/admin-check`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Handle both old format (is_admin at root) and new format (is_admin in data)
        const isAdmin = result.is_admin || (result.data && result.data.is_admin);
        return isAdmin || false;
      } else if (response.status === 403) {
        return false;
      } else {
        throw new Error('Failed to check admin status');
      }
    } catch (err) {
      console.error('Admin check failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getVaultInvitations = useCallback(async (
    vaultId: number,
    adminToken: string
  ): Promise<InvitationResponse[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/vault-invitations/vault/${vaultId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        return result.data.invitations;
      } else {
        throw new Error(result.detail || 'Failed to get invitations');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createInvitation,
    validateInvitation,
    acceptInvitation,
    getVaultInvitations,
    checkVaultAdmin,
    isLoading,
    error,
  };
};