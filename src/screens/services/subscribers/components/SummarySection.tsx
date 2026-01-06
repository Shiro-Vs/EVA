import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles/SubscriberDetailStyles";
import { colors } from "../../../../theme/colors";

interface SummarySectionProps {
  debts: any[];
}

export const SummarySection: React.FC<SummarySectionProps> = ({ debts }) => {
  return (
    <View style={styles.summaryContainer}>
      {/* Card: Deuda Total */}
      <View
        style={[
          styles.summaryCard,
          {
            borderColor:
              debts.filter((d) => d.status === "pending").length > 0
                ? colors.error
                : colors.border,
          },
        ]}
      >
        <Text style={styles.summaryLabel}>Deuda Total</Text>
        <Text style={[styles.summaryValue, { color: colors.error }]}>
          S/{" "}
          {debts
            .filter((d) => d.status === "pending")
            .reduce((a, b) => a + b.amount, 0)
            .toFixed(0)}
        </Text>
        <Text style={styles.summarySub}>
          {debts.filter((d) => d.status === "pending").length} meses
        </Text>
      </View>

      {/* Card: Pagados */}
      <View style={[styles.summaryCard, { borderColor: colors.success }]}>
        <Text style={styles.summaryLabel}>Pagados</Text>
        <Text style={[styles.summaryValue, { color: colors.success }]}>
          {debts.filter((d) => d.status === "paid").length}
        </Text>
        <Text style={styles.summarySub}>meses totales</Text>
      </View>
    </View>
  );
};
