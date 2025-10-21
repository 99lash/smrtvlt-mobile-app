import { ApiService } from './ApiService';
import { CreateKeypadPinRequest, KeypadPinResponse, KeypadPin } from '../types/KeypadPinTypes';

export class KeypadPinService extends ApiService {
  /**
   * Create a new keypad PIN
   * For members: user_id is optional (backend auto-assigns)
   * For admins: user_id can be provided to assign to specific user
   */
  static async createPin(pinData: CreateKeypadPinRequest, token?: string): Promise<KeypadPin> {
    try {
      const response = await this.post<KeypadPinResponse>('/keypad-pins/', pinData, token);
      return response.data;
    } catch (error) {
      console.error('Error creating keypad PIN:', error);
      
      // Handle role-based limit errors
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          throw new Error('Members are limited to 1 keypad pin per vault');
        }
        throw error;
      }
      
      throw new Error('Failed to create keypad PIN');
    }
  }

  /**
   * Get all keypad PINs
   */
  static async getAllPins(token?: string): Promise<KeypadPin[]> {
    return this.get<KeypadPin[]>('/keypad-pins/', token);
  }

  /**
   * Get keypad PINs for a specific user
   */
  static async getPinsByUser(userId: number, token?: string): Promise<KeypadPin[]> {
    return this.get<KeypadPin[]>('/keypad-pins/', token, { user_id: userId.toString() });
  }

  /**
   * Get keypad PINs for a specific vault
   */
  static async getPinsByVault(vaultId: number, token?: string): Promise<KeypadPin[]> {
    return this.get<KeypadPin[]>('/keypad-pins/', token, { vault_id: vaultId.toString() });
  }

  /**
   * Assign PIN to user
   */
  static async assignPinToUser(pinId: number, userId: number, token?: string): Promise<void> {
    return this.patch<void>(`/keypad-pins/${pinId}/assign`, { user_id: userId }, token);
  }

  /**
    * Hard delete a keypad PIN (permanent deletion)
    */
  static async hardDeletePin(pinId: number, token?: string): Promise<void> {
    return this.delete<void>(`/keypad-pins/${pinId}/hard`, token);
  }

  /**
    * Delete a keypad PIN (soft delete)
    */
  static async deletePin(pinId: number, token?: string): Promise<void> {
    return this.delete<void>(`/keypad-pins/${pinId}`, token);
  }
}
