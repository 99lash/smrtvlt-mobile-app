import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { StorageService } from './StorageService';
import { log } from '../utils/logger';

const BIOMETRIC_KEYS = {
  LOGIN_ENABLED: 'biometric_login_enabled',
  LOGIN_REFRESH_TOKEN: 'biometric_login_refresh_token',
  VAULT_ENABLED_PREFIX: 'biometric_vault_enabled_',
  VAULT_PIN_PREFIX: 'biometric_vault_pin_',
};

export interface BiometricCapabilities {
  isSecureStoreAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

export class BiometricService {
  private static async checkSecureStore(): Promise<boolean> {
    try {
      return await SecureStore.isAvailableAsync();
    } catch (error) {
      await log.warn('Biometric', 'SecureStore availability check failed', error);
      return false;
    }
  }

  static async getCapabilities(): Promise<BiometricCapabilities> {
    const isSecureStoreAvailable = await this.checkSecureStore();

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      const supportedTypes = hasHardware
        ? await LocalAuthentication.supportedAuthenticationTypesAsync()
        : [];

      await log.debug('Biometric', 'Capabilities checked', {
        isSecureStoreAvailable,
        hasHardware,
        isEnrolled,
        supportedTypes,
      });

      return { isSecureStoreAvailable, hasHardware, isEnrolled, supportedTypes };
    } catch (error) {
      await log.error('Biometric', 'Failed to check capabilities', error);
      return {
        isSecureStoreAvailable,
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
      };
    }
  }

  static async canUseBiometrics(): Promise<boolean> {
    const { isSecureStoreAvailable, hasHardware, isEnrolled } = await this.getCapabilities();
    return isSecureStoreAvailable && hasHardware && isEnrolled;
  }

  static async isBiometricLoginEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_KEYS.LOGIN_ENABLED);
      return enabled === 'true';
    } catch (error) {
      await log.error('Biometric', 'Failed to read biometric login flag', error);
      return false;
    }
  }

  static async enableBiometricLogin(): Promise<void> {
    const canUse = await this.canUseBiometrics();
    if (!canUse) {
      throw new Error('Biometric authentication is not available');
    }

    const refreshToken = await StorageService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      await SecureStore.setItemAsync(
        BIOMETRIC_KEYS.LOGIN_REFRESH_TOKEN,
        refreshToken,
        { requireAuthentication: true }
      );
      await SecureStore.setItemAsync(BIOMETRIC_KEYS.LOGIN_ENABLED, 'true');
      await log.info('Biometric', 'Biometric login enabled');
    } catch (error) {
      await log.error('Biometric', 'Failed to enable biometric login', error);
      throw new Error('Failed to enable biometric login');
    }
  }

  static async updateBiometricLoginToken(refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        BIOMETRIC_KEYS.LOGIN_REFRESH_TOKEN,
        refreshToken,
        { requireAuthentication: true }
      );
      await SecureStore.setItemAsync(BIOMETRIC_KEYS.LOGIN_ENABLED, 'true');
      await log.debug('Biometric', 'Biometric refresh token updated');
    } catch (error) {
      await log.error('Biometric', 'Failed to update biometric refresh token', error);
      throw new Error('Failed to update biometric refresh token');
    }
  }

  static async disableBiometricLogin(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_KEYS.LOGIN_REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(BIOMETRIC_KEYS.LOGIN_ENABLED);
      await log.info('Biometric', 'Biometric login disabled');
    } catch (error) {
      await log.error('Biometric', 'Failed to disable biometric login', error);
    }
  }

  static async getBiometricRefreshToken(): Promise<string | null> {
    const canUse = await this.canUseBiometrics();
    if (!canUse) {
      return null;
    }

    try {
      const token = await SecureStore.getItemAsync(
        BIOMETRIC_KEYS.LOGIN_REFRESH_TOKEN,
        { requireAuthentication: true }
      );
      return token;
    } catch (error) {
      await log.warn('Biometric', 'Failed to retrieve biometric refresh token', error);
      return null;
    }
  }

  private static vaultEnabledKey(vaultId: number): string {
    return `${BIOMETRIC_KEYS.VAULT_ENABLED_PREFIX}${vaultId}`;
  }

  private static vaultPinKey(vaultId: number): string {
    return `${BIOMETRIC_KEYS.VAULT_PIN_PREFIX}${vaultId}`;
  }

  static async isVaultBiometricEnabled(vaultId: number): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(this.vaultEnabledKey(vaultId));
      return enabled === 'true';
    } catch (error) {
      await log.error('Biometric', 'Failed to read vault biometric flag', error);
      return false;
    }
  }

  static async enableVaultBiometric(vaultId: number, pin: string): Promise<void> {
    const canUse = await this.canUseBiometrics();
    if (!canUse) {
      throw new Error('Biometric authentication is not available');
    }

    try {
      await SecureStore.setItemAsync(
        this.vaultPinKey(vaultId),
        pin,
        { requireAuthentication: true }
      );
      await SecureStore.setItemAsync(this.vaultEnabledKey(vaultId), 'true');
      await log.info('Biometric', 'Vault biometric enabled', { vaultId });
    } catch (error) {
      await log.error('Biometric', 'Failed to enable vault biometric', error);
      throw new Error('Failed to enable biometric vault unlock');
    }
  }

  static async disableVaultBiometric(vaultId: number): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.vaultPinKey(vaultId));
      await SecureStore.deleteItemAsync(this.vaultEnabledKey(vaultId));
      await log.info('Biometric', 'Vault biometric disabled', { vaultId });
    } catch (error) {
      await log.error('Biometric', 'Failed to disable vault biometric', error);
    }
  }

  static async getVaultPinWithBiometrics(vaultId: number): Promise<string | null> {
    const canUse = await this.canUseBiometrics();
    if (!canUse) {
      return null;
    }

    try {
      const pin = await SecureStore.getItemAsync(
        this.vaultPinKey(vaultId),
        { requireAuthentication: true }
      );
      return pin;
    } catch (error) {
      await log.warn('Biometric', 'Failed to retrieve vault PIN', error);
      return null;
    }
  }

  static getBiometricLabel(types: LocalAuthentication.AuthenticationType[]): string {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biometric';
  }
}
