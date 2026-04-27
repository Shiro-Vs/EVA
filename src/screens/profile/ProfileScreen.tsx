import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

import { mockDB } from "../../services/mockDatabase";
import { User } from "../../interfaces/User";

export default function ProfileScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await mockDB.getUserProfile();
        setUser(u);
      } catch (error) {
        console.error("Error al cargar perfil", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  if (isLoading || !user) {
    return (
      <SafeAreaView className="flex-1 bg-background px-6 justify-center items-center">
        <ActivityIndicator size="large" color="#1F7ECC" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center mt-10 mb-8">
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center border-4 border-card shadow-sm">
            <Ionicons name="person" size={50} color="#1F7ECC" />
          </View>
          <Text className="text-text-primary font-asap-bold text-2xl mt-4">{user.nombre_pantalla}</Text>
          <Text className="text-text-secondary font-asap">{user.correo}</Text>
        </View>

        <View className="bg-card rounded-3xl border border-border/30 overflow-hidden">
          <TouchableOpacity 
            className="flex-row items-center p-5 border-b border-border/10"
            onPress={toggleColorScheme}
          >
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color="#1F7ECC" />
            <Text className="flex-1 ml-4 text-text-primary font-asap-medium">Modo {isDark ? "Claro" : "Oscuro"}</Text>
            <Ionicons name="chevron-forward" size={18} color="#8F99A1" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-5 border-b border-border/10">
            <Ionicons name="wallet-outline" size={22} color="#1F7ECC" />
            <Text className="flex-1 ml-4 text-text-primary font-asap-medium">Mis Cuentas</Text>
            <Ionicons name="chevron-forward" size={18} color="#8F99A1" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-5">
            <Ionicons name="log-out-outline" size={22} color="#E63946" />
            <Text className="flex-1 ml-4 text-red-500 font-asap-medium">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
