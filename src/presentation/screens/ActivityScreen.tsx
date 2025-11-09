import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, AlertCircle, Users } from 'lucide-react-native';
import { ActivityScreenProps } from '../../types/ActivityTypes';
import { ACTIVITY_COLORS, ICON_SIZES, DEFAULT_FILTERS } from '../../utils/activityConstants';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { ActivityCard, SearchBar, FilterDropdown, DateFilter } from './activity';
import { EnhancedEmptyState } from '../component/common/EnhancedEmptyState';

export default function ActivityScreen({ navigation }: ActivityScreenProps) {
  const {
    logs,
    loading,
    error,
    filterState,
    currentVault,
    availableVaults,
    vaultsLoading,
    hasNoVaults,
    updateSearchQuery,
    updateUserFilter,
    updateStatusFilter,
    updateDateFilter,
    refreshLogs,
    selectVault,
    refreshVaults
  } = useActivityLogs();

  return (
    <SafeAreaView className="flex-1 bg-bg-default">
      {/* Activity Logs */}
      <FlatList
        data={logs}
        renderItem={({ item }) => <ActivityCard log={item} />}
        keyExtractor={(item) => item.id}
        className="flex-1 px-3 pt-6"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <EnhancedEmptyState
              icon={AlertCircle}
              title="Loading activity logs..."
              message="Please wait while we load the activity logs..."
            />
          ) : hasNoVaults && !vaultsLoading ? (
            <EnhancedEmptyState
              icon={Users}
              title="No Vault Access"
              message="You are not a member of any vaults. Contact an administrator to get access to vault activity logs."
            />
          ) : error ? (
            <EnhancedEmptyState
              icon={AlertCircle}
              title="Error Loading Logs"
              message={error}
            />
          ) : (
            <EnhancedEmptyState
              icon={Activity}
              title="No Activity Logs"
              message="There are no activity logs to display for the selected vault. Check back later or try refreshing."
            />
          )
        }
      />
    </SafeAreaView>
  );
}
