import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Login from '../component/users/login/Login';
import { useAuthContext } from '../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const LoginScreen = () => {
  const { updateAuthState } = useAuthContext();
  const navigation = useNavigation();
  const route = useRoute();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoginSuccess = () => {
    console.log('LoginScreen - Login successful, updating auth state');
    updateAuthState();
  };

  useEffect(() => {
    const params = route.params as { resetMessage?: string } | undefined;
    if (params?.resetMessage) {
      setSuccessMessage(params.resetMessage);
      navigation.setParams({ resetMessage: undefined });
    }
  }, [navigation, route.params]);

  return (
    <View className="flex-1 bg-black">
      <Login
        onLoginSuccess={handleLoginSuccess}
        successMessage={successMessage}
        onClearSuccessMessage={() => setSuccessMessage(null)}
      />
    </View>
  );
};

export default LoginScreen;
