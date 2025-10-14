import { useState, useCallback } from 'react';
import { KeypadPinService } from '../../../service/KeypadPinService';
import { KeypadPin } from '../../../types/KeypadPinTypes';
import { StorageService } from '../../../config/api';

export const useKeypadPins = () => {
  const [pins, setPins] = useState<KeypadPin[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createPin = useCallback(async (pinCode: string, userId?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await StorageService.getAccessToken();
      const newPin = await KeypadPinService.createPin({ pin_code: pinCode, user_id: userId }, token || undefined);
      
      setPins(prev => [...prev, newPin]);
      return newPin;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create PIN';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPins = useCallback(async () => {
    try {
      setLoading(true);
      const token = await StorageService.getAccessToken();
      const allPins = await KeypadPinService.getAllPins(token || undefined);
      setPins(allPins);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PINs');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pins,
    loading,
    error,
    createPin,
    refreshPins
  };
};
