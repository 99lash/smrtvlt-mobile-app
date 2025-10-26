import { useState, useCallback } from 'react';
import { VaultInvitationService, InvitationData, InvitationResponse, ValidationResponse } from '../../../../service/VaultInvitationService';
import { useErrorHandler } from '../../../hooks/common/useErrorHandler';

export const useVaultInvitation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleAPIError } = useErrorHandler();

  const createInvitation = useCallback(async (
    invitationData: InvitationData,
    token: string
  ): Promise<InvitationResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await VaultInvitationService.createInvitation(invitationData, token);
      return result;
    } catch (err) {
      const errorMessage = handleAPIError(err, {
        action: 'Create invitation',
        context: `Vault ID: ${invitationData.vault_id}`
      }, {
        showAlert: false,
        logError: true,
        fallbackMessage: 'Failed to create invitation'
      });
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [handleAPIError]);

  const validateInvitation = useCallback(async (inviteCode: string): Promise<ValidationResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await VaultInvitationService.validateInvitation(inviteCode);
      return result;
    } catch (err) {
      const errorMessage = handleAPIError(err, {
        action: 'Validate invitation',
        context: `Invite code: ${inviteCode}`
      }, {
        showAlert: false,
        logError: true,
        fallbackMessage: 'Failed to validate invitation'
      });
      setError(errorMessage);
      return {
        valid: false,
        reason: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [handleAPIError]);

  const acceptInvitation = useCallback(async (
    inviteCode: string,
    userToken: string
  ): Promise<{ success: boolean; vault_id?: number; role?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await VaultInvitationService.acceptInvitation(inviteCode, userToken);
      return result;
    } catch (err) {
      const errorMessage = handleAPIError(err, {
        action: 'Accept invitation',
        context: `Invite code: ${inviteCode}`
      }, {
        showAlert: false,
        logError: true,
        fallbackMessage: 'Failed to accept invitation'
      });
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [handleAPIError]);

  const checkVaultAdmin = useCallback(async (
    vaultId: number,
    token: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await VaultInvitationService.checkVaultAdmin(vaultId, token);
      return result;
    } catch (err) {
      const errorMessage = handleAPIError(err, {
        action: 'Check vault admin',
        context: `Vault ID: ${vaultId}`
      }, {
        showAlert: false,
        logError: true,
        fallbackMessage: 'Failed to check admin status'
      });
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleAPIError]);

  const getVaultInvitations = useCallback(async (
    vaultId: number,
    adminToken: string
  ): Promise<InvitationResponse[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await VaultInvitationService.getVaultInvitations(vaultId, adminToken);
      return result;
    } catch (err) {
      const errorMessage = handleAPIError(err, {
        action: 'Get vault invitations',
        context: `Vault ID: ${vaultId}`
      }, {
        showAlert: false,
        logError: true,
        fallbackMessage: 'Failed to get invitations'
      });
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [handleAPIError]);

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