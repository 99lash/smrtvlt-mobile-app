import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, Download } from 'lucide-react-native';
import { ActivityScreenProps } from '../../types/ActivityTypes';
import { ACTIVITY_COLORS, ICON_SIZES, DEFAULT_FILTERS } from '../../utils/activityConstants';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { ActivityCard, SearchBar, FilterDropdown, DateFilter } from '../component/activity';

export default function ActivityScreen({ navigation }: ActivityScreenProps) {
  const {
    logs,
    filterState,
    updateSearchQuery,
    updateUserFilter,
    updateStatusFilter,
    updateDateFilter
  } = useActivityLogs();

  return (
    <SafeAreaView className="flex-1 bg-neutral-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center">
          <BarChart3 size={ICON_SIZES.large} color={ACTIVITY_COLORS.white} />
          <Text className="text-white text-xl font-bold ml-2">Activity Log</Text>
        </View>
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity>
            <Download size={ICON_SIZES.medium} color={ACTIVITY_COLORS.neutral} />
          </TouchableOpacity>
          <TouchableOpacity className="bg-neutral-surface px-3 py-2 rounded-lg">
            <Text className="text-white text-sm font-medium">Export</Text>
          </TouchableOpacity>
        </View>
      </View>

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
        {logs.map((log) => (
          <ActivityCard key={log.id} log={log} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
