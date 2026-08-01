import React, { useState } from "react";
import { View, Text } from "react-native";
import {
  PaymentHistory,
  Subscriber,
} from "../../../../interfaces/Subscription";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import MonthDetailModal from "./MonthDetailModal";
import { sumValues } from "../../../../logic/shared/serviceHistoryUtils";
import { compareMesAnioAsc } from "../../../../logic/shared/serviceUtils";
import { HistoryListView } from "./HistoryListView";
import { ParticipantPaymentModal } from "./ParticipantPaymentModal";
import { MonthCarousel } from "./MonthCarousel";
import { ServiceSummaryCard } from "./ServiceSummaryCard";
import { SharedParticipantsList } from "./SharedParticipantsList";

interface Account {
  id: string;
  nombre: string;
  icono?: string;
}

interface ServiceHistoryProps {
  historial_pagos: PaymentHistory[];
  suscriptores: Subscriber[];
  screenWidth: number;
  onTogglePayment: (subscriberId: string, monto?: number, monthIndex?: number) => void;
  accounts: Account[];
  currentAccount: Account;
  serviceStatus: { label: string; status: string };
  onPayService: () => void;
  selectedMonthIndex: number;
  onChangeMonth: (index: number) => void;
  diaCobro: number;
  onAdvancePayment: (subscriberId: string, months: number) => void;
  onRemindParticipant: (subscriberId: string) => void;
  frecuencia: "mensual" | "anual";
  es_compartido: boolean;
  setIsTabScrollEnabled?: (val: boolean) => void;
}

export const ServiceHistory: React.FC<ServiceHistoryProps> = ({
  historial_pagos,
  suscriptores,
  screenWidth,
  onTogglePayment,
  accounts,
  currentAccount,
  serviceStatus,
  onPayService,
  selectedMonthIndex,
  onChangeMonth,
  onAdvancePayment,
  onRemindParticipant,
  frecuencia,
  es_compartido,
  setIsTabScrollEnabled,
}) => {
  const { colors, fonts } = useAppTheme();
  const [showFullHistory, setShowFullHistory] = useState(false);

  const [paymentModal, setPaymentModal] = useState<{
    visible: boolean;
    id: string;
    nombre: string;
    monto: string;
    montoSugerido: number;
    meses: number;
    haPagado: boolean;
    mesInicio?: string;
    notaProrrateo?: string;
  }>({
    visible: false,
    id: "",
    nombre: "",
    monto: "0",
    montoSugerido: 0,
    meses: 1,
    haPagado: false,
  });

  const [monthDetail, setMonthDetail] = useState<{
    visible: boolean;
    mesAnio: string | null;
  }>({ visible: false, mesAnio: null });

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );

  const currentMonth =
    (historial_pagos && historial_pagos[selectedMonthIndex]) ||
    (historial_pagos && historial_pagos[0]);

  if (!currentMonth) return null;

  const totalRecaudado = sumValues(currentMonth.montos_pagados);
  const miCostoFinal =
    (currentMonth?.costo_servicio_momento || 0) - totalRecaudado;

  const activeMonthDetail = historial_pagos.find(h => h.mes_anio === monthDetail.mesAnio);

  const handleToggleRequest = (subscriberId: string, haPagado: boolean) => {
    const sub = suscriptores.find((s) => s.id === subscriberId);

    if (haPagado) {
      onTogglePayment(subscriberId);
    } else {
      const cuotaBase = sub?.cuota || 0;

      const sortedHistoryAsc = [...historial_pagos].sort((a, b) =>
        compareMesAnioAsc(a.mes_anio, b.mes_anio),
      );

      const oldestPending = sortedHistoryAsc.find(
        (h) => h.registro_pagos_personas[subscriberId] === false,
      );
      const mesInicio = oldestPending
        ? oldestPending.mes_anio
        : currentMonth.mes_anio;

      const initialMontoSugerido =
        oldestPending?.cuotas_momento?.[subscriberId] ?? cuotaBase;
      const esProrrateado =
        initialMontoSugerido !== cuotaBase && initialMontoSugerido > 0;
      const esGratisPorInicio = initialMontoSugerido === 0 && cuotaBase > 0;

      setPaymentModal({
        visible: true,
        id: subscriberId,
        nombre: sub?.nombre || "",
        monto: initialMontoSugerido.toString(),
        montoSugerido: initialMontoSugerido,
        meses: 1,
        haPagado: false,
        mesInicio,
        notaProrrateo: esProrrateado
          ? "Monto proporcional por ingreso tardío"
          : esGratisPorInicio
            ? "Mes de cortesía por ingreso tardío (menos de 5 días)"
            : undefined,
      });
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 24, width: screenWidth }}>
      {showFullHistory ? (
        <HistoryListView
          historial_pagos={historial_pagos}
          showFullHistory={showFullHistory}
          setShowFullHistory={setShowFullHistory}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          accounts={accounts}
          currentAccount={currentAccount}
          setMonthDetail={(val: any) => setMonthDetail({ visible: val.visible, mesAnio: val.history?.mes_anio })}
          suscriptores={suscriptores}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <ServiceSummaryCard
            currentMonth={currentMonth}
            historial_pagos={historial_pagos}
            frecuencia={frecuencia}
            totalRecaudado={totalRecaudado}
            miCostoFinal={miCostoFinal}
            accounts={accounts}
            currentAccount={currentAccount}
            serviceStatus={serviceStatus}
            onPayService={onPayService}
            onExpandHistory={() => setShowFullHistory(true)}
          />

          <View style={{ flex: 1 }}>
            {es_compartido ? (
              <>
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: fonts.family.semiBold,
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    CONTROL DE PAGO
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      paddingVertical: 6,
                    }}
                  >
                    <MonthCarousel
                      historial_pagos={historial_pagos}
                      selectedMonthIndex={selectedMonthIndex}
                      onChangeMonth={onChangeMonth}
                      setIsTabScrollEnabled={setIsTabScrollEnabled}
                    />
                  </View>
                </View>

                <SharedParticipantsList
                  currentMonth={currentMonth}
                  historial_pagos={historial_pagos}
                  suscriptores={suscriptores}
                  onToggleRequest={handleToggleRequest}
                  onRemindParticipant={onRemindParticipant}
                />
              </>
            ) : (
              <HistoryListView
                historial_pagos={historial_pagos}
                showFullHistory={false}
                setShowFullHistory={() => {}}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                accounts={accounts}
                currentAccount={currentAccount}
                setMonthDetail={(val: any) => setMonthDetail({ visible: val.visible, mesAnio: val.history?.mes_anio })}
                isInline={true}
                suscriptores={suscriptores}
              />
            )}
          </View>
        </View>
      )}

      {/* Modales de Historial */}
      <ParticipantPaymentModal
        paymentModal={paymentModal}
        setPaymentModal={setPaymentModal}
        frecuencia={frecuencia}
        historial_pagos={historial_pagos}
        suscriptores={suscriptores}
        onTogglePayment={onTogglePayment}
        onAdvancePayment={onAdvancePayment}
      />

      <MonthDetailModal
        visible={monthDetail.visible}
        onClose={() => setMonthDetail({ visible: false, mesAnio: null })}
        history={activeMonthDetail || null}
        suscriptores={suscriptores}
        accounts={accounts}
        historial_pagos={historial_pagos}
        frecuencia={frecuencia}
        onTogglePayment={onTogglePayment}
        onAdvancePayment={onAdvancePayment}
      />
    </View>
  );
};

export default ServiceHistory;
