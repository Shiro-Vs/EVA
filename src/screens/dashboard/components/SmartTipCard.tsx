import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DashboardData } from "../../../hooks/useDashboardData";
import { generateFinancialTip } from "../../../services/aiService";
import { colors } from "../../../theme/colors";

interface Props {
  data: DashboardData;
}

const TIP_STORAGE_KEY = "daily_financial_tip";
const TIP_DATE_KEY = "daily_financial_tip_date";

export const SmartTipCard = ({ data }: Props) => {
  const [tipData, setTipData] = useState<{
    text: string;
    isAi: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTip();
  }, [data]); // Reload if data changes significantly (optional, maybe just on mount)

  const loadTip = async (forceRefresh = false) => {
    try {
      const today = new Date().toDateString();
      const storedDate = await AsyncStorage.getItem(TIP_DATE_KEY);
      const storedTipJson = await AsyncStorage.getItem(TIP_STORAGE_KEY);

      if (!forceRefresh && storedDate === today && storedTipJson) {
        try {
          const parsed = JSON.parse(storedTipJson);
          setTipData(parsed);
          return;
        } catch (e) {
          // Legacy format detected (plain string), proceed to regenerate
          console.log("Migrating legacy tip format...");
        }
      }

      // Generate new tip
      if (data.loading) return; // Don't generate if data not ready

      setLoading(true);
      const result = await generateFinancialTip(data);
      setTipData(result);

      await AsyncStorage.setItem(TIP_STORAGE_KEY, JSON.stringify(result));
      await AsyncStorage.setItem(TIP_DATE_KEY, today);
    } catch (e) {
      console.error("Failed to load tip", e);
    } finally {
      setLoading(false);
    }
  };

  if (data.loading && !tipData) return null;

  return (
    <LinearGradient
      colors={[colors.surface, colors.surface]} // Flat for now, maybe subtle gradient later
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
          <Text style={styles.title}>Consejo del Día</Text>
        </View>
        <TouchableOpacity onPress={() => loadTip(true)} disabled={loading}>
          <Ionicons
            name="refresh-circle"
            size={24}
            color={loading ? colors.textSecondary : colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <Text style={styles.tipText}>
              {tipData?.text || "Analizando tus finanzas..."}
            </Text>
            {tipData && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: tipData.isAi
                      ? colors.primary + "20"
                      : colors.textSecondary + "20",
                  },
                ]}
              >
                <Ionicons
                  name={tipData.isAi ? "logo-google" : "calculator-outline"}
                  size={10}
                  color={tipData.isAi ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: tipData.isAi
                        ? colors.primary
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {tipData.isAi ? "Generado con IA" : "Análisis Local"}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16, // Reduced from 20
    padding: 12, // Reduced from 16
    borderRadius: 16, // Slightly smaller radius
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8, // Reduced from 12
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 14, // Reduced from 16
    fontWeight: "bold",
    color: colors.primary,
  },
  content: {
    minHeight: 30, // Reduced from 40
    justifyContent: "center",
  },
  tipText: {
    fontSize: 13, // Reduced from 15
    color: colors.text,
    lineHeight: 18, // Reduced from 22
    fontStyle: "italic",
    marginBottom: 6,
  },
  badge: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6, // Reduced
    paddingVertical: 2, // Reduced
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 9, // Reduced from 10
    fontWeight: "bold",
  },
});
