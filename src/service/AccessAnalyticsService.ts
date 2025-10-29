import { ApiService } from './ApiService';
import { API_CONFIG } from '../config/api';

/**
 * Access Analytics Service
 *
 * Integrates with backend access tracking endpoints to provide
 * comprehensive analytics and insights for the mobile app.
 */

export interface AccessCountResponse {
  counts: Record<string, number>;
  total_count: number;
  period?: {
    start_date?: string;
    end_date?: string;
  };
}

export interface AccessTrendsResponse {
  daily_trends: Record<string, number>;
  hourly_patterns: Record<string, number>;
  period_days: number;
}

export interface FailedAttemptsResponse {
  attempts: Array<{
    id: number;
    device_id: string;
    vault_id?: number;
    user_id?: number;
    username?: string;
    event_type: string;
    details: string;
    timestamp: string;
  }>;
  total_failed: number;
  period?: {
    start_date?: string;
    end_date?: string;
  };
}

export interface AccessSummaryResponse {
  successful_accesses: Record<string, number>;
  failed_attempts: number;
  total_attempts: number;
  success_rate: number;
  daily_trends: Record<string, number>;
  hourly_patterns: Record<string, number>;
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface AccessAnalyticsQueryParams {
  vault_id?: number;
  user_id?: number;
  device_id?: string;
  start_date?: string;
  end_date?: string;
  include_failed?: boolean;
  days?: number;
  limit?: number;
}

export class AccessAnalyticsService extends ApiService {
  private static getBaseUrl(): string {
    return '/logs/access';
  }

  /**
   * Get access counts grouped by users
   */
  static async getAccessCountsByUsers(
    params: AccessAnalyticsQueryParams = {},
    token?: string
  ): Promise<AccessCountResponse> {
    try {
      console.log('📊 AccessAnalyticsService: Getting user access counts with params:', params);

      const queryParams = this.buildQueryParams(params);
      const endpoint = `${this.getBaseUrl()}/counts/users`;

      const response = await this.get<AccessCountResponse>(endpoint, token, queryParams);

      console.log('✅ AccessAnalyticsService: User access counts retrieved:', response);
      return response;
    } catch (error) {
      console.error('❌ AccessAnalyticsService: Error getting user access counts:', error);
      throw error;
    }
  }

  /**
   * Get access counts grouped by vaults
   */
  static async getAccessCountsByVaults(
    params: AccessAnalyticsQueryParams = {},
    token?: string
  ): Promise<AccessCountResponse> {
    try {
      console.log('📊 AccessAnalyticsService: Getting vault access counts with params:', params);

      const queryParams = this.buildQueryParams(params);
      const endpoint = `${this.getBaseUrl()}/counts/vaults`;

      const response = await this.get<AccessCountResponse>(endpoint, token, queryParams);

      console.log('✅ AccessAnalyticsService: Vault access counts retrieved:', response);
      return response;
    } catch (error) {
      console.error('❌ AccessAnalyticsService: Error getting vault access counts:', error);
      throw error;
    }
  }

  /**
   * Get daily access trends and hourly patterns
   */
  static async getDailyAccessTrends(
    vaultId?: number,
    userId?: number,
    days: number = 30,
    token?: string
  ): Promise<AccessTrendsResponse> {
    try {
      console.log('📊 AccessAnalyticsService: Getting access trends:', { vaultId, userId, days });

      const queryParams = {
        ...(vaultId && { vault_id: vaultId.toString() }),
        ...(userId && { user_id: userId.toString() }),
        days: days.toString()
      };

      const endpoint = `${this.getBaseUrl()}/trends/daily`;
      const response = await this.get<AccessTrendsResponse>(endpoint, token, queryParams);

      console.log('✅ AccessAnalyticsService: Access trends retrieved:', response);
      return response;
    } catch (error) {
      console.error('❌ AccessAnalyticsService: Error getting access trends:', error);
      throw error;
    }
  }

