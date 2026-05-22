import React from "react";
import { View, Text, ViewStyle } from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";

interface EVAAvatarProps {
  name: string;
  color: string;
  size?: number;
  fontSize?: number;
  className?: string;
  style?: ViewStyle;
}

export function EVAAvatar({ 
  name, 
  color, 
  size = 48, 
  fontSize = 18,
  className = "",
  style 
}: EVAAvatarProps) {
  const { isDark } = useAppTheme();
  const initial = name.charAt(0).toUpperCase();

  return (
    <View
      className={`rounded-full items-center justify-center overflow-hidden ${className}`}
      style={[
        { 
          width: size, 
          height: size, 
          backgroundColor: `${color}15`,
          borderWidth: isDark ? 1 : 0,
          borderColor: `${color}30`
        },
        style
      ]}
    >
      <Text 
        className="font-asap-bold" 
        style={{ color: color, fontSize: fontSize }}
      >
        {initial}
      </Text>
    </View>
  );
}
