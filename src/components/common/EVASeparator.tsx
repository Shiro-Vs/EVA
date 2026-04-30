import React from "react";
import { View, Text } from "react-native";

interface EVASeparatorProps {
  title?: string;
  className?: string;
}

export function EVASeparator({ title, className = "" }: EVASeparatorProps) {
  return (
    <View className={`border-t border-border/50 pt-4 mt-2 mb-0 ${className}`}>
      {title && (
        <Text className="text-text-secondary font-asap-semibold text-xs uppercase tracking-wider mb-2">
          {title}
        </Text>
      )}
    </View>
  );
}
