import React from "react";
import { View, Text } from "react-native";
import { useAppTheme } from "../../src/hooks/useAppTheme";

export default function Add() {
  const { colors } = useAppTheme();

  return (
    <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
      <Text className="font-asap-bold text-xl" style={{ color: colors.text }}>Nuevo Movimiento</Text>
      <Text className="font-asap mt-2" style={{ color: colors.textSecondary }}>Próximamente...</Text>
    </View>
  );
}
