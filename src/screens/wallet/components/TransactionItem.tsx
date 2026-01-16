import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Transaction } from "../../../services/transactionService";
import { colors } from "../../../theme/colors";
import { parseTransactionMetadata } from "../../../utils/transactionUtils";

interface Props {
  transaction: Transaction;
  onPress: (t: Transaction) => void;
}

export const TransactionItem: React.FC<Props> = ({ transaction, onPress }) => {
  const { title, subtitle } = parseTransactionMetadata(transaction);
  const isIncome = transaction.type === "income";

  // Determinar Icono
  // Si tenemos categoryIcon, usalo. Si no, default.
  const iconName = (transaction.categoryIcon as any) || "card-outline";
  const iconColor = transaction.categoryColor || colors.primary;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(transaction)}
      activeOpacity={0.7}
    >
      {/* Icon Circle */}
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: isIncome
              ? "rgba(0, 255, 148, 0.1)" // colors.success 10%
              : "rgba(255, 68, 68, 0.1)", // colors.error 10%
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={22}
          color={isIncome ? colors.success : colors.secondary}
        />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {/* Amount + Time */}
      <View style={styles.rightContainer}>
        <Text
          style={[
            styles.amount,
            { color: isIncome ? colors.success : colors.text },
          ]}
        >
          {isIncome ? "+" : "-"} S/ {transaction.amount.toFixed(2)}
        </Text>
        <Text style={styles.time}>
          {transaction.date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderRadius: 16,
    // Sombra sutil pero visible en dark mode?
    // En dark mode las sombras no se ven mucho, quizas un bordo sutil?
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rightContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
