import { ApiService, ApiError } from './ApiService';
import {
  NFCCardCreateRequest,
  NFCCardResponse,
  NFCCardCreateResponse,
  NFCCardServiceResponse
} from '../types/NFCCardTypes';

export class NFCCardService {
  private static getBaseUrl(): string {
    return '/nfc-cards';
  }

  /**
   * Register a new NFC card
   */
  static async registerCard(
    uid: string,
    userId?: number,
    token?: string,
    vaultId?: number
  ): Promise<NFCCardServiceResponse> {
    try {
      if (!vaultId) {
        return {
          success: false,
          error: 'Vault ID is required for NFC card registration'
        };
      }

      const payload: NFCCardCreateRequest = {
        uid,
        ...(userId && { user_id: userId }),
        vault_id: vaultId
      };

      // Add trailing slash for POST to avoid 307 redirect
      const response = await ApiService.post<NFCCardCreateResponse>(
        `${this.getBaseUrl()}/`,  // <-- Add trailing slash here
        payload,
        token
      );

      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.detail || 'Failed to register NFC card'
        };
      }
    } catch (error) {
      console.error('Error registering NFC card:', error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: false,
        error: 'Unknown error occurred while registering NFC card'
      };
    }
  }

  /**
   * Get NFC card by UID
   */
  static async getCardByUID(
    uid: string,
    token?: string
  ): Promise<NFCCardServiceResponse> {
    try {
      // No trailing slash for GET - stays as is
      const response = await ApiService.get<NFCCardResponse>(
        `${this.getBaseUrl()}/uid/${uid}`,
        token
      );

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching NFC card:', error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: false,
        error: 'Failed to fetch NFC card information'
      };
    }
  }

  /**
   * Check if NFC card is already registered
   */
  static async isCardRegistered(
    uid: string,
    token?: string
  ): Promise<boolean> {
    try {
      console.log('🔍 NFCCardService - Checking if card is registered:', uid);
      const result = await this.getCardByUID(uid, token);

      if (result.success && result.data) {
        console.log('✅ NFCCardService - Card is already registered:', uid);
        return true;
      } else {
        console.log('❌ NFCCardService - Card is not registered:', uid);
        return false;
      }
    } catch (error) {
      console.error('Error checking NFC card registration:', error);

      // Handle specific API errors properly
      if (error instanceof ApiError) {
        if (error.status === 404) {
          // 404 means card not found/not registered - this is expected!
          console.log('❌ NFCCardService - Card not found (404), card is not registered:', uid);
          return false;
        } else if (error.status === 401 || error.status === 403) {
          // Authentication errors - card might be registered but we can't check
          console.log('🚫 NFCCardService - Auth error, assuming card might be registered:', uid);
          return true; // Assume registered to be safe
        }
      }

      // For network errors and other issues, assume not registered to maintain functionality
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('fetch')) {
          console.log('⚠️ NFCCardService - Network error, assuming card not registered:', uid);
          return false; // Assume not registered for network issues
        }
      }

      // For any other errors, assume not registered (maintains functionality)
      console.log('⚠️ NFCCardService - Unknown error, assuming card not registered:', uid);
      return false;
    }
  }
}