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
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import EVAAlert from "../common/EVAAlert";

const LOGO_LIGHT = require("../../../assets/LogoEVA_Fclaro.png");
const LOGO_DARK = require("../../../assets/LogoEVA_Foscuro.png");

export default function LoginView() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Ref para saltar al campo de contraseña
  const passwordRef = useRef<TextInput>(null);

  // Estados de error
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateEmail = (text: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };

  // Estados de alerta
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
    iconName: undefined as string | undefined,
  });

  const handleLogin = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "El correo es obligatorio";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Correo inválido";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setAlertConfig({
        visible: true,
        title: "¡Hola de nuevo!",
        message:
          "Has iniciado sesión correctamente. Estamos preparando tus finanzas.",
        type: "success",
        iconName: "log-in-outline",
      });
    }
  };

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
              source={isDark ? LOGO_DARK : LOGO_LIGHT}
              style={{ width: 110, height: 110 }}
              contentFit="contain"
            />
            <Text className="text-4xl font-asap-bold-italic text-text-primary mt-2">
              EVA
            </Text>
            <View className="h-[3px] w-10 bg-primary rounded-full mt-1 mb-3" />
            <Text className="text-text-secondary font-asap-medium text-center text-base leading-6">
              Gestiona tus finanzas de forma inteligente y sencilla.
            </Text>
          </View>

          {/* Form Section */}
          <View>
            {/* Email Input */}
            <View>
              <Text className="text-text-primary font-asap-semibold mb-3 ml-1 text-base">
                Correo Electrónico
              </Text>
              <View
                className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${errors.email ? "border border-red-500" : ""}`}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={
                    errors.email ? "#E63946" : isDark ? "#8F99A1" : "#1F7ECC"
                  }
                />
                <TextInput
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#8F99A1"
                  className="flex-1 ml-3 text-text-primary font-asap text-base"
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
                <Text className="text-red-500 text-xs mt-1 ml-1 font-asap">
                  {errors.email}
                </Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View className="mt-3">
              <Text className="text-text-primary font-asap-semibold mb-3 ml-1 text-base">
                Contraseña
              </Text>
              <View
                className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${errors.password ? "border border-red-500" : ""}`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    errors.password ? "#E63946" : isDark ? "#8F99A1" : "#1F7ECC"
                  }
                />
                <TextInput
                  ref={passwordRef}
                  placeholder="••••••••"
                  placeholderTextColor="#8F99A1"
                  className="flex-1 ml-3 text-text-primary font-asap text-base"
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
                    color="#8F99A1"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text className="text-red-500 text-xs mt-1 ml-1 font-asap">
                  {errors.password}
                </Text>
              ) : null}
              <TouchableOpacity
                className="mt-3 items-end"
                onPress={() => router.push("/forgot-password")}
              >
                <Text className="text-primary font-asap-medium text-sm">
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              className="bg-primary rounded-2xl h-16 items-center justify-center shadow-lg shadow-primary/30 mt-4"
              activeOpacity={0.8}
            >
              <Text className="text-white font-asap-bold text-lg">
                Iniciar Sesión
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mt-3 mb-4">
              <View className="flex-1 h-[1px] bg-border/30" />
              <Text className="mx-4 text-text-secondary font-asap text-[11px] tracking-widest uppercase">
                O continúa con
              </Text>
              <View className="flex-1 h-[1px] bg-border/30" />
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
              <Text className="text-text-primary font-asap-semibold text-base ml-3">
                Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-4 mb-6 flex-row justify-center">
            <Text className="text-text-secondary font-asap text-base">
              ¿No tienes una cuenta?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text className="text-primary font-asap-bold text-base">
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
            // Aquí iría la navegación al Home
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}
