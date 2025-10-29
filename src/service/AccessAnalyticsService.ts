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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  detail?: string;
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

      // The API returns a list of attempts, not a FailedAttemptsResponse object
      const response = await this.get<ApiResponse<Array<{
        id: number;
        device_id: string;
        vault_id?: number;
        user_id?: number;
        username?: string;
        event_type: string;
        details: string;
        timestamp: string;
      }>>>(endpoint, token, queryParams);

      // Unwrap the API response to get the actual data
      if (!response.success || !response.data) {
        throw new Error(response.detail || 'Failed to get failed attempts');
      }

      const attemptsList = response.data || [];

      // Transform the list response to match FailedAttemptsResponse interface
      const failedAttempts: FailedAttemptsResponse = {
        attempts: attemptsList,
        total_failed: attemptsList.length,
        period: params.start_date && params.end_date ? {
          start_date: params.start_date,
          end_date: params.end_date
        } : undefined
      };

      console.log('✅ AccessAnalyticsService: Failed attempts retrieved:', failedAttempts.total_failed, 'attempts');
      return failedAttempts;
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

      console.log('📊 AccessAnalyticsService: Making API request to:', endpoint, 'with query params:', queryParams);

      const response = await this.get<ApiResponse<AccessSummaryResponse>>(endpoint, token, queryParams);

      // Unwrap the API response to get the actual data
      if (!response.success || !response.data) {
        throw new Error(response.detail || 'Failed to get access summary');
      }

      const summary = response.data;

      console.log('✅ AccessAnalyticsService: Access summary retrieved:', {
        success_rate: summary?.success_rate,
        total_attempts: summary?.total_attempts,
        failed_attempts: summary?.failed_attempts,
        successful_accesses: Object.keys(summary?.successful_accesses || {}).length
      });

      console.log('📊 AccessAnalyticsService: Full summary response:', JSON.stringify(summary, null, 2));

      return summary;
    } catch (error) {
      console.error('❌ AccessAnalyticsService: Error getting access summary:', error);
      if (error instanceof Error) {
        console.error('❌ AccessAnalyticsService: Error message:', error.message);
        console.error('❌ AccessAnalyticsService: Error stack:', error.stack);
      }
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

      // Get today's date in YYYY-MM-DD format for filtering (using local time to match API)
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`; // Format: YYYY-MM-DD (local time)
      
      // Get access summary for the vault with configurable days (for success rate calculation)
      const summary = await this.getAccessSummary({ vault_id: vaultId, days }, token);

      // Log the full summary for debugging
      console.log('📊 AccessAnalyticsService: Full summary response:', JSON.stringify(summary, null, 2));

      // Calculate today's access count from daily_trends
      // Backend returns keys in ISO format like "2024-01-15T00:00:00", so we need to match by date prefix
      let todayAccessCount = 0;
      if (summary?.daily_trends && typeof summary.daily_trends === 'object') {
        // Find entries that match today's date (keys are in ISO format)
        const todayPattern = todayStr; // e.g., "2024-01-15"
        for (const [key, value] of Object.entries(summary.daily_trends)) {
          // Key format is "2024-01-15T00:00:00" or similar, check if it starts with today's date
          if (key.startsWith(todayPattern)) {
            todayAccessCount += value || 0;
          }
        }
      }
      console.log('📊 AccessAnalyticsService: Today\'s access count from daily_trends:', todayAccessCount, 'for date:', todayStr);

      // Get today's failed attempts separately
      let todayFailedAttempts = 0;
      try {
        const todayStart = `${todayStr}T00:00:00`;
        const todayEnd = `${todayStr}T23:59:59`;
        const failedResponse = await this.getFailedAccessAttempts(
          {
            vault_id: vaultId,
            start_date: todayStart,
            end_date: todayEnd
          },
          token
        );
        todayFailedAttempts = failedResponse?.total_failed ?? 0;
        console.log('📊 AccessAnalyticsService: Today\'s failed attempts:', todayFailedAttempts);
      } catch (failedError) {
        console.warn('⚠️ AccessAnalyticsService: Could not fetch today\'s failed attempts, using fallback:', failedError);
        // Fallback: if we can't get today's failed attempts, use 0
        todayFailedAttempts = 0;
      }

      // Get last activity - prefer using the most recent activity from the summary's recent_activity,
      // or fall back to extracting from daily_trends
      let lastActivity: string | null = null;
      
      // Only show last activity if there's actual activity (not just empty/new vault)
      const hasActivity = (summary?.total_attempts ?? 0) > 0;
      
      if (hasActivity) {
        // Try to get the most recent activity timestamp from recent_activity list
        if (summary?.recent_activity && Array.isArray(summary.recent_activity) && summary.recent_activity.length > 0) {
          // Sort by timestamp descending and get the most recent
          const sortedActivities = [...summary.recent_activity]
            .filter(activity => activity?.timestamp) // Filter out invalid timestamps
            .sort((a, b) => {
              const timeA = new Date(a.timestamp || 0).getTime();
              const timeB = new Date(b.timestamp || 0).getTime();
              // Handle invalid dates
              if (isNaN(timeA) || isNaN(timeB)) {
                return 0;
              }
              return timeB - timeA;
            });
          
          if (sortedActivities.length > 0 && sortedActivities[0]?.timestamp) {
            const activityDate = new Date(sortedActivities[0].timestamp);
            // Validate the timestamp is valid and not in the future
            if (!isNaN(activityDate.getTime()) && activityDate.getTime() <= Date.now()) {
              lastActivity = sortedActivities[0].timestamp;
              console.log('📊 AccessAnalyticsService: Last activity from recent_activity:', lastActivity);
            }
          }
        }
        
        // Fall back to extracting from daily_trends if no recent activity found
        if (!lastActivity) {
          lastActivity = this.getLastActivityFromTrends(summary?.daily_trends);
          if (lastActivity) {
            console.log('📊 AccessAnalyticsService: Last activity from daily_trends:', lastActivity);
          }
        }
      } else {
        // No activity at all - explicitly set to null
        console.log('📊 AccessAnalyticsService: No activity found for vault, last_activity will be null');
        lastActivity = null;
      }

      // Calculate metrics for dashboard display
      // - access_count: Today's access count (from daily_trends)
      // - success_rate: Success rate for the selected date range
      // - failed_attempts: Today's failed attempts
      const metrics = {
        access_count: todayAccessCount,
        success_rate: summary?.success_rate ?? 0,
        failed_attempts: todayFailedAttempts,
        last_activity: lastActivity
      };

      console.log('✅ AccessAnalyticsService: Dashboard metrics calculated:', metrics);
      return metrics;
    } catch (error) {
      console.error('❌ AccessAnalyticsService: Error getting dashboard metrics:', error);
      console.error('❌ AccessAnalyticsService: Error details:', error instanceof Error ? error.message : String(error));

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
      const response = await this.get<ApiResponse<Array<any>>>(endpoint, token, queryParams);

      console.log('✅ AccessAnalyticsService: Recent activity retrieved from backend:', response);

      // Unwrap the API response to get the actual data
      if (!response.success || !response.data) {
        console.warn('⚠️ AccessAnalyticsService: No activity data in response');
        return [];
      }

      const activitiesData = response.data;

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
      // Parse dates carefully - they come in ISO format like "2024-01-15T00:00:00"
      const sortedDates = dates.sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        // If parsing fails, treat as invalid
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.warn('Invalid date format in daily_trends:', a, b);
          return 0;
        }
        return dateB.getTime() - dateA.getTime();
      });
      
      const mostRecentDate = sortedDates[0];
      
      // Validate the date is not too far in the past (more than 1 year old suggests data issue)
      const dateObj = new Date(mostRecentDate);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid most recent date from daily_trends:', mostRecentDate);
        return null;
      }
      
      // If the date is more than 1 year old, it's likely stale data - return null
      if (dateObj.getTime() < oneYearAgo.getTime()) {
        console.warn('Stale date from daily_trends (more than 1 year old):', mostRecentDate);
        return null;
      }
      
      return mostRecentDate;
    } catch (error) {
      console.warn('Error processing daily trends:', error);
      return null;
    }
  }
}