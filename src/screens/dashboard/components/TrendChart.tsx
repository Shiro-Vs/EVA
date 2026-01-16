import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { colors } from "../../../theme/colors";

interface Props {
  data: { label: string; value: number; type: "income" | "expense" }[];
}

export const TrendChart: React.FC<Props> = ({ data }) => {
  const { width } = Dimensions.get("window");

  // Transform data for Grouped Bar Chart
  // We need to pair Income/Expense for each month
  const groupedData: any[] = [];
  const uniqueLabels = Array.from(new Set(data.map((d) => d.label)));

  uniqueLabels.forEach((label) => {
    const inc =
      data.find((d) => d.label === label && d.type === "income")?.value || 0;
    const exp =
      data.find((d) => d.label === label && d.type === "expense")?.value || 0;

    groupedData.push({
      value: inc,
      label: label,
      spacing: 2,
      labelWidth: 30,
      labelTextStyle: { color: "#757575", fontSize: 10 },
      frontColor: colors.success,
    });
    groupedData.push({
      value: exp,
      frontColor: colors.error,
    });
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Flujo de Caja (6 meses)</Text>
      <View style={styles.chartWrapper}>
        <BarChart
          data={groupedData}
          barWidth={12}
          spacing={24}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: "#757575", fontSize: 10 }}
          noOfSections={3}
          maxValue={Math.max(...groupedData.map((d) => d.value)) * 1.2}
          width={width - 80} // Adjust for padding
          height={180}
        />
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
});
