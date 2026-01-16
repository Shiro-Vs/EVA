import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { colors } from "../../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface DebtBreakdown {
  service: string;
  amount: number;
  month: string;
}

interface Debtor {
  name: string;
  total: number;
  breakdown: DebtBreakdown[];
}

interface Props {
  debts?: Debtor[];
}

export const PendingDebtsWidget: React.FC<Props> = ({ debts }) => {
  // DEBUGGING: Remove this later
  if (!debts || debts.length === 0) {
    // return <Text style={{marginLeft: 20, color: colors.textSecondary}}>No hay deudas pendientes (Debug)</Text>;
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cuentas por Cobrar 💸</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {debts.map((debtor, index) => (
          <LinearGradient
            key={index}
            colors={["#FFEBEE", "#FFCDD2"]} // Red gradient for debts
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.icon, { backgroundColor: "#EF9A9A" }]}>
                <Text style={styles.initial}>
                  {debtor.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {debtor.name}
              </Text>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total</Text>
              <Text style={styles.amount}>S/ {debtor.total.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.breakdownContainer}>
              {debtor.breakdown.slice(0, 2).map((item, idx) => (
                <Text key={idx} style={styles.breakdownText} numberOfLines={1}>
                  • {item.service} ({item.month}): S/ {item.amount.toFixed(0)}
                </Text>
              ))}
              {debtor.breakdown.length > 2 && (
                <Text style={styles.moreText}>
                  +{debtor.breakdown.length - 2} más...
                </Text>
              )}
            </View>
          </LinearGradient>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginLeft: 20,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: 180,
    padding: 16,
    borderRadius: 20,
    minHeight: 160,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  initial: {
    color: "#C62828",
    fontWeight: "bold",
    fontSize: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#B71C1C",
    flex: 1,
  },
  amountContainer: {
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 12,
    color: "#B71C1C",
    opacity: 0.8,
  },
  amount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#C62828",
  },
  divider: {
    height: 1,
    backgroundColor: "#B71C1C",
    opacity: 0.1,
    marginVertical: 8,
  },
  breakdownContainer: {
    gap: 4,
  },
  breakdownText: {
    fontSize: 11,
    color: "#B71C1C",
    fontWeight: "500",
  },
  moreText: {
    fontSize: 10,
    color: "#B71C1C",
    fontStyle: "italic",
    marginTop: 2,
  },
});
