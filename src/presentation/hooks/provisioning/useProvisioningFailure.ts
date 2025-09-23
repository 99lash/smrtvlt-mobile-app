import { useState, useEffect } from 'react';
import { PROVISIONING_CONSTANTS } from '../../../types/provisioningConstants';

/**
 * Custom hook for managing provisioning failure notifications
 */
export const useProvisioningFailure = (log: string) => {
  const [showFailure, setShowFailure] = useState(false);

  useEffect(() => {
    if (
      log.includes(PROVISIONING_CONSTANTS.MESSAGES.PROVISION_FAILED) ||
      log.includes(PROVISIONING_CONSTANTS.MESSAGES.AUTH_FAILED) ||
      log.includes(PROVISIONING_CONSTANTS.MESSAGES.AP_NOT_FOUND)
    ) {
      setShowFailure(true);

      const timer = setTimeout(() => {
        setShowFailure(false);
      }, PROVISIONING_CONSTANTS.TIMING.BANNER_DURATION);

      return () => clearTimeout(timer);
    }
  }, [log]);

  const hideFailure = () => setShowFailure(false);

  return {
    showFailure,
    hideFailure,
  };
};