  /**
   * Get failed access attempts for security monitoring
   */
  static async getFailedAccessAttempts(
    params: AccessAnalyticsQueryParams = {},
    token?: string
  ): Promise<FailedAttemptsResponse> {
    try {
      console.log('📊 AccessAnalyticsService: Getting failed attempts with params:', params);

      const queryParams = this.buildQueryParams(params);
      const endpoint = `${this.getBaseUrl()}/failed-attempts`;

      const response = await this.get<FailedAttemptsResponse>(endpoint, token, queryParams);

      console.log('✅ AccessAnalyticsService: Failed attempts retrieved:', response?.total_failed ?? 'undefined', 'attempts');
      return response;
    } catch (error) {
      console.error('❌ AccessAnalyticsService: Error getting failed attempts:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive access summary
   */
  static async getAccessSummary(
    params: AccessAnalyticsQueryParams = {},
    token?: string
  ): Promise<AccessSummaryResponse> {
    try {
      console.log('📊 AccessAnalyticsService: Getting access summary with params:', params);

      const queryParams = this.buildQueryParams(params);
      const endpoint = `${this.getBaseUrl()}/summary`;

      const response = await this.get<AccessSummaryResponse>(endpoint, token, queryParams);

      console.log('✅ AccessAnalyticsService: Access summary retrieved:', {
        success_rate: response?.success_rate,
        total_attempts: response?.total_attempts,
        failed_attempts: response?.failed_attempts,
        successful_accesses: Object.keys(response?.successful_accesses || {}).length
      });

      return response;
    } catch (error) {
      console.error('❌ AccessAnalyticsService: Error getting access summary:', error);
      throw error;
    }
  }

  /**
    * Get dashboard metrics for a specific vault
    */
  static async getDashboardMetrics(
    vaultId: number,
    token?: string,
    days: number = 7
  ): Promise<{
    access_count: number;
    success_rate: number;
    failed_attempts: number;
    last_activity: string | null;
  }> {
    try {
      console.log('📊 AccessAnalyticsService: Getting dashboard metrics for vault:', vaultId, 'with days:', days);

      // Get access summary for the vault with configurable days
      const summary = await this.getAccessSummary({ vault_id: vaultId, days }, token);

      // Calculate metrics for dashboard display (with null checks)
      const metrics = {
        access_count: summary?.total_attempts ?? 0,
        success_rate: summary?.success_rate ?? 0,
        failed_attempts: summary?.failed_attempts ?? 0,
        last_activity: this.getLastActivityFromTrends(summary?.daily_trends)
      };

      console.log('✅ AccessAnalyticsService: Dashboard metrics calculated:', metrics);
      return metrics;
    } catch (error) {
      console.error('❌ AccessAnalyticsService: Error getting dashboard metrics:', error);

      // Return default metrics on error
      return {
        access_count: 0,
        success_rate: 0,
        failed_attempts: 0,
        last_activity: null
      };
    }
  }

  /**
   * Get recent activity for activity feed
   */
  static async getRecentActivity(
    vaultId?: number,
    limit: number = 10,
    token?: string
  ): Promise<Array<{
    id: number;
    type: 'success' | 'failed' | 'info';
    title: string;
    description: string;
    timestamp: string;
    user?: string;
  }>> {
    try {
      console.log('📊 AccessAnalyticsService: Getting recent activity for vault:', vaultId);

      // Use the new backend endpoint that returns actual log data
      const queryParams = {
        ...(vaultId && { vault_id: vaultId.toString() }),
        limit: limit.toString()
      };

      const endpoint = `${this.getBaseUrl()}/recent-activity`;
      const response = await this.get<any>(endpoint, token, queryParams);

      console.log('✅ AccessAnalyticsService: Recent activity retrieved from backend:', response);

      // The backend returns a Response wrapper with data inside
      const activitiesData = response?.data || [];

      console.log('✅ AccessAnalyticsService: Processing activities data:', activitiesData?.length || 0, 'activities');

      // Transform backend response to match expected format
      const activities = (activitiesData || []).map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.timestamp,
        user: activity.user
      }));

      return activities;

    } catch (error) {
      console.error('❌ AccessAnalyticsService: Error getting recent activity:', error);
      return [];
    }
  }

  /**
   * Build query parameters object from params
   */
  private static buildQueryParams(params: AccessAnalyticsQueryParams): Record<string, string> {
    const queryParams: Record<string, string> = {};

    if (params.vault_id) queryParams.vault_id = params.vault_id.toString();
    if (params.user_id) queryParams.user_id = params.user_id.toString();
    if (params.device_id) queryParams.device_id = params.device_id;
    if (params.start_date) queryParams.start_date = params.start_date;
    if (params.end_date) queryParams.end_date = params.end_date;
    if (params.include_failed !== undefined) queryParams.include_failed = params.include_failed.toString();
    if (params.days) queryParams.days = params.days.toString();
    if (params.limit) queryParams.limit = params.limit.toString();

    return queryParams;
  }

  /**
   * Extract last activity date from daily trends
   */
  private static getLastActivityFromTrends(dailyTrends: Record<string, number>): string | null {
    // Add null/undefined check
    if (!dailyTrends || typeof dailyTrends !== 'object') {
      return null;
    }

    try {
      const dates = Object.keys(dailyTrends).filter(date => dailyTrends[date] > 0);

      if (dates.length === 0) return null;

      // Return the most recent date with activity
      const sortedDates = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      return sortedDates[0];
    } catch (error) {
      console.warn('Error processing daily trends:', error);
      return null;
    }
  }
}