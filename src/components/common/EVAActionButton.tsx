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
          container: "bg-muted/10",
          color: colors.textSecondary,
          iconName: icon || "pencil"
        };
      case "delete":
        return {
          container: "bg-expense/10",
          color: colors.expense,
          iconName: icon || "trash-outline"
        };
      default:
        return {
          container: "bg-muted/10",
          color: colors.textSecondary,
          iconName: icon
        };
    }
  };

  const styles = getStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-8 h-8 rounded-full items-center justify-center ${styles.container}`}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={styles.iconName as any} 
        size={size} 
        color={styles.color} 
      />
    </TouchableOpacity>
  );
}
