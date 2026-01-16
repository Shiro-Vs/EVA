import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { createUserRecord, getUserData } from "../../services/userService";
import { Alert } from "react-native";
// import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

export const useRegister = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (email === "" || password === "") {
      alert("Por favor completa todos los campos");
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

      console.log("Usuario registrado y guardado en BD:", user.email);
      navigation.replace("Home"); // Navegar al Home
    } catch (error: any) {
      console.error(error);
      alert("Error al registrar: " + error.message);
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
      const hasPlayServices = await GoogleSignin.hasPlayServices().catch(() => false);
      
      if(hasPlayServices || !hasPlayServices){ 
          const userInfo = await GoogleSignin.signIn();
          const { idToken } = userInfo.data || {};
          if (!idToken) throw new Error("No ID Token found");

          const googleCredential = GoogleAuthProvider.credential(idToken);
          // SignInWithCredential creates the user if doesn't exist
          const userCredential = await signInWithCredential(auth, googleCredential);
          
          // Crear registro en DB si no existe (Usuario nuevo)
          const existingUser = await getUserData(userCredential.user.uid);
          if (!existingUser) {
            await createUserRecord(userCredential.user, userCredential.user.displayName || "Usuario Google");
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
         if (errMsg.includes("RNGoogleSignin") || errMsg.includes("null is not an object")) {
            Alert.alert("Atención", "Google Login NO funciona en Expo Go. Necesitas generar una Development Build.");
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
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleRegister,
    signInWithGoogle,
    navigation, // exposed if needed
  };
};
