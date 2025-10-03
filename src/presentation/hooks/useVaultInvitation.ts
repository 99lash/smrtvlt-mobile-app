import { useState, useCallback } from 'react';

// Use the same BASE_URL as UserService for consistency
const API_CONFIG = {
  BASE_URL: 'https://quenchlessly-headachy-enriqueta.ngrok-free.dev',
};

interface InvitationData {
  vault_id: number;
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
    isLoading,
    error,
  };
};