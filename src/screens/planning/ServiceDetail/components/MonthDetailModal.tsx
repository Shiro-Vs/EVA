import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EVAModal from "../../../../components/common/EVAModal";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { PaymentHistory, Subscriber } from "../../../../interfaces/Subscription";

interface MonthDetailModalProps {
  visible: boolean;
  onClose: () => void;
  history: PaymentHistory | null;
  suscriptores: Subscriber[];
  accounts: any[];
}

export const MonthDetailModal: React.FC<MonthDetailModalProps> = ({
  visible,
  onClose,
  history,
  suscriptores,
  accounts,
}) => {
  const { colors } = useAppTheme();

  if (!history) return null;

  const sumValues = (obj: any) => Object.values(obj || {}).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
  const totalRecaudado = sumValues(history.montos_pagados);
  const miGasto = (history.costo_servicio_momento || 0) - totalRecaudado;
  const actualAccount = accounts.find((a: any) => a.id === history.id_cuenta_pago_real);

  return (
    <EVAModal
      visible={visible}
      onClose={onClose}
      title={`Detalle de ${history.mes_anio}`}
      secondaryButtonText="Cerrar"
    >
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
        {/* Resumen Card */}
        <View style={{ backgroundColor: `${colors.primary}10`, padding: 16, borderRadius: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <View>
              <Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 10, textTransform: "uppercase" }}>Costo del Mes</Text>
              <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 18 }}>S/ {history.costo_servicio_momento.toFixed(2)}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 10, textTransform: "uppercase" }}>Estado del Pago</Text>
              <View style={{ backgroundColor: history.fecha_real_pago ? `${colors.income}15` : `${colors.warning}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 }}>
                <Text style={{ color: history.fecha_real_pago ? colors.income : colors.warning, fontFamily: "AsapBold", fontSize: 10 }}>
                  {history.fecha_real_pago ? "PAGADO" : "PENDIENTE"}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: `${colors.text}10`, marginBottom: 16 }} />

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 10, textTransform: "uppercase" }}>Recaudado</Text>
              <Text style={{ color: colors.income, fontFamily: "AsapBold", fontSize: 16 }}>S/ {totalRecaudado.toFixed(2)}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 10, textTransform: "uppercase" }}>{miGasto < 0 ? "Saldo Favor" : "Tu Gasto"}</Text>
              <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 16 }}>S/ {Math.abs(miGasto).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Detalles del Pago al Banco */}
        <Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Información Bancaria</Text>
        <View style={{ backgroundColor: colors.card, padding: 16, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: `${colors.text}05` }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.primary}10`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <Ionicons name={actualAccount?.icono || "card-outline"} size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 10 }}>Cuenta utilizada</Text>
              <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 14 }}>{actualAccount?.nombre || "No especificada"}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.income}10`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <Ionicons name="calendar-outline" size={20} color={colors.income} />
            </View>
            <View>
              <Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 10 }}>Fecha de confirmación</Text>
              <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 14 }}>
                {history.fecha_real_pago ? new Date(history.fecha_real_pago).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "Sin registrar"}
              </Text>
            </View>
          </View>
        </View>

        {/* Lista de Participantes */}
        <Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Detalle de Participantes</Text>
        {Object.keys(history.registro_pagos_personas || {}).map((nombre, idx) => {
          const haPagado = history.registro_pagos_personas[nombre];
          const montoPagado = history.montos_pagados?.[nombre] || 0;
          const cuotaSugerida = history.cuotas_momento?.[nombre] || 0;
          const sub = suscriptores.find(s => s.nombre === nombre);
          const color = sub?.color || colors.primary;

          return (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.card, padding: 12, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: `${colors.text}05` }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${color}15`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Text style={{ color: color, fontFamily: "AsapBold", fontSize: 12 }}>{nombre.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 13 }}>{nombre}</Text>
                <Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 11 }}>
                  {haPagado ? `Pagó S/ ${montoPagado.toFixed(2)}` : `Debe S/ ${cuotaSugerida.toFixed(2)}`}
                </Text>
              </View>
              <Ionicons 
                name={haPagado ? "checkmark-circle" : "time-outline"} 
                size={20} 
                color={haPagado ? colors.income : colors.muted} 
              />
            </View>
          );
        })}
      </ScrollView>
    </EVAModal>
  );
};

export default MonthDetailModal;
