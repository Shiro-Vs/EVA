import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../hooks/useAppTheme";

interface EVALoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function EVALoading({ message, fullScreen = true }: EVALoadingProps) {
  const { colors } = useAppTheme();

  const content = (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text className="mt-4 text-text-secondary font-asap text-sm">
          {message}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return <SafeAreaView className="flex-1 bg-background">{content}</SafeAreaView>;
  }

  return content;
}
