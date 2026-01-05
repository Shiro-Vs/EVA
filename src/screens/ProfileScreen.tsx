import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { colors } from "../theme/colors";
import { auth } from "../config/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  signOut,
} from "firebase/auth";

export default function ProfileScreen({ navigation }: any) {
  const user = auth.currentUser;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || "Usuario");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState(""); // Solo para cambiarla

  useEffect(() => {
    if (user) {
      setName(user.displayName || "Usuario");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      // 1. Actualizar Nombre
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      // 2. Actualizar Email (OJO: Requiere login reciente)
      if (email !== user.email && email !== "") {
        await updateEmail(user, email);
      }

      // 3. Actualizar Password (OJO: Requiere login reciente)
      if (password !== "") {
        await updatePassword(user, password);
      }

      Alert.alert("Éxito", "Perfil actualizado correctamente");
      setIsEditing(false);
      setPassword(""); // Limpiar password
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "No se pudo actualizar: " + error.message);
      // Si pide re-login, podrías redirigir al Login
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Seguridad",
          "Por seguridad, inicia sesión nuevamente para cambiar datos sensibles."
        );
        handleLogout();
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header con botón Editar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          <Ionicons
            name={isEditing ? "checkmark" : "pencil"}
            size={24}
            color={isEditing ? colors.success : colors.primary}
          />
          <Text
            style={[
              styles.editText,
              { color: isEditing ? colors.success : colors.primary },
            ]}
          >
            {isEditing ? "Guardar" : "Editar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sección Superior: Foto y Nombre */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                user?.photoURL ||
                `https://ui-avatars.com/api/?name=${name}&background=00E0FF&color=000`,
            }}
            style={styles.avatar}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="#000" />
          </View>
        </View>

        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Nombre"
            placeholderTextColor={colors.textSecondary}
          />
        ) : (
          <Text style={styles.name}>{name}</Text>
        )}
      </View>

      {/* Sección Inferior: Datos detallados */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Información Personal</Text>

        <View style={styles.infoItem}>
          <Text style={styles.label}>Correo Electrónico</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.value}>{email}</Text>
          )}
        </View>

        {isEditing && (
          <View style={styles.infoItem}>
            <Text style={styles.label}>Nueva Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Deja vacío para no cambiar"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
          </View>
        )}

        {/* Otros datos futuros */}
        <View style={styles.infoItem}>
          <Text style={styles.label}>ID de Usuario</Text>
          <Text style={styles.valueId}>{user?.uid}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 50, // Espacio para StatusBar
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editText: {
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  nameInput: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    minWidth: 200,
    textAlign: "center",
  },
  infoSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 20,
  },
  label: {
    color: colors.primary,
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: colors.text,
    fontSize: 18,
  },
  valueId: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  input: {
    color: colors.text,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 4,
  },
  logoutButton: {
    marginTop: "auto",
    borderWidth: 1,
    borderColor: colors.secondary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: colors.secondary,
    fontWeight: "bold",
    fontSize: 16,
  },
});
