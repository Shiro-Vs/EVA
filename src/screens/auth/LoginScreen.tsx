import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";

import { styles } from "./LoginScreen.styles";
import { useLogin } from "./useLogin";
import { EmailVerificationModal } from "./components/EmailVerificationModal";
import { CustomAlertModal } from "../../components/common/CustomAlertModal";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { Alert } from "react-native";

export default function LoginScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
    signInWithGoogle,
    navigation,
    showVerificationModal,
    setShowVerificationModal,
    verificationUser,
    errorModalVisible,
    errorMessage,
    failedAttempts,
    resetError,
    passwordVisible,
    togglePasswordVisibility,
  } = useLogin();

  const handleResetPassword = async () => {
    resetError();
    if (!email) {
      Alert.alert("Error", "Ingresa tu correo para recuperar la contraseña");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Correo enviado",
        "Revisa tu bandeja para restablecer tu contraseña."
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo pequeño */}
        <Image
          source={require("../../../assets/logo-eva.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Bienvenido de nuevo</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={[styles.input, { marginBottom: 16 }]}
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={passwordVisible ? "eye-off" : "eye"}
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Cargando..." : "Ingresar"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, loading && { opacity: 0.7 }]}
          onPress={signInWithGoogle}
          disabled={loading}
        >
          {/* Using a text symbol for Google G if icon not available perfectly, but Ionicons usually has logo-google */}
          {/* Note: Ensure Ionicons is imported in LoginScreen if used, or use Image */}
          <Image
            source={{
              uri: "https://developers.google.com/identity/images/g-logo.png",
            }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Continuar con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={styles.footerLink}
        >
          <Text style={styles.footerText}>
            ¿No tienes cuenta? <Text style={styles.link}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <EmailVerificationModal
        visible={showVerificationModal}
        user={verificationUser}
        onClose={() => setShowVerificationModal(false)}
        onContinueAnyway={() => {
          setShowVerificationModal(false);
          navigation.replace("Home");
        }}
        onVerificationConfirmed={() => {
          setShowVerificationModal(false);
          navigation.replace("Home");
        }}
      />

      <CustomAlertModal
        visible={errorModalVisible}
        title={failedAttempts >= 2 ? "¿Olvidaste tu contraseña?" : "Oops"}
        message={
          failedAttempts >= 2
            ? "Parece que tienes problemas. ¿Deseas restablecer tu contraseña?"
            : errorMessage
        }
        variant={failedAttempts >= 2 ? "confirm" : "info"}
        onClose={resetError}
        confirmText="Sí, recuperar"
        cancelText={failedAttempts >= 2 ? "No, intentar de nuevo" : "Aceptar"}
        onConfirm={handleResetPassword}
      />
    </KeyboardAvoidingView>
  );
}
