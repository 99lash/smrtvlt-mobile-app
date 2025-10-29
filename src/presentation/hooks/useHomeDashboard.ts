import { useState, useEffect, useCallback } from 'react';
import { AccessAnalyticsService } from '../../service/AccessAnalyticsService';
import { VaultService } from '../../service/VaultService';
import { UserService } from '../../service/UserService';
import { useVaultManagement } from './VaultContext';
import { useAuthContext } from '../context/AuthContext';
import { DateFilterOption, DATE_FILTER_OPTIONS } from '../components/home/DateFilterDropdown';

export interface DashboardMetrics {
  totalVaults: number;
  todayAccessCount: number;
  successRate: number;
  failedAttempts: number;
  lastActivity: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface RecentActivity {
  id: number;
  type: 'success' | 'failed' | 'info';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface HomeDashboardData {
  metrics: DashboardMetrics;
  recentActivity: RecentActivity[];
  refreshData: () => Promise<void>;
  isRefreshing: boolean;
  selectedDateFilter: DateFilterOption;
  setSelectedDateFilter: (option: DateFilterOption) => void;
}

export const useHomeDashboard = (): HomeDashboardData => {
  const { currentVault, availableVaults } = useVaultManagement();
  const { user } = useAuthContext();

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalVaults: 0,
    todayAccessCount: 0,
    successRate: 0,
    failedAttempts: 0,
    lastActivity: null,
    isLoading: true,
    error: null,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilterOption>(
    DATE_FILTER_OPTIONS.find(option => option.value === 7) || DATE_FILTER_OPTIONS[1]
  );

  const loadDashboardData = useCallback(async () => {
    try {
      console.log('🏠 useHomeDashboard: Loading dashboard data for vault:', currentVault?.vault_id);

      if (!currentVault) {
        setMetrics(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Get authentication token
      const token = await UserService.getStoredToken();
      if (!token) {
        setMetrics(prev => ({
          ...prev,
          isLoading: false,
          error: 'Authentication required'
        }));
        return;
      }

      // Load metrics and activity in parallel
      const [metricsData, activityData] = await Promise.all([
        AccessAnalyticsService.getDashboardMetrics(currentVault.vault_id, token, selectedDateFilter.value),
        AccessAnalyticsService.getRecentActivity(currentVault.vault_id, 10, token)
      ]);

      setMetrics({
        totalVaults: availableVaults.length,
        todayAccessCount: metricsData.access_count,
        successRate: Math.round(metricsData.success_rate * 100) / 100, // Round to 2 decimal places
        failedAttempts: metricsData.failed_attempts,
        lastActivity: metricsData.last_activity,
        isLoading: false,
        error: null,
      });

      setRecentActivity(activityData);

      console.log('✅ useHomeDashboard: Dashboard data loaded successfully');

    } catch (error) {
      console.error('❌ useHomeDashboard: Error loading dashboard data:', error);

      setMetrics(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data'
      }));
    }
  }, [currentVault, availableVaults.length, selectedDateFilter.value]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  }, [loadDashboardData]);

  // Load data when vault changes
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!currentVault) return;

    const interval = setInterval(() => {
      console.log('🔄 useHomeDashboard: Auto-refreshing dashboard data');
      loadDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentVault, loadDashboardData]);

  return {
    metrics,
    recentActivity,
    refreshData,
    isRefreshing,
    selectedDateFilter,
    setSelectedDateFilter,
  };
};