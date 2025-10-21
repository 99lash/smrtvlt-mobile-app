import React from 'react';
import { View, Text } from 'react-native';
import { Keyboard, RefreshCw, Trash2, User } from 'lucide-react-native';
import { KeypadPin } from '../../../types/KeypadPinTypes';
import BorderedList from '../../component/lists/BorderedList';
import { WarningMessage } from '../../component/common/WarningMessage';

interface PinListProps {
  pins: KeypadPin[];
  loading: boolean;
  error: string | null;
  deletingPinId: number | null;
  onDeletePin: (pin: KeypadPin) => void;
  onRefresh: () => void;
  isAdmin?: boolean;
  currentUserId?: number;
  currentVaultId?: number;
}

export const PinList: React.FC<PinListProps> = ({
  pins,
  loading,
  error,
  deletingPinId,
  onDeletePin,
  onRefresh,
  isAdmin = false,
  currentUserId,
  currentVaultId,
}) => {
  // Filter pins based on user role and vault
  const filteredPins = React.useMemo(() => {
    console.log('🔍 PinList - Raw pins from API:', pins);
    console.log('🔍 PinList - currentVaultId:', currentVaultId);
    console.log('🔍 PinList - currentUserId:', currentUserId);
    console.log('🔍 PinList - isAdmin:', isAdmin);
    
    let filtered = pins;
    
    // Filter by vault if vault_id is available in the pin data
    if (currentVaultId) {
      filtered = pins.filter(pin => pin.vault_id === currentVaultId);
      console.log('🔍 PinList - After vault filtering:', filtered);
    }
    
    // Filter by user role
    if (isAdmin) {
      // Admins see all pins for the current vault
      console.log('🔍 PinList - Admin view - final filtered pins:', filtered);
      return filtered;
    } else if (currentUserId) {
      // Members see only their own pins for the current vault
      const userFiltered = filtered.filter(pin => pin.user_id === currentUserId);
      console.log('🔍 PinList - Member view - final filtered pins:', userFiltered);
      return userFiltered;
    }
    // If no currentUserId, show all pins for the current vault (fallback)
    console.log('🔍 PinList - Fallback view - final filtered pins:', filtered);
    return filtered;
  }, [pins, isAdmin, currentUserId, currentVaultId]);

  if (loading) {
    return (
      <View className="py-8 items-center">
        <Text className="text-muted-default">Loading pins...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-8 items-center">
        <Text className="text-red-400 mb-2">Error loading pins</Text>
        <Text className="text-muted-default text-sm">{error}</Text>
      </View>
    );
  }

  if (filteredPins.length === 0) {
    console.log('🔍 PinList - No filtered pins found. Raw pins count:', pins.length);
    console.log('🔍 PinList - Filtered pins count:', filteredPins.length);
    const message = isAdmin 
      ? "No pins found. Create your first PIN to get started."
      : "No pins found. You haven't created any PINs yet.";
    return (
      <WarningMessage
        message={message}
      />
    );
  }

  return (
    <BorderedList
      data={filteredPins}
      keyExtractor={(pin) => pin.id.toString()}
      maxVisibleItems={5}
      itemHeight={80}
      renderItem={(pin) => (
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Keyboard size={16} color="#60a5fa" />
            <Text className="text-text-default font-mono text-lg ml-2">
              {pin.pin_code}
            </Text>
            {pin.user_id && (
              <View className="flex-row items-center ml-2">
                <User size={12} color="#60a5fa" />
                <Text className="text-muted-default text-xs ml-1">
                  {pin.username || pin.first_name
                    ? `${pin.first_name || ''} ${pin.last_name || ''}`.trim() || pin.username || `User ${pin.user_id}`
                    : `User ${pin.user_id}`
                  }
                </Text>
              </View>
            )}
          </View>
          <Text className="text-muted-default text-xs">
            Created: {new Date(pin.created_at).toLocaleDateString()}
          </Text>
        </View>
      )}
      rightContentExtractor={(pin) => (
        <View className="p-2">
          {deletingPinId === pin.id ? (
            <RefreshCw size={16} color="#ef4444" />
          ) : (
            <Trash2 size={16} color="#ef4444" />
          )}
        </View>
      )}
      onItemPress={(pin) => onDeletePin(pin)}
      className="max-h-96"
    />
  );
};
