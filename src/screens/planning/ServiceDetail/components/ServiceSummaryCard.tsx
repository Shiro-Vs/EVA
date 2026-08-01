import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PaymentHistory } from "../../../../interfaces/Subscription";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { getMesFin } from "../../../../logic/shared/serviceHistoryUtils";

interface Account {
  id: string;
  nombre: string;
  icono?: string;
}

interface ServiceSummaryCardProps {
  currentMonth: PaymentHistory;
  historial_pagos: PaymentHistory[];
  frecuencia: "mensual" | "anual";
  totalRecaudado: number;
  miCostoFinal: number;
  accounts: Account[];
  currentAccount: Account;
  serviceStatus: { label: string; status: string };
  onPayService: () => void;
  onExpandHistory: () => void;
}

export const ServiceSummaryCard: React.FC<ServiceSummaryCardProps> = ({
  currentMonth,
  historial_pagos,
  frecuencia,
  totalRecaudado,
  miCostoFinal,
  accounts,
  currentAccount,
  serviceStatus,
  onPayService,
  onExpandHistory,
}) => {
  const { colors, fonts } = useAppTheme();

  const actualAccount =
    accounts.find((a) => a.id === currentMonth.id_cuenta_pago_real) || currentAccount;

  return (
    <View
      style={{
        backgroundColor: colors.primary,
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        position: "relative",
      }}
    >
      <TouchableOpacity
        onPress={onExpandHistory}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={currentMonth.es_compartido_momento !== false ? "time" : "list-outline"}
          size={20}
          color="white"
        />
      </TouchableOpacity>
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            color: "rgba(255,255,255,0.8)",
            fontFamily: fonts.family.semiBold,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          Resumen de Pago
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              color: "white",
              fontFamily: fonts.family.bold,
              fontSize: 24,
              marginRight: 12,
            }}
          >
            {currentMonth.mes_anio}
          </Text>
          <View style={{ marginTop: 4 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                alignSelf: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Ionicons
                name={currentMonth.frecuencia_momento === "anual" ? "shield-checkmark" : "repeat"}
                size={12}
                color="white"
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  color: "white",
                  fontFamily: fonts.family.semiBold,
                  fontSize: 11,
                }}
              >
                {currentMonth.frecuencia_momento === "anual"
                  ? `hasta ${getMesFin(currentMonth.mes_anio, 1, currentMonth.frecuencia_momento || frecuencia, historial_pagos)}`
                  : "Ciclo mensual"}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Ionicons name={(actualAccount?.icono || "card-outline") as any} size={12} color="rgba(255,255,255,0.9)" />
        <Text
          style={{
            color: "rgba(255,255,255,0.9)",
            fontFamily: fonts.family.semiBold,
            fontSize: 10,
            marginLeft: 4,
          }}
        >
          {currentMonth.fecha_real_pago ? "Pagado con: " : "Pago desde: "}
          {actualAccount?.nombre || "N/A"}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, marginRight: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <View>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: fonts.family.regular,
                  fontSize: 9,
                  textTransform: "uppercase",
                }}
              >
                Costo Total
              </Text>
              <Text style={{ color: "white", fontFamily: fonts.family.bold, fontSize: 14 }}>
                S/ {(currentMonth.costo_servicio_momento || 0).toFixed(2)}
              </Text>
            </View>
            {currentMonth?.es_compartido_momento !== false && (
              <View>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: fonts.family.regular,
                    fontSize: 9,
                    textTransform: "uppercase",
                  }}
                >
                  Recaudado
                </Text>
                <Text style={{ color: "white", fontFamily: fonts.family.bold, fontSize: 14 }}>
                  S/ {(totalRecaudado || 0).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: fonts.family.regular,
                  fontSize: 9,
                  textTransform: "uppercase",
                }}
              >
                {currentMonth?.es_compartido_momento === false ? "Total" : miCostoFinal < 0 ? "Saldo" : "Tu Gasto"}
              </Text>
              <Text style={{ color: "white", fontFamily: fonts.family.bold, fontSize: 14 }}>
                S/ {(Math.abs(miCostoFinal) || 0).toFixed(2)}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.3)",
              height: 6,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                height: "100%",
                width: `${Math.min(((totalRecaudado || 0) / (currentMonth?.costo_servicio_momento || 1)) * 100, 100)}%`,
              }}
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={onPayService}
          style={{
            backgroundColor: "white",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.family.bold,
              fontSize: 12,
              color: serviceStatus.status === "success" ? colors.incomeStrong : colors.expenseStrong,
            }}
          >
            {serviceStatus.status === "success" ? "EDITAR" : "PAGAR"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ServiceSummaryCard;
