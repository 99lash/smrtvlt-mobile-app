import { ENV_CONFIG } from './env';
import { APP_CONSTANTS } from './constants';
import { log } from '../utils/logger';

// --- API Configuration ---
export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.BASE_URL,
  
  ENDPOINTS: {
    LOGS: {
      FILTERED: (vaultId: number) => `/logs/vault/${vaultId}/filtered`,
      WS: '/logs/ws',
    },
    USERS: {
      LOGIN: '/users/login',
      REGISTER: '/users/register',
      LIST: '/users/',
      ME: '/users/test/me',
      VAULT_MEMBERS: (vaultId: number) => `/vault-memberships/vault/${vaultId}`,
    },
    VAULT_MEMBERSHIPS: {
      USER_VAULTS: '/vault-memberships/user/vaults',
      ADMIN_CHECK: (vaultId: number) => `/vault-memberships/vaults/${vaultId}/admin-check`,
    },
    VAULT_INVITATIONS: {
      CREATE: '/vault-invitations/',
      VALIDATE: (code: string) => `/vault-invitations/${code}`,
      ACCEPT: (code: string) => `/vault-invitations/${code}/accept`,
      BY_VAULT: (vaultId: number) => `/vault-invitations/vault/${vaultId}`,
    },
    VAULTS: {
      CREATE: '/vaults/',
      LIST: '/vaults/',
      BY_ID: (id: string) => `/vaults/${id}`,
    },
  },
  
  DEFAULTS: {
    VAULT_ID: ENV_CONFIG.DEFAULT_VAULT_ID,
    PREFIXES: ENV_CONFIG.DEFAULT_PREFIXES,
    LOG_LIMIT: APP_CONSTANTS.DEFAULTS.LOG_LIMIT,
    LOG_OFFSET: APP_CONSTANTS.DEFAULTS.LOG_OFFSET,
  },
  
  STORAGE_KEYS: APP_CONSTANTS.STORAGE_KEYS,
} as const;

// WebSocket URL construction
const wsProtocol = API_CONFIG.BASE_URL.startsWith('https') ? 'wss://' : 'ws://';
const wsHost = API_CONFIG.BASE_URL.replace(/^https?:\/\//, '');
export const EVENT_WS_URL = ENV_CONFIG.EVENT_WS_URL || `${wsProtocol}${wsHost}${API_CONFIG.ENDPOINTS.LOGS.WS}`;

// Development logging
if (__DEV__) {
  log.debug('Config', 'API Configuration loaded', {
    BASE_URL: API_CONFIG.BASE_URL,
    DEFAULT_VAULT_ID: API_CONFIG.DEFAULTS.VAULT_ID,
    DEFAULT_PREFIXES: API_CONFIG.DEFAULTS.PREFIXES,
    WS_URL: EVENT_WS_URL,
  });
}
