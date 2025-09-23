// src/screens/Activity/ActivityScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BarChart3,
  Download,
  Search,
  ChevronDown,
  Calendar,
  CheckCircle,
  X,
  AlertTriangle,
  User,
  Settings,
  Shield,
  Smartphone,
  Lock
} from 'lucide-react-native';

type Props = any;

interface ActivityLog {
  id: string;
  status: 'success' | 'failed' | 'warning';
  eventType: 'vault_unlock' | 'failed_unlock' | 'user_added' | 'tamper_alert' | 'remote_unlock' | 'failed_pin' | 'settings_updated';
  title: string;
  timestamp: string;
  user: {
    initials: string;
    name: string;
  };
  description: string;
}

const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    status: 'success',
    eventType: 'vault_unlock',
    title: 'Vault Unlocked',
    timestamp: 'Jan 15, 02:30 PM',
    user: { initials: 'JD', name: 'John Doe' },
    description: 'Face recognition + NFC card'
  },
  {
    id: '2',
    status: 'failed',
    eventType: 'failed_unlock',
    title: 'Failed Unlock Attempt',
    timestamp: 'Jan 15, 02:15 PM',
    user: { initials: 'JS', name: 'Jane Smith' },
    description: 'Face not recognized after 3 attempts'
  },
  {
    id: '3',
    status: 'success',
    eventType: 'user_added',
    title: 'User Added',
    timestamp: 'Jan 15, 01:45 PM',
    user: { initials: 'A', name: 'Admin' },
    description: 'New user "Mike Johnson" added to system'
  },
  {
    id: '4',
    status: 'warning',
    eventType: 'tamper_alert',
    title: 'Tamper Alert',
    timestamp: 'Jan 15, 12:20 PM',
    user: { initials: 'U', name: 'Unknown' },
    description: 'Ultrasonic sensor detected movement'
  },
  {
    id: '5',
    status: 'success',
    eventType: 'vault_unlock',
    title: 'Vault Unlocked',
    timestamp: 'Jan 15, 11:30 AM',
    user: { initials: 'JS', name: 'Jane Smith' },
    description: 'PIN code verification successful'
  },
  {
    id: '6',
    status: 'success',
    eventType: 'remote_unlock',
    title: 'Remote Unlock',
    timestamp: 'Jan 15, 10:15 AM',
    user: { initials: 'JD', name: 'John Doe' },
    description: 'Unlocked via mobile app with OTP'
  },
  {
    id: '7',
    status: 'failed',
    eventType: 'failed_pin',
    title: 'Failed PIN Attempt',
    timestamp: 'Jan 15, 09:45 AM',
    user: { initials: 'MJ', name: 'Mike Johnson' },
    description: 'Incorrect PIN entered 3 times'
  },
  {
    id: '8',
    status: 'success',
    eventType: 'settings_updated',
    title: 'Settings Updated',
    timestamp: 'Jan 14, 04:30 PM',
    user: { initials: 'A', name: 'Admin' },
    description: 'Auto-lock timer changed to 45 seconds'
  }
];

function StatusIcon({ status }: { status: ActivityLog['status'] }) {
  switch (status) {
    case 'success':
      return <CheckCircle size={20} color="#22c55e" />;
    case 'failed':
      return <X size={20} color="#ef4444" />;
    case 'warning':
      return <AlertTriangle size={20} color="#f59e0b" />;
    default:
      return <CheckCircle size={20} color="#22c55e" />;
  }
}

function EventIcon({ eventType }: { eventType: ActivityLog['eventType'] }) {
  switch (eventType) {
    case 'vault_unlock':
    case 'failed_unlock':
    case 'failed_pin':
      return <Shield size={20} color="#9ca3af" />;
    case 'user_added':
    case 'settings_updated':
      return <Settings size={20} color="#9ca3af" />;
    case 'tamper_alert':
      return <Settings size={20} color="#9ca3af" />;
    case 'remote_unlock':
      return <Smartphone size={20} color="#9ca3af" />;
    default:
      return <User size={20} color="#9ca3af" />;
  }
}

function ActivityCard({ log }: { log: ActivityLog }) {
  const getStatusColor = () => {
    switch (log.status) {
      case 'success': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    switch (log.status) {
      case 'success': return 'success';
      case 'failed': return 'failed';
      case 'warning': return 'warning';
      default: return 'success';
    }
  };

  return (
    <View className="bg-neutral-surface rounded-lg p-4 mb-3">
      <View className="flex-row items-start">
        <View className="mr-3 mt-1">
          <StatusIcon status={log.status} />
        </View>
        <View className="mr-3 mt-1">
          <EventIcon eventType={log.eventType} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-neutral-text text-base font-medium">{log.title}</Text>
            <View className={`${getStatusColor()} px-2 py-1 rounded-full`}>
              <Text className="text-white text-xs font-medium">{getStatusText()}</Text>
            </View>
          </View>
          <Text className="text-neutral-text text-sm mb-1">{log.description}</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-2">
                <Text className="text-white text-xs font-bold">{log.user.initials}</Text>
              </View>
              <Text className="text-neutral-muted text-sm">{log.user.name}</Text>
            </View>
            <Text className="text-neutral-muted text-sm">{log.timestamp}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ActivityScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('All Users');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedDate, setSelectedDate] = useState('Date');

  return (
    <SafeAreaView className="flex-1 bg-neutral-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center">
          <BarChart3 size={24} color="#ffffff" />
          <Text className="text-white text-xl font-bold ml-2">Activity Log</Text>
        </View>
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity>
            <Download size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-neutral-surface px-3 py-2 rounded-lg">
            <Text className="text-white text-sm font-medium">Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center space-x-3">
          <View className="flex-1 bg-neutral-surface rounded-lg px-3 py-3 flex-row items-center">
            <Search size={16} color="#9ca3af" />
            <TextInput
              className="flex-1 text-neutral-text ml-2"
              placeholder="Search activities..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity className="bg-neutral-surface rounded-lg px-3 py-3 flex-row items-center">
            <Text className="text-white text-sm mr-1">{selectedUser}</Text>
            <ChevronDown size={16} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-neutral-surface rounded-lg px-3 py-3 flex-row items-center">
            <Text className="text-white text-sm mr-1">{selectedStatus}</Text>
            <ChevronDown size={16} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-neutral-surface rounded-lg px-3 py-3 flex-row items-center">
            <Calendar size={16} color="#9ca3af" />
            <Text className="text-white text-sm ml-1">{selectedDate}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Activity Logs */}
      <ScrollView className="flex-1 px-4">
        {mockActivityLogs.map((log) => (
          <ActivityCard key={log.id} log={log} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
