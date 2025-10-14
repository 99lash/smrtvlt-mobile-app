import { ApiService } from './ApiService';
import { CreateKeypadPinRequest, KeypadPinResponse, KeypadPin } from '../types/KeypadPinTypes';

export class KeypadPinService extends ApiService {
  /**
   * Create a new keypad PIN
   */
  static async createPin(pinData: CreateKeypadPinRequest, token?: string): Promise<KeypadPin> {
    const response = await this.post<KeypadPinResponse>('/keypad-pins/', pinData, token);
    return response.data;
  }

  /**
   * Get all keypad PINs
   */
  static async getAllPins(token?: string): Promise<KeypadPin[]> {
    return this.get<KeypadPin[]>('/keypad-pins/', token);
  }

  /**
   * Assign PIN to user
   */
  static async assignPinToUser(pinId: number, userId: number, token?: string): Promise<void> {
    return this.patch<void>(`/keypad-pins/${pinId}/assign`, { user_id: userId }, token);
  }
}
