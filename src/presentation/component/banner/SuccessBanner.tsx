// SuccessBanner.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

interface SuccessBannerProps {
  message: string;
  duration?: number;
  onHide?: () => void;
}

const SuccessBanner: React.FC<SuccessBannerProps> = ({
  message,
  duration = 3000,
  onHide,
}) => {
  const slideAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onHide?.();
      });
    }, duration);

    return () => clearTimeout(timeout);
  }, [slideAnim, duration, onHide]);

  return (
    <Animated.View
      className="absolute top-0 w-full h-14 bg-success justify-center items-center z-50"
      style={{ transform: [{ translateY: slideAnim }] }}
    >
      <Text className="text-white font-semibold text-base">{message}</Text>
    </Animated.View>
  );
};

export default SuccessBanner;
