import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import { colors } from "../../../theme/colors";
import { Ionicons } from "@expo/vector-icons";

interface AdvancePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    selectedMonths: any[],
    mode: "pay" | "charge",
    paymentDate: Date
  ) => void;
  debts: any[];
  monthlyFee: number;
}

export const AdvancePaymentModal = ({
  visible,
  onClose,
  onConfirm,
  debts,
  monthlyFee,
}: AdvancePaymentModalProps) => {
  const [selectedMonths, setSelectedMonths] = useState<any[]>([]);
  const [generatedMonths, setGeneratedMonths] = useState<any[]>([]);
  const [mode, setMode] = useState<"pay" | "charge">("pay");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Manual Date Input State
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  React.useEffect(() => {
    if (visible) {
      setMode("pay");

      const now = new Date();
      setDay(now.getDate().toString());
      setMonth((now.getMonth() + 1).toString());
      setYear(now.getFullYear().toString());

      const pendingDebts = debts.filter((d) => d.status === "pending");
      if (pendingDebts.length > 0) {
        const parts = pendingDebts[0].month.split(" ");
        const y = parseInt(parts[parts.length - 1]);
        if (!isNaN(y)) setCurrentYear(y);
      } else {
        setCurrentYear(new Date().getFullYear());
      }
    }
  }, [visible]);

  React.useEffect(() => {
    if (visible) {
      generateMonthList();
    }
  }, [visible, debts, currentYear]);

  const generateMonthList = () => {
    const monthsEs = [
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

    const pendingDebts = debts.filter((d) => d.status === "pending");
    const list = [];

    for (let i = 0; i < 12; i++) {
      const mName = monthsEs[i];
      const label = `${mName} ${currentYear}`;
      const iterDate = new Date(currentYear, i, 1);

      const existingDebt = pendingDebts.find(
        (d) =>
          d.month.replace(" de ", " ").toLowerCase() === label.toLowerCase()
      );

      const isPaid = debts.some(
        (d) =>
          d.month.replace(" de ", " ").toLowerCase() === label.toLowerCase() &&
          d.status === "paid"
      );

      list.push({
        label: label,
        date: iterDate,
        status: isPaid ? "paid" : existingDebt ? "pending" : "future",
        debtId: existingDebt ? existingDebt.id : null,
        amount: monthlyFee,
      });
    }

    setGeneratedMonths(list);
  };

  const toggleMonth = (month: any) => {
    if (month.status === "paid") return;
    if (mode === "charge" && month.status === "pending") return;

    const isSelected = selectedMonths.some((m) => m.label === month.label);
    if (isSelected) {
      setSelectedMonths(selectedMonths.filter((m) => m.label !== month.label));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const handleConfirm = () => {
    const d = parseInt(day);
    const m = parseInt(month) - 1;
    const y = parseInt(year);

    let validDate = new Date();
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      validDate = new Date(y, m, d);
    }

    onConfirm(selectedMonths, mode, validDate);
  };

  const changeYear = (delta: number) => {
    setCurrentYear((prev) => prev + delta);
  };

  const activeColor = mode === "pay" ? colors.primary : "#FF8C00";
  const buttonLabel = mode === "pay" ? "Confirmar Pago" : "Generar Deuda";
  const totalAmount = selectedMonths.length * monthlyFee;

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
              <Text style={styles.title}>Pagar Servicio</Text>

              {/* Mode Toggle */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    mode === "pay" && {
                      backgroundColor: "rgba(62, 210, 255, 0.2)",
                    },
                  ]}
                  onPress={() => {
                    setMode("pay");
                    setSelectedMonths([]);
                  }}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      mode === "pay" && { color: colors.primary },
                    ]}
                  >
                    Pagar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    mode === "charge" && {
                      backgroundColor: "rgba(255, 140, 0, 0.2)",
                    },
                  ]}
                  onPress={() => {
                    setMode("charge");
                    setSelectedMonths([]);
                  }}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      mode === "charge" && { color: "#FF8C00" },
                    ]}
                  >
                    Cobrar
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Payment Date Input (ONLY IN PAY MODE) */}
              {mode === "pay" && (
                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>Fecha de Pago:</Text>
                  <View style={styles.dateInputs}>
                    <TextInput
                      style={styles.dateInput}
                      value={day}
                      onChangeText={setDay}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="D"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <Text style={styles.dateSlash}>/</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={month}
                      onChangeText={setMonth}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="M"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <Text style={styles.dateSlash}>/</Text>
                    <TextInput
                      style={[styles.dateInput, { width: 50 }]}
                      value={year}
                      onChangeText={setYear}
                      keyboardType="numeric"
                      maxLength={4}
                      placeholder="Y"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>
              )}

              {/* Year Selector */}
              <View style={styles.yearContainer}>
                <TouchableOpacity
                  onPress={() => changeYear(-1)}
                  style={styles.yearButton}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                <Text style={styles.yearLabel}>{currentYear}</Text>
                <TouchableOpacity
                  onPress={() => changeYear(1)}
                  style={styles.yearButton}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>Selecciona los meses:</Text>

              <View style={styles.gridContainer}>
                <FlatList
                  data={generatedMonths}
                  keyExtractor={(item) => item.label}
                  numColumns={4}
                  columnWrapperStyle={styles.columnWrapper}
                  renderItem={({ item }) => {
                    const isSelected = selectedMonths.some(
                      (m) => m.label === item.label
                    );
                    const isPending = item.status === "pending";
                    const isPaid = item.status === "paid";
                    const isDisabled =
                      isPaid || (mode === "charge" && isPending);

                    return (
                      <TouchableOpacity
                        style={[
                          styles.gridItem,
                          isPending && styles.gridItemPending,
                          isPaid && styles.gridItemPaid,
                          isDisabled && { opacity: 0.5 },
                          isSelected && {
                            backgroundColor: activeColor,
                            borderColor: activeColor,
                            shadowColor: activeColor,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.5,
                            shadowRadius: 4,
                            elevation: 3,
                          },
                        ]}
                        onPress={() => toggleMonth(item)}
                        disabled={isDisabled}
                      >
                        <Text
                          style={[
                            styles.monthText,
                            isSelected && styles.monthTextSelected,
                            isPending && !isSelected && styles.monthTextPending,
                            isPaid && styles.monthTextPaid,
                          ]}
                        >
                          {item.label
                            .split(" ")[0]
                            .substring(0, 3)
                            .toUpperCase()}
                        </Text>

                        {isPending && !isSelected && (
                          <View style={styles.pendingDot} />
                        )}
                        {isPaid && (
                          <Ionicons
                            name="checkmark-circle"
                            size={12}
                            color={colors.success}
                            style={styles.checkIcon}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  style={{ maxHeight: 200 }}
                />
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={[styles.totalAmount, { color: activeColor }]}>
                  S/ {totalAmount.toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleConfirm}
                style={[
                  styles.button,
                  { backgroundColor: activeColor, shadowColor: activeColor },
                  selectedMonths.length === 0 && { opacity: 0.5 },
                ]}
                disabled={selectedMonths.length === 0}
              >
                <Text style={styles.buttonText}>{buttonLabel}</Text>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleText: {
    color: colors.textSecondary,
    fontWeight: "bold",
    fontSize: 13,
  },
  yearContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    gap: 15,
  },
  yearButton: {
    padding: 5,
  },
  yearLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  title: {
    fontSize: 18,
    color: colors.text,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  gridContainer: {
    marginBottom: 16,
    height: 200, // Adjusted
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 8,
  },
  gridItem: {
    width: "23%",
    aspectRatio: 1.1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  gridItemPending: {
    borderColor: colors.error,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
  },
  gridItemPaid: {
    opacity: 0.5,
    backgroundColor: "rgba(0, 200, 83, 0.1)",
  },
  monthText: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.textSecondary,
  },
  monthTextSelected: {
    color: "#000",
  },
  monthTextPending: {
    color: colors.error,
  },
  monthTextPaid: {
    color: colors.success,
  },
  pendingDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.error,
  },
  checkIcon: {
    position: "absolute",
    top: 3,
    right: 3,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelButton: {
    padding: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  // Date Input Styles
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 8,
    borderRadius: 10,
  },
  dateLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginRight: 10,
  },
  dateInputs: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateInput: {
    backgroundColor: colors.background,
    color: colors.primary,
    fontWeight: "bold",
    textAlign: "center",
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 5,
    minWidth: 30,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateSlash: {
    color: colors.textSecondary,
    marginHorizontal: 5,
    fontWeight: "bold",
  },
});
