import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { sumValues } from "../../../../logic/serviceHistoryUtils";
import { PaymentHistory } from "../../../../interfaces/Subscription";

interface HistoryListViewProps {
  historial_pagos: PaymentHistory[];
  showFullHistory: boolean;
  setShowFullHistory: (val: boolean) => void;
  selectedYear: string;
  setSelectedYear: (val: string) => void;
  accounts: any[];
  currentAccount: any;
  setMonthDetail: (val: any) => void;
}

export const HistoryListView: React.FC<HistoryListViewProps> = ({
  historial_pagos,
  showFullHistory,
  setShowFullHistory,
  selectedYear,
  setSelectedYear,
  accounts,
  currentAccount,
  setMonthDetail,
}) => {
  const { colors } = useAppTheme();

  const filteredHistory = (historial_pagos || []).filter(
    (h: any) => !selectedYear || h.mes_anio.endsWith(selectedYear),
  );

  if (!showFullHistory) return null;

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowFullHistory(false)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 16,
          }}
        >
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
          <Text
            style={{
              marginLeft: 8,
              color: colors.primary,
              fontFamily: "AsapBold",
              fontSize: 14,
            }}
          >
            Resumen Actual
          </Text>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 4,
          }}
        >
          {["2025", "2026"].map((year) => (
            <TouchableOpacity
              key={year}
              onPress={() => setSelectedYear(year)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor:
                  selectedYear === year ? colors.background : "transparent",
              }}
            >
              <Text
                style={{
                  fontFamily: "AsapBold",
                  fontSize: 10,
                  color:
                    selectedYear === year
                      ? colors.primary
                      : colors.textSecondary,
                }}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginBottom: 80 }}
      >
        {(filteredHistory || []).map((hist: any, idx: number) => {
          const recHist = sumValues(hist?.montos_pagados);
          const miGasto = (hist?.costo_servicio_momento || 0) - recHist;
          const accountForThisMonth =
            accounts.find((a: any) => a.id === hist.id_cuenta_pago_real) ||
            currentAccount;

          return (
            <TouchableOpacity
              key={`hist-${idx}`}
              onPress={() => setMonthDetail({ visible: true, history: hist })}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 12,
                marginBottom: 10,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontFamily: "AsapBold",
                      fontSize: 12,
                      textTransform: "uppercase",
                      marginRight: 8,
                    }}
                  >
                    {hist.mes_anio}
                  </Text>
                  {hist.frecuencia_momento === "anual" && (
                    <View
                      style={{
                        backgroundColor: `${colors.income}15`,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        marginRight: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.income,
                          fontFamily: "AsapBold",
                          fontSize: 7,
                          textTransform: "uppercase",
                        }}
                      >
                        PAGO ANUAL
                      </Text>
                    </View>
                  )}
                  {hist.es_compartido_momento !== false && (
                    <View
                      style={{
                        backgroundColor: `${colors.primary}15`,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.primary,
                          fontFamily: "AsapBold",
                          fontSize: 7,
                          textTransform: "uppercase",
                        }}
                      >
                        Compartido
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  style={{
                    backgroundColor: hist.fecha_real_pago
                      ? `${colors.income}15`
                      : `${colors.warning}15`,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                  }}
                >
                  <Text
                    style={{
                      color: hist.fecha_real_pago
                        ? colors.income
                        : colors.warning,
                      fontFamily: "AsapBold",
                      fontSize: 8,
                    }}
                  >
                    {hist.fecha_real_pago ? "PAGADO" : "PENDIENTE"}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <View>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: "Asap",
                      fontSize: 8,
                      textTransform: "uppercase",
                    }}
                  >
                    Costo Total
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontFamily: "AsapBold",
                      fontSize: 11,
                    }}
                  >
                    S/ {(hist?.costo_servicio_momento || 0).toFixed(2)}
                  </Text>
                </View>
                {hist?.es_compartido_momento !== false && (
                  <View>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontFamily: "Asap",
                        fontSize: 8,
                        textTransform: "uppercase",
                      }}
                    >
                      Recaudado
                    </Text>
                    <Text
                      style={{
                        color: colors.text,
                        fontFamily: "AsapBold",
                        fontSize: 11,
                      }}
                    >
                      S/ {(recHist || 0).toFixed(2)}
                    </Text>
                  </View>
                )}
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: "Asap",
                      fontSize: 8,
                      textTransform: "uppercase",
                    }}
                  >
                    {hist?.es_compartido_momento === false
                      ? "Total"
                      : miGasto < 0
                        ? "Ganancia"
                        : "Tu Gasto"}
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontFamily: "AsapBold",
                      fontSize: 11,
                    }}
                  >
                    S/ {(Math.abs(miGasto) || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: `${colors.text}10`,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name={(accountForThisMonth?.icono || "card-outline") as any}
                    size={12}
                    color={accountForThisMonth?.color || colors.textSecondary}
                  />
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: "AsapSemiBold",
                      fontSize: 9,
                      marginLeft: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    {accountForThisMonth?.nombre || "N/A"}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name={
                      (hist?.fecha_real_pago || miGasto <= 0
                        ? "checkmark-circle"
                        : "alert-circle") as any
                    }
                    size={14}
                    color={
                      hist?.fecha_real_pago || miGasto <= 0
                        ? colors.income
                        : colors.muted
                    }
                  />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: 9,
                      fontFamily: "AsapBold",
                      color: colors.textSecondary,
                      textTransform: "uppercase",
                    }}
                  >
                    {hist.fecha_real_pago
                      ? "Pagado"
                      : miGasto <= 0
                        ? "Recuperado"
                        : "Pendiente"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
