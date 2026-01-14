import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { createUserRecord } from "../../services/userService";

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

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleRegister,
    navigation, // exposed if needed
  };
};
