import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";

interface Props {
  balance: number;
  income: number;
  expense: number;
}

export const BalanceCard: React.FC<Props> = ({ balance, income, expense }) => {
  return (
    <LinearGradient
      colors={["#1A1A2E", "#16213E"]} // Dark blue/purple gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View>
        <Text style={styles.label}>Balance Actual</Text>
        <Text style={styles.balance}>S/ {balance.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        {/* Income */}
        <View style={styles.metric}>
          <View
            style={[styles.icon, { backgroundColor: "rgba(0, 255, 148, 0.1)" }]}
          >
            <Ionicons name="arrow-up" size={16} color={colors.success} />
          </View>
          <View>
            <Text style={styles.metricLabel}>Ingresos (Mes)</Text>
            <Text style={[styles.metricValue, { color: colors.success }]}>
              + S/ {income.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Expense */}
        <View style={styles.metric}>
          <View
            style={[styles.icon, { backgroundColor: "rgba(255, 68, 68, 0.1)" }]}
          >
            <Ionicons name="arrow-down" size={16} color={colors.error} />
          </View>
          <View>
            <Text style={styles.metricLabel}>Gastos (Mes)</Text>
            <Text style={[styles.metricValue, { color: colors.error }]}>
              - S/ {expense.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  label: {
    color: "#A0A0A0",
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  balance: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  metricLabel: {
    color: "#A0A0A0",
    fontSize: 12,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
