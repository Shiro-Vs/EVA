import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../../config/firebaseConfig";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";

interface Props {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const DeleteAccountModal = ({ visible, onClose, onLogout }: Props) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const handleDelete = async () => {
    if (!user) return;
    if (password === "") {
      Alert.alert("Requerido", "Ingresa tu contraseña para confirmar.");
      return;
    }

    setLoading(true);
    try {
      // 1. Re-authenticate
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);

      // 2. Delete Firestore Data (Cleanup)
      // Note: A real app should probably use a Cloud Function for recursive delete
      // This is a "best effort" client side delete for key collections.

      const collectionsToDelete = [
        "transactions",
        "services",
        "accounts",
        "categories",
      ];

      for (const colName of collectionsToDelete) {
        const colRef = collection(db, "users", user.uid, colName);
        const snap = await getDocs(colRef);
        const promises = snap.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(promises);
      }

      await deleteDoc(doc(db, "users", user.uid));

      // 3. Delete Auth User
      await deleteUser(user);

      Alert.alert(
        "Cuenta Eliminada",
        "Lamentamos verte partir. Tu cuenta ha sido borrada."
      );
      onLogout(); // Should handle navigation to Login
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "La contraseña es incorrecta.");
      } else {
        Alert.alert("Error", "No se pudo eliminar la cuenta: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="warning" size={24} color="#C62828" />
              </View>
              <Text style={styles.title}>Eliminar Cuenta</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Esta acción es irreversible. Se eliminarán permanentemente todos
              tus datos, suscripciones, historial y configuración.
            </Text>
          </View>

          <Text style={styles.label}>
            Por seguridad, ingresa tu contraseña para confirmar:
          </Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña actual"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.deleteButton, loading && styles.disabledButton]}
            onPress={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View style={styles.btnContent}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.deleteButtonText}>
                  Eliminar Definitivamente
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    backgroundColor: "#FFEBEE",
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  warningBox: {
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EF9A9A",
    marginBottom: 24,
  },
  warningText: {
    color: "#C62828",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
  },
  deleteButton: {
    backgroundColor: "#C62828",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
