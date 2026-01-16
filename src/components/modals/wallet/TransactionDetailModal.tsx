import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { Transaction } from "../../../services/transactionService";

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const isIncome = transaction.type === "income";
  const color = isIncome ? colors.success : colors.secondary; // Expense uses secondary or specific color
  const icon = isIncome ? "arrow-up" : "arrow-down";

  // Format Date
  const dateObj = new Date(transaction.date);
  const dateStr = dateObj.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = dateObj.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide" // Faster feel than fade
      statusBarTranslucent={true} // Covers status bar
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <TouchableOpacity activeOpacity={1} style={{ width: "100%" }}>
            {/* Header: Amount & Icon */}
            <View style={styles.header}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isIncome
                      ? "rgba(76, 175, 80, 0.1)"
                      : "rgba(255, 68, 68, 0.1)",
                  },
                ]}
              >
                <Ionicons name={icon} size={32} color={color} />
              </View>
              <Text style={[styles.amount, { color }]}>
                {isIncome ? "+" : "-"} S/ {transaction.amount.toFixed(2)}
              </Text>
              <Text style={styles.typeLabel}>
                {isIncome ? "Ingreso" : "Egreso"}
              </Text>
            </View>

            <ScrollView style={styles.detailsContainer}>
              {/* Account */}
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="wallet-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.label}>Cuenta</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {/* Use account icon if available, or generic */}
                    <Text style={styles.value}>{transaction.accountName}</Text>
                  </View>
                </View>
              </View>

              {/* Category */}
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="grid-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.label}>Categoría</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {transaction.categoryIcon && (
                      <Ionicons
                        name={transaction.categoryIcon as any}
                        size={16}
                        color={transaction.categoryColor || colors.text}
                      />
                    )}
                    <Text style={styles.value}>
                      {transaction.categoryName || "Sin Categoría"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Service - if available */}
              {transaction.serviceName && (
                <View style={styles.row}>
                  <View style={styles.iconBox}>
                    <Ionicons
                      name="tv-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.label}>Servicio</Text>
                    <Text style={styles.value}>{transaction.serviceName}</Text>
                  </View>
                </View>
              )}

              {/* Subscriber - if available */}
              {transaction.subscriberName && (
                <View style={styles.row}>
                  <View style={styles.iconBox}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.label}>Suscriptor</Text>
                    <Text style={styles.value}>
                      {transaction.subscriberName}
                    </Text>
                  </View>
                </View>
              )}

              {/* Date */}
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.label}>Fecha y Hora</Text>
                  <Text style={styles.value}>{dateStr}</Text>
                  <Text style={styles.subValue}>{timeStr}</Text>
                </View>
              </View>

              {/* Description / Note */}
              <View style={[styles.row, { borderBottomWidth: 0 }]}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.label}>Nota</Text>
                  <Text style={styles.note}>{transaction.description}</Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    padding: 20,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    paddingBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  amount: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailsContainer: {
    width: "100%",
    maxHeight: 300,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  iconBox: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  infoBox: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  subValue: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  note: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
});
