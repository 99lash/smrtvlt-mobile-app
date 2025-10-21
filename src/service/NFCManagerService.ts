import { StorageService } from '../config/api';
import { NFCCardService } from './NFCCardService';
import {
  NFCCard,
  NFCCardRegistrationRequest,
  NFCCardRegistrationResponse,
  NFCCardListResponse,
  NFCCardDeleteResponse,
  TokenValidationResult,
} from '../types/NFCCardTypes';

export class NFCManagerServiceClass {
  /**
   * Validates JWT token format and expiration
   */
  validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return !payload.exp || payload.exp >= currentTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets a valid token with retry logic and validation
   */
  async getValidToken(retries: number = 2): Promise<string | null> {
    for (let i = 0; i <= retries; i++) {
      try {
        const token = await StorageService.getAccessToken();

        if (!token) {
          if (i < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }

        if (this.validateTokenFormat(token)) {
          return token;
        } else {
          if (i < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    return null;
  }

  /**
   * Fetches NFC cards for a specific vault
   */
  async fetchNFCCards(vaultId: number): Promise<NFCCardListResponse> {
    try {
      console.log('🔍 NFCManagerService: Fetching NFC cards for vault:', vaultId);
      
      const token = await this.getValidToken();

      if (!token) {
        console.error('❌ NFCManagerService: No valid token available');
        return {
          success: false,
          error: 'Authentication required. Please log in again.',
        };
      }

      console.log('🔑 NFCManagerService: Token obtained, calling NFCCardService');
      const result = await NFCCardService.getCardsByVault(vaultId, token);
      console.log('📱 NFCManagerService: NFCCardService response:', result);

      if (result.success && result.data) {
        console.log('✅ NFCManagerService: Successfully fetched', result.data.length, 'NFC cards');
        return {
          success: true,
          data: result.data,
        };
      } else {
        console.error('❌ NFCManagerService: NFCCardService returned error:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to fetch NFC cards',
        };
      }
    } catch (error) {
      console.error('❌ NFCManagerService: Exception occurred:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch NFC cards';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Registers a new NFC card
   */
  async registerNFCCard(
    uid: string,
    userId: number,
    vaultId?: number,
    cardName?: string,
  ): Promise<NFCCardRegistrationResponse> {
    try {
      const token = await this.getValidToken();

      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please log in again.',
        };
      }

      const registrationRequest: NFCCardRegistrationRequest = {
        uid,
        user_id: userId,
        vault_id: vaultId,
        name: cardName?.trim(),
      };

      const result = await NFCCardService.registerCard(
        registrationRequest.uid,
        registrationRequest.vault_id!,
        token,
        registrationRequest.user_id || undefined,
        registrationRequest.name,
      );

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to register NFC card',
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to register NFC card';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Deletes an NFC card permanently
   */
  async deleteNFCCard(cardId: number): Promise<NFCCardDeleteResponse> {
    try {
      const token = await this.getValidToken();

      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please log in again.',
        };
      }

      await NFCCardService.hardDeleteCard(cardId, token);

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete NFC card';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

// Export singleton instance
export const NFCManagerService = new NFCManagerServiceClass();