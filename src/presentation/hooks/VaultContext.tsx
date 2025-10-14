import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VaultService, VaultMembership } from '../../service/VaultService';
import { StorageService } from '../../config/api';

interface VaultContextType {
  availableVaults: VaultMembership[];
  currentVaultId: number | null;
  loading: boolean;
  error: string | null;
  loadVaults: () => Promise<void>;
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

      if (!token) {
        console.log('❌ No token for vault loading');
        setError('Please log in to access vault data');
        return;
      }

      console.log('📡 Fetching user vaults...');
      const vaults = await VaultService.getUserVaults(token);
      console.log('📋 Available vaults:', vaults.map(v => ({ id: v.vault_id, role: v.role })));
      setAvailableVaults(vaults);

      // Set the first available vault as current if not already set
      if (vaults.length > 0 && !currentVaultId) {
        console.log('🎯 Setting current vault ID:', vaults[0].vault_id);
        setCurrentVaultId(vaults[0].vault_id);
      } else if (vaults.length === 0) {
        console.log('⚠️ No vaults available for user');
        setCurrentVaultId(null);
      }

      setHasLoadedOnce(true);
      console.log('🔍 === VAULT MANAGEMENT DEBUG END ===');
    } catch (error) {
      console.error('❌ Error loading vaults:', error);
      setError(error instanceof Error ? error.message : 'Failed to load vaults');
    } finally {
      setLoading(false);
    }
  };

  const selectVault = (vaultId: number) => {
    console.log('🎯 Vault selected:', vaultId);
    setCurrentVaultId(vaultId);
  };

  useEffect(() => {
    console.log('🚀 VaultProvider: Initial load triggered');
    loadVaults();
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