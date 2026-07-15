import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";

interface EVAActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  type?: "edit" | "delete" | "default";
  size?: number;
}

export function EVAActionButton({ 
  icon, 
  onPress, 
  type = "default",
  size = 14 
}: EVAActionButtonProps) {
  const { colors } = useAppTheme();

  const getStyles = () => {
    switch (type) {
      case "edit":
        return {
          backgroundColor: `${colors.muted}15`,
          color: colors.textSecondary,
          iconName: icon || "pencil"
        };
      case "delete":
        return {
          backgroundColor: colors.expense,
          color: "#FFFFFF",
          iconName: icon || "trash-outline"
        };
      default:
        return {
          backgroundColor: `${colors.muted}15`,
          color: colors.textSecondary,
          iconName: icon
        };
    }
  };

  const buttonStyle = getStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-8 h-8 rounded-full items-center justify-center"
      style={{ backgroundColor: buttonStyle.backgroundColor }}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={buttonStyle.iconName as any} 
        size={size} 
        color={buttonStyle.color} 
      />
    </TouchableOpacity>
  );
}
