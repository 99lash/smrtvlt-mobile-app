import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, User, Lock } from 'lucide-react-native';
import CustomModal from '../../modals/CustomModal';
import ButtonPrimary from '../../buttons/ButtonPrimary';
import SuccessBanner from '../../banner/SuccessBanner';
import FailureBanner from '../../banner/FailureBanner';
import { useAuthContext } from '../../../context/AuthContext';

type LoginModalProps = {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
};

const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login: authLogin } = useAuthContext();

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setIsLoading(false);
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please fill in all fields');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    setShowError(false);

    try {
      // Call the auth context login method
      const loginData = {
        username: username.trim(),
        password: password,
      };

      console.log('LoginModal - Attempting login for:', loginData.username);

      await authLogin(loginData.username, loginData.password);

      if (__DEV__) {
        console.log('LoginModal - Login successful');
      }

      setIsLoading(false);
      setShowSuccess(true);

      // Auto-hide success banner and close modal after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        onLoginSuccess?.();
        onClose();
      }, 2000);

    } catch (error) {
      setIsLoading(false);

      // Handle specific error messages from UserService
      let errorMsg = 'Login failed. Please try again.';

      if (error instanceof Error) {
        switch (error.message) {
          case 'Invalid username or password':
            errorMsg = 'Invalid username or password. Please check your credentials.';
            break;
          case 'Invalid login credentials provided':
            errorMsg = 'Please check your username and password.';
            break;
          case 'Server error occurred during login':
            errorMsg = 'Server error. Please try again later.';
            break;
          case 'Network error occurred during login':
            errorMsg = 'Network error. Please check your connection and try again.';
            break;
          default:
            errorMsg = error.message || 'Login failed. Please try again.';
        }
      }

      setErrorMessage(errorMsg);
      setShowError(true);

      if (__DEV__) {
        console.error('LoginModal - Login error:', error);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <CustomModal
        visible={visible}
        onClose={handleClose}
        title="Login to SmartVault"
        icon={<User size={24} color="#3B82F6" />}
        primaryAction={{
          label: 'Login',
          onPress: handleLogin,
          disabled: isLoading || !username.trim() || !password.trim(),
          loading: isLoading,
        }}
      >
        <View className="w-full">
          {/* Username/Email Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Username or Email
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
              <User size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base"
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
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Password
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
              <Lock size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base"
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
          <TouchableOpacity className="mb-4">
            <Text className="text-sm text-blue-600 text-center">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

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
          message={errorMessage}
          duration={3000}
          onHide={() => setShowError(false)}
        />
      )}
    </>
  );
};

export default LoginModal;