import React from 'react';
import { View } from 'react-native';
import ButtonSecondary from '../buttons/ButtonSecondary';

interface UserActionsProps {
  onJoinVault: () => void;
  onInviteUser: () => void;
}

export const UserActions: React.FC<UserActionsProps> = ({
  onJoinVault,
  onInviteUser,
}) => {
  return (
    <View className="flex-row justify-between items-center p-4 border-b border-neutral-800">
      <View className="flex-row space-x-2">
        <ButtonSecondary
          title="Join Vault"
          onPress={onJoinVault}
          className="bg-green-600 border-green-600"
          textClassName="text-white"
        />
        <ButtonSecondary
          title="Invite User"
          onPress={onInviteUser}
          className="bg-blue-600 border-blue-600"
          textClassName="text-white"
        />
      </View>
    </View>
  );
};