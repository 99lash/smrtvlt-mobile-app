import { useState, useEffect, useRef } from 'react';
import { PROVISIONING_CONSTANTS } from '../../../utils/provisioningConstants';

/**
 * Custom hook for managing success notifications
 * Handles showing/hiding success banners with auto-dismiss
 * Prevents duplicate success notifications for the same provisioning session
 */
export const useSuccessNotification = (
  log: string,
  onSuccess?: () => void,
  autoReset: boolean = true
) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const hasTriggeredSuccess = useRef(false);
  const lastSuccessLog = useRef<string>('');

  useEffect(() => {
    const successMessage = PROVISIONING_CONSTANTS.MESSAGES.PROVISION_SUCCESS;

    // Check if log contains success message and we haven't already triggered for this session
    if (log.includes(successMessage) && !hasTriggeredSuccess.current) {
      // Additional check: only trigger if this is a new success message
      // (prevents triggering on the same log message multiple times)
      if (log !== lastSuccessLog.current) {
        hasTriggeredSuccess.current = true;
        lastSuccessLog.current = log;

        setShowSuccess(true);

        // Trigger success callback if provided and autoReset is enabled
        if (onSuccess && autoReset) {
          onSuccess();
        }

        const timer = setTimeout(() => {
          setShowSuccess(false);
        }, PROVISIONING_CONSTANTS.TIMING.BANNER_DURATION);

        return () => clearTimeout(timer);
      }
    }
  }, [log, onSuccess, autoReset]);

  const hideSuccess = () => {
    setShowSuccess(false);
  };

  // Reset the success trigger when needed (e.g., when starting a new provisioning session)
  const resetSuccessTrigger = () => {
    hasTriggeredSuccess.current = false;
    lastSuccessLog.current = '';
  };

  return {
    showSuccess,
    hideSuccess,
    resetSuccessTrigger,
  };
};