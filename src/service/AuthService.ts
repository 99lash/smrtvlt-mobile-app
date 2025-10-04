import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRegistrationRequest, UserRegistrationResponse, UserLoginRequest, UserLoginResponse } from '../types/UserTypes';
import { API_CONFIG } from '../config/api';
import { NetworkService } from './NetworkService';
import { ApiService } from './ApiService';

/**
 * Authentication Service
 *
 * Handles user authentication, registration, and token management.
 * Follows Single Responsibility Principle - only handles auth concerns.
 */
export class AuthService {
  private static readonly API_TIMEOUT = 10000; // 10 seconds

  /**
   * Register a new user account
   * @param registrationData - User registration data
   * @returns Promise<UserRegistrationResponse>
   * @throws Error with specific message based on API response
   */
  static async register(registrationData: UserRegistrationRequest): Promise<UserRegistrationResponse> {
    if (__DEV__) {
      console.log('AuthService - Registration attempt for:', registrationData.username);
    }

    // Test basic connectivity first using NetworkService
    await NetworkService.testConnectivity();

    try {
      const responseData = await ApiService.post<UserRegistrationResponse>(
        '/users/register',
        registrationData
      );

      if (__DEV__) {
        console.log('AuthService - Registration successful for:', registrationData.username);
      }

      return responseData;

    } catch (error) {
      this.logError('Registration', error, { registrationData });
      throw this.processError(error, 'registration');
    }
  }

  /**
   * Authenticate user login
   * @param loginData - User login credentials
   * @returns Promise<UserLoginResponse>
   * @throws Error with specific message based on API response
   */
  static async login(loginData: UserLoginRequest): Promise<UserLoginResponse> {
    if (__DEV__) {
      console.log('AuthService - Login attempt for:', loginData.username);
    }

    try {
      // Create form data for login (backend expects form-encoded data)
      const formData = new URLSearchParams();
      formData.append('username', loginData.username);
      formData.append('password', loginData.password);

      const responseData = await ApiService.postForm<UserLoginResponse>(
        '/users/login',
        formData,
        { 'Content-Type': 'application/x-www-form-urlencoded' }
      );

      // Validate response structure for successful login
      if (!responseData || !responseData.access_token || !responseData.token_type) {
        throw new Error('Invalid response format from server');
      }

      if (__DEV__) {
        console.log('AuthService - Login successful for:', loginData.username);
      }

      // Store the token after successful login
      if (responseData.access_token) {
        await this.storeToken(responseData.access_token);
      }

      return responseData;

    } catch (error) {
      this.logError('Login', error, { username: loginData.username });
      throw this.processError(error, 'login');
    }
  }

  /**
   * Get stored authentication token
   * @returns Promise<string | null>
   */
  static async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      if (__DEV__) {
        console.error('AuthService - Error getting stored token:', error);
      }
      return null;
    }
  }

  /**
   * Store authentication token
   * @param token - JWT token to store
   * @returns Promise<void>
   */
  static async storeToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, token);
      if (__DEV__) {
        console.log('AuthService - Token stored successfully');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('AuthService - Error storing token:', error);
      }
      throw new Error('Failed to store authentication token');
    }
  }

  /**
   * Clear stored authentication token
   * @returns Promise<void>
   */
  static async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      if (__DEV__) {
        console.log('AuthService - Token cleared successfully');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('AuthService - Error clearing token:', error);
      }
    }
  }

  /**
   * Check if user is authenticated
   * @returns Promise<boolean>
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }


  /**
   * Handle registration-specific errors
   * @private
   */
  private static handleRegistrationError(status: number, responseData: UserRegistrationResponse): never {
    switch (status) {
      case 409:
        throw new Error('User already exists with this username or email');
      case 422:
        throw new Error('Password and confirmation password do not match');
      case 400:
        throw new Error('Invalid registration data provided');
      case 500:
        throw new Error('Server error occurred during registration');
      default:
        const errorMessage = responseData.detail || 'Registration failed';
        throw new Error(errorMessage);
    }
  }

  /**
   * Handle login-specific errors
   * @private
   */
  private static handleLoginError(status: number, responseData: any): never {
    switch (status) {
      case 401:
        throw new Error('Invalid username or password');
      case 400:
        throw new Error('Invalid login credentials provided');
      case 500:
        throw new Error('Server error occurred during login');
      default:
        const errorMessage = (responseData && responseData.detail) || 'Login failed';
        throw new Error(errorMessage);
    }
  }

  /**
   * Centralized error logging
   * @private
   */
  private static logError(operation: string, error: any, context?: any): void {
    if (__DEV__) {
      console.error(`AuthService - ${operation} error:`, error);

      if (error instanceof Error) {
        console.error(`AuthService - Error type:`, error.constructor.name);
        console.error(`AuthService - Error message:`, error.message);
        console.error(`AuthService - Error stack:`, error.stack);

        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          console.error(`AuthService - This appears to be a timeout error`);
          console.error(`AuthService - The request timed out after`, this.API_TIMEOUT, 'ms');
        }
      } else {
        console.error('AuthService - Non-Error object thrown:', error);
      }

      if (context) {
        console.error('AuthService - Operation context:', context);
      }
    }
  }

  /**
   * Process and enhance error messages
   * @private
   */
  private static processError(error: any, operation: string): Error {
    if (error instanceof Error) {
      return error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new Error(`Network error occurred during ${operation}`);
    }

    return new Error(`Unknown error occurred during ${operation}`);
  }
}
