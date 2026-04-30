import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAppThemeContext } from "../../context/ThemeContext";

import { mockDB } from "../../services/mockDatabase";
import { User } from "../../interfaces/User";

export default function ProfileScreen() {
  const { theme, toggleTheme } = useAppThemeContext();
  const { colors, isDark } = useAppTheme();

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
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center mt-10 mb-8">
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center border-4 border-card shadow-sm">
            <Ionicons name="person" size={50} color={colors.primary} />
          </View>
          <Text className="text-text-primary font-asap-bold text-2xl mt-4">{user.nombre_pantalla}</Text>
          <Text className="text-text-secondary font-asap">{user.correo}</Text>
        </View>

        <View className="bg-card rounded-3xl border border-border/30 overflow-hidden">
          <TouchableOpacity className="flex-row items-center p-5 border-b border-border/10">
            <View className="w-8 items-center">
              <Ionicons name="wallet-outline" size={22} color={colors.primary} />
            </View>
            <Text className="flex-1 ml-3 text-text-primary font-asap-medium">Mis Cuentas</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-5">
            <View className="w-8 items-center">
              <Ionicons name="log-out-outline" size={22} color={colors.expense} />
            </View>
            <Text className="flex-1 ml-3 text-expense font-asap-medium">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
