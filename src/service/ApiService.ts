import { API_CONFIG, StorageService } from '../config/api';

export interface ApiError {
  status: number;
  message: string;
  body?: string;
}

export class ApiService {
  /**
    * Build full URL from endpoint
    */
  private static buildUrl(endpoint: string): string {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  }

  /**
    * Get authorization headers
    */
  private static async getAuthHeaders(token?: string): Promise<Record<string, string>> {
    let authToken = token;

    if (!authToken) {
      authToken = await StorageService.getAccessToken() || undefined;
    }

    if (!authToken) {
      throw new Error('No access token available for API call');
    }

    return {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
    * Create headers without authentication (for public endpoints)
    */
  private static getPublicHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...customHeaders
    };
  }

  /**
    * Generic GET request with auth
    */
  public static async get<T>(
    endpoint: string,
    token?: string,
    queryParams?: Record<string, string>
  ): Promise<T> {
    try {
      const headers = await this.getAuthHeaders(token);
      let url = this.buildUrl(endpoint);

      if (queryParams) {
        const params = new URLSearchParams(queryParams);
        url = `${url}?${params}`;
      }

      if (__DEV__) {
        console.log('[API GET]', url);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[API Error]', response.status, errorBody);
        throw {
          status: response.status,
          message: `HTTP error! status: ${response.status}`,
          body: errorBody,
        } as ApiError;
      }

      const data: T = await response.json();
      
      if (__DEV__) {
        console.log('[API Success]', endpoint);
      }

      return data;
    } catch (error) {
      console.error('[API Request Failed]', endpoint, error);
      throw error;
    }
  }

  /**
    * Generic POST request
    */
  public static async post<T>(
    endpoint: string,
    body: any,
    headers: Record<string, string> = {}
  ): Promise<T> {
    try {
      const url = this.buildUrl(endpoint);

      if (__DEV__) {
        console.log('[API POST]', url);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[API Error]', response.status, errorBody);
        throw {
          status: response.status,
          message: `HTTP error! status: ${response.status}`,
          body: errorBody,
        } as ApiError;
      }

      const data: T = await response.json();
      
      if (__DEV__) {
        console.log('[API Success]', endpoint);
      }

      return data;
    } catch (error) {
      console.error('[API Request Failed]', endpoint, error);
      throw error;
    }
  }

  /**
    * Generic POST request with form data (for login, etc.)
    */
  public static async postForm<T>(
    endpoint: string,
    formData: URLSearchParams,
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    try {
      const url = this.buildUrl(endpoint);
      const headers = this.getPublicHeaders(customHeaders);

      if (__DEV__) {
        console.log('[API POST FORM]', url);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[API Error]', response.status, errorBody);
        throw {
          status: response.status,
          message: `HTTP error! status: ${response.status}`,
          body: errorBody,
        } as ApiError;
      }

      const data: T = await response.json();

      if (__DEV__) {
        console.log('[API Success]', endpoint);
      }

      return data;
    } catch (error) {
      console.error('[API Request Failed]', endpoint, error);
      throw error;
    }
  }

  /**
    * Generic GET request without authentication (for public endpoints)
    */
  public static async getPublic<T>(
    endpoint: string,
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    try {
      const headers = this.getPublicHeaders(customHeaders);
      const url = this.buildUrl(endpoint);

      if (__DEV__) {
        console.log('[API GET PUBLIC]', url);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[API Error]', response.status, errorBody);
        throw {
          status: response.status,
          message: `HTTP error! status: ${response.status}`,
          body: errorBody,
        } as ApiError;
      }

      const data: T = await response.json();

      if (__DEV__) {
        console.log('[API Success]', endpoint);
      }

      return data;
    } catch (error) {
      console.error('[API Request Failed]', endpoint, error);
      throw error;
    }
  }
}
