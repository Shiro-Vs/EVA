import React, { useState, useRef } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import EVAAlert from "../../components/common/EVAAlert";
import { useLogin } from "../../logic/auth/useLogin";
import { useAppTheme } from "../../hooks/useAppTheme";

const LOGO_LIGHT = require("../../../assets/LogoEVA_Fclaro.png");

export default function LoginScreen() {
  const { colors, fonts } = useAppTheme();
  const isDark = false;

  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isAuthenticating,
    errors,
    setErrors,
    alertConfig,
    setAlertConfig,
    handleLogin,
  } = useLogin();

  // Ref para saltar al campo de contraseña
  const passwordRef = useRef<TextInput>(null);

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
        <SafeAreaView className="flex-1 px-12 pt-20 pb-10">
          {/* Logo Section */}
          <View className="items-center mb-8">
            <Image
              source={LOGO_LIGHT}
              style={{ width: 110, height: 110 }}
              contentFit="contain"
            />
            <Text className="text-4xl text-text-primary mt-2" style={{ fontFamily: fonts.family.boldItalic }}>
              EVA
            </Text>
            <View className="h-[3px] w-10 bg-primary rounded-full mt-1 mb-3" />
            <Text className="text-text-secondary text-center text-base leading-6" style={{ fontFamily: fonts.family.medium }}>
              Gestiona tus finanzas de forma inteligente y sencilla.
            </Text>
          </View>

          {/* Form Section */}
          <View>
            {/* Email Input */}
            <View>
              <Text className="text-text-primary mb-3 ml-1 text-base" style={{ fontFamily: fonts.family.semiBold }}>
                Correo Electrónico
              </Text>
              <View
                className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${errors.email ? "border border-expense" : ""}`}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={
                    errors.email ? colors.expense : colors.primary
                  }
                />
                <TextInput
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor={colors.textSecondary}
                  className="flex-1 ml-3 text-text-primary text-base"
                  style={{ fontFamily: fonts.family.regular }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                />
              </View>
              {errors.email ? (
                <Text className="text-expense text-xs mt-1 ml-1" style={{ fontFamily: fonts.family.regular }}>
                  {errors.email}
                </Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View className="mt-3">
              <Text className="text-text-primary mb-3 ml-1 text-base" style={{ fontFamily: fonts.family.semiBold }}>
                Contraseña
              </Text>
              <View
                className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${errors.password ? "border border-expense" : ""}`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    errors.password ? colors.expense : colors.primary
                  }
                />
                <TextInput
                  ref={passwordRef}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  className="flex-1 ml-3 text-text-primary text-base"
                  style={{ fontFamily: fonts.family.regular }}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text className="text-expense text-xs mt-1 ml-1" style={{ fontFamily: fonts.family.regular }}>
                  {errors.password}
                </Text>
              ) : null}
              <TouchableOpacity
                className="mt-3 items-end"
                onPress={() => router.push("/forgot-password")}
              >
                <Text className="text-primary text-sm" style={{ fontFamily: fonts.family.medium }}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isAuthenticating}
              className={`bg-primary rounded-2xl h-16 items-center justify-center shadow-lg shadow-primary/30 mt-4 ${isAuthenticating ? "opacity-70" : ""}`}
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg" style={{ fontFamily: fonts.family.bold }}>
                {isAuthenticating ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mt-3 mb-4">
              <View className="flex-1 h-[1px] bg-border" />
              <Text className="mx-4 text-text-secondary text-[11px] tracking-widest uppercase" style={{ fontFamily: fonts.family.regular }}>
                O continúa con
              </Text>
              <View className="flex-1 h-[1px] bg-border" />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-card rounded-2xl h-16"
              activeOpacity={0.7}
            >
              <Image
                source="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                style={{ width: 22, height: 22 }}
                contentFit="contain"
              />
              <Text className="text-text-primary text-base ml-3" style={{ fontFamily: fonts.family.semiBold }}>
                Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-4 mb-6 flex-row justify-center">
            <Text className="text-text-secondary text-base" style={{ fontFamily: fonts.family.regular }}>
              ¿No tienes una cuenta?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text className="text-primary text-base" style={{ fontFamily: fonts.family.bold }}>
                Regístrate
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>

      {/* Alerta Genérica */}
      <EVAAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        iconName={alertConfig.iconName}
        onClose={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          if (alertConfig.type === "success") {
            router.replace("/(main)");
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}
