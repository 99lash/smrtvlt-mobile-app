import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VaultService, VaultMembership } from '../../service/VaultService';
import { StorageService } from '../../config/api';

interface VaultContextType {
   availableVaults: VaultMembership[];
   currentVaultId: number | null;
   loading: boolean;
   error: string | null;
   loadVaults: () => Promise<void>;
   retryLoadVaults: () => Promise<void>;
   forceRefreshVaults: () => Promise<void>;
   selectVault: (vaultId: number) => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [availableVaults, setAvailableVaults] = useState<VaultMembership[]>([]);
  const [currentVaultId, setCurrentVaultId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const loadVaults = async () => {
    // Prevent multiple simultaneous loads
    if (loading && hasLoadedOnce) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Debug: Vault loading with token validation
      const token = await StorageService.getAccessToken();

      if (!token) {
        setError('Please log in to access vault data');
        return;
      }

      // Use token immediately - delay was causing token invalidation
      const freshToken = await StorageService.getAccessToken();

      const vaults = await VaultService.getUserVaults(freshToken || token);

      // Successfully loaded vaults

      setAvailableVaults(vaults);

      // Set the first available vault as current if not already set
      if (vaults.length > 0 && !currentVaultId) {
        setCurrentVaultId(vaults[0].vault_id);
      } else if (vaults.length === 0) {
        setCurrentVaultId(null);
      }

      setHasLoadedOnce(true);
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Failed to load vaults';
       setError(`Vault loading failed: ${errorMessage}`);
     } finally {
       setLoading(false);
     }
  };

  const selectVault = (vaultId: number) => {
    setCurrentVaultId(vaultId);
  };

  const retryLoadVaults = async () => {
    setHasLoadedOnce(false);
    await loadVaults();
  };

  const forceRefreshVaults = async () => {
    setHasLoadedOnce(false);
    setAvailableVaults([]);
    setCurrentVaultId(null);
    await loadVaults();
  };

  useEffect(() => {
    // Wait for authentication before loading vaults
    const checkAuthAndLoadVaults = async () => {
      const token = await StorageService.getAccessToken();
      if (token) {
        loadVaults();
      } else {
        // Set a timeout to check again
        setTimeout(checkAuthAndLoadVaults, 1000);
      }
    };

    checkAuthAndLoadVaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only load once on mount

  return (
    <VaultContext.Provider
      value={{
        availableVaults,
        currentVaultId,
        loading,
        error,
        loadVaults,
        retryLoadVaults,
        forceRefreshVaults,
        selectVault,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVaultManagement = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVaultManagement must be used within a VaultProvider');
  }
  return context;
};