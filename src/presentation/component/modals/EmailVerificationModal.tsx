import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react-native';
import { useAuthContext } from '../../context/AuthContext';
import ButtonPrimary from '../buttons/ButtonPrimary';
import CustomModal from './CustomModal';
import { API_CONFIG } from '../../../config/api';

interface EmailVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  username: string;
  email?: string; // Optional email prop for registration flow
  onVerificationSuccess: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  visible,
  onClose,
  username,
  email,
  onVerificationSuccess,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuthContext();

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setVerificationCode('');
      setError('');
      setSuccess(false);
      setAttempts(0);
      setCountdown(60);
    }
  }, [visible]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0 && visible) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, visible]);

  const handleCodeChange = (text: string) => {
    // Only allow numbers and limit to 6 digits
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setVerificationCode(numericText);
      setError(''); // Clear error when user types
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (__DEV__) {
        console.log('EmailVerificationModal - Verifying code for user:', username);
        console.log('EmailVerificationModal - Base URL:', API_CONFIG.BASE_URL);
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.VERIFY_EMAIL}?username=${username}&verification_code=${verificationCode}`;
      
      if (__DEV__) {
        console.log('EmailVerificationModal - Making verification request to:', url);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (__DEV__) {
        console.log('EmailVerificationModal - Response status:', response.status);
        console.log('EmailVerificationModal - Response ok:', response.ok);
      }

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setError('');

        // Show success message and close modal
        setTimeout(() => {
          onVerificationSuccess();
          onClose();
        }, 1500);
      } else {
        setAttempts(attempts + 1);
        setError(data.detail || 'Verification failed. Please try again.');
        
        if (attempts + 1 >= maxAttempts) {
          Alert.alert(
            'Maximum Attempts Reached',
            'You have exceeded the maximum number of verification attempts. Please request a new verification code.',
            [{ text: 'Request New Code', onPress: resendCode }]
          );
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      console.error('Verification error:', error);
      
      if (__DEV__) {
        console.error('EmailVerificationModal - Error details:', {
          message: errorMessage,
          username,
          baseUrl: API_CONFIG.BASE_URL,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setError('');

    try {
      if (__DEV__) {
        console.log('EmailVerificationModal - Resending code for user:', username);
        console.log('EmailVerificationModal - Base URL:', API_CONFIG.BASE_URL);
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.RESEND_VERIFICATION}?username=${username}`;
      
      if (__DEV__) {
        console.log('EmailVerificationModal - Making resend request to:', url);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (__DEV__) {
        console.log('EmailVerificationModal - Resend response status:', response.status);
        console.log('EmailVerificationModal - Resend response ok:', response.ok);
      }

      const data = await response.json();

      if (response.ok) {
        setVerificationCode('');
        setAttempts(0);
        setCountdown(60); // Reset countdown
        Alert.alert(
          'Email Sent',
          'A new verification code has been sent to your email address.'
        );
      } else {
        setError(data.detail || 'Failed to resend verification code');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      console.error('Resend error:', error);
      
      if (__DEV__) {
        console.error('EmailVerificationModal - Resend error details:', {
          message: errorMessage,
          username,
          baseUrl: API_CONFIG.BASE_URL,
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleResendCode = () => {
    resendCode();
  };

  if (success) {
    return (
      <CustomModal
        visible={visible}
        onClose={onClose}
        title="Email Verified!"
        icon={<CheckCircle size={32} color="#10b981" />}
        iconPosition="top"
        secondaryAction={{
          label: 'Continue',
          onPress: () => {
            onVerificationSuccess();
            onClose();
          },
        }}
      >
        <View style={styles.successContainer}>
          <Text style={styles.successMessage}>
            Your email has been successfully verified. You can now access all SmartVault features.
          </Text>
        </View>
      </CustomModal>
    );
  }

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Email Verification"
      icon={<Mail size={32} color="#ffb800" />}
      iconPosition="top"
      primaryAction={{
        label: isLoading ? "Verifying..." : "Verify Code",
        onPress: verifyCode,
        disabled: verificationCode.length !== 6 || isLoading,
        loading: isLoading,
      }}
      secondaryAction={{
        label: "Cancel",
        onPress: onClose,
      }}
    >
      <View style={styles.content}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.subtitle}>Check Your Email</Text>
          <Text style={styles.description}>
            We've sent a 6-digit verification code to your email address. Please check your inbox and enter the code below.
          </Text>
          <Text style={styles.emailText}>{email || user?.email}</Text>
        </View>

        {/* Verification Input */}
        <View style={styles.verificationContainer}>
          <Text style={styles.inputLabel}>Verification Code</Text>
          <TextInput
            style={[styles.codeInput, error && styles.inputError]}
            value={verificationCode}
            onChangeText={handleCodeChange}
            keyboardType="numeric"
            maxLength={6}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#6B7280"
            autoFocus
          />
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          {attempts > 0 && (
            <Text style={styles.attemptsText}>
              Attempts remaining: {maxAttempts - attempts}
            </Text>
          )}
        </View>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive the code?
          </Text>
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={countdown > 0 || isResending}
            style={styles.resendButton}
          >
            <RefreshCw
              size={16}
              color={countdown > 0 ? "#9CA3AF" : "#ffb800"}
            />
            <Text style={[
              styles.resendButtonText,
              countdown > 0 && styles.resendDisabledText
            ]}>
              {isResending 
                ? "Sending..." 
                : countdown > 0 
                ? `Resend in ${countdown}s` 
                : "Resend Code"
              }
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            • Code expires in 15 minutes{'\n'}
            • Check your spam/junk folder{'\n'}
            • Contact support if issues persist
          </Text>
        </View>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a365d',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  verificationContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  codeInput: {
    height: 50,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a365d',
    backgroundColor: '#ffffff',
    letterSpacing: 6,
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  attemptsText: {
    color: '#f59e0b',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  resendText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#ffb800',
    fontWeight: '600',
    marginLeft: 6,
  },
  resendDisabledText: {
    color: '#9CA3AF',
  },
  helpContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmailVerificationModal;