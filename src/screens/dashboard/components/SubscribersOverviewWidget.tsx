import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { colors } from "../../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

interface SubscriberStats {
  totalSubscribers: number;
  totalDebtors: number;
  topDebtors: { name: string; total: number; breakdown: any[] }[];
}

interface Props {
  stats?: SubscriberStats;
}

export const SubscribersOverviewWidget: React.FC<Props> = ({ stats }) => {
  const navigation = useNavigation<any>();

  if (!stats || stats.totalSubscribers === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.unifiedCard}>
        {/* Header Section */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Suscriptores 👥</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Servicios", { screen: "SubscribersGlobal" })
            }
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>Ver Todos</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Stats Section */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalSubscribers}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statVerticalDivider} />
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statValue,
                {
                  color: stats.totalDebtors > 0 ? colors.error : colors.success,
                },
              ]}
            >
              {stats.totalDebtors}
            </Text>
            <Text style={styles.statLabel}>Deudores</Text>
          </View>
          <View style={styles.statVerticalDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {stats.totalSubscribers - stats.totalDebtors}
            </Text>
            <Text style={styles.statLabel}>Al Día</Text>
          </View>
        </View>

        {/* Top Debtors Section (if any) */}
        {stats.totalDebtors > 0 && (
          <View style={styles.debtorsSection}>
            <View style={styles.divider} />
            <Text style={styles.subHeader}>Pendientes (Top 3)</Text>

            <View style={styles.listContent}>
              {stats.topDebtors.map((debtor, index) => (
                <View key={index} style={styles.debtorRow}>
                  {/* Avatar */}
                  <View style={styles.icon}>
                    <Text style={styles.initial}>
                      {debtor.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={styles.debtorInfo}>
                    <Text style={styles.name} numberOfLines={1}>
                      {debtor.name}
                    </Text>
                    <Text style={styles.serviceText} numberOfLines={1}>
                      {debtor.breakdown.map((b) => b.service).join(", ")}
                    </Text>
                  </View>

                  {/* Amount */}
                  <Text style={styles.amount}>
                    S/ {debtor.total.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  unifiedCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "10",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "600",
    marginRight: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: "100%",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statVerticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  debtorsSection: {
    marginTop: 8,
  },
  subHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginLeft: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  debtorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  initial: {
    color: colors.error,
    fontSize: 12,
    fontWeight: "bold",
  },
  debtorInfo: {
    flex: 1,
    justifyContent: "center",
    marginRight: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 2,
  },
  serviceText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  amount: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.error,
  },
});
