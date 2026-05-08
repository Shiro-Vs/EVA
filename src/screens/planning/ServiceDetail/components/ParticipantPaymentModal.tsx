import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EVAModal from "../../../../components/common/EVAModal";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import {
  getMesFin,
  calculateTotalMonto,
  getPeriodDisplayLabel,
} from "../../../../logic/serviceHistoryUtils";
import {
  PaymentHistory,
  Subscriber,
} from "../../../../interfaces/Subscription";
import * as Haptics from "expo-haptics";

interface ParticipantPaymentModalProps {
  paymentModal: any;
  setPaymentModal: (val: any | ((prev: any) => any)) => void;
  frecuencia: string;
  historial_pagos: PaymentHistory[];
  suscriptores: Subscriber[];
  onTogglePayment: (nombre: string, monto?: number) => void;
  onAdvancePayment: (nombre: string, months: number) => void;
}

export const ParticipantPaymentModal: React.FC<
  ParticipantPaymentModalProps
> = ({
  paymentModal,
  setPaymentModal,
  frecuencia,
  historial_pagos,
  suscriptores,
  onTogglePayment,
  onAdvancePayment,
}) => {
  const { colors } = useAppTheme();
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Resetea el estado de éxito cuando se abre un nuevo modal
  React.useEffect(() => {
    if (paymentModal.visible) {
      setIsSuccess(false);
    }
  }, [paymentModal.visible]);

  const confirmPayment = async () => {
    setIsSuccess(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      const finalMonto = parseFloat(paymentModal.monto) || 0;
      if (onAdvancePayment && paymentModal.meses > 1) {
        onAdvancePayment(paymentModal.nombre, paymentModal.meses);
      } else {
        onTogglePayment(paymentModal.nombre, finalMonto);
      }
      setPaymentModal((prev: any) => ({ ...prev, visible: false }));
    }, 800);
  };

  return (
    <EVAModal
      visible={paymentModal.visible}
      title={`Pago de ${paymentModal.nombre}`}
      onClose={() => setPaymentModal({ ...paymentModal, visible: false })}
      primaryButtonText="Confirmar Pago"
      onPrimaryAction={confirmPayment}
      secondaryButtonText="Cancelar"
      isSuccess={isSuccess}
    >
      <View style={{ paddingVertical: 16 }}>
        <View
          style={{
            backgroundColor: `${colors.income}10`,
            padding: 12,
            borderRadius: 12,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: colors.income,
          }}
        >
          <Text
            style={{
              color: colors.income,
              fontFamily: "AsapBold",
              fontSize: 11,
              marginBottom: 2,
            }}
          >
            PERIODO DE COBERTURA
          </Text>

          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: "AsapMedium",
              fontSize: 10,
            }}
          >
            Este pago cubrirá desde{" "}
            <Text style={{ color: colors.text, fontFamily: "AsapBold" }}>
              {paymentModal.mesInicio}
            </Text>
            {(paymentModal.meses > 1 ||
              getMesFin(
                paymentModal.mesInicio,
                paymentModal.meses,
                frecuencia,
                historial_pagos,
              ) !== paymentModal.mesInicio) && (
              <>
                {" hasta "}
                <Text style={{ color: colors.text, fontFamily: "AsapBold" }}>
                  {getMesFin(
                    paymentModal.mesInicio,
                    paymentModal.meses,
                    frecuencia,
                    historial_pagos,
                  )}
                </Text>
              </>
            )}
          </Text>
        </View>

        {paymentModal.notaProrrateo && (
          <View
            style={{
              backgroundColor: `${colors.primary}10`,
              padding: 10,
              borderRadius: 12,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: colors.primary,
                fontFamily: "AsapSemiBold",
                fontSize: 10,
                flex: 1,
              }}
            >
              {paymentModal.notaProrrateo}
            </Text>
          </View>
        )}
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: "AsapSemiBold",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 16,
          }}
        >
          Monto Recibido
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            padding: 12,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <View>
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: "AsapSemiBold",
                fontSize: 9,
              }}
            >
              CUOTA SUGERIDA
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: "AsapBold",
                fontSize: 16,
              }}
            >
              S/ {paymentModal.montoSugerido.toFixed(2)}
            </Text>
          </View>
          <Ionicons
            name="arrow-forward-outline"
            size={18}
            color={colors.muted}
          />
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: "AsapSemiBold",
                fontSize: 9,
                marginBottom: 4,
              }}
            >
              MONTO REAL
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: `${colors.text}08`,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontFamily: "AsapBold",
                  fontSize: 18,
                  marginRight: 4,
                }}
              >
                S/
              </Text>
              <TextInput
                value={paymentModal.monto}
                onChangeText={(val) =>
                  setPaymentModal({ ...paymentModal, monto: val })
                }
                keyboardType="decimal-pad"
                style={{
                  color: colors.text,
                  fontFamily: "AsapBold",
                  fontSize: 18,
                  minWidth: 70,
                  textAlign: "right",
                }}
              />
            </View>
          </View>
        </View>
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: "AsapSemiBold",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 16,
          }}
        >
          Periodos a Pagar
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: `${colors.text}08`,
            padding: 8,
            borderRadius: 16,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() =>
              setPaymentModal((p: any) => {
                const newMeses = Math.max(1, p.meses - 1);
                const nuevoMonto = calculateTotalMonto(
                  p.nombre,
                  newMeses,
                  p.mesInicio,
                  historial_pagos,
                  suscriptores,
                );

                // Buscar la cuota del último periodo del nuevo rango
                const mesesMap: Record<string, number> = {
                  Enero: 0,
                  Febrero: 1,
                  Marzo: 2,
                  Abril: 3,
                  Mayo: 4,
                  Junio: 5,
                  Julio: 6,
                  Agosto: 7,
                  Septiembre: 8,
                  Octubre: 9,
                  Noviembre: 10,
                  Diciembre: 11,
                };
                const sortedHistoryAsc = [...(historial_pagos || [])].sort(
                  (a, b) => {
                    const [mA, yA] = a.mes_anio.split(" ");
                    const [mB, yB] = b.mes_anio.split(" ");
                    return (
                      new Date(parseInt(yA), mesesMap[mA], 1).getTime() -
                      new Date(parseInt(yB), mesesMap[mB], 1).getTime()
                    );
                  },
                );
                const startIndex = sortedHistoryAsc.findIndex(
                  (h) => h.mes_anio === p.mesInicio,
                );
                const lastHist =
                  startIndex !== -1
                    ? sortedHistoryAsc[startIndex + newMeses - 1]
                    : null;
                const sub = suscriptores.find(
                  (s: any) => s.nombre === p.nombre,
                );
                const nuevaCuotaSugerida =
                  lastHist?.cuotas_momento?.[p.nombre] ?? (sub?.cuota || 0);

                return {
                  ...p,
                  meses: newMeses,
                  monto: nuevoMonto.toString(),
                  montoSugerido: nuevaCuotaSugerida,
                };
              })
            }
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.card,
              borderRadius: 12,
            }}
          >
            <Ionicons name="remove" size={20} color={colors.primary} />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                color: colors.text,
                fontFamily: "AsapBold",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {getPeriodDisplayLabel(
                paymentModal.mesInicio,
                paymentModal.meses,
                frecuencia,
                historial_pagos,
              )}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              setPaymentModal((p: any) => {
                const newMeses = p.meses + 1;
                const nuevoMonto = calculateTotalMonto(
                  p.nombre,
                  newMeses,
                  p.mesInicio,
                  historial_pagos,
                  suscriptores,
                );

                // Buscar la cuota del último periodo del nuevo rango
                const mesesMap: Record<string, number> = {
                  Enero: 0,
                  Febrero: 1,
                  Marzo: 2,
                  Abril: 3,
                  Mayo: 4,
                  Junio: 5,
                  Julio: 6,
                  Agosto: 7,
                  Septiembre: 8,
                  Octubre: 9,
                  Noviembre: 10,
                  Diciembre: 11,
                };
                const sortedHistoryAsc = [...(historial_pagos || [])].sort(
                  (a, b) => {
                    const [mA, yA] = a.mes_anio.split(" ");
                    const [mB, yB] = b.mes_anio.split(" ");
                    return (
                      new Date(parseInt(yA), mesesMap[mA], 1).getTime() -
                      new Date(parseInt(yB), mesesMap[mB], 1).getTime()
                    );
                  },
                );
                const startIndex = sortedHistoryAsc.findIndex(
                  (h) => h.mes_anio === p.mesInicio,
                );
                const lastHist =
                  startIndex !== -1
                    ? sortedHistoryAsc[startIndex + newMeses - 1]
                    : null;
                const sub = suscriptores.find(
                  (s: any) => s.nombre === p.nombre,
                );
                const nuevaCuotaSugerida =
                  lastHist?.cuotas_momento?.[p.nombre] ?? (sub?.cuota || 0);

                return {
                  ...p,
                  meses: newMeses,
                  monto: nuevoMonto.toString(),
                  montoSugerido: nuevaCuotaSugerida,
                };
              })
            }
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.card,
              borderRadius: 12,
            }}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </EVAModal>
  );
};
