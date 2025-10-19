import React from 'react';
import { View } from 'react-native';
import { UserPlus, Lock } from 'lucide-react-native';
import ButtonSecondary from '../../../component/buttons/ButtonSecondary';

interface UserActionsProps {
  onJoinVault: () => void;
  onInviteUser: () => void;
}

export const UserActions: React.FC<UserActionsProps> = ({
  onJoinVault,
  onInviteUser,
}) => {
  return (
    <View className="flex-row justify-between items-center border-b border-surface-default">
      <View className="flex-row gap-2 flex-1">
        <View className="flex-1">
          <ButtonSecondary
            title="Join Vault"
            onPress={onJoinVault}
            icon={<Lock size={18} />}
          />
        </View>
        <View className="flex-1">
          <ButtonSecondary
            title="Add User"
            onPress={onInviteUser}
            icon={<UserPlus size={18} />}
          />
        </View>
      </View>
    </View>
  );
};
