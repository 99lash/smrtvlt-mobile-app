import { useState, useMemo, useCallback } from 'react';
import { ActivityLog, FilterState } from '../../types/ActivityTypes';
import { ACTIVITY_MOCK_DATA } from '../../utils/activityMockData';
import { DEFAULT_FILTERS } from '../../utils/activityConstants';

export const useActivityLogs = () => {
  const [searchQuery, setSearchQuery] = useState<string>(DEFAULT_FILTERS.user);
  const [selectedUser, setSelectedUser] = useState<string>(DEFAULT_FILTERS.user);
  const [selectedStatus, setSelectedStatus] = useState<string>(DEFAULT_FILTERS.status);
  const [selectedDate, setSelectedDate] = useState<string>(DEFAULT_FILTERS.date);

  const filterState: FilterState = {
    searchQuery,
    selectedUser,
    selectedStatus,
    selectedDate
  };

  // Memoized filtered logs based on current filter state
  const filteredLogs = useMemo(() => {
    let filtered = ACTIVITY_MOCK_DATA;

    // Filter by search query
    if (searchQuery && searchQuery !== DEFAULT_FILTERS.user) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.title.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query) ||
        log.user.name.toLowerCase().includes(query)
      );
    }

    // Filter by user
    if (selectedUser && selectedUser !== DEFAULT_FILTERS.user) {
      filtered = filtered.filter(log => log.user.name === selectedUser);
    }

    // Filter by status
    if (selectedStatus && selectedStatus !== DEFAULT_FILTERS.status) {
      filtered = filtered.filter(log => log.status === selectedStatus.toLowerCase());
    }

    // Filter by date (simplified - in real app would parse dates)
    if (selectedDate && selectedDate !== DEFAULT_FILTERS.date) {
      // This would be more complex in a real implementation
      // For now, we'll just return all logs if date filter is applied
    }

    return filtered;
  }, [searchQuery, selectedUser, selectedStatus, selectedDate]);

  // Memoized filter handlers
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const updateUserFilter = useCallback((user: string) => {
    setSelectedUser(user);
  }, []);

  const updateStatusFilter = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  const updateDateFilter = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery(DEFAULT_FILTERS.user);
    setSelectedUser(DEFAULT_FILTERS.user);
    setSelectedStatus(DEFAULT_FILTERS.status);
    setSelectedDate(DEFAULT_FILTERS.date);
  }, []);

  return {
    logs: filteredLogs,
    filterState,
    updateSearchQuery,
    updateUserFilter,
    updateStatusFilter,
    updateDateFilter,
    resetFilters
  };
};