import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PaymentHistory, Subscriber } from "../../../../interfaces/Subscription";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { ParticipantTimeline } from "../../../../components/common/ParticipantTimeline";

interface SharedParticipantsListProps {
  currentMonth: PaymentHistory;
  historial_pagos: PaymentHistory[];
  suscriptores: Subscriber[];
  onToggleRequest: (subscriberId: string, haPagado: boolean) => void;
  onRemindParticipant: (subscriberId: string) => void;
}

export const SharedParticipantsList: React.FC<SharedParticipantsListProps> = ({
  currentMonth,
  historial_pagos,
  suscriptores,
  onToggleRequest,
  onRemindParticipant,
}) => {
  const { colors, fonts } = useAppTheme();

  const getUserStatus = (subscriberId: string) => {
    const haPagado = currentMonth.registro_pagos_personas?.[subscriberId];
    const sub = suscriptores.find((s) => s.id === subscriberId);

    if (haPagado)
      return { bgColor: `${colors.income}15`, textColor: colors.incomeStrong, label: "PAGADO", icon: undefined as string | undefined };
    if (sub?.es_cortesia)
      return { bgColor: `${colors.warning}15`, textColor: colors.warning, label: "CORTESÍA", icon: undefined as string | undefined };
    return { bgColor: `${colors.textSecondary}10`, textColor: colors.textSecondary, label: "PENDIENTE", icon: undefined as string | undefined };
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      {Object.keys(currentMonth?.registro_pagos_personas || {}).map((subscriberId, idx) => {
        const activeSub = suscriptores.find((s) => s.id === subscriberId);
        const nombre = activeSub?.nombre || "Ex-participante";
        const cuotaHistorica = currentMonth.cuotas_momento?.[subscriberId] ?? (activeSub?.cuota || 0);
        const eraCortesia = cuotaHistorica === 0 || activeSub?.es_cortesia === true;
        const status = eraCortesia
          ? { bgColor: `${colors.primary}15`, textColor: colors.primary, label: "CORTESÍA", icon: "gift" }
          : getUserStatus(subscriberId);
        const haPagado = currentMonth.registro_pagos_personas?.[subscriberId];
        const montoPagado = currentMonth.montos_pagados?.[subscriberId] || 0;
        const displayColor = activeSub?.color || colors.textSecondary;

        // Definir el color del indicador lateral
        const indicatorColor = haPagado ? colors.income : eraCortesia ? colors.primary : colors.warning;

        return (
          <TouchableOpacity
            key={idx}
            onPress={() => !eraCortesia && onToggleRequest(subscriberId, !!haPagado)}
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              marginBottom: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderLeftWidth: 4,
              borderLeftColor: indicatorColor,
              borderWidth: 1,
              borderColor: `${colors.text}05`,
              opacity: eraCortesia ? 0.8 : 1,
            }}
            activeOpacity={eraCortesia ? 1 : 0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                  backgroundColor: `${displayColor}15`,
                }}
              >
                <Text style={{ fontFamily: fonts.family.bold, fontSize: 14, color: displayColor }}>
                  {nombre.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={{ color: colors.text, fontFamily: fonts.family.bold, fontSize: 14 }}>{nombre}</Text>

                <View style={{ marginTop: 0, marginBottom: 2 }}>
                  <ParticipantTimeline
                    subscriberId={subscriberId}
                    historial_pagos={historial_pagos}
                    mesInicio={currentMonth.mes_anio}
                  />
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ color: colors.textSecondary, fontFamily: fonts.family.regular, fontSize: 12 }}>
                    {haPagado ? `S/ ${montoPagado.toFixed(2)}` : `S/ ${eraCortesia ? "0.00" : cuotaHistorica.toFixed(2)}`}
                  </Text>
                  {haPagado && montoPagado !== cuotaHistorica && (
                    <Text
                      style={{
                        color: `${colors.text}30`,
                        fontFamily: fonts.family.regular,
                        fontSize: 8,
                        marginLeft: 8,
                        textDecorationLine: "line-through",
                      }}
                    >
                      (S/ {cuotaHistorica.toFixed(2)})
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  backgroundColor: status.bgColor,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: eraCortesia ? 0 : 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {status.icon && (
                  <Ionicons name={status.icon as any} size={10} color={status.textColor} style={{ marginRight: 4 }} />
                )}
                <Text
                  style={{
                    color: status.textColor,
                    fontFamily: fonts.family.bold,
                    fontSize: 8,
                    textTransform: "uppercase",
                  }}
                >
                  {status.label}
                </Text>
              </View>
              {!eraCortesia && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {!haPagado && (
                    <TouchableOpacity
                      onPress={() => onRemindParticipant(subscriberId)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: `${colors.income}15`,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8,
                      }}
                    >
                      <Ionicons name="logo-whatsapp" size={16} color={colors.income} />
                    </TouchableOpacity>
                  )}
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: haPagado ? colors.income : "transparent",
                      borderWidth: haPagado ? 0 : 2,
                      borderColor: colors.border,
                    }}
                  >
                    {haPagado && <Ionicons name="checkmark" size={14} color={colors.background} />}
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

export default SharedParticipantsList;
