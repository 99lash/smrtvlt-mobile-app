/**
 * Constants for the Provisioning component
 * Centralizes configuration values and removes magic strings/numbers
 */

export const PROVISIONING_CONSTANTS = {
  // UI Messages
  MESSAGES: {
    SCAN_DEVICES_TITLE: 'Wi-Fi Devices',
    WIFI_CREDENTIALS_TITLE: 'Send Wi-Fi Credentials',
    PROVISION_SUCCESS: 'Provisioning successful',
    PROVISION_FAILED: 'Provisioning failed',
    AUTH_FAILED: 'Authentication failed',
    AP_NOT_FOUND: 'AP not found',
    NO_DEVICES_FOUND: 'No devices found',
    NO_NETWORKS_FOUND: 'No networks found',
    SCANNING: 'Scanning...',
    PROVISION_NEW_DEVICE: 'Provision New Device',
    SCAN_FOR_DEVICES: 'Scan for Devices',
    SCANNING_DEVICES: 'Scanning...',
    CONFIRM: 'Confirm',
    BACK: 'Back',
    CLOSE: 'Close',
    ENTER_WIFI_PASSWORD: 'Enter Wi-Fi password',
    SEND_WIFI_CREDENTIALS: 'Send Wi-Fi credentials to device',
    MAKE_SURE_DEVICE_POWERED_ON:
      'Make sure your SmartVault device is powered on and in pairing mode (LED blinking green).',
  },

  // Timing
  TIMING: {
    BANNER_DURATION: 3000,
    WIFI_SCAN_DEBOUNCE: 500,
  },

  // UI Configuration
  UI: {
    ICON_SIZE: 20,
    ICON_COLOR: 'blue',
    SIGNAL_COLOR: '#3b82f6',
    PRIMARY_COLOR: 'blue',
    GRAY_COLOR: 'gray',
  },

  // Validation
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 63,
  },

  // ESP32 Configuration
  ESP32: {
    // IMPORTANT: This POP key must match the key in your ESP32 firmware
    // Check your ESP32 code for the PROOF_OF_POSSESSION constant
    PROOF_OF_POSSESSION: 'abcd1234', // Replace with your ESP32's actual POP key
  },
} as const;