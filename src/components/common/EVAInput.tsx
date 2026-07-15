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
  const { colors, fonts } = useAppTheme();

  return (
    <View className="mb-4 w-full">
      {label && (
        <Text 
          className="text-[10px] uppercase tracking-widest mb-2 ml-1"
          style={{ color: colors.textSecondary, fontFamily: fonts.family.semiBold }}
        >
          {label}
        </Text>
      )}
      <View
        className="flex-row items-center px-4 py-3 rounded-2xl border"
        style={{ 
          backgroundColor: colors.card, 
          borderColor: error ? colors.expense : colors.border,
          borderWidth: 1
        }}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className="flex-1 text-base"
          placeholderTextColor={colors.muted}
          style={[{ color: colors.text, fontFamily: fonts.family.bold }, style]}
          {...props}
        />
        {rightAction && <View className="ml-2">{rightAction}</View>}
      </View>
      {error && (
        <Text className="text-[10px] mt-1 ml-1" style={{ color: (colors as any).expenseStrong || colors.expense, fontFamily: fonts.family.regular }}>
          {error}
        </Text>
      )}
    </View>
  );
}
