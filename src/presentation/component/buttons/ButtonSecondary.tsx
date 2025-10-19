import { Text, TouchableOpacity, ActivityIndicator, View } from "react-native";
import React, { ReactElement } from "react";

type ButtonSecondaryProps = {
  title: string;
  onPress: () => void;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactElement<{ color?: string; size?: number }>;
  iconPosition?: "left" | "right";
};

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  title,
  onPress,
  className = "",
  textClassName = "",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
}) => {
  // base colors
  const activeBg = "#eff1ed";
  const disabledBg = "#d9dbd7";
  const textColor = disabled ? "#9ea19b" : "#5e5e5e";

  const coloredIcon =
    icon &&
    React.cloneElement(icon, {
      color: textColor,
    });

  return (
    <TouchableOpacity
      onPress={!disabled && !loading ? onPress : undefined}
      activeOpacity={0.7}
      disabled={disabled || loading}
      style={{
        backgroundColor: disabled ? disabledBg : activeBg,
        shadowColor: disabled ? "transparent" : "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: disabled ? 0 : 0.15,
        shadowRadius: 8,
        elevation: disabled ? 0 : 6,
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
      className={`rounded-3xl flex-row items-center justify-center ${className}`}
    >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <View className="flex-row items-center justify-center">
            {coloredIcon && iconPosition === "left" && (
              <View className="mr-2">{coloredIcon}</View>
            )}
            <Text
              className={`text-base text-center ${textClassName}`}
              style={{ color: textColor }}
            >
              {title}
            </Text>
            {coloredIcon && iconPosition === "right" && (
              <View className="ml-2">{coloredIcon}</View>
            )}
          </View>
        )}
    </TouchableOpacity>
  );
};

export default ButtonSecondary;
