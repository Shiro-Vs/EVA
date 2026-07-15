import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAppThemeContext } from "../../context/ThemeContext";

import { AuthService } from "../../services/AuthService";
import { User } from "../../interfaces/User";

export default function ProfileScreen() {
  const { theme, toggleTheme } = useAppThemeContext();
  const { colors, isDark } = useAppTheme();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await AuthService.getUserProfile();
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
      <SafeAreaView 
        className="flex-1 px-6 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      className="flex-1 px-6"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center mt-10 mb-8">
          <View 
            className="w-24 h-24 rounded-full items-center justify-center border-4 shadow-sm"
            style={{ backgroundColor: `${colors.primary}10`, borderColor: colors.card }}
          >
            <Ionicons name="person" size={50} color={colors.primary} />
          </View>
          <Text 
            className="font-asap-bold text-2xl mt-4"
            style={{ color: colors.text }}
          >
            {user.nombre_pantalla}
          </Text>
          <Text 
            className="font-asap"
            style={{ color: colors.textSecondary }}
          >
            {user.correo}
          </Text>
        </View>

        <View 
          className="rounded-3xl border overflow-hidden"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <TouchableOpacity 
            className="flex-row items-center p-5 border-b"
            style={{ borderBottomColor: `${colors.text}05` }}
          >
            <View className="w-8 items-center">
              <Ionicons name="wallet-outline" size={22} color={colors.primary} />
            </View>
            <Text 
              className="flex-1 ml-3 font-asap-medium"
              style={{ color: colors.text }}
            >
              Mis Cuentas
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center p-5 border-b"
            style={{ borderBottomColor: `${colors.text}05` }}
            onPress={toggleTheme}
          >
            <View className="w-8 items-center">
              <Ionicons 
                name={theme === "light" ? "moon-outline" : "sunny-outline"} 
                size={22} 
                color={colors.primary} 
              />
            </View>
            <Text 
              className="flex-1 ml-3 font-asap-medium"
              style={{ color: colors.text }}
            >
              Cambiar Tema
            </Text>
            <View style={{ backgroundColor: `${colors.primary}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: colors.primary, fontSize: 10, fontFamily: 'AsapBold' }}>
                {theme === "light" ? "CLÁSICO" : "SLATE"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-5">
            <View className="w-8 items-center">
              <Ionicons name="log-out-outline" size={22} color={colors.expense} />
            </View>
            <Text 
              className="flex-1 ml-3 font-asap-medium"
              style={{ color: colors.expense }}
            >
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
