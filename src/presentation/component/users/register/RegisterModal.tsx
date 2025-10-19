import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, User, Lock, Mail, UserCheck } from 'lucide-react-native';
import CustomModal from '../../modals/CustomModal';
import ButtonPrimary from '../../buttons/ButtonPrimary';
import { UserRole, UserRegistrationRequest } from '../../../../types/UserTypes';
import { UserService } from '../../../../service/UserService';

type RegisterModalProps = {
  visible: boolean;
  onClose: () => void;
  onRegisterSuccess?: () => void;
};

type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
};

type FormErrors = {
  [K in keyof FormData]?: string;
};

const RegisterModal: React.FC<RegisterModalProps> = ({
  visible,
  onClose,
  onRegisterSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsLoading(false);
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!UserService.isValidEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!UserService.isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setShowError(false);

    try {
      // Prepare registration data
      const registrationData: UserRegistrationRequest = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      };

      // Call the actual registration API
      const response = await UserService.register(registrationData);

      if (__DEV__) {
        console.log('Registration successful:', response.data);
      }

      setIsLoading(false);
      setShowSuccess(true);

      // Auto-hide success banner and close modal after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        onRegisterSuccess?.();
        onClose();
      }, 2000);

    } catch (error) {
      setIsLoading(false);

      // Handle specific error messages from the API
      const errorMessage = error instanceof Error
        ? error.message
        : 'Registration failed. Please try again.';

      if (__DEV__) {
        console.error('Registration error:', errorMessage);
      }

      setErrorMessage(errorMessage);
      setShowError(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isFormValid = () => {
    return (
      formData.username.trim() &&
      UserService.isValidEmail(formData.email.trim()) &&
      UserService.isValidPassword(formData.password) &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      Object.keys(errors).length === 0
    );
  };

  return (
    <>
      <CustomModal
        visible={visible}
        onClose={handleClose}
        title="Create New Account"
        primaryAction={{
          label: 'Register',
          onPress: handleRegister,
          disabled: isLoading || !isFormValid(),
          loading: isLoading,
        }}
      >
        <View className="w-full">
          {/* Username Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Username *
            </Text>
            <View className="flex-row items-center border border-border-dark rounded-2xl px-3 py-2">
              <User size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="Enter your username"
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {errors.username && (
              <Text className="text-sm text-red-500 mt-1">{errors.username}</Text>
            )}
          </View>

          {/* Email Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email *
            </Text>
            <View className="flex-row items-center border border-border-dark rounded-2xl px-3 py-2">
              <Mail size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="Enter your email address"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>
            {errors.email && (
              <Text className="text-sm text-red-500 mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Password Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Password *
            </Text>
            <View className="flex-row items-center border border-border-dark rounded-2xl px-3 py-2">
              <Lock size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
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
            {errors.password && (
              <Text className="text-sm text-red-500 mt-1">{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password Field */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </Text>
            <View className="flex-row items-center border border-border-dark rounded-2xl px-3 py-2">
              <Lock size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={toggleConfirmPasswordVisibility}
                disabled={isLoading}
                className="ml-2"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text className="text-sm text-red-500 mt-1">{errors.confirmPassword}</Text>
            )}
          </View>
        </View>
      </CustomModal>

    </>
  );
};

export default RegisterModal;