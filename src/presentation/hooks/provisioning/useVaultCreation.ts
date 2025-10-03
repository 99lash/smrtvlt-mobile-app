import { useState } from 'react';
import { Alert } from 'react-native';
import { UserService } from '../../../service/UserService';

interface VaultCreateData {
  device_id: string;
  name: string;
  location?: string;
}

interface VaultCreationResult {
  id: string;
  device_id: string;
  name: string;
  location?: string;
  status: string;
  created_at: string;
}

export const useVaultCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  const createVault = async (vaultData: VaultCreateData): Promise<VaultCreationResult | null> => {
    setIsCreating(true);
    setCreationError(null);

    try {
      console.log('🚀 Creating vault with data:', vaultData);

      // Get authentication token
      const token = await UserService.getStoredToken();
      if (!token) {
        throw new Error('Authentication required to create vault. Please log in again.');
      }

      console.log('🔐 Authentication token found, proceeding with vault creation');

      // API server URL - use environment-based configuration
      const API_BASE_URL = __DEV__
        ? 'http://192.168.1.8:8000'
        : 'https://quenchlessly-headachy-enriqueta.ngrok-free.dev';
      const endpoint = `${API_BASE_URL}/vaults/`;

      // Also try alternative endpoints if the main one fails
      const alternativeEndpoints = [
        `${API_BASE_URL}/vaults/`,
        `${API_BASE_URL}/api/vaults/`,
        `${API_BASE_URL}/api/v1/vaults/`
      ];

      console.log('📡 API Request Details:');
      console.log('  URL:', endpoint);
      console.log('  Method: POST');
      console.log('  Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.substring(0, 20)}...`,
      });
      console.log('  Body:', JSON.stringify(vaultData));

      // Try multiple endpoints if the first one fails
      let response: Response | null = null;
      let lastError: unknown = null;

      for (const testEndpoint of alternativeEndpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${testEndpoint}`);
          response = await fetch(testEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(vaultData),
          });

          console.log(`✅ Endpoint ${testEndpoint} responded with status:`, response.status);
          break; // Success, exit the loop

        } catch (endpointError) {
          const errorMessage = endpointError instanceof Error ? endpointError.message : String(endpointError);
          console.error(`❌ Endpoint ${testEndpoint} failed:`, errorMessage);
          lastError = endpointError;

          // If this is the last endpoint, throw the error
          if (testEndpoint === alternativeEndpoints[alternativeEndpoints.length - 1]) {
            const finalErrorMessage = lastError instanceof Error ? lastError.message : String(lastError);
            throw new Error(`All API endpoints failed. Last error: ${finalErrorMessage}`);
          }
        }
      }

      // Ensure we have a response at this point
      if (!response) {
        throw new Error('No response received from any API endpoint');
      }

      console.log('📡 API Response Details:');
      console.log('  Status:', response!.status);
      console.log('  Status Text:', response!.statusText);

      if (!response!.ok) {
        let errorMessage = `HTTP ${response!.status}: ${response!.statusText}`;

        try {
          const errorData = await response!.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
          console.error('❌ API Error Response:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage += ' (Failed to parse error response)';
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Vault created successfully:', result);

      // Handle different response formats
      const processedVaultData = result.data || result;
      console.log('📦 Processed vault data:', processedVaultData);

      return processedVaultData as VaultCreationResult;

    } catch (error) {
      console.error('Vault creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setCreationError(errorMessage);

      Alert.alert(
        'Vault Creation Failed',
        `Failed to create vault: ${errorMessage}. Please try again.`
      );

      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const resetCreation = () => {
    setIsCreating(false);
    setCreationError(null);
  };

  return {
    createVault,
    isCreating,
    creationError,
    resetCreation,
  };
};