import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Shield,
  Moon,
  Wifi,
  Battery,
  CheckCircle,
  Square,
  Lock,
  AlertTriangle,
  Settings,
  BarChart3,
  Clock,
  Bell,
  X,
  Users,
  Activity
} from 'lucide-react-native';

type Props = any;

interface NotificationCardProps {
  type: 'error' | 'warning' | 'info';
  icon: React.ReactNode;
  title: string;
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
  unread?: boolean;
  onDismiss?: () => void;
}

function NotificationCard({ type, icon, title, timestamp, priority, unread, onDismiss }: NotificationCardProps) {
  const getBackgroundColor = () => {
    switch (type) {
      case 'error': return 'bg-red-500/20';
      case 'warning': return 'bg-orange-500/20';
      case 'info': return 'bg-blue-500/20';
      default: return 'bg-neutral-surface';
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-orange-400';
      case 'low': return 'text-blue-400';
      default: return 'text-neutral-muted';
    }
  };

  return (
    <View className={`${getBackgroundColor()} rounded-lg p-4 mb-3 relative`}>
      {unread && <View className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full" />}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start flex-1">
          <View className="mr-3 mt-1">{icon}</View>
          <View className="flex-1">
            <Text className="text-neutral-text text-sm font-medium mb-1">{title}</Text>
            <View className="flex-row items-center">
              <Text className="text-neutral-muted text-xs">{timestamp}</Text>
              {priority && (
                <Text className={`text-xs ml-2 ${getPriorityColor()}`}>{priority}</Text>
              )}
            </View>
          </View>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} className="ml-2">
            <X size={16} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-neutral-bg">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center">
            <Shield size={24} color="#3b82f6" />
            <Text className="text-neutral-text text-xl font-bold ml-2">SmartVault</Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity onPress={() => setColorScheme(isDark ? 'light' : 'dark')} accessibilityRole="button">
              <Moon size={20} color={isDark ? '#f9fafb' : '#9ca3af'} />
            </TouchableOpacity>
            <Wifi size={20} color="#22c55e" />
            <Text className="text-success text-sm font-medium">Secured</Text>
          </View>
        </View>

        {/* Users Overview Card */}
        <View className="bg-neutral-surface rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Users size={20} color="#3b82f6" />
              <Text className="text-neutral-text text-lg font-semibold ml-2">Users Overview</Text>
            </View>
            <TouchableOpacity className="bg-primary px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-medium">Active</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-neutral-muted text-sm mb-4">Manage authorized users and their access.</Text>

          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-neutral-text text-lg font-semibold">4</Text>
              <Text className="text-neutral-muted text-sm">Total Users</Text>
            </View>
            <View>
              <Text className="text-neutral-text text-lg font-semibold">3</Text>
              <Text className="text-neutral-muted text-sm">Online Now</Text>
            </View>
            <View>
              <Text className="text-neutral-text text-lg font-semibold">12</Text>
              <Text className="text-neutral-muted text-sm">Access Today</Text>
            </View>
          </View>

          <View className="space-y-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
                  <Text className="text-white text-xs font-bold">JD</Text>
                </View>
                <View>
                  <Text className="text-neutral-text text-sm font-medium">John Doe</Text>
                  <Text className="text-neutral-muted text-xs">Admin • Online</Text>
                </View>
              </View>
              <CheckCircle size={16} color="#22c55e" />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center mr-3">
                  <Text className="text-white text-xs font-bold">JS</Text>
                </View>
                <View>
                  <Text className="text-neutral-text text-sm font-medium">Jane Smith</Text>
                  <Text className="text-neutral-muted text-xs">User • Online</Text>
                </View>
              </View>
              <CheckCircle size={16} color="#22c55e" />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center mr-3">
                  <Text className="text-white text-xs font-bold">MJ</Text>
                </View>
                <View>
                  <Text className="text-neutral-text text-sm font-medium">Mike Johnson</Text>
                  <Text className="text-neutral-muted text-xs">User • Offline</Text>
                </View>
              </View>
              <Square size={16} color="#9ca3af" />
            </View>
          </View>
        </View>

        {/* User Management Actions */}
        <View className="bg-neutral-surface rounded-lg p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <Users size={20} color="#3b82f6" />
            <Text className="text-neutral-text text-lg font-semibold ml-2">User Management</Text>
          </View>

          <View className="space-y-2">
            <TouchableOpacity
              className="bg-primary rounded-lg p-3 flex-row items-center"
              onPress={() => navigation.getParent()?.navigate('Settings', { screen: 'AddUser' })}
            >
              <Users size={20} color="#ffffff" />
              <Text className="text-white font-medium ml-3">Add New User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-neutral-border rounded-lg p-3 flex-row items-center"
              onPress={() => navigation.getParent()?.navigate('Settings', { screen: 'ManagePermissions' })}
            >
              <Settings size={20} color="#9ca3af" />
              <Text className="text-neutral-text font-medium ml-3">Manage Permissions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-neutral-border rounded-lg p-3 flex-row items-center"
              onPress={() => navigation.getParent()?.navigate('Activity')}
            >
              <Activity size={20} color="#9ca3af" />
              <Text className="text-neutral-text font-medium ml-3">View User Activity</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Activity */}
        <View className="bg-neutral-surface rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Activity size={20} color="#3b82f6" />
              <Text className="text-neutral-text text-lg font-semibold ml-2">User Activity</Text>
            </View>
          </View>

          <View className="space-y-3">
            <View className="flex-row items-center">
              <CheckCircle size={16} color="#22c55e" />
              <View className="ml-3 flex-1">
                <Text className="text-neutral-text text-sm">John Doe logged in</Text>
                <Text className="text-neutral-muted text-xs">2 minutes ago</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Users size={16} color="#38bdf8" />
              <View className="ml-3 flex-1">
                <Text className="text-neutral-text text-sm">Jane Smith profile updated</Text>
                <Text className="text-neutral-muted text-xs">15 minutes ago</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <AlertTriangle size={16} color="#f87171" />
              <View className="ml-3 flex-1">
                <Text className="text-neutral-text text-sm">Mike Johnson access denied</Text>
                <Text className="text-neutral-muted text-xs">1 hour ago</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Clock size={16} color="#38bdf8" />
              <View className="ml-3 flex-1">
                <Text className="text-neutral-text text-sm">New user Sarah Wilson added</Text>
                <Text className="text-neutral-muted text-xs">2 hours ago</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity className="mt-3" onPress={() => navigation.getParent()?.navigate('Activity')}>
            <Text className="text-primary text-sm font-medium">View All User Activity</Text>
          </TouchableOpacity>
        </View>

        {/* User Notifications */}
        <View className="bg-neutral-surface rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Bell size={20} color="#3b82f6" />
              <Text className="text-neutral-text text-lg font-semibold ml-2">User Notifications</Text>
              <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center ml-2">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Text className="text-neutral-muted text-sm mr-2">Unread only</Text>
              <Switch
                value={unreadOnly}
                onValueChange={setUnreadOnly}
                trackColor={{ false: '#374151', true: '#3b82f6' }}
                thumbColor={unreadOnly ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>

          <View className="flex-row space-x-2 mb-3">
            <TouchableOpacity className="bg-neutral-border px-3 py-1 rounded-full">
              <Text className="text-neutral-text text-xs">Mark All Read</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-neutral-border px-3 py-1 rounded-full">
              <Text className="text-neutral-text text-xs">Clear All</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-3">
            <NotificationCard
              type="error"
              icon={<AlertTriangle size={16} color="#f87171" />}
              title="User 'Jane Smith' failed authentication 3 times in a row."
              timestamp="Jan 15, 02:45 PM"
              unread={true}
            />

            <NotificationCard
              type="error"
              icon={<AlertTriangle size={16} color="#f87171" />}
              title="Unauthorized access attempt by unknown user detected."
              timestamp="Jan 15, 02:15 PM"
              unread={true}
            />

            <NotificationCard
              type="warning"
              icon={<Users size={16} color="#facc15" />}
              title="User 'Mike Johnson' has been inactive for 7 days."
              timestamp="Jan 15, 12:30 PM"
              priority="medium"
              unread={true}
            />

            <NotificationCard
              type="info"
              icon={<Users size={16} color="#38bdf8" />}
              title="New user 'Sarah Wilson' has been successfully added to the system."
              timestamp="Jan 15, 10:00 AM"
              priority="low"
              onDismiss={() => {}}
            />

            <NotificationCard
              type="info"
              icon={<Settings size={16} color="#38bdf8" />}
              title="User permissions updated for 'John Doe' - Admin privileges granted."
              timestamp="Jan 15, 09:30 AM"
              priority="low"
              onDismiss={() => {}}
            />
          </View>

          <TouchableOpacity className="mt-3">
            <Text className="text-primary text-sm font-medium">View All 8 User Notifications</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
