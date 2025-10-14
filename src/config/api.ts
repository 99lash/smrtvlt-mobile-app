import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Configuration Constants ---
export const API_CONFIG = {
  BASE_URL: process.env.BASE_URL || 'https://quenchlessly-headachy-enriqueta.ngrok-free.dev',
  
  ENDPOINTS: {
    LOGS: {
      FILTERED: (vaultId: number) => `/logs/vault/${vaultId}/filtered`,
      WS: '/logs/ws',
    },
    USERS: {
      LOGIN: '/users/login',
    },
    VAULT_MEMBERSHIPS: {
      USER_VAULTS: '/vault-memberships/user/vaults',
      ADMIN_CHECK: (vaultId: number) => `/vault-memberships/vaults/${vaultId}/admin-check`,
    },
  },
  
  DEFAULTS: {
    VAULT_ID: parseInt(process.env.DEFAULT_VAULT_ID || '2', 10),
    PREFIXES: (process.env.DEFAULT_PREFIXES || 'Locked,Tamper,DUAL,Failure,NFC').split(','),
    LOG_LIMIT: 50,
    LOG_OFFSET: 0,
  },
  
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    USER_DATA: 'user_data',
  },
} as const;

// WebSocket URL construction
const wsProtocol = API_CONFIG.BASE_URL.startsWith('https') ? 'wss://' : 'ws://';
const wsHost = API_CONFIG.BASE_URL.replace(/^https?:\/\//, '');
export const EVENT_WS_URL = process.env.EVENT_WS_URL || `${wsProtocol}${wsHost}${API_CONFIG.ENDPOINTS.LOGS.WS}`;

// Development logging
if (__DEV__) {
  console.log('🔧 === API CONFIG DEBUG ===');
  console.log('[API Config] BASE_URL:', API_CONFIG.BASE_URL);
  console.log('[API Config] DEFAULT_VAULT_ID:', API_CONFIG.DEFAULTS.VAULT_ID);
  console.log('[API Config] DEFAULT_PREFIXES:', API_CONFIG.DEFAULTS.PREFIXES);
  console.log('[API Config] WS URL:', EVENT_WS_URL);
  console.log('🔧 === API CONFIG DEBUG END ===');
}

// ============================================================================
// services/StorageService.ts - Token & Storage Management
// ============================================================================
export class StorageService {
  /**
   * Get access token from storage
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      if (__DEV__) {
        console.log('[Storage] Token retrieved:', !!token);
      }
      return token;
    } catch (error) {
      console.error('[Storage] Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Store access token
   */
  static async setAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, token);
      if (__DEV__) {
        console.log('[Storage] Token stored successfully');
      }
    } catch (error) {
      console.error('[Storage] Error storing token:', error);
      throw new Error('Failed to store access token');
    }
  }

  /**
   * Remove access token
   */
  static async removeAccessToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      if (__DEV__) {
        console.log('[Storage] Token removed');
      }
    } catch (error) {
      console.error('[Storage] Error removing token:', error);
    }
  }

  /**
   * Clear all storage
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      if (__DEV__) {
        console.log('[Storage] All data cleared');
      }
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
    }
  }
}
