import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { colors } from "../../../theme/colors";

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface Props {
  data: CategoryData[];
  totalExpense: number;
}

export const ExpenseDonutChart: React.FC<Props> = ({ data, totalExpense }) => {
  const { width } = Dimensions.get("window");

  // Transform data for PieChart
  const pieData = data.map((item) => ({
    value: item.amount,
    color: item.color,
    text: `${Math.round(item.percentage)}%`,
    textColor: "#fff", // or calculate contrast
    textSize: 10,
  }));

  const renderLegend = () => {
    return (
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.legendAmount}>
              {Math.round(item.percentage)}%
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (totalExpense === 0 || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Distribución de Gastos</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sin gastos registrados este mes.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Distribución de Gastos</Text>
      <View style={styles.chartWrapper}>
        <PieChart
          data={pieData}
          donut
          showGradient
          sectionAutoFocus
          radius={90}
          innerRadius={60}
          innerCircleColor={colors.surface}
          centerLabelComponent={() => {
            return (
              <View style={styles.centerLabel}>
                <Text style={styles.centerLabelTitle}>Total</Text>
                <Text style={styles.centerLabelAmount}>
                  S/ {totalExpense.toFixed(0)}
                </Text>
              </View>
            );
          }}
        />
        {renderLegend()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  chartWrapper: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  centerLabel: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerLabelTitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  centerLabelAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  legendContainer: {
    marginTop: 24,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: "40%",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  legendAmount: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text,
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textSecondary,
    fontStyle: "italic",
  },
});
