import { useState, useEffect } from 'react';
import { UserService } from '../../service/UserService';

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
      const token = await UserService.getStoredToken();

      if (token) {
        // Validate token with backend and get user info
        try {
          const user = await UserService.getCurrentUser();
          if (user) {
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: user,
            });
          } else {
            // Token exists but user fetch failed, clear token
            await UserService.clearToken();
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
            });
          }
        } catch (userError) {
          console.error('Failed to fetch user info:', userError);
          // Token exists but user fetch failed, clear token
          await UserService.clearToken();
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
      await UserService.login({ username, password });
      await checkAuthStatus(); // Re-check auth status after login
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await UserService.clearToken();
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

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus,
  };
};