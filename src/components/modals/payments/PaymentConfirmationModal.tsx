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
import { Ionicons } from "@expo/vector-icons";

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
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    if (visible) {
      const now = new Date();
      setSelectedDate(now);
      setViewDate(now);
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(selectedDate);
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setViewDate(newDate);
  };

  const generateDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ empty: true, key: `pre-${i}` });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, empty: false, key: `day-${i}` });
    }
    return days;
  };

  const dayItems = generateDays();
  const monthsNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

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
              <Text style={styles.title}>Confirmar Pago</Text>
              <Text style={styles.subtitle}>
                {monthLabel} -{" "}
                <Text style={{ color: colors.success }}>
                  S/ {amount.toFixed(2)}
                </Text>
              </Text>

              <View style={styles.calendarContainer}>
                <View style={styles.calHeader}>
                  <TouchableOpacity
                    onPress={() => changeMonth(-1)}
                    style={styles.arrowBtn}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.calTitle}>
                    {monthsNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => changeMonth(1)}
                    style={styles.arrowBtn}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.weekRow}>
                  {["d", "l", "m", "m", "j", "v", "s"].map((d, i) => (
                    <Text key={i} style={styles.weekText}>
                      {d.toUpperCase()}
                    </Text>
                  ))}
                </View>

                <View style={styles.daysGrid}>
                  {dayItems.map((item: any) => {
                    if (item.empty) {
                      return (
                        <View key={item.key} style={styles.dayCellEmpty} />
                      );
                    }
                    const isSelected =
                      item.day === selectedDate.getDate() &&
                      viewDate.getMonth() === selectedDate.getMonth() &&
                      viewDate.getFullYear() === selectedDate.getFullYear();

                    return (
                      <View key={item.key} style={styles.dayCellWrapper}>
                        <TouchableOpacity
                          style={[
                            styles.dayCell,
                            isSelected && styles.dayCellSelected,
                          ]}
                          onPress={() => {
                            const newDate = new Date(viewDate);
                            newDate.setDate(item.day);
                            setSelectedDate(newDate);
                          }}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              isSelected && styles.dayTextSelected,
                            ]}
                          >
                            {item.day}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>

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
  calendarContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
  },
  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  arrowBtn: { padding: 5 },
  calTitle: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  weekText: {
    width: "14%",
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "bold",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCellEmpty: {
    width: "14.28%", // 1/7th
    aspectRatio: 1,
  },
  dayCellWrapper: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCell: {
    width: 32, // Fixed size for perfect circle
    height: 32,
    borderRadius: 16, // Half of width
    justifyContent: "center",
    alignItems: "center",
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    elevation: 3,
  },
  dayText: {
    color: colors.text,
    fontSize: 14,
    textAlign: "center",
    // Remove lineHeight if it conflicts, usually not needed for simple centering in flex
  },
  dayTextSelected: {
    color: "#000",
    fontWeight: "bold",
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
