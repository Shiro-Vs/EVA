import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { colors } from "../../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  topCategory: { name: string; amount: number; percentage: number } | null;
  antExpenses: { count: number; total: number };
  expensiveDay: { day: string; amount: number } | null;
  spendingTrend?: { percentage: number; direction: "up" | "down" } | null;
}

export const InsightsRail: React.FC<Props> = ({
  topCategory,
  antExpenses,
  expensiveDay,
  spendingTrend,
}) => {
  if (
    !topCategory &&
    antExpenses.count === 0 &&
    !expensiveDay &&
    !spendingTrend
  )
    return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Alertas y Curiosidades</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card 0: Trend (New) */}
        {spendingTrend && (
          <LinearGradient
            colors={
              spendingTrend.direction === "up"
                ? ["#FFEBEE", "#FFCDD2"] // Red-ish if spending UP
                : ["#E8F5E9", "#C8E6C9"] // Green-ish if spending DOWN
            }
            style={styles.card}
          >
            <View
              style={[
                styles.icon,
                {
                  backgroundColor:
                    spendingTrend.direction === "up" ? "#EF9A9A" : "#A5D6A7",
                },
              ]}
            >
              <Ionicons
                name={
                  spendingTrend.direction === "up"
                    ? "trending-up"
                    : "trending-down"
                }
                size={20}
                color={spendingTrend.direction === "up" ? "#C62828" : "#2E7D32"}
              />
            </View>
            <Text
              style={[
                styles.title,
                {
                  color:
                    spendingTrend.direction === "up" ? "#C62828" : "#2E7D32",
                },
              ]}
            >
              {spendingTrend.direction === "up"
                ? "Gastos subieron"
                : "Gastos bajaron"}
            </Text>
            <Text
              style={[
                styles.desc,
                {
                  color:
                    spendingTrend.direction === "up" ? "#B71C1C" : "#1B5E20",
                },
              ]}
            >
              Un {spendingTrend.percentage.toFixed(0)}% respecto al mes
              anterior.
            </Text>
          </LinearGradient>
        )}

        {/* Card 1: Top Category */}
        {topCategory && (
          <LinearGradient
            colors={["#FFF3E0", "#FFE0B2"]} // Soft Orange
            style={styles.card}
          >
            <View style={[styles.icon, { backgroundColor: "#FFCC80" }]}>
              <Ionicons name="pie-chart" size={20} color="#E65100" />
            </View>
            <Text style={[styles.title, { color: "#E65100" }]}>
              Mayor Gasto: {topCategory.name}
            </Text>
            <Text style={[styles.desc, { color: "#BF360C" }]}>
              {topCategory.percentage.toFixed(0)}% de tu salida (S/{" "}
              {topCategory.amount.toFixed(0)})
            </Text>
          </LinearGradient>
        )}

        {/* Card 2: Ant Expenses */}
        {antExpenses.count > 0 && (
          <LinearGradient
            colors={["#F3E5F5", "#E1BEE7"]} // Soft Purple
            style={styles.card}
          >
            <View style={[styles.icon, { backgroundColor: "#CE93D8" }]}>
              <Ionicons name="bug" size={20} color="#7B1FA2" />
            </View>
            <Text style={[styles.title, { color: "#7B1FA2" }]}>
              {antExpenses.count} Gastos Hormiga
            </Text>
            <Text style={[styles.desc, { color: "#4A148C" }]}>
              Detectamos fugas por S/ {antExpenses.total.toFixed(2)}
            </Text>
          </LinearGradient>
        )}

        {/* Card 3: Expensive Day */}
        {expensiveDay && (
          <LinearGradient
            colors={["#E3F2FD", "#BBDEFB"]} // Soft Blue
            style={styles.card}
          >
            <View style={[styles.icon, { backgroundColor: "#90CAF9" }]}>
              <Ionicons name="calendar" size={20} color="#1565C0" />
            </View>
            <Text style={[styles.title, { color: "#0D47A1" }]}>
              Día Intenso: {expensiveDay.day}
            </Text>
            <Text style={[styles.desc, { color: "#01579B" }]}>
              Sueles gastar más este día de la semana.
            </Text>
          </LinearGradient>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    fontSize: 16, // Reduced from 18
    fontWeight: "bold",
    color: colors.text,
    marginLeft: 20,
    marginBottom: 10, // Reduced from 12
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10, // Reduced from 12
  },
  card: {
    width: 150, // Reduced from 200
    padding: 12, // Reduced from 16
    borderRadius: 16, // Reduced from 20
    justifyContent: "space-between",
    minHeight: 100, // Reduced from 130
    // Subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 32, // Reduced from 38
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8, // Reduced from 12
  },
  title: {
    fontSize: 12, // Reduced from 15
    fontWeight: "800",
    marginBottom: 4, // Reduced from 6
  },
  desc: {
    fontSize: 11, // Reduced from 13
    lineHeight: 14, // Reduced from 18, tighter line height logic
    fontWeight: "500",
  },
});
