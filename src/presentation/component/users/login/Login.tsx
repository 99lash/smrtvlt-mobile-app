import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react-native';
import ButtonPrimary from '../../buttons/ButtonPrimary';
import SuccessBanner from '../../banner/SuccessBanner';
import FailureBanner from '../../banner/FailureBanner';
import { useAuthContext } from '../../../context/AuthContext';
import { useLogin } from '../../../hooks/useLogin';
import { validateLoginForm, resetLoginForm, createLoginFormData } from '../../../../utils/loginUtils';
import { LoginProps } from '../../../../types/LoginTypes';
import RegisterModal from '../register';

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onLoginError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registerModalVisible, setRegisterModalVisible] = useState(false);

  // Use the new login hook instead of auth context
  const { login, isLoading, error: hookError, clearError } = useLogin();

  const handleLogin = async () => {
    // Clear any previous errors
    clearError();
    setShowError(false);

    // Validate form using utility function
    const validation = validateLoginForm(username, password);
    if (!validation.isValid) {
      setErrorMessage(validation.error!);
      setShowError(true);
      onLoginError?.(validation.error!);
      return;
    }

    try {
      const loginData = createLoginFormData(username, password);

      console.log('Login - Attempting login for:', loginData.username);

      // Use the new login hook
      await login(loginData.username, loginData.password);

      if (__DEV__) {
        console.log('Login - Login successful');
      }

      setShowSuccess(true);

      // Auto-hide success banner after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        resetLoginForm({ setUsername, setPassword, setShowPassword, setShowError, setErrorMessage });
        onLoginSuccess?.();
      }, 2000);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setErrorMessage(errorMsg);
      setShowError(true);
      onLoginError?.(errorMsg);

      if (__DEV__) {
        console.error('Login - Login error:', error);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterSuccess = () => {
    console.log('Registration successful - user can now login');
    setErrorMessage('Account created! Please login with your credentials.');
    setShowError(false);
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  return (
    <>
      <ScrollView 
        className="flex-1 bg-bg-default dark:bg-bg-dark"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-text-default dark:text-text-dark mb-2">
              Welcome Back
            </Text>
            <Text className="text-muted-default dark:text-muted-dark text-center px-4">
              Sign in to access your SmartVault account and manage your devices
            </Text>
          </View>

          {/* Login Form */}
          <View className="w-full max-w-md mx-auto mt-10">
            {/* Username/Email Field */}
            <View className="mb-4">
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3 bg-bg-default dark:bg-bg-dark">
                <User size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-text-default dark:text-text-dark text-base"
                  placeholder="Enter your username or email"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-6">
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 bg-bg-default dark:bg-bg-dark">
                <Lock size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-text-default dark:text-text-dark text-base"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  disabled={isLoading}
                  className="ml-2"
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity className="mb-6">
              <Text className="text-sm text-blue-600 text-right">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <ButtonPrimary
              title="Login to SmartVault"
              onPress={handleLogin}
              disabled={isLoading || !username.trim() || !password.trim()}
              loading={isLoading}
              icon={<LogIn size={20} color="white" />}
              className="w-full"
            />

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-muted-default dark:text-muted-dark text-sm">
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => setRegisterModalVisible(true)}>
                <Text className="text-blue-600 text-sm font-semibold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Registration Modal */}
      <RegisterModal
        visible={registerModalVisible}
        onClose={() => setRegisterModalVisible(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* Success Banner */}
      {showSuccess && (
        <SuccessBanner
          message="Login successful! Welcome back."
          duration={2000}
          onHide={() => setShowSuccess(false)}
        />
      )}

      {/* Error Banner */}
      {showError && (
        <FailureBanner
          message={errorMessage || hookError || 'Login failed'}
          duration={3000}
          onHide={() => setShowError(false)}
        />
      )}
    </>
  );
};

export default Login;