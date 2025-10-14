import { NFCLogInfo, NFCCardData } from '../types/ActivityTypes';

/**
 * Utility functions for handling NFC card data in logs
 */

/**
 * Extract NFC card UID from log details
 * Handles formats like "NFC:BC:9F:42:5" or just "BC:9F:42:5"
 */
export const extractNFCCardUID = (details: string): string | null => {
  if (!details) return null;

  // Check if details contains NFC card data
  const nfcMatch = details.match(/NFC:([0-9A-F:]+)/i) || details.match(/^([0-9A-F:]+)$/i);

  if (nfcMatch) {
    return nfcMatch[1] || nfcMatch[0];
  }

  return null;
};

/**
 * Check if log entry contains NFC card data
 */
export const hasNFCData = (details: string): boolean => {
  return extractNFCCardUID(details) !== null;
};

/**
 * Parse NFC log information from log entry
 */
export const parseNFCLogInfo = (details: string, eventType: string): NFCLogInfo => {
  const cardUID = extractNFCCardUID(details);

  return {
    hasNFCData: cardUID !== null,
    cardUID: cardUID || '',
    isFailedAttempt: eventType === 'failed_attempt'
  };
};

/**
 * Format NFC card UID for display
 * Shows first 8 characters followed by ellipsis for long UIDs
 */
export const formatNFCCardDisplay = (uid: string): string => {
  if (uid.length <= 8) return uid;
  return `${uid.substring(0, 8)}...`;
};

/**
 * Generate title for NFC log entries
 */
export const getNFCTitle = (eventType: string, nfcInfo: NFCLogInfo): string => {
  if (!nfcInfo.hasNFCData) {
    // Fallback to existing title generation
    const titleMap: { [key: string]: string } = {
      'unlock': 'Vault Unlocked',
      'lock': 'Vault Locked',
      'failed_attempt': 'Failed Unlock Attempt',
      'tamper': 'Tamper Alert',
      'alarm': 'Security Alarm',
      'disconnected': 'Device Disconnected',
      'need_other_factor': 'Authentication Required',
      'access_granted': 'Access Granted',
      'connected': 'Device Connected'
    };
    return titleMap[eventType] || 'Activity Log';
  }

  if (nfcInfo.isFailedAttempt) {
    return `Unknown NFC Card: ${formatNFCCardDisplay(nfcInfo.cardUID)}`;
  } else {
    return `NFC Card: ${formatNFCCardDisplay(nfcInfo.cardUID)}`;
  }
};

/**
 * Generate description for NFC log entries
 */
export const getNFCDescription = (details: string, nfcInfo: NFCLogInfo): string => {
  if (!nfcInfo.hasNFCData) {
    return details || 'No details available';
  }

  if (nfcInfo.isFailedAttempt) {
    return `NFC card ${nfcInfo.cardUID} attempted access but is not registered`;
  } else {
    return `NFC card ${nfcInfo.cardUID} successfully authenticated`;
  }
};