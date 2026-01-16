import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../../theme/colors";
import { CustomCalendarPicker } from "../../common/CustomCalendarPicker";
import { Account } from "../../../services/accountService";
import { Ionicons } from "@expo/vector-icons";

interface PaymentConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    date: Date,
    accountId?: string,
    amount?: number,
    note?: string
  ) => void;
  monthLabel: string;
  amount: number;
  availableAccounts: Account[];
  initialAccountId?: string;
  loading?: boolean;
}

export const PaymentConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  monthLabel,
  amount,
  availableAccounts = [],
  initialAccountId,
  loading = false,
}: PaymentConfirmationModalProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >(initialAccountId);
  const [editedAmount, setEditedAmount] = useState(amount.toString());
  const [note, setNote] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedDate(new Date());
      setEditedAmount(amount.toString());
      setNote("");
      setShowDatePicker(false);
      // Smart default
      if (initialAccountId) {
        setSelectedAccountId(initialAccountId);
      } else if (availableAccounts.length > 0) {
        setSelectedAccountId(availableAccounts[0].id);
      }
    }
  }, [visible, amount, initialAccountId, availableAccounts]);

  const handleConfirm = () => {
    const finalAmount = parseFloat(editedAmount);
    if (isNaN(finalAmount) || finalAmount <= 0) return;
    onConfirm(selectedDate, selectedAccountId, finalAmount, note);
  };

  // If selecting date, show calendar view
  if (showDatePicker) {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={() => setShowDatePicker(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.content}>
                <Text style={styles.title}>Seleccionar Fecha</Text>
                <CustomCalendarPicker
                  initialDate={selectedDate}
                  onDateChange={(d) => {
                    setSelectedDate(d);
                    setShowDatePicker(false);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

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
              <Text style={styles.subtitle}>{monthLabel}</Text>

              {/* Amount Input */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginBottom: 5,
                  }}
                >
                  Monto a Pagar
                </Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: colors.success,
                    }}
                  >
                    S/
                  </Text>
                  <TextInput
                    value={editedAmount}
                    onChangeText={setEditedAmount}
                    keyboardType="numeric"
                    style={{
                      fontSize: 32,
                      fontWeight: "bold",
                      color: colors.success,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      minWidth: 100,
                      textAlign: "center",
                    }}
                  />
                </View>
              </View>

              {/* Note Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  placeholder="Nota (Opcional)"
                  placeholderTextColor={colors.textSecondary}
                  value={note}
                  onChangeText={setNote}
                  style={styles.textInput}
                />
              </View>

              {/* Date Button (Full Width) */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { marginBottom: 15, width: "100%" },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.iconBox}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.text}
                  />
                </View>
                <View>
                  <Text style={styles.labelSmall}>Fecha del Pago</Text>
                  <Text style={styles.valueText}>
                    {selectedDate.toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={colors.textSecondary}
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>

              {/* Account Selector (Horizontal Scroll) */}
              <View style={{ width: "100%", marginBottom: 20 }}>
                <Text style={[styles.sectionLabel, { marginBottom: 10 }]}>
                  Método de Pago
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10 }}
                >
                  {availableAccounts.map((acc) => {
                    const isSelected = selectedAccountId === acc.id;
                    return (
                      <TouchableOpacity
                        key={acc.id}
                        onPress={() => setSelectedAccountId(acc.id)}
                        style={[
                          styles.accountBadge,
                          isSelected && {
                            backgroundColor:
                              (acc.color || colors.primary) + "20",
                            borderColor: acc.color || colors.primary,
                          },
                        ]}
                      >
                        <Ionicons
                          name={acc.icon as any}
                          size={16}
                          color={
                            isSelected
                              ? acc.color || colors.primary
                              : colors.textSecondary
                          }
                          style={{ marginRight: 6 }}
                        />
                        <View>
                          <Text
                            style={[
                              styles.accountText,
                              isSelected && {
                                color: acc.color || colors.primary,
                                fontWeight: "bold",
                              },
                            ]}
                          >
                            {acc.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <TouchableOpacity
                onPress={handleConfirm}
                style={[
                  styles.confirmButton,
                  (!selectedAccountId || loading) && { opacity: 0.5 },
                ]}
                disabled={!selectedAccountId || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.confirmText}>Confirmar Pago</Text>
                )}
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
    marginBottom: 20,
  },
  sectionLabel: {
    alignSelf: "flex-start",
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    marginTop: 5,
    fontWeight: "600",
  },
  accountContainer: {
    flexDirection: "row",
    marginBottom: 15,
    width: "100%",
    height: 40,
  },
  accountBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    minWidth: 90,
    justifyContent: "center",
  },
  accountText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedDisplay: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 8,
    borderRadius: 10,
    marginTop: 10,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    width: "100%",
    padding: 8, // Reduced padding
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13, // Slightly smaller font
  },
  actionButton: {
    width: "100%", // Explicit width
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  labelSmall: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  valueText: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.text,
  },
  compactBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
    backgroundColor: colors.background,
  },
  compactBadgeActive: {
    backgroundColor: colors.primary, // Will be overridden
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
  cancelButtonText: { color: colors.textSecondary }, // Just in case
});
