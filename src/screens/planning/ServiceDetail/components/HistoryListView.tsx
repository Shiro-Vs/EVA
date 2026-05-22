import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { sumValues } from "../../../../logic/serviceHistoryUtils";
import {
  PaymentHistory,
  Subscriber,
} from "../../../../interfaces/Subscription";

interface HistoryListViewProps {
  historial_pagos: PaymentHistory[];
  showFullHistory: boolean;
  setShowFullHistory: (val: boolean) => void;
  selectedYear: string;
  setSelectedYear: (val: string) => void;
  accounts: any[];
  currentAccount: any;
  setMonthDetail: (val: any) => void;
  isInline?: boolean;
  suscriptores: Subscriber[];
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
  isInline = false,
  suscriptores,
}) => {
  const { colors, fonts } = useAppTheme();

  let filteredHistory = (historial_pagos || []).filter(
    (h: any) => !selectedYear || h.mes_anio.endsWith(selectedYear),
  );

  if (isInline) {
    filteredHistory = filteredHistory.slice(0, 3);
  }

  if (!showFullHistory && !isInline) return null;

  return (
    <View style={{ flex: 1 }}>
      {!isInline && (
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
                fontFamily: fonts.family.bold,
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
                    fontFamily: fonts.family.bold,
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
      )}

      {isInline && (
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: fonts.family.semiBold,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 16,
          }}
        >
          Historial de Pagos
        </Text>
      )}
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

          const isShared = hist.es_compartido_momento !== false;

          return (
            <TouchableOpacity
              key={`hist-${idx}`}
              onPress={() => setMonthDetail({ visible: true, history: hist })}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: `${colors.text}05`,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor: `${colors.primary}10`,
                      padding: 6,
                      borderRadius: 10,
                      marginRight: 10,
                    }}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <View>
                    <Text
                      style={{
                        color: colors.text,
                        fontFamily: fonts.family.bold,
                        fontSize: 13,
                        textTransform: "capitalize",
                      }}
                    >
                      {hist.mes_anio.split(" ")[0]}
                    </Text>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontFamily: fonts.family.regular,
                        fontSize: 9,
                      }}
                    >
                      {hist.mes_anio.split(" ")[1]}
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <View
                    style={{
                      backgroundColor: hist.fecha_real_pago
                        ? `${colors.income}15`
                        : `${colors.warning}15`,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 8,
                      marginBottom: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: hist.fecha_real_pago
                          ? colors.income
                          : colors.warning,
                        fontFamily: fonts.family.bold,
                        fontSize: 8,
                      }}
                    >
                      {hist.fecha_real_pago ? "PAGADO" : "PENDIENTE"}
                    </Text>
                  </View>
                  {hist.frecuencia_momento === "anual" && (
                    <Text
                      style={{
                        color: colors.income,
                        fontFamily: fonts.family.bold,
                        fontSize: 7,
                      }}
                    >
                      PAGO ANUAL
                    </Text>
                  )}
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: `${colors.text}03`,
                  padding: 8,
                  borderRadius: 12,
                  borderTopWidth: 1,
                  borderTopColor: `${colors.text}05`,
                }}
              >
                <View>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: fonts.family.regular,
                      fontSize: 8,
                      textTransform: "uppercase",
                    }}
                  >
                    Costo
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontFamily: fonts.family.bold,
                      fontSize: 12,
                    }}
                  >
                    S/ {hist.costo_servicio_momento.toFixed(2)}
                  </Text>
                </View>

                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: fonts.family.regular,
                      fontSize: 8,
                      textTransform: "uppercase",
                    }}
                  >
                    Pagado
                  </Text>
                  <Text
                    style={{
                      color: hist.fecha_real_pago ? colors.primary : colors.textSecondary,
                      fontFamily: fonts.family.bold,
                      fontSize: 12,
                    }}
                  >
                    {hist.fecha_real_pago ? `S/ ${(hist.monto_pagado_banco || hist.costo_servicio_momento).toFixed(2)}` : "---"}
                  </Text>
                </View>

                {isShared ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", marginRight: 10 }}>
                      {Object.keys(hist.registro_pagos_personas || {})
                        .slice(0, 3)
                        .map((name, pIdx) => {
                          const sub = suscriptores.find(
                            (s) => s.nombre === name,
                          );
                          const color = sub?.color || colors.primary;
                          const hasPaid = hist.registro_pagos_personas[name];
                          return (
                            <View
                              key={pIdx}
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                backgroundColor: color,
                                borderWidth: 1.5,
                                borderColor: colors.card,
                                marginLeft: pIdx === 0 ? 0 : -6,
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: hasPaid ? 1 : 0.4,
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontFamily: fonts.family.bold,
                                  fontSize: 8,
                                }}
                              >
                                {name.charAt(0)}
                              </Text>
                            </View>
                          );
                        })}
                      {Object.keys(hist.registro_pagos_personas || {}).length >
                        3 && (
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: colors.muted,
                            borderWidth: 1.5,
                            borderColor: colors.card,
                            marginLeft: -6,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontFamily: fonts.family.bold,
                              fontSize: 7,
                            }}
                          >
                            +
                            {Object.keys(hist.registro_pagos_personas).length -
                              3}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontFamily: fonts.family.regular,
                          fontSize: 8,
                          textTransform: "uppercase",
                        }}
                      >
                        Recaudo
                      </Text>
                      <Text
                        style={{
                          color: colors.income,
                          fontFamily: fonts.family.bold,
                          fontSize: 12,
                        }}
                      >
                        S/ {recHist.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ alignItems: "flex-end" }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: `${colors.primary}10`,
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 6,
                      }}
                    >
                      <Ionicons
                        name="person-outline"
                        size={10}
                        color={colors.primary}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={{
                          color: colors.primary,
                          fontFamily: fonts.family.bold,
                          fontSize: 9,
                        }}
                      >
                        Individual
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
