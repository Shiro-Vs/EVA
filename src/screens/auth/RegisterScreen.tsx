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
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import EVAAlert from "../../components/common/EVAAlert";
import { mockDB } from "../../services/mockDatabase";

const LOGO_LIGHT = require("../../../assets/LogoEVA_Fclaro.png");
const LOGO_DARK = require("../../../assets/LogoEVA_Foscuro.png");

export default function RegisterScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Refs para saltar entre campos
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Detectar teclado
  React.useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Estados de error
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateEmail = (text: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };

  const validateName = (text: string) => {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
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

  const handleRegister = async () => {
    if (isAuthenticating) return;

    const newErrors = { name: "", email: "", password: "", confirmPassword: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
      isValid = false;
    } else if (!validateName(name)) {
      newErrors.name = "Solo se permiten letras";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "El correo es obligatorio";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Correo inválido";
      isValid = false;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
      isValid = false;
    } else if (!hasUppercase || !hasNumber) {
      newErrors.password = "Usa una mayúscula y un número";
      isValid = false;
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = "No coinciden";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsAuthenticating(true);
      try {
        await mockDB.register(email.trim(), password, name.trim());
        setAlertConfig({
          visible: true,
          title: "¡Bienvenido!",
          message: "Tu cuenta ha sido creada con éxito. Ya puedes comenzar a gestionar tus finanzas.",
          type: "success",
          iconName: "person-add-outline",
        });
      } catch (error: any) {
        setAlertConfig({
          visible: true,
          title: "Error al registrar",
          message: error.message || "Hubo un problema al crear tu cuenta.",
          type: "error",
          iconName: "warning-outline",
        });
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

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
              color={isDark ? "#A7B6C2" : "#0C1B26"}
            />
          </TouchableOpacity>

          {/* Logo Section */}
          <View className="items-center mb-10">
            <Image
              source={isDark ? LOGO_DARK : LOGO_LIGHT}
              style={{ width: 100, height: 100 }}
              contentFit="contain"
            />
            <Text className="text-3xl font-asap-bold-italic text-text-primary mt-2">
              Únete a EVA
            </Text>
            <View className="h-[3px] w-10 bg-primary rounded-full mt-1 mb-3" />
            <Text className="text-text-secondary font-asap-medium text-center text-base leading-6">
              Comienza a gestionar tus finanzas de forma inteligente hoy mismo.
            </Text>
          </View>

          {/* Form Section */}
          <View>
            {/* Name Input */}
            <View>
              <Text className="text-text-primary font-asap-semibold mb-3 ml-1 text-base">
                Nombre Completo
              </Text>
              <View className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${errors.name ? 'border border-red-500' : ''}`}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={errors.name ? "#E63946" : (isDark ? "#8F99A1" : "#1F7ECC")}
                />
                <TextInput
                  placeholder="Tu nombre"
                  placeholderTextColor="#8F99A1"
                  className="flex-1 ml-3 text-text-primary font-asap text-base"
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
                <Text className="text-red-500 text-xs mt-1 ml-1 font-asap">{errors.name}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View className="mt-3">
              <Text className="text-text-primary font-asap-semibold mb-3 ml-1 text-base">
                Correo Electrónico
              </Text>
              <View className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${errors.email ? 'border border-red-500' : ''}`}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={errors.email ? "#E63946" : (isDark ? "#8F99A1" : "#1F7ECC")}
                />
                <TextInput
                  ref={emailRef}
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
                    if (errors.email) setErrors({...errors, email: ""});
                  }}
                />
              </View>
              {errors.email ? (
                <Text className="text-red-500 text-xs mt-1 ml-1 font-asap">{errors.email}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View className="mt-3">
              <Text className="text-text-primary font-asap-semibold mb-3 ml-1 text-base">
                Contraseña
              </Text>
              <View className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${errors.password ? 'border border-red-500' : ''}`}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.password ? "#E63946" : (isDark ? "#8F99A1" : "#1F7ECC")}
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
                    color="#8F99A1"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text className="text-red-500 text-xs mt-1 ml-1 font-asap">{errors.password}</Text>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View className="mt-3">
              <Text className="text-text-primary font-asap-semibold mb-3 ml-1 text-base">
                Confirmar Contraseña
              </Text>
              <View className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${errors.confirmPassword ? 'border border-red-500' : ''}`}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={errors.confirmPassword ? "#E63946" : (isDark ? "#8F99A1" : "#1F7ECC")}
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
                    color="#8F99A1"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text className="text-red-500 text-xs mt-1 ml-1 font-asap">{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isAuthenticating}
              className={`bg-primary rounded-2xl h-16 items-center justify-center shadow-lg shadow-primary/30 mt-10 ${isAuthenticating ? "opacity-70" : ""}`}
              activeOpacity={0.8}
            >
              <Text className="text-white font-asap-bold text-lg">
                {isAuthenticating ? "Creando cuenta..." : "Crear Cuenta"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-3 mb-6 flex-row justify-center">
            <Text className="text-text-secondary font-asap text-base">
              ¿Ya tienes una cuenta?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-asap-bold text-base">
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
