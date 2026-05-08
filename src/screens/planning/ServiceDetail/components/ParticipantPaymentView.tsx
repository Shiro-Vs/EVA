import React from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

interface ParticipantPaymentViewProps {
  data: {
    nombre: string;
    monto: string;
    montoSugerido: number;
    meses: number;
    mesInicio: string;
    notaProrrateo?: string;
  };
  setData: (val: any | ((prev: any) => any)) => void;
  frecuencia: string;
  historial_pagos: PaymentHistory[];
  suscriptores: Subscriber[];
}

export const ParticipantPaymentView: React.FC<ParticipantPaymentViewProps> = ({
  data,
  setData,
  frecuencia,
  historial_pagos,
  suscriptores,
}) => {
  const { colors } = useAppTheme();

  const mesesMap: Record<string, number> = {
    Enero: 0, Febrero: 1, Marzo: 2, Abril: 3, Mayo: 4, Junio: 5,
    Julio: 6, Agosto: 7, Septiembre: 8, Octubre: 9, Noviembre: 10, Diciembre: 11,
  };

  const sortedHistoryAsc = [...(historial_pagos || [])].sort((a, b) => {
    const [mA, yA] = a.mes_anio.split(" ");
    const [mB, yB] = b.mes_anio.split(" ");
    return (
      new Date(parseInt(yA), mesesMap[mA], 1).getTime() -
      new Date(parseInt(yB), mesesMap[mB], 1).getTime()
    );
  });

  const handleIncrement = () => {
    const newMeses = data.meses + 1;
    
    // Check if next month exists and is shared
    const startIndex = sortedHistoryAsc.findIndex(h => h.mes_anio === data.mesInicio);
    if (startIndex === -1) return;
    
    const nextHist = sortedHistoryAsc[startIndex + newMeses - 1];
    if (!nextHist) return; // No more months
    
    // CONSTRAINT: Cannot advance if the month is NOT shared (individual)
    if (nextHist.es_compartido_momento === false) {
      // Maybe show a hint or just block
      return;
    }

    const nuevoMonto = calculateTotalMonto(
      data.nombre,
      newMeses,
      data.mesInicio,
      historial_pagos,
      suscriptores,
    );

    const sub = suscriptores.find((s: any) => s.nombre === data.nombre);
    const nuevaCuotaSugerida = nextHist?.cuotas_momento?.[data.nombre] ?? (sub?.cuota || 0);

    setData((p: any) => ({
      ...p,
      meses: newMeses,
      monto: nuevoMonto.toString(),
      montoSugerido: nuevaCuotaSugerida,
    }));
  };

  const handleDecrement = () => {
    const newMeses = Math.max(1, data.meses - 1);
    const nuevoMonto = calculateTotalMonto(
      data.nombre,
      newMeses,
      data.mesInicio,
      historial_pagos,
      suscriptores,
    );

    const startIndex = sortedHistoryAsc.findIndex(h => h.mes_anio === data.mesInicio);
    const lastHist = startIndex !== -1 ? sortedHistoryAsc[startIndex + newMeses - 1] : null;
    const sub = suscriptores.find((s: any) => s.nombre === data.nombre);
    const nuevaCuotaSugerida = lastHist?.cuotas_momento?.[data.nombre] ?? (sub?.cuota || 0);

    setData((p: any) => ({
      ...p,
      meses: newMeses,
      monto: nuevoMonto.toString(),
      montoSugerido: nuevaCuotaSugerida,
    }));
  };

  return (
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
        <Text style={{ color: colors.income, fontFamily: "AsapBold", fontSize: 11, marginBottom: 2 }}>
          PERIODO DE COBERTURA
        </Text>
        <Text style={{ color: colors.textSecondary, fontFamily: "AsapMedium", fontSize: 10 }}>
          Este pago cubrirá desde{" "}
          <Text style={{ color: colors.text, fontFamily: "AsapBold" }}>{data.mesInicio}</Text>
          {(data.meses > 1 || getMesFin(data.mesInicio, data.meses, frecuencia, historial_pagos) !== data.mesInicio) && (
            <>
              {" hasta "}
              <Text style={{ color: colors.text, fontFamily: "AsapBold" }}>
                {getMesFin(data.mesInicio, data.meses, frecuencia, historial_pagos)}
              </Text>
            </>
          )}
        </Text>
      </View>

      {data.notaProrrateo && (
        <View style={{ backgroundColor: `${colors.primary}10`, padding: 10, borderRadius: 12, marginBottom: 20, flexDirection: "row", alignItems: "center", borderLeftWidth: 4, borderLeftColor: colors.primary }}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.primary, fontFamily: "AsapSemiBold", fontSize: 10, flex: 1 }}>{data.notaProrrateo}</Text>
        </View>
      )}

      <Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Monto Recibido</Text>
      <View style={{ backgroundColor: colors.card, padding: 12, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <View>
          <Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 9 }}>CUOTA SUGERIDA</Text>
          <Text style={{ color: colors.textSecondary, fontFamily: "AsapBold", fontSize: 16 }}>S/ {data.montoSugerido.toFixed(2)}</Text>
        </View>
        <Ionicons name="arrow-forward-outline" size={18} color={colors.muted} />
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 9, marginBottom: 4 }}>MONTO REAL</Text>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${colors.text}08`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
            <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 18, marginRight: 4 }}>S/</Text>
            <TextInput
              value={data.monto}
              onChangeText={(val) => setData({ ...data, monto: val })}
              keyboardType="decimal-pad"
              style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 18, minWidth: 70, textAlign: "right" }}
            />
          </View>
        </View>
      </View>

      <Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Periodos a Pagar</Text>
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${colors.text}08`, padding: 8, borderRadius: 16, justifyContent: "space-between" }}>
        <TouchableOpacity
          onPress={handleDecrement}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: colors.card, borderRadius: 12 }}
        >
          <Ionicons name="remove" size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 16, textAlign: "center" }}>
            {getPeriodDisplayLabel(data.mesInicio, data.meses, frecuencia, historial_pagos)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleIncrement}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: colors.card, borderRadius: 12 }}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
