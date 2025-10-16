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
      console.log('⏸️ Load already in progress, skipping...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 === VAULT MANAGEMENT DEBUG ===');
      const token = await StorageService.getAccessToken();
      console.log('🔑 Vault loading - token available:', !!token);
      console.log('🔑 Token preview:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

      if (!token) {
        console.log('❌ No token for vault loading');
        setError('Please log in to access vault data');
        return;
      }

      // Use token immediately - delay was causing token invalidation
      const freshToken = await StorageService.getAccessToken();
      console.log('🔑 Using fresh token for vault loading:', freshToken ? `${freshToken.substring(0, 20)}...` : 'NO TOKEN');

      console.log('📡 Fetching user vaults...');
      const vaults = await VaultService.getUserVaults(freshToken || token);

      // Add detailed logging
      console.log('🔍 Raw API response:', vaults);
      console.log('🔍 Vaults array length:', vaults.length);
      console.log('🔍 Vaults type:', typeof vaults);
      console.log('🔍 Is array?', Array.isArray(vaults));

      if (vaults.length > 0) {
        console.log('🔍 First vault details:', {
          vault_id: vaults[0].vault_id,
          role: vaults[0].role,
          created_at: vaults[0].created_at
        });
      }

      console.log('📋 Available vaults:', vaults.map(v => ({
        id: v.vault_id,
        name: v.vault_name,
        role: v.role,
        deviceId: v.vault_device_id
      })));
      console.log('📊 Total vaults received:', vaults.length);

      // Force refresh if no vaults but API call succeeded
      if (vaults.length === 0) {
        console.warn('⚠️ API returned empty array - user might not have vault access');
        console.warn('⚠️ This could indicate the user is not a member of any vaults');
      }

      if (vaults.length === 0) {
        console.warn('⚠️ No vaults returned from API - checking if user has vault access...');
      }

      setAvailableVaults(vaults);

      // Add logging after state update
      console.log('✅ State updated - availableVaults length:', vaults.length);

      // Set the first available vault as current if not already set
      if (vaults.length > 0 && !currentVaultId) {
        console.log('🎯 Setting current vault ID:', vaults[0].vault_id);
        setCurrentVaultId(vaults[0].vault_id);
      } else if (vaults.length === 0) {
        console.log('⚠️ No vaults available for user');
        setCurrentVaultId(null);
      } else {
        console.log('ℹ️ Vaults loaded but currentVaultId already set:', currentVaultId);
      }

      setHasLoadedOnce(true);
      console.log('🔍 === VAULT MANAGEMENT DEBUG END ===');
    } catch (error) {
       console.error('❌ Error loading vaults:', error);
       const errorMessage = error instanceof Error ? error.message : 'Failed to load vaults';
       console.error('❌ Detailed error:', error);

       // Type-safe error logging
       if (error instanceof Error) {
         console.error('❌ Error type:', error.constructor.name);
         console.error('❌ Error message:', error.message);
       }

       // Check if it's an ApiError with additional properties
       if (error && typeof error === 'object' && 'status' in error) {
         console.error('❌ Error status:', (error as any).status);
         console.error('❌ Error body:', (error as any).body);
       }

       setError(`Vault loading failed: ${errorMessage}`);
     } finally {
       setLoading(false);
     }
  };

  const selectVault = (vaultId: number) => {
    console.log('🎯 Vault selected:', vaultId);
    setCurrentVaultId(vaultId);
  };

  // Add a manual retry function for debugging
  const retryLoadVaults = async () => {
    console.log('🔄 Manual retry triggered');
    setHasLoadedOnce(false); // Reset to allow fresh load
    await loadVaults();
  };

  // Add a function to force refresh vaults (useful for debugging)
  const forceRefreshVaults = async () => {
    console.log('🔄 Force refresh triggered');
    setHasLoadedOnce(false);
    setAvailableVaults([]);
    setCurrentVaultId(null);
    await loadVaults();
  };

  useEffect(() => {
    console.log('🚀 VaultProvider: Initial load triggered');

    // Wait for authentication before loading vaults
    const checkAuthAndLoadVaults = async () => {
      const token = await StorageService.getAccessToken();
      if (token) {
        console.log('🚀 Token found, loading vaults...');
        loadVaults();
      } else {
        console.log('⏳ No token found, waiting for authentication...');
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