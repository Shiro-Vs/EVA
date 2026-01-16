import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { colors } from "../../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { User, sendEmailVerification } from "firebase/auth";

interface Props {
  visible: boolean;
  onClose: () => void;
  user: User | null;
  onContinueAnyway: () => void;
}

export const EmailVerificationModal = ({
  visible,
  onClose,
  user,
  onContinueAnyway,
}: Props) => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    if (!user) return;
    setSending(true);
    try {
      await sendEmailVerification(user);
      setSent(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="mail-unread-outline"
              size={40}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>Verifica tu Correo</Text>

          <Text style={styles.message}>
            Hola{" "}
            <Text style={styles.bold}>{user?.displayName || "Usuario"}</Text>,
            notamos que aún no has verificado tu dirección de correo:
          </Text>

          <Text style={styles.email}>{user?.email}</Text>

          <Text style={styles.subMessage}>
            Es importante para recuperar tu cuenta si olvidas la contraseña.
          </Text>

          {sent ? (
            <View style={styles.successContainer}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.successText}>
                ¡Correo enviado! Revisa tu bandeja.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.resendButton, sending && styles.disabledButton]}
              onPress={handleResend}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.resendButtonText}>
                  Reenviar Correo de Verificación
                </Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onContinueAnyway}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              Continuar de todas formas
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "bold",
    color: colors.text,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 12,
  },
  subMessage: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  resendButton: {
    backgroundColor: colors.primary,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  resendButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.7,
  },
  secondaryButton: {
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontWeight: "500",
    fontSize: 14,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success + "20",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  successText: {
    color: colors.success,
    fontWeight: "600",
    fontSize: 14,
  },
});
