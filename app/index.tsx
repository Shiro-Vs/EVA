import { View, Text } from "react-native";
import React from "react";

export default function WelcomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <View className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-xl border border-border">
        <Text className="text-4xl font-bold text-primary text-center mb-2">
          Hola, soy EVA
        </Text>
        <Text className="text-text-secondary text-center mb-8 text-lg">
          Tu asistente financiera inteligente
        </Text>
        
        <View className="space-y-4">
          <View className="p-4 bg-background/50 rounded-2xl flex-row items-center border border-border/50">
            <Text className="text-2xl mr-3">🚀</Text>
            <View>
              <Text className="font-semibold text-text-primary">SDK 54</Text>
              <Text className="text-text-secondary text-sm">Versión Estable</Text>
            </View>
          </View>
          
          <View className="p-4 bg-background/50 rounded-2xl flex-row items-center border border-border/50">
            <Text className="text-2xl mr-3">✨</Text>
            <View>
              <Text className="font-semibold text-text-primary">NativeWind v4</Text>
              <Text className="text-text-secondary text-sm">Temas configurados</Text>
            </View>
          </View>
          
          <View className="p-4 bg-background/50 rounded-2xl flex-row items-center border border-border/50">
            <Text className="text-2xl mr-3">🔥</Text>
            <View>
              <Text className="font-semibold text-text-primary">Firebase + Gemini</Text>
              <Text className="text-text-secondary text-sm">Listo para el misiones</Text>
            </View>
          </View>
        </View>
      </View>
      
      <Text className="mt-8 text-text-secondary font-medium">
        Modo Oscuro/Claro disponible
      </Text>
    </View>
  );
}

