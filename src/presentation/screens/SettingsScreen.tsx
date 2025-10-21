import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { LogOut, ChevronDown, ChevronUp, Vault } from 'lucide-react-native';
import ButtonSecondary from '../component/buttons/ButtonSecondary';
import CustomModal from '../component/modals/CustomModal';
import BorderedList from '../component/lists/BorderedList';
import { useVaultManagement } from '../hooks/VaultContext';
import { NFCManager } from './settings/NFCManager';
import { PinManager } from './settings/PinManager';
import { ProvisioningManager } from './settings/ProvisioningManager';

const SettingsScreen = () => {
  // Use the extracted vault management hook
  const {
    availableVaults,
    currentVaultId,
    currentVault,
    loading: vaultsLoading,
    selectVault
  } = useVaultManagement();
  
  // Debug: Log vaults to see what's being passed (only when values change)
  React.useEffect(() => {
    console.log('🔍 SettingsScreen - State updated:', {
      availableVaults: availableVaults.length,
      currentVaultId,
      vaultsLoading
    });
    
    // Additional validation: Log vault details for debugging
    if (availableVaults.length > 0) {
      console.log('📋 SettingsScreen - Available vaults details:', 
        availableVaults.map(vault => ({
          vault_id: vault.vault_id,
          vault_name: vault.vault_name,
          role: vault.role,
          created_at: vault.created_at
        }))
      );
    }
  }, [availableVaults.length, currentVaultId, vaultsLoading]);
  
  // VaultContext already handles loading vaults, no need to call loadVaults here
  
  // Security validation: Ensure only vaults where user is a member are displayed
  // This provides an additional layer of security on the frontend, though the backend
  // should already be filtering vaults by user membership via /vault-memberships/user/vaults
  const validatedVaults = React.useMemo(() => {
    // Filter out any vaults that might not have proper membership data
    const filteredVaults = availableVaults.filter(vault => {
      // Ensure vault has required fields and user has a valid role
      const hasValidRole = vault.role && ['admin', 'member', 'guest'].includes(vault.role);
      const hasValidVaultId = vault.vault_id && typeof vault.vault_id === 'number';
      
      if (!hasValidRole || !hasValidVaultId) {
        console.warn('⚠️ SettingsScreen - Filtering out invalid vault:', vault);
        return false;
      }
      
      return true;
    });
    
    console.log('✅ SettingsScreen - Validated vaults:', filteredVaults.length, 'out of', availableVaults.length);
    return filteredVaults;
  }, [availableVaults]);

  // Ensure current vault is still valid after filtering
  const isValidCurrentVault = React.useMemo(() => {
    if (!currentVaultId || !currentVault) return false;
    return validatedVaults.some(vault => vault.vault_id === currentVaultId);
  }, [currentVaultId, currentVault, validatedVaults]);

  // Reset current vault if it's no longer valid
  React.useEffect(() => {
    if (currentVaultId && !isValidCurrentVault && validatedVaults.length > 0) {
      console.log('🔄 SettingsScreen - Current vault no longer valid, selecting first available vault');
      selectVault(validatedVaults[0].vault_id);
    }
  }, [currentVaultId, isValidCurrentVault, validatedVaults, selectVault]);
  
  // State for dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <View className="flex-1 bg-bg-default">
      <ScrollView
        className="flex-1 gap-2"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Vault Selection Dropdown */}
        <View className="px-3 mt-3">
          <ButtonSecondary
            title={currentVault 
              ? `${currentVault.vault_name || `Vault ${currentVault.vault_id}`} (${currentVault.role})`
              : vaultsLoading 
                ? 'Loading vaults...'
                : validatedVaults.length === 0 
                  ? 'No vaults available'
                  : 'No vault selected'
            }
            onPress={() => {
              console.log('🔍 SettingsScreen - Dropdown pressed, validatedVaults:', validatedVaults);
              setIsDropdownOpen(!isDropdownOpen);
            }}
            icon={
              isDropdownOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )
            }
            iconPosition="right"
            className="w-full"
            textClassName="text-left flex-1"
          />
          
          {/* Dropdown Modal */}
          <CustomModal
            visible={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            title="Select Vault"
          >
            <BorderedList
              data={validatedVaults}
              keyExtractor={(vault) => vault.vault_id.toString()}
              selectedId={currentVaultId?.toString()}
              getId={(vault) => vault.vault_id.toString()}
              onItemPress={(vault) => {
                console.log('🔍 SettingsScreen - Vault selected:', vault.vault_name || vault.vault_id);
                selectVault(vault.vault_id);
                setIsDropdownOpen(false);
              }}
              iconExtractor={() => <Vault size={20} color="#9CA3AF" />}
              rightContentExtractor={(vault) => 
                currentVaultId === vault.vault_id ? (
                  <View className="w-2 h-2 bg-primary rounded-full" />
                ) : null
              }
              renderItem={(vault) => (
                <View className="flex-1">
                  <Text className="text-text-default font-medium">
                    {vault.vault_name || `Vault ${vault.vault_id}`}
                  </Text>
                  <Text className="text-muted-default text-sm">
                    {vault.role} {vault.vault_location ? `• ${vault.vault_location}` : ''}
                  </Text>
                </View>
              )}
              maxVisibleItems={5}
              itemHeight={60}
            />
          </CustomModal>
        </View>
        {/* PIN Management Section */}
        <View className="px-3 mt-3">
          <PinManager
            currentVault={currentVault}
            vaultsLoading={vaultsLoading}
          />
        </View>

        {/* NFC Management Section */}
        <View className="px-3">
          <NFCManager
            currentVault={currentVault}
            vaultsLoading={vaultsLoading}
          />
        </View>

        {/* Provisioning Management Section */}
        <View className="px-3 pb-12">
          <ProvisioningManager />
        </View>
      </ScrollView>

    </View>
  );
};

export default SettingsScreen;