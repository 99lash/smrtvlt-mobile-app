import { Text, TouchableOpacity, ActivityIndicator, View } from "react-native";
import React, { ReactElement } from "react";

type ButtonPrimaryProps = {
  title: string;
  onPress: () => void;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactElement<{ color?: string; size?: number; className?: string }>;
  iconPosition?: "left" | "right";
};

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  title,
  onPress,
  className = "",
  textClassName = "",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
}) => {
  const styledIcon =
    icon &&
    React.cloneElement(icon, {
      color: '#ffffff', 
      size: icon.props.size ?? 20, 
    });

  return (
    <TouchableOpacity
      onPress={!disabled && !loading ? onPress : undefined}
      activeOpacity={0.7}
      disabled={disabled || loading}
      className={`bg-primary rounded-xl px-4 py-3 flex-row items-center justify-center
        ${disabled ? "opacity-50" : ""}
        ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <View className="flex-row items-center justify-center">
          {styledIcon && iconPosition === "left" && (
            <View className="mr-2">{styledIcon}</View>
          )}
          <Text
            className={`text-neutral text-text-default dark:text-text-dark text-center ${textClassName}`}
          >
            {title}
          </Text>
          {styledIcon && iconPosition === "right" && (
            <View className="ml-2">{styledIcon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ButtonPrimary;
