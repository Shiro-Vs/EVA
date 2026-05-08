import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  PaymentHistory,
  Subscriber,
} from "../../../../interfaces/Subscription";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import EVAModal from "../../../../components/common/EVAModal";
import MonthDetailModal from "./MonthDetailModal";
import { sumValues, getMesFin } from "../../../../logic/serviceHistoryUtils";
import { HistoryListView } from "./HistoryListView";
import { ParticipantPaymentModal } from "./ParticipantPaymentModal";
import { ParticipantTimeline } from "../../../../components/common/ParticipantTimeline";
import { MonthCarousel } from "./MonthCarousel";

interface ServiceHistoryProps {
  historial_pagos: PaymentHistory[];
  suscriptores: Subscriber[];
  screenWidth: number;
  onTogglePayment: (nombre: string, monto?: number) => void;
  accounts: any[];
  currentAccount: any;
  serviceStatus: { label: string; status: string };
  onPayService: () => void;
  selectedMonthIndex: number;
  onChangeMonth: (index: number) => void;
  diaCobro: number;
  onAdvancePayment: (nombre: string, months: number) => void;
  onRemindParticipant: (nombre: string) => void;
  frecuencia: "mensual" | "anual";
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
  diaCobro,
  onAdvancePayment,
  onRemindParticipant,
  frecuencia,
  setIsTabScrollEnabled,
}) => {
  const { colors } = useAppTheme();
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const [paymentModal, setPaymentModal] = useState<{
    visible: boolean;
    nombre: string;
    monto: string;
    montoSugerido: number;
    meses: number;
    haPagado: boolean;
    mesInicio?: string;
    notaProrrateo?: string;
  }>({
    visible: false,
    nombre: "",
    monto: "0",
    montoSugerido: 0,
    meses: 1,
    haPagado: false,
  });

  const [monthDetail, setMonthDetail] = useState<{
    visible: boolean;
    history: PaymentHistory | null;
  }>({ visible: false, history: null });

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

  const handleToggleRequest = (nombre: string, haPagado: boolean) => {
    const sub = suscriptores.find((s: any) => s.nombre === nombre);

    if (haPagado) {
      onTogglePayment(nombre);
    } else {
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
      const mesInicio = oldestPending
        ? oldestPending.mes_anio
        : currentMonth.mes_anio;

      const initialMontoSugerido =
        oldestPending?.cuotas_momento?.[nombre] ?? cuotaBase;
      const esProrrateado =
        initialMontoSugerido !== cuotaBase && initialMontoSugerido > 0;
      const esGratisPorInicio = initialMontoSugerido === 0 && cuotaBase > 0;

      setPaymentModal({
        visible: true,
        nombre,
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

  const getUserStatus = (persona: string) => {
    const haPagado = currentMonth.registro_pagos_personas?.[persona];
    const sub = suscriptores.find((s: any) => s.nombre === persona);

    if (haPagado)
      return { bgColor: `${colors.income}15`, textColor: colors.income, label: "PAGADO" };
    if (sub?.es_cortesia)
      return { bgColor: `${colors.warning}15`, textColor: colors.warning, label: "CORTESÍA" };
    return { bgColor: `${colors.textSecondary}10`, textColor: colors.textSecondary, label: "PENDIENTE" };
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
          setMonthDetail={setMonthDetail}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <View
            style={{
              backgroundColor:
                serviceStatus.status === "success"
                  ? colors.income
                  : colors.expense,
              borderRadius: 24,
              padding: 16,
              marginBottom: 16,
              shadowColor: colors.text,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
              position: "relative",
            }}
          >
            <TouchableOpacity
              onPress={() => setShowFullHistory(true)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 40,
                height: 40,
                backgroundColor: `${colors.background}33`,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={"time" as any}
                size={20}
                color={colors.background}
              />
            </TouchableOpacity>
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  color: `${colors.background}B3`,
                  fontFamily: "AsapSemiBold",
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
                    color: colors.background,
                    fontFamily: "AsapBold",
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
                      backgroundColor: `${colors.background}20`,
                      alignSelf: "flex-start",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Ionicons
                      name={
                        currentMonth.frecuencia_momento === "anual"
                          ? "shield-checkmark"
                          : "repeat"
                      }
                      size={12}
                      color={colors.background}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color: colors.background,
                        fontFamily: "AsapSemiBold",
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
              {(() => {
                const actualAccount =
                  accounts.find(
                    (a: any) => a.id === currentMonth.id_cuenta_pago_real,
                  ) || currentAccount;
                return (
                  <>
                    <Ionicons
                      name={(actualAccount?.icono || "card-outline") as any}
                      size={12}
                      color={colors.background}
                    />
                    <Text
                      style={{
                        color: `${colors.background}CC`,
                        fontFamily: "AsapSemiBold",
                        fontSize: 10,
                        marginLeft: 4,
                      }}
                    >
                      {currentMonth.fecha_real_pago
                        ? "Pagado con: "
                        : "Pago desde: "}
                      {actualAccount?.nombre || "N/A"}
                    </Text>
                  </>
                );
              })()}
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
                        color: `${colors.background}99`,
                        fontFamily: "Asap",
                        fontSize: 9,
                        textTransform: "uppercase",
                      }}
                    >
                      Costo Total
                    </Text>
                    <Text
                      style={{
                        color: colors.background,
                        fontFamily: "AsapBold",
                        fontSize: 14,
                      }}
                    >
                      S/ {(currentMonth.costo_servicio_momento || 0).toFixed(2)}
                    </Text>
                  </View>
                  {currentMonth?.es_compartido_momento !== false && (
                    <View>
                      <Text
                        style={{
                          color: `${colors.background}99`,
                          fontFamily: "Asap",
                          fontSize: 9,
                          textTransform: "uppercase",
                        }}
                      >
                        Recaudado
                      </Text>
                      <Text
                        style={{
                          color: colors.background,
                          fontFamily: "AsapBold",
                          fontSize: 14,
                        }}
                      >
                        S/ {(totalRecaudado || 0).toFixed(2)}
                      </Text>
                    </View>
                  )}
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        color: `${colors.background}99`,
                        fontFamily: "Asap",
                        fontSize: 9,
                        textTransform: "uppercase",
                      }}
                    >
                      {currentMonth?.es_compartido_momento === false
                        ? "Total"
                        : miCostoFinal < 0
                          ? "Saldo"
                          : "Tu Gasto"}
                    </Text>
                    <Text
                      style={{
                        color: colors.background,
                        fontFamily: "AsapBold",
                        fontSize: 14,
                      }}
                    >
                      S/ {(Math.abs(miCostoFinal) || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: `${colors.background}40`,
                    height: 6,
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colors.background,
                      height: "100%",
                      width: `${Math.min(((totalRecaudado || 0) / (currentMonth?.costo_servicio_momento || 1)) * 100, 100)}%`,
                    }}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={onPayService}
                style={{
                  backgroundColor: colors.background,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: "AsapBold",
                    fontSize: 12,
                    color:
                      serviceStatus.status === "success"
                        ? colors.income
                        : colors.expense,
                  }}
                >
                  {serviceStatus.status === "success" ? "EDITAR" : "PAGAR"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View style={{ flex: 1 }}>
              {currentMonth.es_compartido_momento !== false && (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: "AsapSemiBold",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  CONTROL DE PAGO
                </Text>
              )}
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
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {Object.keys(currentMonth?.registro_pagos_personas || {}).map(
              (nombre, idx) => {
                const activeSub = suscriptores.find(
                  (s: any) => s.nombre === nombre,
                );
                const cuotaHistorica =
                  currentMonth.cuotas_momento?.[nombre] ??
                  (activeSub?.cuota || 0);
                const eraCortesia =
                  cuotaHistorica === 0 || activeSub?.es_cortesia === true;
                const status = eraCortesia
                  ? {
                      bgColor: `#8E44AD15`,
                      textColor: `#8E44AD`,
                      label: "CORTESÍA",
                      icon: "gift",
                    }
                  : getUserStatus(nombre);
                const haPagado = currentMonth.registro_pagos_personas?.[nombre];
                const montoPagado = currentMonth.montos_pagados?.[nombre] || 0;
                const displayColor = activeSub?.color || colors.textSecondary;

                const bgColor = haPagado 
                  ? `${colors.income}10` 
                  : eraCortesia 
                    ? colors.card 
                    : `${colors.warning}10`;

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() =>
                      !eraCortesia && handleToggleRequest(nombre, !!haPagado)
                    }
                    style={{
                      backgroundColor: bgColor,
                      borderRadius: 16,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      marginBottom: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      opacity: eraCortesia ? 0.8 : 1,
                    }}
                    activeOpacity={eraCortesia ? 1 : 0.7}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
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
                        <Text
                          style={{
                            fontFamily: "AsapBold",
                            fontSize: 14,
                            color: displayColor,
                          }}
                        >
                          {nombre.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text
                          style={{
                            color: colors.text,
                            fontFamily: "AsapBold",
                            fontSize: 14,
                          }}
                        >
                          {nombre}
                        </Text>
                        
                        <View style={{ marginTop: 0, marginBottom: 2 }}>
                          <ParticipantTimeline 
                            nombre={nombre} 
                            historial_pagos={historial_pagos} 
                            mesInicio={currentMonth.mes_anio} 
                          />
                        </View>
                        
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text
                            style={{
                              color: colors.textSecondary,
                              fontFamily: "Asap",
                              fontSize: 12,
                            }}
                          >
                            {haPagado
                              ? `S/ ${montoPagado.toFixed(2)}`
                              : `S/ ${eraCortesia ? "0.00" : cuotaHistorica.toFixed(2)}`}
                          </Text>
                          {haPagado && montoPagado !== cuotaHistorica && (
                            <Text
                              style={{
                                color: `${colors.text}30`,
                                fontFamily: "Asap",
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
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
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
                        {(status as any).icon && (
                          <Ionicons
                            name={(status as any).icon}
                            size={10}
                            color={status.textColor}
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          style={{
                            color: status.textColor,
                            fontFamily: "AsapBold",
                            fontSize: 8,
                            textTransform: "uppercase",
                          }}
                        >
                          {status.label}
                        </Text>
                      </View>
                      {!eraCortesia && (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          {!haPagado && (
                            <TouchableOpacity
                              onPress={() => onRemindParticipant(nombre)}
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
                              <Ionicons
                                name="logo-whatsapp"
                                size={16}
                                color={colors.income}
                              />
                            </TouchableOpacity>
                          )}
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: haPagado
                                ? colors.income
                                : "transparent",
                              borderWidth: haPagado ? 0 : 2,
                              borderColor: colors.border,
                            }}
                          >
                            {haPagado && (
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color={colors.background}
                              />
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              },
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
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

      <EVAModal
        visible={isFilterModalVisible}
        title="Seleccionar Periodo"
        onClose={() => setIsFilterModalVisible(false)}
        secondaryButtonText="Cerrar"
      >
        <View style={{ paddingVertical: 8 }}>
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
            Historial Disponible
          </Text>
          <ScrollView
            style={{ maxHeight: 320 }}
            showsVerticalScrollIndicator={false}
          >
            {(historial_pagos || []).map((hist: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  onChangeMonth(idx);
                  setIsFilterModalVisible(false);
                  setShowFullHistory(false);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  marginBottom: 8,
                  borderRadius: 16,
                  backgroundColor:
                    selectedMonthIndex === idx
                      ? `${colors.primary}15`
                      : colors.card,
                  borderWidth: 1,
                  borderColor:
                    selectedMonthIndex === idx ? colors.primary : "transparent",
                }}
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
                      backgroundColor:
                        selectedMonthIndex === idx
                          ? `${colors.primary}20`
                          : colors.background,
                    }}
                  >
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={
                        selectedMonthIndex === idx
                          ? colors.primary
                          : colors.textSecondary
                      }
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: "AsapBold",
                      fontSize: 16,
                      color:
                        selectedMonthIndex === idx
                          ? colors.primary
                          : colors.text,
                    }}
                  >
                    {hist.mes_anio}
                  </Text>
                </View>
                {selectedMonthIndex === idx && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </EVAModal>

      <MonthDetailModal
        visible={monthDetail.visible}
        onClose={() => setMonthDetail({ visible: false, history: null })}
        history={monthDetail.history}
        suscriptores={suscriptores}
        accounts={accounts}
      />
    </View>
  );
};

export default ServiceHistory;
