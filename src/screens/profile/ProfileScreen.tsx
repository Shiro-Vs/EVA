import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { colors } from "../../theme/colors";
import { auth } from "../../config/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import * as LocalAuthentication from "expo-local-authentication";

// Modals
import { EditProfileModal } from "./components/EditProfileModal";
import { SuggestionsModal } from "./components/SuggestionsModal";
import { DeleteAccountModal } from "./components/DeleteAccountModal";
import { CustomAlertModal } from "../../components/common/CustomAlertModal";
import { ImageViewModal } from "./components/ImageViewModal";
import { UserLevelModal } from "./components/UserLevelModal";

export default function ProfileScreen({ navigation }: any) {
  const user = auth.currentUser;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Security State
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "No disponible",
          "Tu dispositivo no soporta biometría o no está configurada."
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirma tu identidad para activar",
      });

      if (result.success) {
        setIsBiometricEnabled(true);
        // Here you would save to AsyncStorage
      }
    } else {
      setIsBiometricEnabled(false);
    }
  };

  // Format Member Since Date
  const memberSince = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
      })
    : "Reciente";

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header con botón Editar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Ionicons name="pencil" size={16} color={colors.primary} />
            <Text style={[styles.editText, { color: colors.primary }]}>
              Editar Perfil
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sección Superior: Foto y Nombre */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowImageModal(true)}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri:
                  user?.photoURL ||
                  `https://ui-avatars.com/api/?name=${
                    user?.displayName || "User"
                  }&background=00E0FF&color=000`,
              }}
              style={styles.avatar}
            />
            {/* Zoom Icon Hint */}
            <View style={styles.zoomIndicator}>
              <Ionicons name="expand" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.displayName || "Usuario"}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          {/* User Stats / Chip */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.statText}>Miembro desde {memberSince}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowLevelModal(true)}
              style={[
                styles.statChip,
                { borderColor: "#CD7F32", backgroundColor: "#FFF8E1" },
              ]}
            >
              <Ionicons name="trophy" size={14} color="#CD7F32" />
              <Text
                style={[
                  styles.statText,
                  { color: "#CD7F32", fontWeight: "bold" },
                ]}
              >
                Nivel Bronce
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Datos ID */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="finger-print" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>ID de Usuario</Text>
              <Text style={styles.valueId}>{user?.uid}</Text>
            </View>
          </View>
        </View>

        {/* Acciones & Seguridad */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Seguridad y Soporte</Text>

          {/* Biometría */}
          <View style={styles.actionButton}>
            <View style={[styles.iconBox, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="scan-outline" size={22} color="#2E7D32" />
            </View>
            <Text style={styles.actionText}>Ingreso Biométrico</Text>
            <Switch
              value={isBiometricEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ false: "#767577", true: colors.primary }}
              thumbColor={isBiometricEnabled ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Sugerencias */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowSuggestionsModal(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: "#FFF9C4" }]}>
              <Ionicons name="bulb-outline" size={22} color="#FBC02D" />
            </View>
            <Text style={styles.actionText}>Enviar Sugerencia</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutConfirm(true)}
        >
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setShowDeleteModal(true)}
        >
          <Text style={styles.deleteButtonText}>Eliminar Cuenta</Text>
        </TouchableOpacity>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Versión 1.0.2</Text>
          <Text style={styles.developerMessage}>
            "Construí EVA para ayudarte a tomar el control de tus finanzas y
            mejorar tu futuro." ❤️
          </Text>
        </View>
      </ScrollView>

      {/* MODALS */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentUser={{
          displayName: user?.displayName || "",
          email: user?.email || "",
          photoURL: user?.photoURL || null,
        }}
      />

      <SuggestionsModal
        visible={showSuggestionsModal}
        onClose={() => setShowSuggestionsModal(false)}
      />

      <UserLevelModal
        visible={showLevelModal}
        onClose={() => setShowLevelModal(false)}
      />

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onLogout={handleLogout}
      />

      <CustomAlertModal
        visible={showLogoutConfirm}
        title="¿Cerrar Sesión?"
        message="¿Estás seguro que deseas salir de tu cuenta?"
        variant="destructive"
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      <ImageViewModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUri={
          user?.photoURL ||
          `https://ui-avatars.com/api/?name=${
            user?.displayName || "User"
          }&background=00E0FF&color=000`
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 50,
    paddingBottom: 100, // Added extra padding for Navbar
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  editText: {
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 14,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  zoomIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  valueId: {
    color: colors.text,
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  actionSection: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  logoutText: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "500",
  },
  // New Styles
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
    marginTop: 10,
  },
  versionText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legalText: {
    color: colors.primary,
    fontSize: 12,
  },
  developerMessage: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
    paddingHorizontal: 40,
  },
});
