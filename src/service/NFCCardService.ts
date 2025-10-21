import { ApiService, ApiError } from './ApiService';
import {
  NFCCardCreateRequest,
  NFCCardResponse,
  NFCCardCreateResponse,
  NFCCardServiceResponse,
  NFCCardWithUserResponse
} from '../types/NFCCardTypes';

export class NFCCardService {
  private static getBaseUrl(): string {
    return '/nfc-cards';
  }

  /**
    * Register a new NFC card
    * For members: userId is optional (backend auto-assigns)
    * For admins: userId can be provided to assign to specific user
    */
  static async registerCard(
    uid: string,
    vaultId: number,
    token?: string,
    userId?: number,
    name?: string
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
        vault_id: vaultId,
        // Only include user_id if explicitly provided (for admin assignments)
        ...(userId && { user_id: userId }),
        ...(name && { name })
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

      // Handle role-based limit errors
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          return {
            success: false,
            error: 'Members are limited to 1 NFC card per vault'
          };
        }
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
        data: response as any
      };
    } catch (error) {
      console.error('Error fetching NFC card:', error);

      // Re-throw ApiError so isCardRegistered can handle 404 properly
      if (error instanceof ApiError) {
        throw error;
      }

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
    * Get all NFC cards for a specific vault with usernames
    */
  static async getCardsByVault(
    vaultId: number,
    token?: string
  ): Promise<{ success: boolean; data?: NFCCardWithUserResponse[]; error?: string }> {
    try {
      const response = await ApiService.get<NFCCardWithUserResponse[]>(
        `${this.getBaseUrl()}/vault/${vaultId}`,
        token
      );

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching NFC cards by vault:', error);

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: false,
        error: 'Failed to fetch NFC cards'
      };
    }
  }

 /**
   * Hard delete an NFC card (permanent deletion)
   */
 static async hardDeleteCard(
   cardId: number,
   token?: string
 ): Promise<void> {
   try {
     await ApiService.delete(
       `${this.getBaseUrl()}/${cardId}/hard`,
       token
     );
   } catch (error) {
     console.error('Error hard deleting NFC card:', error);
     throw error;
   }
 }

 /**
   * Delete an NFC card (soft delete)
   */
 static async deleteCard(
   cardId: number,
   token?: string
 ): Promise<void> {
   try {
     await ApiService.delete(
       `${this.getBaseUrl()}/${cardId}`,
       token
     );
   } catch (error) {
     console.error('Error deleting NFC card:', error);
     throw error;
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