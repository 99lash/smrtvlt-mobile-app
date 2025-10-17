import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityScreenProps } from '../../types/ActivityTypes';
import { ACTIVITY_COLORS, ICON_SIZES, DEFAULT_FILTERS } from '../../utils/activityConstants';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { ActivityCard, SearchBar, FilterDropdown, DateFilter } from '../component/activity';

export default function ActivityScreen({ navigation }: ActivityScreenProps) {
  const {
    logs,
    loading,
    error,
    filterState,
    currentVault,
    availableVaults,
    vaultsLoading,
    updateSearchQuery,
    updateUserFilter,
    updateStatusFilter,
    updateDateFilter,
    refreshLogs,
    selectVault,
    refreshVaults
  } = useActivityLogs();

  return (
    <SafeAreaView className="flex-1 bg-neutral-bg">
      {/* Search and Filters */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center space-x-3">
          <SearchBar
            value={filterState.searchQuery}
            onChangeText={updateSearchQuery}
            placeholder="Search activities..."
          />
          <FilterDropdown
            value={filterState.selectedUser}
            onPress={() => updateUserFilter(DEFAULT_FILTERS.user)}
            placeholder="All Users"
          />
          <FilterDropdown
            value={filterState.selectedStatus}
            onPress={() => updateStatusFilter(DEFAULT_FILTERS.status)}
            placeholder="All Status"
          />
          <DateFilter
            value={filterState.selectedDate}
            onPress={() => updateDateFilter(DEFAULT_FILTERS.date)}
          />
        </View>
      </View>

      {/* Activity Logs */}
      <ScrollView className="flex-1 px-4">
        {loading ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-white text-lg">Loading activity logs...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-red-400 text-lg mb-4">Error loading logs</Text>
            <Text className="text-neutral-400 text-center mb-4">{error}</Text>
            <TouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg"
              onPress={refreshLogs}
            >
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : logs.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-neutral-400 text-lg">No activity logs found</Text>
          </View>
        ) : (
          logs.map((log) => (
            <ActivityCard key={log.id} log={log} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
