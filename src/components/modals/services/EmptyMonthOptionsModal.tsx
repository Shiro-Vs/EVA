import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { colors } from "../../../theme/colors";
import { Ionicons } from "@expo/vector-icons";

interface EmptyMonthOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  monthLabel: string;
  onGenerateDebt: () => void;
  onPayNow: () => void;
}

export const EmptyMonthOptionsModal = ({
  visible,
  onClose,
  monthLabel,
  onGenerateDebt,
  onPayNow,
}: EmptyMonthOptionsModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <Text style={styles.title}>{monthLabel}</Text>
              <Text style={styles.subtitle}>¿Qué acción deseas realizar?</Text>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={onGenerateDebt}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: "rgba(255, 140, 0, 0.1)" },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={24}
                    color="#FF8C00"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>Generar Deuda</Text>
                  <Text style={styles.optionDesc}>Marcar como pendiente</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={onPayNow}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: "rgba(62, 210, 255, 0.1)" },
                  ]}
                >
                  <Ionicons
                    name="cash-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>Pagar Ahora</Text>
                  <Text style={styles.optionDesc}>
                    Registrar pago y entrada
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end", // Bottom sheet style often looks better, but centered is fine too. Let's stick to center for consistency with others.
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
});
