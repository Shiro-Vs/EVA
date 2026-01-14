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
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  cancelButton: { padding: 15 },
  cancelText: { color: colors.textSecondary },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  saveText: { color: "#000", fontWeight: "bold" },
  // New Styles
  infoButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  infoText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
});
