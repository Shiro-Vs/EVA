import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithCredential,
  GoogleAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { createUserRecord, getUserData } from "../../services/userService";
import { Alert } from "react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

export const useRegister = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Custom Alert Modal State
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const closeErrorModal = () => {
    setErrorModalVisible(false);
    setErrorTitle("");
    setErrorMessage("");
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(pass)) {
      return "La contraseña debe tener al menos un carácter especial (!@#$...)";
    }
    return null;
  };

  const showError = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleRegister = async () => {
    if (email === "" || password === "" || name === "") {
      showError("Campos incompletos", "Por favor completa todos los campos");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      showError("Contraseña insegura", passwordError);
      return;
    }

    setLoading(true);
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Actualizar el nombre del perfil (Auth)
      await updateProfile(user, {
        displayName: name,
      });

      // 3. Crear registro en Base de Datos (Firestore)
      await createUserRecord(user, name);

      // 4. Enviar correo de verificación
      await sendEmailVerification(user);
      Alert.alert(
        "Cuenta Creada",
        "Se ha enviado un correo de verificación a tu email.",
        [{ text: "OK", onPress: () => navigation.replace("Home") }]
      );

      console.log("Usuario registrado, guardado y correo enviado:", user.email);
      // navigación movida al Alert para asegurar que el usuario lea el mensaje
    } catch (error: any) {
      console.error(error);
      let msg = error.message;
      if (error.code === "auth/email-already-in-use") {
        msg = "El correo ya está registrado";
      }
      showError("Error de registro", msg);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!GoogleSignin) {
      Alert.alert(
        "No Soportado",
        "Google Login requiere una 'Development Build'. No funciona en Expo Go."
      );
      return;
    }

    setLoading(true);
    try {
      // Intentar verificar disponibilidad, si falla (Expo Go) irá al catch
      const hasPlayServices = await GoogleSignin.hasPlayServices().catch(
        () => false
      );

      if (hasPlayServices || !hasPlayServices) {
        const userInfo = await GoogleSignin.signIn();
        const { idToken } = userInfo.data || {};
        if (!idToken) throw new Error("No ID Token found");

        const googleCredential = GoogleAuthProvider.credential(idToken);
        // SignInWithCredential creates the user if doesn't exist
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
            "Google Login NO funciona en Expo Go. Necesitas generar una Development Build."
          );
        } else {
          Alert.alert("Error", "No se pudo iniciar con Google: " + errMsg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleRegister,
    signInWithGoogle,
    navigation,
    passwordVisible,
    togglePasswordVisibility,
    errorModalVisible,
    errorTitle,
    errorMessage,
    closeErrorModal,
  };
};
