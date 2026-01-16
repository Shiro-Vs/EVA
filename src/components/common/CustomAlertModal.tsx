import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { colors } from "../../theme/colors";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: "info" | "confirm" | "destructive";
  onConfirm?: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const CustomAlertModal = ({
  visible,
  title,
  message,
  variant = "info",
  onConfirm,
  onClose,
  confirmText,
  cancelText,
}: CustomAlertProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View
                style={[
                  styles.modalButtons,
                  variant === "info" && { justifyContent: "center" },
                ]}
              >
                {/* Cancel/OK Button */}
                <TouchableOpacity
                  onPress={onClose}
                  style={
                    variant !== "info" ? styles.cancelButton : styles.infoButton
                  }
                >
                  <Text
                    style={
                      variant !== "info" ? styles.cancelText : styles.infoText
                    }
                  >
                    {variant === "info" ? "Aceptar" : cancelText || "Cancelar"}
                  </Text>
                </TouchableOpacity>

                {/* Confirm Button (Only if not info) */}
                {variant !== "info" && (
                  <TouchableOpacity
                    onPress={onConfirm}
                    style={[
                      styles.saveButton,
                      variant === "destructive" && {
                        backgroundColor: colors.secondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.saveText,
                        variant === "destructive" && { color: "#FFF" },
                      ]}
                    >
                      {variant === "destructive"
                        ? "Eliminar"
                        : confirmText || "Confirmar"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 24,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
  },
  // New Styles
  infoButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary + "15", // Low opacity primary
  },
  infoText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
});
