import React from "react";
import { View, Text } from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";

interface EVASeparatorProps {
  title?: string;
  className?: string;
}

export function EVASeparator({ title, className = "" }: EVASeparatorProps) {
  const { colors, fonts } = useAppTheme();

  return (
    <View 
      className={`border-t pt-4 mt-2 mb-0 ${className}`}
      style={{ borderTopColor: colors.border }}
    >
      {title && (
        <Text 
          className="text-[10px] uppercase tracking-widest mb-2"
          style={{ fontFamily: fonts.family.semiBold, color: colors.textSecondary }}
        >
          {title}
        </Text>
      )}
    </View>
  );
}
