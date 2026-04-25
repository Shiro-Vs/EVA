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
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import EVAAlert from "../common/EVAAlert";

const LOGO_LIGHT = require("../../../assets/LogoEVA_Fclaro.png");
const LOGO_DARK = require("../../../assets/LogoEVA_Foscuro.png");

export default function ForgotPasswordView() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
    iconName: undefined as string | undefined,
  });

  const validateEmail = (text: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };

  const handleResetPassword = () => {
    if (!email.trim()) {
      setError("El correo es obligatorio");
      return;
    }
    if (!validateEmail(email)) {
      setError("Ingresa un correo válido");
      return;
    }

    // Simulación de envío exitoso
      setAlertConfig({
        visible: true,
        title: "Enlace Enviado",
        message: "Hemos enviado un correo a " + email + " con las instrucciones para restablecer tu contraseña.",
        type: "success",
        iconName: "mail-unread-outline",
      });
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
            <Text className="text-3xl font-asap-bold-italic text-text-primary mt-4 text-center">
              Recuperar Cuenta
            </Text>
            <View className="h-[3px] w-10 bg-primary rounded-full mt-1 mb-4" />
            <Text className="text-text-secondary font-asap-medium text-center text-base leading-6 px-4">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </Text>
          </View>

          {/* Form Section */}
          <View className="mt-6">
            <View>
              <Text className="text-text-primary font-asap-semibold mb-3 ml-1 text-base">
                Correo Electrónico
              </Text>
              <View className={`flex-row items-center bg-card rounded-2xl px-5 py-1.5 ${error ? 'border border-red-500' : ''}`}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={error ? "#E63946" : (isDark ? "#8F99A1" : "#1F7ECC")}
                />
                <TextInput
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#8F99A1"
                  className="flex-1 ml-3 text-text-primary font-asap text-base"
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
                <Text className="text-red-500 text-xs mt-1 ml-1 font-asap">{error}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleResetPassword}
              className="bg-primary rounded-2xl h-16 items-center justify-center shadow-lg shadow-primary/30 mt-10"
              activeOpacity={0.8}
            >
              <Text className="text-white font-asap-bold text-lg">
                Enviar Enlace
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help Footer */}
          <View className="mt-12 items-center">
            <Text className="text-text-secondary font-asap text-center text-sm">
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
