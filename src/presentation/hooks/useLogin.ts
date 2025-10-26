import { useState } from 'react';
import { AuthService } from '../../service/AuthService';
import { UserDataService } from '../../service/UserDataService';
import { VaultService } from '../../service/VaultService';
import { UseLoginReturn } from '../../types/LoginTypes';

export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (!username.trim() || !password.trim()) {
      throw new Error('Please fill in all fields');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 useLogin - Starting complete authentication flow...');
      
      // Step 1: Login API call
      console.log('🔐 useLogin - Step 1: Login API call');
      await AuthService.login({ username: username.trim(), password });
      
      // Step 2: Fetch user data
      console.log('🔐 useLogin - Step 2: Fetching user data');
      const user = await UserDataService.getCurrentUser();
      if (!user) {
        throw new Error('Failed to fetch user data after login');
      }
      
      // Step 3: Load vault data
      console.log('🔐 useLogin - Step 3: Loading vault data');
      const token = await AuthService.getStoredToken();
      if (token) {
        await VaultService.getUserVaults(token);
      }
      
      console.log('✅ useLogin - Complete authentication flow successful');
      return true; // Success
    } catch (error) {
      const errorMessage = mapLoginError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    login,
    isLoading,
    error,
    clearError
  };
};

const mapLoginError = (error: any): string => {
  if (error instanceof Error) {
    switch (error.message) {
      case 'Invalid username or password':
        return 'Invalid username or password. Please check your credentials.';
      case 'Invalid login credentials provided':
        return 'Please check your username and password.';
      case 'Server error occurred during login':
        return 'Server error. Please try again later.';
      case 'Network error occurred during login':
        return 'Network error. Please check your connection and try again.';
      default:
        return error.message || 'Login failed. Please try again.';
    }
  }
  return 'Login failed. Please try again.';
};