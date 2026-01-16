import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useDashboardData } from "../../hooks/useDashboardData";
import { auth } from "../../config/firebaseConfig";
import { BalanceCard } from "./components/BalanceCard";
import { SmartTipCard } from "./components/SmartTipCard";
import { InsightsRail } from "./components/InsightsRail";
import { SubscribersOverviewWidget } from "./components/SubscribersOverviewWidget";
import { UpcomingServices } from "./components/UpcomingServices";
// import { TrendChart } from "./components/TrendChart"; // Replaced
import { ExpenseDonutChart } from "./components/ExpenseDonutChart";
import { colors } from "../../theme/colors";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState(
    auth.currentUser?.displayName?.split(" ")[0] || "Usuario"
  );

  useFocusEffect(
    useCallback(() => {
      if (auth.currentUser?.displayName) {
        setUserName(auth.currentUser.displayName.split(" ")[0]);
      }
    }, [])
  );

  const {
    loading,
    totalBalance,
    currentMonthIncome,
    currentMonthExpense,
    topCategory,
    antExpenses,
    expensiveDay,
    trendData,
    upcomingServices,
    spendingTrend,
    subscriberStats, // New Stats
    categoryBreakdown, // New Logic
  } = useDashboardData();

  // Re-construct full data object to pass to SmartTip
  const dashboardData = {
    loading,
    totalBalance,
    currentMonthIncome,
    currentMonthExpense,
    netFlow: currentMonthIncome - currentMonthExpense,
    topCategory,
    antExpenses,
    expensiveDay,
    trendData,
    coveragePercentage: 0,
    upcomingServices,
    spendingTrend,
    subscriberStats,
    categoryBreakdown,
  };

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {userName} 👋</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      {/* Balance */}
      <BalanceCard
        balance={totalBalance}
        income={currentMonthIncome}
        expense={currentMonthExpense}
      />

      {/* AI Smart Tip */}
      <SmartTipCard data={dashboardData} />

      {/* Subscribers Widget (Global & Top Debtors) */}
      <SubscribersOverviewWidget stats={subscriberStats} />

      {/* Upcoming Services */}
      <UpcomingServices services={upcomingServices} />

      {/* Insights */}
      <InsightsRail
        topCategory={topCategory}
        antExpenses={antExpenses}
        expensiveDay={expensiveDay}
        spendingTrend={spendingTrend}
      />

      {/* Expense Distribution (Donut Chart) */}
      <ExpenseDonutChart
        data={categoryBreakdown}
        totalExpense={currentMonthExpense}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 20, // Safe area handled by parent or layout
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: "capitalize",
  },
});
