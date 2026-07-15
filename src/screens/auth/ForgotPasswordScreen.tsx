import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useForgotPassword } from "../../logic/auth/useForgotPassword";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import EVAAlert from "../../components/common/EVAAlert";

const LOGO_LIGHT = require("../../../assets/LogoEVA_Fclaro.png");
const LOGO_DARK = require("../../../assets/LogoEVA_Foscuro.png");

export default function ForgotPasswordScreen() {
  const { colors, fonts, isDark } = useAppTheme();

  const {
    email,
    setEmail,
    error,
    setError,
    alertConfig,
    setAlertConfig,
    handleResetPassword,
  } = useForgotPassword();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="bg-background"
      >
        <SafeAreaView className="flex-1 px-12 pt-20 pb-12">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-16 left-6 z-10 p-2"
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={colors.text}
            />
          </TouchableOpacity>

          {/* Logo Section */}
          <View className="items-center mb-10">
            <Image
              source={isDark ? LOGO_DARK : LOGO_LIGHT}
              style={{ width: 100, height: 100 }}
              contentFit="contain"
            />
            <Text className="text-3xl text-text-primary mt-4 text-center" style={{ fontFamily: fonts.family.boldItalic }}>
              Recuperar Cuenta
            </Text>
            <View className="h-[3px] w-10 bg-primary rounded-full mt-1 mb-4" />
            <Text className="text-text-secondary text-center text-base leading-6 px-4" style={{ fontFamily: fonts.family.medium }}>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </Text>
          </View>

          {/* Form Section */}
          <View className="mt-6">
            <View>
              <Text className="text-text-primary mb-3 ml-1 text-base" style={{ fontFamily: fonts.family.semiBold }}>
                Correo Electrónico
              </Text>
              <View className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${error ? 'border border-red-500' : ''}`}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={error ? colors.expense : (isDark ? colors.textSecondary : colors.primary)}
                />
                <TextInput
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor={colors.muted}
                  className="flex-1 ml-3 text-text-primary text-base"
                  style={{ fontFamily: fonts.family.regular }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError("");
                  }}
                />
              </View>
              {error ? (
                <Text className="text-xs mt-1 ml-1" style={{ color: (colors as any).expenseStrong || colors.expense, fontFamily: fonts.family.regular }}>{error}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleResetPassword}
              className="bg-primary rounded-2xl h-16 items-center justify-center shadow-lg shadow-primary/30 mt-10"
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg" style={{ fontFamily: fonts.family.bold }}>
                Enviar Enlace
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help Footer */}
          <View className="mt-12 items-center">
            <Text className="text-text-secondary text-center text-sm" style={{ fontFamily: fonts.family.regular }}>
              ¿No recibiste el correo? Revisa tu carpeta de spam o intenta de nuevo en unos minutos.
            </Text>
          </View>
        </SafeAreaView>
      </ScrollView>

      {/* Alerta de Éxito */}
      <EVAAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        iconName={alertConfig.iconName}
        onClose={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          if (alertConfig.type === "success") {
            router.replace("/");
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}
