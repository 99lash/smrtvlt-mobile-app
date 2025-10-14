import { useState, useEffect } from 'react';
import { VaultService, VaultMembership } from '../../service/VaultService';
import { StorageService } from '../../config/api';

export const useVaultManagement = () => {
  const [availableVaults, setAvailableVaults] = useState<VaultMembership[]>([]);
  const [currentVaultId, setCurrentVaultId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadVaults = async () => {
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

      // Set the first available vault as current
      if (vaults.length > 0) {
        console.log('🎯 Setting current vault ID:', vaults[0].vault_id);
        setCurrentVaultId(vaults[0].vault_id);
      } else {
        console.log('⚠️ No vaults available for user');
      }

      console.log('🔍 === VAULT MANAGEMENT DEBUG END ===');
    } catch (error) {
      console.error('❌ Error loading vaults:', error);
      setError(error instanceof Error ? error.message : 'Failed to load vaults');
    } finally {
      setLoading(false);
    }
  };

  const selectVault = (vaultId: number) => {
    setCurrentVaultId(vaultId);
  };

  useEffect(() => {
    console.log('🚀 VaultManagement: Initial load triggered');
    loadVaults();
  }, []);

  // Debug: Monitor vault ID changes
  useEffect(() => {
    console.log('🔄 VaultManagement: Vault ID changed:', {
      currentVaultId,
      availableVaultsCount: availableVaults.length,
      loading,
      error
    });
  }, [currentVaultId, availableVaults.length, loading, error]);

  return {
    availableVaults,
    currentVaultId,
    loading,
    error,
    loadVaults,
    selectVault
  };
};