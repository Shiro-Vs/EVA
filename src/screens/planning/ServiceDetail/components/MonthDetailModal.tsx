import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EVAModal from "../../../../components/common/EVAModal";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { PaymentHistory, Subscriber } from "../../../../interfaces/Subscription";
import { ParticipantPaymentView } from "./ParticipantPaymentView";
import * as Haptics from "expo-haptics";

interface MonthDetailModalProps {
  visible: boolean;
  onClose: () => void;
  history: PaymentHistory | null;
  suscriptores: Subscriber[];
  accounts: any[];
  onTogglePayment?: (nombre: string, monto?: number) => void;
  onAdvancePayment?: (nombre: string, months: number) => void;
  historial_pagos: PaymentHistory[];
  frecuencia: string;
}

export const MonthDetailModal: React.FC<MonthDetailModalProps> = ({
  visible,
  onClose,
  history,
  suscriptores,
  accounts,
  onTogglePayment,
  onAdvancePayment,
  historial_pagos,
  frecuencia,
}) => {
  const { colors, fonts } = useAppTheme();
  const [payingParticipant, setPayingParticipant] = React.useState<any | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Reset internal state when modal opens/closes
  React.useEffect(() => {
    if (!visible) {
      setPayingParticipant(null);
      setIsSuccess(false);
    }
  }, [visible]);

  if (!history) return null;

  const sumValues = (obj: any) => Object.values(obj || {}).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
  const totalRecaudado = sumValues(history.montos_pagados);
  const miGasto = (history.costo_servicio_momento || 0) - totalRecaudado;
  const actualAccount = accounts.find((a: any) => a.id === history.id_cuenta_pago_real);

  const handleStartPayment = (nombre: string) => {
    const sub = suscriptores.find(s => s.nombre === nombre);
    const cuotaBase = sub?.cuota || 0;

    const mesesMap: Record<string, number> = {
      Enero: 0, Febrero: 1, Marzo: 2, Abril: 3, Mayo: 4, Junio: 5,
      Julio: 6, Agosto: 7, Septiembre: 8, Octubre: 9, Noviembre: 10, Diciembre: 11,
    };

    const sortedHistoryAsc = [...historial_pagos].sort((a, b) => {
      const [mA, yA] = a.mes_anio.split(" ");
      const [mB, yB] = b.mes_anio.split(" ");
      return (
        new Date(parseInt(yA), mesesMap[mA], 1).getTime() -
        new Date(parseInt(yB), mesesMap[mB], 1).getTime()
      );
    });

    const oldestPending = sortedHistoryAsc.find(
      (h) => h.registro_pagos_personas[nombre] === false,
    );
    
    const mesInicio = oldestPending ? oldestPending.mes_anio : history.mes_anio;
    const initialMontoSugerido = oldestPending?.cuotas_momento?.[nombre] ?? cuotaBase;
    const esProrrateado = initialMontoSugerido !== cuotaBase && initialMontoSugerido > 0;
    const esGratisPorInicio = initialMontoSugerido === 0 && cuotaBase > 0;

    setPayingParticipant({
      nombre,
      monto: initialMontoSugerido.toString(),
      montoSugerido: initialMontoSugerido,
      meses: 1,
      mesInicio,
      notaProrrateo: esProrrateado
        ? "Monto proporcional por ingreso tardío"
        : esGratisPorInicio
          ? "Mes de cortesía por ingreso tardío (menos de 5 días)"
          : undefined,
    });
  };

  const confirmPayment = async () => {
    if (!payingParticipant) return;
    
    setIsSuccess(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      const finalMonto = parseFloat(payingParticipant.monto) || 0;
      if (onAdvancePayment && payingParticipant.meses > 1) {
        onAdvancePayment(payingParticipant.nombre, payingParticipant.meses);
      } else if (onTogglePayment) {
        onTogglePayment(payingParticipant.nombre, finalMonto);
      }
      setPayingParticipant(null);
      setIsSuccess(false);
    }, 800);
  };

  return (
    <EVAModal
      visible={visible}
      onClose={payingParticipant ? () => setPayingParticipant(null) : onClose}
      title={payingParticipant ? `Pago de ${payingParticipant.nombre}` : `Detalle de ${history.mes_anio}`}
      secondaryButtonText={payingParticipant ? "Volver" : "Cerrar"}
      primaryButtonText={payingParticipant ? "Confirmar Pago" : undefined}
      onPrimaryAction={payingParticipant ? confirmPayment : undefined}
      isSuccess={isSuccess}
    >
      {payingParticipant ? (
        <ParticipantPaymentView
          data={payingParticipant}
          setData={setPayingParticipant}
          frecuencia={frecuencia}
          historial_pagos={historial_pagos}
          suscriptores={suscriptores}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
          {/* Resumen Card */}
          <View style={{ backgroundColor: `${colors.primary}10`, padding: 16, borderRadius: 20, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <View>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.family.regular, fontSize: 10, textTransform: "uppercase" }}>Costo del Servicio</Text>
                <Text style={{ color: colors.text, fontFamily: fonts.family.bold, fontSize: 18 }}>S/ {history.costo_servicio_momento.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.family.regular, fontSize: 10, textTransform: "uppercase" }}>Estado del Pago</Text>
                <View style={{ backgroundColor: history.fecha_real_pago ? `${colors.income}15` : `${colors.warning}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 }}>
                  <Text style={{ color: history.fecha_real_pago ? colors.income : colors.warning, fontFamily: fonts.family.bold, fontSize: 10 }}>
                    {history.fecha_real_pago ? "PAGADO" : "PENDIENTE"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: `${colors.text}10`, marginBottom: 16 }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.family.regular, fontSize: 10, textTransform: "uppercase" }}>{history.es_compartido_momento ? "Recaudado" : "Total Recaudado"}</Text>
                <Text style={{ color: colors.income, fontFamily: fonts.family.bold, fontSize: 16 }}>S/ {totalRecaudado.toFixed(2)}</Text>
              </View>
              {history.fecha_real_pago ? (
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: colors.textSecondary, fontFamily: fonts.family.regular, fontSize: 10, textTransform: "uppercase" }}>Pagado al Banco</Text>
                  <Text style={{ color: colors.primary, fontFamily: fonts.family.bold, fontSize: 16 }}>S/ {(history.monto_pagado_banco || history.costo_servicio_momento).toFixed(2)}</Text>
                </View>
              ) : history.es_compartido_momento ? (
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: colors.textSecondary, fontFamily: fonts.family.regular, fontSize: 10, textTransform: "uppercase" }}>{miGasto < 0 ? "Saldo Favor" : "Tu Gasto"}</Text>
                  <Text style={{ color: colors.text, fontFamily: fonts.family.bold, fontSize: 16 }}>S/ {Math.abs(miGasto).toFixed(2)}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Detalles del Pago al Banco */}
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.family.semiBold, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Información Bancaria</Text>
          <View style={{ backgroundColor: colors.card, padding: 16, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: `${colors.text}05` }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.primary}10`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name={actualAccount?.icono || "card-outline"} size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.family.regular, fontSize: 10 }}>Cuenta utilizada</Text>
                <Text style={{ color: colors.text, fontFamily: fonts.family.bold, fontSize: 14 }}>{actualAccount?.nombre || "No especificada"}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.income}10`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="calendar-outline" size={20} color={colors.income} />
              </View>
              <View>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.family.regular, fontSize: 10 }}>Fecha de confirmación</Text>
                <Text style={{ color: colors.text, fontFamily: fonts.family.bold, fontSize: 14 }}>
                  {history.fecha_real_pago ? new Date(history.fecha_real_pago).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "Sin registrar"}
                </Text>
              </View>
            </View>
          </View>

          {/* Lista de Participantes (Solo si el mes fue compartido) */}
          {history.es_compartido_momento && (
            <>
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.family.semiBold, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Control de pagos</Text>
              {Object.keys(history.registro_pagos_personas || {}).map((nombre, idx) => {
                const haPagado = history.registro_pagos_personas[nombre];
                const montoPagado = history.montos_pagados?.[nombre] || 0;
                const cuotaSugerida = history.cuotas_momento?.[nombre] || 0;
                const sub = suscriptores.find(s => s.nombre === nombre);
                const color = sub?.color || colors.primary;

                return (
                  <TouchableOpacity 
                    key={idx} 
                    onPress={() => haPagado ? (onTogglePayment && onTogglePayment(nombre)) : handleStartPayment(nombre)}
                    activeOpacity={0.7}
                    style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.card, padding: 12, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: `${colors.text}05` }}
                  >
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${color}15`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                      <Text style={{ color: color, fontFamily: fonts.family.bold, fontSize: 12 }}>{nombre.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontFamily: fonts.family.bold, fontSize: 13 }}>{nombre}</Text>
                      <Text style={{ color: colors.textSecondary, fontFamily: fonts.family.regular, fontSize: 11 }}>
                        {haPagado ? `Pagó S/ ${montoPagado.toFixed(2)}` : `Debe S/ ${cuotaSugerida.toFixed(2)}`}
                      </Text>
                    </View>
                    {haPagado ? (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={24} 
                        color={colors.income} 
                      />
                    ) : (
                      <View style={{ backgroundColor: `${colors.primary}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ color: colors.primary, fontFamily: fonts.family.bold, fontSize: 10 }}>PAGAR</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </ScrollView>
      )}
    </EVAModal>
  );
};

export default MonthDetailModal;
