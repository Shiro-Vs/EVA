import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";

interface EVAInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function EVAInput({ label, error, icon, rightAction, style, ...props }: EVAInputProps) {
  const { colors } = useAppTheme();

  return (
    <View className="mb-4 w-full">
      {label && (
        <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-2 ml-1">
          {label}
        </Text>
      )}
      <View
        className={`bg-card flex-row items-center px-4 py-3 rounded-2xl border border-border/10 ${
          error ? "border-expense" : ""
        }`}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className="flex-1 text-text-primary font-asap-bold text-base"
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
        {rightAction && <View className="ml-2">{rightAction}</View>}
      </View>
      {error ? (
        <Text className="text-expense font-asap text-[10px] mt-1 ml-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
