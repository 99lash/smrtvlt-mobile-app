import { useState } from 'react';
import { AuthService } from '../../service/AuthService';
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
      await AuthService.login({ username: username.trim(), password });
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