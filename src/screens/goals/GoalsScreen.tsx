import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";

export default function GoalsScreen() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView className="flex-1 px-6" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="font-asap-bold text-2xl mt-6" style={{ color: colors.text }}>Metas de Ahorro</Text>
        <Text className="font-asap mb-6" style={{ color: colors.textSecondary }}>Tu progreso financiero</Text>

        {/* Meta de prueba */}
        <View className="p-6 rounded-3xl border mb-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="font-asap-bold text-lg" style={{ color: colors.text }}>Nueva Laptop</Text>
              <Text className="font-asap text-xs" style={{ color: colors.textSecondary }}>Objetivo: $1,200</Text>
            </View>
            <View className="bg-orange-500/10 p-2 rounded-xl">
              <Ionicons name="laptop-outline" size={24} color="#F59E0B" />
            </View>
          </View>

          {/* Progress Bar */}
          <View className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: colors.border }}>
            <View className="h-full bg-orange-500 w-[65%]" />
          </View>
          <View className="flex-row justify-between">
            <Text className="font-asap text-xs" style={{ color: colors.textSecondary }}>65% completado</Text>
            <Text className="font-asap-bold text-xs" style={{ color: colors.text }}>$780.00</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
