import { Text, TouchableOpacity, ActivityIndicator, View } from "react-native";
import React, { ReactElement } from "react";

type ButtonSecondaryProps = {
  title: string;
  onPress: () => void;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactElement<{ color?: string; size?: number }>; // 👈 type with color
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
  const textColor = "#0f172a";

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
      className={`border border-secondary rounded-xl px-4 py-3 flex-row items-center justify-center
        ${disabled ? "opacity-50" : ""}
        ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View className="flex-row items-center justify-center">
          {coloredIcon && iconPosition === "left" && (
            <View className="mr-2 text-neutral-text">{coloredIcon}</View>
          )}
          <Text
            className={`text-neutral-text text-base text-center ${textClassName}`}
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
