import React from "react";
import { View, Text } from "react-native";

export default function Add() {
  return (
    <View className="flex-1 bg-background justify-center items-center">
      <Text className="text-text-primary font-asap-bold text-xl">Nuevo Movimiento</Text>
      <Text className="text-text-secondary font-asap mt-2">Próximamente...</Text>
    </View>
  );
}
