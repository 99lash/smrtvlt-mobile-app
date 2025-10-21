import { useState, useEffect, useCallback } from 'react';
import { VaultService } from '../../../../service/VaultService';
import { AccessLimits } from '../../../../types/AccessLimits';
import { UserService } from '../../../../service/UserService';

export const useAccessLimits = (vaultId: number | null) => {
  const [limits, setLimits] = useState<AccessLimits | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = useCallback(async () => {
    if (!vaultId) {
      setLimits(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔍 useAccessLimits: Fetching limits for vault', vaultId);
      
      const token = await UserService.getStoredToken();
      const accessLimits = await VaultService.getAccessLimits(vaultId, token);
      
      console.log('✅ useAccessLimits: Limits fetched successfully', accessLimits);
      setLimits(accessLimits);
    } catch (err) {
      console.error('❌ useAccessLimits: Error fetching limits:', err);
      
      // Handle specific error cases
      if (err instanceof Error) {
        if (err.message.includes('404') || err.message.includes('Not Found')) {
          setError('You are not a member of this vault. Please contact an admin to add you to this vault.');
          setLimits({
            is_member: false,
            role: 'guest',
            nfc_cards: { current_count: 0, limit: null, can_create: false },
            keypad_pins: { current_count: 0, limit: null, can_create: false }
          });
        } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
          setError('Access denied to this vault. You may not have the required permissions.');
          setLimits({
            is_member: false,
            role: 'guest',
            nfc_cards: { current_count: 0, limit: null, can_create: false },
            keypad_pins: { current_count: 0, limit: null, can_create: false }
          });
        } else {
          setError(err.message);
          setLimits(null);
        }
      } else {
        setError('Failed to fetch access limits');
        setLimits(null);
      }
    } finally {
      setLoading(false);
    }
  }, [vaultId]);

  // Fetch limits when vaultId changes
  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  // Computed values for easy access
  const canCreateNFC = limits?.nfc_cards.can_create ?? false;
  const canCreatePin = limits?.keypad_pins.can_create ?? false;
  
  const nfcUsage = limits 
    ? `${limits.nfc_cards.current_count}/${limits.nfc_cards.limit ?? '∞'}`
    : '';
    
  const pinUsage = limits
    ? `${limits.keypad_pins.current_count}/${limits.keypad_pins.limit ?? '∞'}`
    : '';

  const isAdmin = limits?.role === 'admin';
  const isMember = limits?.role === 'member';
  const isGuest = limits?.role === 'guest';

  // Helper functions
  const isAtNfcLimit = limits ? limits.nfc_cards.current_count >= (limits.nfc_cards.limit ?? Infinity) : false;
  const isAtPinLimit = limits ? limits.keypad_pins.current_count >= (limits.keypad_pins.limit ?? Infinity) : false;

  const getNfcLimitMessage = () => {
    if (!limits) return '';
    if (isAdmin) return 'You can create unlimited NFC cards';
    if (isMember) return `You can create up to ${limits.nfc_cards.limit} NFC card${limits.nfc_cards.limit === 1 ? '' : 's'} per vault`;
    return 'You cannot create NFC cards';
  };

  const getPinLimitMessage = () => {
    if (!limits) return '';
    if (isAdmin) return 'You can create unlimited keypad pins';
    if (isMember) return `You can create up to ${limits.keypad_pins.limit} keypad pin${limits.keypad_pins.limit === 1 ? '' : 's'} per vault`;
    return 'You cannot create keypad pins';
  };

  return {
    limits,
    loading,
    error,
    fetchLimits,
    canCreateNFC,
    canCreatePin,
    nfcUsage,
    pinUsage,
    isAdmin,
    isMember,
    isGuest,
    isAtNfcLimit,
    isAtPinLimit,
    getNfcLimitMessage,
    getPinLimitMessage,
  };
};