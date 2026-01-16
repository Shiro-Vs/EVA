import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
// import {
//   signInWithEmailAndPassword,
//   GoogleAuthProvider,
//   signInWithCredential,
//   sendEmailVerification,
//   User
// } from "firebase/auth";
import {
  signInWithEmailAndPassword,
  User,
  sendEmailVerification,
} from "firebase/auth";

// import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

import { auth } from "../../config/firebaseConfig";
import { Alert } from "react-native";
import { createUserRecord, getUserData } from "../../services/userService";

export const useLogin = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   try {
  //     GoogleSignin.configure({
  //       // Reemplaza con tu Web Client ID de Firebase Console (Authentication > Google)
  //       webClientId: "1058026439316-cif5s6bh5gnla7ec05co8acchocpeums.apps.googleusercontent.com",
  //     });
  //   } catch (e) {
  //     console.warn("GoogleSignin configure failed (likely Expo Go):", e);
  //   }
  // }, []);

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

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Campos vacíos", "Por favor ingresa correo y contraseña");
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

      if (!userCredential.user.emailVerified) {
        // Trigger Modal instead of Alert
        setVerificationUser(userCredential.user);
        setShowVerificationModal(true);
        // We don't navigate yet, the modal will handle "Continue Anyway"
      } else {
        navigation.replace("Home");
      }
    } catch (error: any) {
      console.error(error);
      let msg = "Error al iniciar sesión";
      if (error.code === "auth/invalid-credential")
        msg = "Credenciales incorrectas";
      if (error.code === "auth/user-not-found") msg = "Usuario no encontrado";
      if (error.code === "auth/wrong-password") msg = "Contraseña incorrecta";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    Alert.alert(
      "Aviso",
      "Google Sign-In deshabilitado en Expo Go. Usa Development Build para probarlo."
    );
    /*
    // Código comentado para evitar crashels en Expo Go
    if (!GoogleSignin) {
      Alert.alert("No Soportado", "Google Login requiere una 'Development Build'. No funciona en Expo Go.");
      return;
    }

    setLoading(true);
    try {
      // Intentar verificar disponibilidad, si falla (Expo Go) irá al catch
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
        // Check for specific Native Module missing error string
        const errMsg = error.message || "";
        if (
          errMsg.includes("RNGoogleSignin") ||
          errMsg.includes("null is not an object")
        ) {
          Alert.alert(
            "Atención",
            "Google Login NO funciona en Expo Go. Necesitas generar una Development Build."
          );
        } else {
          Alert.alert("Error", "No se pudo iniciar con Google: " + errMsg);
        }
      }
    } finally {
      setLoading(false);
    }
    */
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
  };
};
