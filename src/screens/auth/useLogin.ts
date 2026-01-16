import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  signInWithEmailAndPassword,
  User,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { auth } from "../../config/firebaseConfig";
import { Alert } from "react-native";
import { createUserRecord, getUserData } from "../../services/userService";

export const useLogin = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  useEffect(() => {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId) {
      console.warn(
        "Google Sign-In: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing in .env"
      );
      return;
    }

    try {
      GoogleSignin.configure({
        webClientId: webClientId,
      });
    } catch (e) {
      console.warn("GoogleSignin configure failed:", e);
    }
  }, []);

  // State for verification modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationUser, setVerificationUser] = useState<User | null>(null);

  const checkEmailVerification = async (user: User) => {
    if (!user.emailVerified) {
      Alert.alert(
        "Verificación Requerida",
        "Tu correo electrónico no ha sido verificado. ¿Deseas reenviar el correo?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Reenviar",
            onPress: async () => {
              try {
                await sendEmailVerification(user);
                Alert.alert(
                  "Enviado",
                  "Revisa tu bandeja de entrada (y spam)."
                );
              } catch (e: any) {
                Alert.alert("Error", e.message);
              }
            },
          },
        ]
      );
      // Opcional: Impedir acceso si no está verificado
      // await auth.signOut();
      // return false;
      return true; // Por ahora permitimos acceso, o cámbialo a false si quieres bloqueo estricto
    }
    return true;
  };

  // Error Modal State
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleLogin = async () => {
    if (email === "" || password === "") {
      setErrorMessage("Por favor ingresa correo y contraseña");
      setErrorModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Login exitoso");
      setFailedAttempts(0); // Reset on success

      if (!userCredential.user.emailVerified) {
        setVerificationUser(userCredential.user);
        setShowVerificationModal(true);
      } else {
        navigation.replace("Home");
      }
    } catch (error: any) {
      console.error(error);
      let msg = "Error al iniciar sesión";
      let isPasswordError = false;

      if (error.code === "auth/invalid-credential") {
        msg = "Credenciales incorrectas";
      } else if (error.code === "auth/user-not-found") {
        msg = "Usuario no encontrado";
      } else if (error.code === "auth/wrong-password") {
        msg = "Contraseña incorrecta";
        isPasswordError = true;
      }

      setErrorMessage(msg);
      setErrorModalVisible(true);

      if (isPasswordError) {
        setFailedAttempts((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Intentar verificar disponibilidad
      const hasPlayServices = await GoogleSignin.hasPlayServices().catch(
        () => false
      );

      if (
        hasPlayServices ||
        !hasPlayServices // Try anyway if check problematic
      ) {
        const userInfo = await GoogleSignin.signIn();
        const { idToken } = userInfo.data || {};
        if (!idToken) throw new Error("No ID Token found");

        const googleCredential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(
          auth,
          googleCredential
        );

        // Crear registro en DB si no existe (Usuario nuevo)
        const existingUser = await getUserData(userCredential.user.uid);
        if (!existingUser) {
          await createUserRecord(
            userCredential.user,
            userCredential.user.displayName || "Usuario Google"
          );
        }

        navigation.replace("Home");
      }
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation in progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Google Play Services no disponible");
      } else {
        const errMsg = error.message || "";
        if (
          errMsg.includes("RNGoogleSignin") ||
          errMsg.includes("null is not an object")
        ) {
          Alert.alert(
            "Atención",
            "Google Login requiere una Development Build si la configuración nativa falla."
          );
        } else {
          Alert.alert("Error", "No se pudo iniciar con Google: " + errMsg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => {
    setErrorModalVisible(false);
    setErrorMessage("");
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
    signInWithGoogle,
    navigation,
    // Verification Modal State
    showVerificationModal,
    setShowVerificationModal,
    verificationUser,
    // Error Modal State
    errorModalVisible,
    errorMessage,
    failedAttempts,
    resetError,
    passwordVisible,
    togglePasswordVisibility,
  };
};
