import { useState, useEffect } from 'react';
import { AuthService } from '../../service/AuthService';
import { UserDataService } from '../../service/UserDataService';
import { StorageService } from '../../service/StorageService';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Check if token exists
      const token = await StorageService.getAccessToken();

      if (token) {
        // Validate token with backend and get user info
        try {
          const user = await UserDataService.getCurrentUser();
          if (user) {
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: user,
            });
          } else {
            // Token exists but user fetch failed, clear token
            await AuthService.clearToken();
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
            });
          }
        } catch (userError) {
          console.error('Failed to fetch user info:', userError);
          // Token exists but user fetch failed, clear token
          await AuthService.clearToken();
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  };

  const login = async (username: string, password: string) => {
    try {
      await AuthService.login({ username, password });
      // Don't call checkAuthStatus here - let useLogin handle the complete flow
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await StorageService.removeAccessToken();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const updateAuthState = async () => {
    await checkAuthStatus();
  };

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus,
    updateAuthState,
  };
};