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
      {/* Header */}
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <BarChart3 size={ICON_SIZES.large} color={ACTIVITY_COLORS.white} />
            <Text className="text-white text-xl font-bold ml-2">Activity Log</Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity onPress={refreshLogs}>
              <Download size={ICON_SIZES.medium} color={ACTIVITY_COLORS.neutral} />
            </TouchableOpacity>
            <TouchableOpacity className="bg-neutral-surface px-3 py-2 rounded-lg">
              <Text className="text-white text-sm font-medium">Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vault Selector */}
        {vaultsLoading ? (
          <View className="bg-neutral-surface px-3 py-2 rounded-lg mb-2">
            <Text className="text-neutral-400 text-sm">Loading vaults...</Text>
          </View>
        ) : availableVaults.length > 1 ? (
          <View className="bg-neutral-surface px-3 py-2 rounded-lg mb-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {availableVaults.map((vault) => (
                <TouchableOpacity
                  key={vault.vault_id}
                  className={`px-3 py-1 rounded-md mr-2 ${
                    currentVault?.vault_id === vault.vault_id
                      ? 'bg-primary'
                      : 'bg-neutral-600'
                  }`}
                  onPress={() => selectVault(vault.vault_id)}
                >
                  <Text className={`text-sm font-medium ${
                    currentVault?.vault_id === vault.vault_id
                      ? 'text-white'
                      : 'text-neutral-300'
                  }`}>
                    Vault {vault.vault_id} ({vault.role})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : currentVault ? (
          <View className="bg-neutral-surface px-3 py-2 rounded-lg mb-2">
            <Text className="text-neutral-300 text-sm">
              Vault {currentVault.vault_id} ({currentVault.role})
            </Text>
          </View>
        ) : null}
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
