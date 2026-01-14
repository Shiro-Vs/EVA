import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { colors } from "../../../theme/colors";
import { CustomCalendarPicker } from "../../common/CustomCalendarPicker";

interface PaymentConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  monthLabel: string;
  amount: number;
}

export const PaymentConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  monthLabel,
  amount,
}: PaymentConfirmationModalProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (visible) {
      setSelectedDate(new Date());
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(selectedDate);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <Text style={styles.title}>Confirmar Pago</Text>
              <Text style={styles.subtitle}>
                {monthLabel} -{" "}
                <Text style={{ color: colors.success }}>
                  S/ {amount.toFixed(2)}
                </Text>
              </Text>

              <CustomCalendarPicker
                initialDate={selectedDate}
                onDateChange={setSelectedDate}
              />

              <View style={styles.selectedDisplay}>
                <Text style={styles.selectedLabel}>Fecha seleccionada:</Text>
                <Text style={styles.selectedValue}>
                  {selectedDate.toLocaleDateString()}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleConfirm}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmText}>Confirmar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "90%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  selectedDisplay: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 8,
    borderRadius: 10,
  },
  selectedLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  selectedValue: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  confirmText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: { padding: 10 },
  cancelText: { color: colors.textSecondary },
});
