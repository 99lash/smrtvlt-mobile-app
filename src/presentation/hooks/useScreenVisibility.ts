import React from 'react';
import { useVaultManagement } from './VaultContext';

export interface ScreenVisibility {
  canAccessUsers: boolean;
  canAccessActivity: boolean;
  canAccessSettings: boolean;
  canAccessHome: boolean;
}

/**
 * Custom hook to determine screen visibility based on vault membership role
 * 
 * Screen access rules:
 * - Home: Available to all roles (admin, member, guest)
 * - Users: Available to admin and guest, NOT member
 * - Activity: Available to admin and guest, NOT member
 * - Settings: Available to all roles (admin, member, guest)
 * 
 * @returns ScreenVisibility object with boolean flags for each screen
 */
export const useScreenVisibility = (): ScreenVisibility => {
  const { currentVault, loading, availableVaults } = useVaultManagement();
  
  // Debug logging
  React.useEffect(() => {
    if (__DEV__) {
      console.log('🔍 useScreenVisibility - Hook updated');
      console.log('🔍 useScreenVisibility - currentVault:', currentVault);
      console.log('🔍 useScreenVisibility - loading:', loading);
      console.log('🔍 useScreenVisibility - currentVaultId:', currentVault?.vault_id);
      console.log('🔍 useScreenVisibility - role:', currentVault?.role);
      console.log('🔍 useScreenVisibility - availableVaults count:', availableVaults.length);
    }
  }, [currentVault, loading, availableVaults.length]);
  
  // If vault is still loading or not available, default to showing only safe tabs
  // This prevents restricted screens from being registered and then removed
  if (loading || !currentVault) {
    if (__DEV__) {
      console.log('🔍 useScreenVisibility - Vault loading or not available');
      console.log('🔍 useScreenVisibility - Returning safe defaults (hide Users/Activity)');
    }
    return {
      canAccessHome: true,
      canAccessUsers: false, // Hide until vault loads to be safe
      canAccessActivity: false, // Hide until vault loads to be safe
      canAccessSettings: true,
    };
  }
  
  const role = currentVault.role;
  const isMember = role === 'member';
  
  // Debug logging
  if (__DEV__) {
    console.log('🔍 useScreenVisibility - role:', role);
    console.log('🔍 useScreenVisibility - isMember:', isMember);
    console.log('🔍 useScreenVisibility - canAccessUsers:', !isMember);
    console.log('🔍 useScreenVisibility - canAccessActivity:', !isMember);
  }
  
  return {
    canAccessHome: true, // Always accessible
    canAccessUsers: !isMember, // Hidden for members
    canAccessActivity: !isMember, // Hidden for members
    canAccessSettings: true, // Always accessible
  };
};

