import { ApiService } from './ApiService';
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
    token?: string
  ): Promise<NFCCardServiceResponse> {
    try {
      const payload: NFCCardCreateRequest = {
        uid,
        ...(userId && { user_id: userId })
      };

      const response = await ApiService.post<NFCCardCreateResponse>(
        this.getBaseUrl(),
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
}