import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useAppTheme } from "../../hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import EVAAlert from "../../components/common/EVAAlert";
import { useRegister } from "../../logic/auth/useRegister";

const LOGO_LIGHT = require("../../../assets/LogoEVA_Fclaro.png");
const LOGO_DARK = require("../../../assets/LogoEVA_Foscuro.png");

export default function RegisterScreen() {
  const { colors, fonts, isDark } = useAppTheme();

  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    isKeyboardVisible,
    isAuthenticating,
    errors,
    setErrors,
    alertConfig,
    setAlertConfig,
    handleRegister,
  } = useRegister();

  // Refs para saltar entre campos
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="bg-background"
        scrollEnabled={isKeyboardVisible}
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
            <Text className="text-3xl text-text-primary mt-2" style={{ fontFamily: fonts.family.boldItalic }}>
              Únete a EVA
            </Text>
            <View className="h-[3px] w-10 bg-primary rounded-full mt-1 mb-3" />
            <Text className="text-text-secondary text-center text-base leading-6" style={{ fontFamily: fonts.family.medium }}>
              Comienza a gestionar tus finanzas de forma inteligente hoy mismo.
            </Text>
          </View>

          {/* Form Section */}
          <View>
            {/* Name Input */}
            <View>
              <Text className="text-text-primary mb-3 ml-1 text-base" style={{ fontFamily: fonts.family.semiBold }}>
                Nombre Completo
              </Text>
              <View className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${errors.name ? 'border border-red-500' : ''}`}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={errors.name ? colors.expense : (isDark ? colors.textSecondary : colors.primary)}
                />
                <TextInput
                  placeholder="Tu nombre"
                  placeholderTextColor={colors.muted}
                  className="flex-1 ml-3 text-text-primary text-base"
                  style={{ fontFamily: fonts.family.regular }}
                  value={name}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  blurOnSubmit={false}
                  onChangeText={(text) => {
                    // Filtramos para que solo pasen letras y espacios
                    const filteredText = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                    setName(filteredText);
                    if (errors.name) setErrors({...errors, name: ""});
                  }}
                />
              </View>
              {errors.name ? (
                <Text className="text-xs mt-1 ml-1" style={{ color: (colors as any).expenseStrong || colors.expense, fontFamily: fonts.family.regular }}>{errors.name}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View className="mt-3">
              <Text className="text-text-primary mb-3 ml-1 text-base" style={{ fontFamily: fonts.family.semiBold }}>
                Correo Electrónico
              </Text>
              <View className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${errors.email ? 'border border-red-500' : ''}`}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={errors.email ? colors.expense : (isDark ? colors.textSecondary : colors.primary)}
                />
                <TextInput
                  ref={emailRef}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor={colors.muted}
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
                    if (errors.email) setErrors({...errors, email: ""});
                  }}
                />
              </View>
              {errors.email ? (
                <Text className="text-xs mt-1 ml-1" style={{ color: (colors as any).expenseStrong || colors.expense, fontFamily: fonts.family.regular }}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View className="mt-3">
              <Text className="text-text-primary mb-3 ml-1 text-base" style={{ fontFamily: fonts.family.semiBold }}>
                Contraseña
              </Text>
              <View className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${errors.password ? 'border border-red-500' : ''}`}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.password ? colors.expense : (isDark ? colors.textSecondary : colors.primary)}
                />
                <TextInput
                  ref={passwordRef}
                  placeholder="••••••••"
                  placeholderTextColor="#8F99A1"
                  className="flex-1 ml-3 text-text-primary font-asap text-base"
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  blurOnSubmit={false}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({...errors, password: ""});
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text className="text-xs mt-1 ml-1" style={{ color: (colors as any).expenseStrong || colors.expense, fontFamily: fonts.family.regular }}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View className="mt-3">
              <Text className="text-text-primary mb-3 ml-1 text-base" style={{ fontFamily: fonts.family.semiBold }}>
                Confirmar Contraseña
              </Text>
              <View className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${errors.confirmPassword ? 'border border-red-500' : ''}`}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={errors.confirmPassword ? colors.expense : (isDark ? colors.textSecondary : colors.primary)}
                />
                <TextInput
                  ref={confirmPasswordRef}
                  placeholder="••••••••"
                  placeholderTextColor="#8F99A1"
                  className="flex-1 ml-3 text-text-primary font-asap text-base"
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({...errors, confirmPassword: ""});
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text className="text-xs mt-1 ml-1" style={{ color: (colors as any).expenseStrong || colors.expense, fontFamily: fonts.family.regular }}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isAuthenticating}
              className={`bg-primary rounded-2xl h-16 items-center justify-center shadow-lg shadow-primary/30 mt-10 ${isAuthenticating ? "opacity-70" : ""}`}
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg" style={{ fontFamily: fonts.family.bold }}>
                {isAuthenticating ? "Creando cuenta..." : "Crear Cuenta"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-3 mb-6 flex-row justify-center">
            <Text className="text-text-secondary text-base" style={{ fontFamily: fonts.family.regular }}>
              ¿Ya tienes una cuenta?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary text-base" style={{ fontFamily: fonts.family.bold }}>
                Inicia Sesión
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
            router.replace("/"); // Redirigir al login si fue exitoso
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}
