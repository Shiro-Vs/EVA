import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { colors } from "../../theme/colors";
import { auth } from "../../config/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";

// Modals
import { EditProfileModal } from "./components/EditProfileModal";
import { SuggestionsModal } from "./components/SuggestionsModal";
import { DeleteAccountModal } from "./components/DeleteAccountModal";
import { CustomAlertModal } from "../../components/common/CustomAlertModal";
import { ImageViewModal } from "./components/ImageViewModal";

export default function ProfileScreen({ navigation }: any) {
  const user = auth.currentUser;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

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
        </View>

        {/* Datos ID */}
        <View style={styles.infoSection}>
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

        {/* Acciones */}
        <View style={styles.actionSection}>
          {/* Sugerencias */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowSuggestionsModal(true)}
          >
            <Ionicons name="bulb-outline" size={24} color="#FBC02D" />
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
});
