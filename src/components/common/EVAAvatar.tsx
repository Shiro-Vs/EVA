import React from "react";
import { View, Text, ViewStyle } from "react-native";

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
  const initial = name.charAt(0).toUpperCase();

  return (
    <View
      className={`rounded-full items-center justify-center overflow-hidden ${className}`}
      style={[
        { 
          width: size, 
          height: size, 
          backgroundColor: `${color}15` 
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
