import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function GoalsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-text-primary font-asap-bold text-2xl mt-6">Metas de Ahorro</Text>
        <Text className="text-text-secondary font-asap mb-6">Tu progreso financiero</Text>
        
        {/* Meta de prueba */}
        <View className="bg-card p-6 rounded-3xl border border-border/30 mb-4">
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-text-primary font-asap-bold text-lg">Nueva Laptop</Text>
              <Text className="text-text-secondary font-asap text-xs">Objetivo: $1,200</Text>
            </View>
            <View className="bg-orange-500/10 p-2 rounded-xl">
              <Ionicons name="laptop-outline" size={24} color="#F59E0B" />
            </View>
          </View>
          
          {/* Progress Bar */}
          <View className="h-2 bg-border/20 rounded-full overflow-hidden mb-2">
            <View className="h-full bg-orange-500 w-[65%]" />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary font-asap text-xs">65% completado</Text>
            <Text className="text-text-primary font-asap-bold text-xs">$780.00</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
