import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  PaymentHistory,
  Subscriber,
} from "../../../../interfaces/Subscription";
import EVAModal from "../../../../components/common/EVAModal";

interface ServiceHistoryProps {
  historial_pagos: PaymentHistory[];
  suscriptores: Subscriber[];
  screenWidth: number;
  onTogglePayment: (nombre: string, monto?: number) => void;
  accounts: any[];
  serviceStatus: { color: string; label: string; status: string };
  onPayService: () => void;
  selectedMonthIndex: number;
  onChangeMonth: (index: number) => void;
  diaCobro: number;
  onAdvancePayment?: (nombre: string, months: number) => void;
}

const ServiceHistory: React.FC<ServiceHistoryProps> = ({
  historial_pagos,
  suscriptores,
  screenWidth,
  onTogglePayment,
  accounts,
  serviceStatus,
  onPayService,
  selectedMonthIndex,
  onChangeMonth,
  diaCobro,
  onAdvancePayment,
}) => {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [modalView, setModalView] = useState<"confirm" | "accounts">("confirm");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(
    new Date().getFullYear().toString(),
  );

  useEffect(() => {
    const backAction = () => {
      if (showFullHistory) {
        setShowFullHistory(false);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, [showFullHistory]);

  const [paymentModal, setPaymentModal] = useState<{
    visible: boolean;
    nombre: string;
    monto: string;
    montoSugerido: number;
    meses: number;
    haPagado: boolean;
  }>({
    visible: false,
    nombre: "",
    monto: "0",
    montoSugerido: 0,
    meses: 1,
    haPagado: false,
  });

  const handleToggleRequest = (nombre: string, haPagado: boolean) => {
    // Verificar si es cortesía: bloquear cualquier interacción
    const sub = suscriptores.find((s) => s.nombre === nombre);
    if (sub?.es_cortesia) return;

    if (haPagado) {
      // Si ya pagó, al tocarlo simplemente lo desmarcamos
      onTogglePayment(nombre);
    } else {
      // Si no ha pagado, abrimos el modal
      const cuotaSugerida =
        currentMonth.cuotas_momento?.[nombre] ||
        suscriptores.find((s) => s.nombre === nombre)?.cuota ||
        0;
      setPaymentModal({
        visible: true,
        nombre,
        monto: cuotaSugerida.toString(),
        montoSugerido: cuotaSugerida,
        meses: 1,
        haPagado: false,
      });
    }
  };

  const confirmPayment = () => {
    const finalMonto = parseFloat(paymentModal.monto) || 0;
    if (paymentModal.meses > 1 && onAdvancePayment) {
      // Nota: Para adelantos, por ahora usamos la cuota sugerida x meses
      // pero el usuario podría querer un monto total manual.
      // Por simplicidad, si es adelanto, ignoramos el monto manual y usamos la lógica de meses.
      onAdvancePayment(paymentModal.nombre, paymentModal.meses);
    } else {
      onTogglePayment(paymentModal.nombre, finalMonto);
    }
    setPaymentModal({ ...paymentModal, visible: false });
  };

  // Lógica de filtrado por año
  const availableYears = Array.from(
    new Set(
      (historial_pagos || []).map((h) => h.mes_anio.split(" ").pop() || ""),
    ),
  )
    .sort()
    .reverse();
  const filteredHistory = (historial_pagos || []).filter((h) => {
    if (!selectedYear) return true;
    return h.mes_anio.endsWith(selectedYear);
  });

  const currentMonth =
    (historial_pagos && historial_pagos[selectedMonthIndex]) ||
    (historial_pagos && historial_pagos[0]);

  if (!currentMonth) {
    return (
      <View
        style={{ width: screenWidth }}
        className="px-6 items-center justify-center py-20"
      >
        <Text className="text-text-secondary font-asap">
          No hay historial disponible para este servicio.
        </Text>
      </View>
    );
  }

  const totalRecaudado = Object.values(
    currentMonth.montos_pagados || {},
  ).reduce((acc, val) => acc + (val || 0), 0);
  const miCostoFinal =
    (currentMonth?.costo_servicio_momento || 0) - totalRecaudado;

  const getUserStatus = (persona: string) => {
    const haPagado = currentMonth.registro_pagos_personas?.[persona];
    if (haPagado)
      return { color: "bg-green-100 text-green-600", label: "PAGADO" };

    const sub = suscriptores.find((s) => s.nombre === persona);
    if (sub?.es_cortesia) {
      return { color: "bg-[#FF8C0026] text-[#FF8C00]", label: "CORTESÍA" };
    }

    return { color: "bg-slate-100 text-text-secondary", label: "PENDIENTE" };
  };

  return (
    <View style={{ width: screenWidth }} className="px-6 relative">
      {showFullHistory ? (
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => setShowFullHistory(false)}
              className="flex-row items-center bg-card px-4 py-2 rounded-2xl"
            >
              <Ionicons name="arrow-back" size={18} color="#1F7ECC" />
              <Text className="ml-2 text-primary font-asap-bold text-sm">
                Resumen Actual
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center bg-card rounded-2xl px-1 py-1">
              <TouchableOpacity
                onPress={() => {
                  const currentIndex = availableYears.indexOf(
                    selectedYear || "",
                  );
                  if (currentIndex > 0) {
                    setSelectedYear(availableYears[currentIndex - 1]);
                  }
                }}
                className="w-8 h-8 items-center justify-center rounded-full bg-slate-50"
              >
                <Ionicons name="chevron-back" size={18} color="#1F7ECC" />
              </TouchableOpacity>
              <Text className="mx-3 font-asap-bold text-sm text-text-primary">
                {selectedYear}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const currentIndex = availableYears.indexOf(
                    selectedYear || "",
                  );
                  if (currentIndex < availableYears.length - 1) {
                    setSelectedYear(availableYears[currentIndex + 1]);
                  }
                }}
                className="w-8 h-8 items-center justify-center rounded-full bg-slate-50"
              >
                <Ionicons name="chevron-forward" size={18} color="#1F7ECC" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mb-20">
            {filteredHistory.map((hist, idx) => {
              const recHist = Object.values(hist.montos_pagados || {}).reduce(
                (acc, val) => acc + (val || 0),
                0,
              );
              const miGasto = (hist?.costo_servicio_momento || 0) - recHist;

              return (
                <View
                  key={`hist-${idx}`}
                  className="bg-card rounded-2xl p-3 mb-2.5"
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <Text className="text-text-primary font-asap-bold text-xs uppercase mr-2">
                        {hist.mes_anio}
                      </Text>
                      {hist.es_compartido_momento !== false && (
                        <View className="bg-blue-50 px-1.5 py-0.5 rounded-md">
                          <Text className="text-blue-500 font-asap-bold text-[7px] uppercase">
                            Compartido
                          </Text>
                        </View>
                      )}
                    </View>
                    {hist.fecha_real_pago ? (
                      <View className="bg-primary/10 px-2 py-1 rounded-md">
                        <Text className="text-primary font-asap-bold text-[8px]">
                          PAGADO
                        </Text>
                      </View>
                    ) : (
                      <View className="bg-orange-500/10 px-2 py-1 rounded-md">
                        <Text className="text-orange-500 font-asap-bold text-[8px]">
                          PENDIENTE
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <View>
                      <Text className="text-text-secondary font-asap text-[8px] uppercase">
                        Banco
                      </Text>
                      <Text className="text-text-primary font-asap-bold text-[11px]">
                        S/ {hist.costo_servicio_momento.toFixed(2)}
                      </Text>
                    </View>
                    {hist.es_compartido_momento !== false && (
                      <View>
                        <Text className="text-text-secondary font-asap text-[8px] uppercase">
                          Recaudado
                        </Text>
                        <Text className="text-text-primary font-asap-bold text-[11px]">
                          S/ {recHist.toFixed(2)}
                        </Text>
                      </View>
                    )}
                    <View className="items-end">
                      <Text className="text-text-secondary font-asap text-[8px] uppercase">
                        {hist.es_compartido_momento === false
                          ? "Total"
                          : miGasto < 0
                            ? "Ganancia"
                            : "Gasto"}
                      </Text>
                      <Text className="text-text-primary font-asap-bold text-[11px]">
                        S/ {Math.abs(miGasto).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center pt-3">
                    <View className="flex-row">
                      {Object.entries(hist.registro_pagos_personas).map(
                        ([persona, pago], pIdx) => (
                          <View
                            key={pIdx}
                            className={`w-5 h-5 rounded-full items-center justify-center mr-1 ${pago ? "bg-green-500/20" : "bg-red-500/10"}`}
                          >
                            <Text
                              className={`font-asap-bold text-[9px] ${pago ? "text-green-600" : "text-red-400"}`}
                            >
                              {persona.charAt(0)}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name={
                          hist.fecha_real_pago
                            ? "checkmark-circle"
                            : miGasto <= 0
                              ? "checkmark-circle"
                              : "alert-circle"
                        }
                        size={14}
                        color={
                          hist.fecha_real_pago || miGasto <= 0
                            ? "#10B981"
                            : "#64748B"
                        }
                      />
                      <Text className="ml-1 text-[10px] font-asap-semibold text-text-secondary">
                        {hist.fecha_real_pago
                          ? "Pagado"
                          : miGasto <= 0
                            ? "Recuperado"
                            : "Pendiente"}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View>
          <View
            className={`${serviceStatus.color} rounded-[32px] p-6 mb-8 shadow-lg shadow-black/10 relative`}
          >
            <TouchableOpacity
              onPress={() => setShowFullHistory(true)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons name="time" size={20} color="white" />
            </TouchableOpacity>
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-white/70 font-asap-semibold text-[10px] uppercase tracking-widest mb-1">
                  Resumen de Pago
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-white font-asap-bold text-2xl mr-3">
                    {currentMonth.mes_anio}
                  </Text>
                  <View className="bg-black/10 px-2 py-0.5 rounded-md border border-white/20">
                    <Text className="text-white font-asap-bold text-[8px]">
                      {serviceStatus.label}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View className="flex-row items-end justify-between">
              <View className="flex-1 mr-4">
                <View className="flex-row justify-between mb-2">
                  <View>
                    <Text className="text-white/60 font-asap text-[9px] uppercase tracking-tighter">
                      Banco
                    </Text>
                    <Text className="text-white font-asap-bold text-sm">
                      S/ {currentMonth.costo_servicio_momento.toFixed(2)}
                    </Text>
                  </View>
                  {currentMonth.es_compartido_momento !== false && (
                    <View>
                      <Text className="text-white/60 font-asap text-[9px] uppercase tracking-tighter">
                        Recaudado
                      </Text>
                      <Text className="text-white font-asap-bold text-sm">
                        S/ {totalRecaudado.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  <View className="items-end">
                    <Text className="text-white/60 font-asap text-[9px] uppercase tracking-tighter">
                      {currentMonth.es_compartido_momento === false
                        ? "Total a Pagar"
                        : miCostoFinal < 0
                          ? "Saldo Favor"
                          : "Tu Gasto"}
                    </Text>
                    <Text className="text-white font-asap-bold text-sm">
                      S/ {Math.abs(miCostoFinal).toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View className="bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <View
                    className="bg-white h-full"
                    style={{
                      width: `${Math.min((totalRecaudado / currentMonth.costo_servicio_momento) * 100, 100)}%`,
                    }}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={onPayService}
                className="bg-white px-4 py-3 rounded-2xl shadow-sm"
              >
                <Text
                  className={`font-asap-bold text-xs ${serviceStatus.color.replace("bg-", "text-")}`}
                >
                  {serviceStatus.status === "success" ? "PAGADO" : "PAGAR"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-1">
              {currentMonth.es_compartido_momento !== false && (
                <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-2">
                  CONTROL DE PAGO DE USUARIOS
                </Text>
              )}
              <View className="flex-row items-center justify-between bg-card rounded-2xl px-4 py-3">
                <TouchableOpacity
                  onPress={() =>
                    onChangeMonth(
                      Math.min(
                        selectedMonthIndex + 1,
                        historial_pagos.length - 1,
                      ),
                    )
                  }
                  className="w-8 h-8 items-center justify-center rounded-full bg-slate-50"
                >
                  <Ionicons name="chevron-back" size={18} color="#1F7ECC" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsFilterModalVisible(true)}
                  className="flex-row items-center"
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color="#1F7ECC"
                    className="mr-2"
                  />
                  <Text className="text-text-primary font-asap-bold text-base">
                    {currentMonth.mes_anio}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color="#64748B"
                    className="ml-1"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    onChangeMonth(Math.max(selectedMonthIndex - 1, 0))
                  }
                  className="w-8 h-8 items-center justify-center rounded-full bg-slate-50"
                >
                  <Ionicons name="chevron-forward" size={18} color="#1F7ECC" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {currentMonth.es_compartido_momento !== false &&
            Object.keys(currentMonth.registro_pagos_personas)
              .map((nombre, idx) => {
                // Buscamos si el suscriptor sigue activo para obtener su color, sino usamos uno por defecto
                const activeSub = suscriptores.find((s) => s.nombre === nombre);
                
                const cuotaHistorica =
                  currentMonth.cuotas_momento?.[nombre] ?? (activeSub?.cuota || 0);
                const eraCortesia = cuotaHistorica === 0 || activeSub?.es_cortesia === true;

                const status = eraCortesia
                  ? { color: "bg-[#FF8C0026] text-[#FF8C00]", label: "CORTESÍA" }
                  : getUserStatus(nombre);
                const haPagado =
                  currentMonth.registro_pagos_personas?.[nombre];
                const montoPagado =
                  currentMonth.montos_pagados?.[nombre] || 0;

                const displayColor = activeSub?.color || "#64748B";

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() =>
                      !eraCortesia &&
                      handleToggleRequest(nombre, !!haPagado)
                    }
                    className={`bg-card rounded-2xl p-4 mb-3 flex-row items-center justify-between ${eraCortesia ? "opacity-80" : ""}`}
                    activeOpacity={eraCortesia ? 1 : 0.7}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{
                          backgroundColor: `${displayColor}15`,
                        }}
                      >
                        <Text
                          className="font-asap-bold text-base"
                          style={{ color: displayColor }}
                        >
                          {nombre.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-text-primary font-asap-bold text-sm">
                          {nombre}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-text-secondary font-asap text-xs">
                            {haPagado
                              ? `S/ ${montoPagado.toFixed(2)}`
                              : `S/ ${eraCortesia ? "0.00" : cuotaHistorica.toFixed(2)}`}
                          </Text>
                          {haPagado && montoPagado !== cuotaHistorica && (
                            <Text className="text-text-secondary/40 font-asap text-[8px] ml-2 line-through">
                              (S/ {cuotaHistorica.toFixed(2)})
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <View
                        className={`${status.color.split(" ")[0]} px-3 py-1.5 rounded-full ${eraCortesia ? "" : "mr-3"}`}
                      >
                        <Text
                          className={`${status.color.split(" ")[1]} font-asap-bold text-[8px] uppercase tracking-wider`}
                        >
                          {status.label}
                        </Text>
                      </View>
                      {!eraCortesia && (
                        <View
                          className={`w-6 h-6 rounded-full items-center justify-center ${haPagado ? "bg-green-500" : "border-2 border-border"}`}
                        >
                          {haPagado && (
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color="white"
                            />
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
          <View className="h-20" />
        </View>
      )}

      {/* MODAL DE PAGO (NUEVO) */}
      <EVAModal
        visible={paymentModal.visible}
        title={`Pago de ${paymentModal.nombre}`}
        onClose={() => setPaymentModal({ ...paymentModal, visible: false })}
        primaryButtonText="Confirmar Pago"
        onPrimaryAction={confirmPayment}
        secondaryButtonText="Cancelar"
      >
        <View className="py-4">
          {/* Selector de Monto */}
          <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-4">
            MONTO RECIBIDO
          </Text>

          <View className="bg-slate-50/50 p-3 rounded-2xl flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-text-secondary/60 font-asap text-[9px] mb-0.5">
                CUOTA ESTABLECIDA
              </Text>
              <Text className="text-text-secondary font-asap-bold text-base">
                S/ {paymentModal.montoSugerido.toFixed(2)}
              </Text>
            </View>
            <Ionicons name="arrow-forward-outline" size={18} color="#94A3B8" />
            <View className="items-end">
              <Text className="text-text-secondary/60 font-asap text-[9px] mb-1">
                MONTO REAL
              </Text>
              <View className="flex-row items-center bg-slate-100/80 px-3 py-1.5 rounded-xl">
                <Text className="text-primary font-asap-bold text-lg mr-1">
                  S/
                </Text>
                <TextInput
                  value={paymentModal.monto}
                  onChangeText={(val) =>
                    setPaymentModal({ ...paymentModal, monto: val })
                  }
                  keyboardType="decimal-pad"
                  className="text-primary font-asap-bold text-lg min-w-[70px] text-right"
                  placeholder="0.00"
                />
              </View>
            </View>
          </View>

          {/* Selector de Meses (Para Adelantos) */}
          <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-4">
            MESES A PAGAR
          </Text>
          <View className="flex-row items-center bg-card p-2 rounded-2xl mb-6 justify-between">
            <TouchableOpacity
              onPress={() =>
                setPaymentModal((prev) => ({
                  ...prev,
                  meses: Math.max(1, prev.meses - 1),
                }))
              }
              className="w-10 h-10 items-center justify-center bg-white rounded-xl shadow-sm"
            >
              <Ionicons name="remove" size={20} color="#1F7ECC" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Text className="text-text-primary font-asap-bold text-lg mr-1">
                {paymentModal.meses}
              </Text>
              <Text className="text-text-secondary font-asap-medium text-xs">
                {paymentModal.meses === 1 ? "mes" : "meses"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                setPaymentModal((prev) => ({ ...prev, meses: prev.meses + 1 }))
              }
              className="w-10 h-10 items-center justify-center bg-white rounded-xl shadow-sm"
            >
              <Ionicons name="add" size={20} color="#1F7ECC" />
            </TouchableOpacity>
          </View>

          <View className="bg-blue-50 p-3 rounded-xl border border-blue-100">
            <Text className="text-blue-600 font-asap text-[10px] text-center">
              {paymentModal.meses > 1
                ? `Se registrará un adelanto de ${paymentModal.meses} meses.`
                : "Se registrará el pago para el periodo seleccionado."}
            </Text>
          </View>
        </View>
      </EVAModal>

      <EVAModal
        visible={isFilterModalVisible}
        title="Seleccionar Periodo"
        onClose={() => setIsFilterModalVisible(false)}
        secondaryButtonText="Cerrar"
      >
        <View className="py-2">
          <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-4 ml-1">
            HISTORIAL DISPONIBLE
          </Text>
          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
            {historial_pagos.map((hist, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  onChangeMonth(idx);
                  setIsFilterModalVisible(false);
                  setShowFullHistory(false);
                }}
                className={`flex-row items-center justify-between p-4 mb-2 rounded-2xl ${selectedMonthIndex === idx ? "bg-primary/10" : "bg-slate-50"}`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${selectedMonthIndex === idx ? "bg-primary/20" : "bg-white shadow-sm"}`}
                  >
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={selectedMonthIndex === idx ? "#1F7ECC" : "#64748B"}
                    />
                  </View>
                  <Text
                    className={`font-asap-bold text-base ${selectedMonthIndex === idx ? "text-primary" : "text-text-primary"}`}
                  >
                    {hist.mes_anio}
                  </Text>
                </View>
                {selectedMonthIndex === idx && (
                  <Ionicons name="checkmark-circle" size={20} color="#1F7ECC" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </EVAModal>
    </View>
  );
};

export default ServiceHistory;
