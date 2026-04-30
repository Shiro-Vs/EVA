import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PaymentHistory, Subscriber } from "../../../../interfaces/Subscription";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import EVAModal from "../../../../components/common/EVAModal";
import MonthDetailModal from "./MonthDetailModal";

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
}

const sumValues = (obj: any) => Object.values(obj || {}).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);

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
}) => {
  const { colors } = useAppTheme();
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [paymentModal, setPaymentModal] = useState<{
    visible: boolean;
    nombre: string;
    monto: string;
    montoSugerido: number;
    meses: number;
    haPagado: boolean;
  }>({ visible: false, nombre: "", monto: "0", montoSugerido: 0, meses: 1, haPagado: false });
  
  const [monthDetail, setMonthDetail] = useState<{ visible: boolean; history: PaymentHistory | null }>({ visible: false, history: null });
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const currentMonth = (historial_pagos && historial_pagos[selectedMonthIndex]) || (historial_pagos && historial_pagos[0]);

  if (!currentMonth) return null;

  const totalRecaudado = sumValues(currentMonth.montos_pagados);
  const miCostoFinal = (currentMonth?.costo_servicio_momento || 0) - totalRecaudado;

  const handleToggleRequest = (nombre: string, haPagado: boolean) => {
    const sub = suscriptores.find((s: any) => s.nombre === nombre);
    if (sub?.es_cortesia) return;

    if (haPagado) {
      onTogglePayment(nombre);
    } else {
      const cuotaSugerida = currentMonth.cuotas_momento?.[nombre] || suscriptores.find((s: any) => s.nombre === nombre)?.cuota || 0;
      setPaymentModal({ visible: true, nombre, monto: cuotaSugerida.toString(), montoSugerido: cuotaSugerida, meses: 1, haPagado: false });
    }
  };

  const confirmPayment = () => {
    const finalMonto = parseFloat(paymentModal.monto) || 0;
    if (paymentModal.meses > 1 && onAdvancePayment) {
      onAdvancePayment(paymentModal.nombre, paymentModal.meses);
    } else {
      onTogglePayment(paymentModal.nombre, finalMonto);
    }
    setPaymentModal(prev => ({ ...prev, visible: false }));
  };

  const filteredHistory = (historial_pagos || []).filter((h: any) => !selectedYear || h.mes_anio.endsWith(selectedYear));

  const getUserStatus = (persona: string) => {
    const haPagado = currentMonth.registro_pagos_personas?.[persona];
    const sub = suscriptores.find((s: any) => s.nombre === persona);

    if (haPagado) return { bgColor: `${colors.income}15`, textColor: colors.income, label: "PAGADO" };
    if (sub?.es_cortesia) return { bgColor: `${colors.warning}15`, textColor: colors.warning, label: "CORTESÍA" };
    return { bgColor: `${colors.textSecondary}10`, textColor: colors.textSecondary, label: "PENDIENTE" };
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 24, width: screenWidth }}>
      {showFullHistory ? (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <TouchableOpacity onPress={() => setShowFullHistory(false)} style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 }}>
              <Ionicons name="arrow-back" size={18} color={colors.primary} />
              <Text style={{ marginLeft: 8, color: colors.primary, fontFamily: "AsapBold", fontSize: 14 }}>Resumen Actual</Text>
            </TouchableOpacity>
            
            <View style={{ flexDirection: "row", backgroundColor: colors.card, borderRadius: 12, padding: 4 }}>
              {["2025", "2026"].map(year => (
                <TouchableOpacity 
                  key={year}
                  onPress={() => setSelectedYear(year)}
                  style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, backgroundColor: selectedYear === year ? colors.background : "transparent" }}
                >
                  <Text style={{ fontFamily: "AsapBold", fontSize: 10, color: selectedYear === year ? colors.primary : colors.textSecondary }}>{year}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 80 }}>
            {(filteredHistory || []).map((hist: any, idx: number) => {
              const recHist = sumValues(hist?.montos_pagados);
              const miGasto = (hist?.costo_servicio_momento || 0) - recHist;
              const accountForThisMonth = accounts.find((a: any) => a.id === hist.id_cuenta_pago_real) || currentAccount;

              return (
                <TouchableOpacity 
                  key={`hist-${idx}`} 
                  onPress={() => setMonthDetail({ visible: true, history: hist })}
                  style={{ backgroundColor: colors.card, borderRadius: 16, padding: 12, marginBottom: 10 }}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 12, textTransform: "uppercase", marginRight: 8 }}>{hist.mes_anio}</Text>
                      {hist.es_compartido_momento !== false && (
                        <View style={{ backgroundColor: `${colors.primary}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ color: colors.primary, fontFamily: "AsapBold", fontSize: 7, textTransform: "uppercase" }}>Compartido</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ backgroundColor: hist.fecha_real_pago ? `${colors.income}15` : `${colors.warning}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                      <Text style={{ color: hist.fecha_real_pago ? colors.income : colors.warning, fontFamily: "AsapBold", fontSize: 8 }}>{hist.fecha_real_pago ? "PAGADO" : "PENDIENTE"}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                    <View><Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 8, textTransform: "uppercase" }}>Costo Total</Text><Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 11 }}>S/ {(hist?.costo_servicio_momento || 0).toFixed(2)}</Text></View>
                    {hist?.es_compartido_momento !== false && (
                      <View><Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 8, textTransform: "uppercase" }}>Recaudado</Text><Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 11 }}>S/ {(recHist || 0).toFixed(2)}</Text></View>
                    )}
                    <View style={{ alignItems: "flex-end" }}><Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 8, textTransform: "uppercase" }}>{hist?.es_compartido_momento === false ? "Total" : miGasto < 0 ? "Ganancia" : "Tu Gasto"}</Text><Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 11 }}>S/ {(Math.abs(miGasto) || 0).toFixed(2)}</Text></View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1, borderTopColor: `${colors.text}10` }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name={(accountForThisMonth?.icono || "card-outline") as any} size={12} color={accountForThisMonth?.color || colors.textSecondary} />
                      <Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 9, marginLeft: 6, textTransform: "uppercase" }}>{accountForThisMonth?.nombre || "N/A"}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name={(hist?.fecha_real_pago || miGasto <= 0 ? "checkmark-circle" : "alert-circle") as any} size={14} color={hist?.fecha_real_pago || miGasto <= 0 ? colors.income : colors.muted} />
                      <Text style={{ marginLeft: 4, fontSize: 9, fontFamily: "AsapBold", color: colors.textSecondary, textTransform: "uppercase" }}>{hist.fecha_real_pago ? "Pagado" : miGasto <= 0 ? "Recuperado" : "Pendiente"}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ backgroundColor: serviceStatus.status === "success" ? colors.income : colors.expense, borderRadius: 32, padding: 24, marginBottom: 32, shadowColor: colors.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, position: "relative" }}>
            <TouchableOpacity onPress={() => setShowFullHistory(true)} style={{ position: "absolute", top: 24, right: 24, width: 40, height: 40, backgroundColor: `${colors.background}33`, borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={"time" as any} size={20} color={colors.background} />
            </TouchableOpacity>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: `${colors.background}B3`, fontFamily: "AsapSemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Resumen de Pago</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: colors.background, fontFamily: "AsapBold", fontSize: 24, marginRight: 12 }}>{currentMonth.mes_anio}</Text>
                <View style={{ backgroundColor: `${colors.text}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: `${colors.background}40` }}>
                  <Text style={{ color: colors.background, fontFamily: "AsapBold", fontSize: 8 }}>{serviceStatus.label}</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              {(() => {
                const actualAccount = accounts.find((a: any) => a.id === currentMonth.id_cuenta_pago_real) || currentAccount;
                return (
                  <>
                    <Ionicons name={(actualAccount?.icono || "card-outline") as any} size={12} color={colors.background} />
                    <Text style={{ color: `${colors.background}CC`, fontFamily: "AsapSemiBold", fontSize: 10, marginLeft: 4 }}>
                      {currentMonth.fecha_real_pago ? "Pagado con: " : "Pago desde: "}{actualAccount?.nombre || "N/A"}
                    </Text>
                  </>
                );
              })()}
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <View style={{ flex: 1, marginRight: 16 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <View><Text style={{ color: `${colors.background}99`, fontFamily: "Asap", fontSize: 9, textTransform: "uppercase" }}>Costo Total</Text><Text style={{ color: colors.background, fontFamily: "AsapBold", fontSize: 14 }}>S/ {(currentMonth.costo_servicio_momento || 0).toFixed(2)}</Text></View>
                      {currentMonth?.es_compartido_momento !== false && (
                        <View><Text style={{ color: `${colors.background}99`, fontFamily: "Asap", fontSize: 9, textTransform: "uppercase" }}>Recaudado</Text><Text style={{ color: colors.background, fontFamily: "AsapBold", fontSize: 14 }}>S/ {(totalRecaudado || 0).toFixed(2)}</Text></View>
                      )}
                      <View style={{ alignItems: "flex-end" }}><Text style={{ color: `${colors.background}99`, fontFamily: "Asap", fontSize: 9, textTransform: "uppercase" }}>{currentMonth?.es_compartido_momento === false ? "Total" : miCostoFinal < 0 ? "Saldo" : "Tu Gasto"}</Text><Text style={{ color: colors.background, fontFamily: "AsapBold", fontSize: 14 }}>S/ {(Math.abs(miCostoFinal) || 0).toFixed(2)}</Text></View>
                    </View>
                    <View style={{ backgroundColor: `${colors.background}40`, height: 6, borderRadius: 3, overflow: "hidden" }}>
                      <View style={{ backgroundColor: colors.background, height: "100%", width: `${Math.min(((totalRecaudado || 0) / (currentMonth?.costo_servicio_momento || 1)) * 100, 100)}%` }} />
                    </View>
                  </View>
              <TouchableOpacity 
                onPress={onPayService} 
                style={{ backgroundColor: colors.background, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 }}
              >
                <Text style={{ fontFamily: "AsapBold", fontSize: 12, color: serviceStatus.status === "success" ? colors.income : colors.expense }}>
                  {serviceStatus.status === "success" ? "EDITAR" : "PAGAR"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <View style={{ flex: 1 }}>
              {currentMonth.es_compartido_momento !== false && (
                <Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>CONTROL DE PAGO</Text>
              )}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
                <TouchableOpacity onPress={() => onChangeMonth(Math.min(selectedMonthIndex + 1, (historial_pagos?.length || 1) - 1))} style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: `${colors.text}10` }}>
                  <Ionicons name="chevron-back" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsFilterModalVisible(true)} style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 16, marginLeft: 8 }}>{currentMonth.mes_anio}</Text>
                  <Ionicons name="chevron-down" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChangeMonth(Math.max(selectedMonthIndex - 1, 0))} style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: `${colors.text}10` }}>
                  <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {Object.keys(currentMonth?.registro_pagos_personas || {}).map((nombre, idx) => {
              const activeSub = suscriptores.find((s: any) => s.nombre === nombre);
              const cuotaHistorica = currentMonth.cuotas_momento?.[nombre] ?? (activeSub?.cuota || 0);
              const eraCortesia = cuotaHistorica === 0 || activeSub?.es_cortesia === true;
              const status = eraCortesia ? { bgColor: `${colors.warning}15`, textColor: colors.warning, label: "CORTESÍA" } : getUserStatus(nombre);
              const haPagado = currentMonth.registro_pagos_personas?.[nombre];
              const montoPagado = currentMonth.montos_pagados?.[nombre] || 0;
              const displayColor = activeSub?.color || colors.textSecondary;

              return (
                <TouchableOpacity key={idx} onPress={() => !eraCortesia && handleToggleRequest(nombre, !!haPagado)} style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", opacity: eraCortesia ? 0.8 : 1 }} activeOpacity={eraCortesia ? 1 : 0.7}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 12, backgroundColor: `${displayColor}15` }}>
                      <Text style={{ fontFamily: "AsapBold", fontSize: 16, color: displayColor }}>{nombre.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 14 }}>{nombre}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 12 }}>{haPagado ? `S/ ${montoPagado.toFixed(2)}` : `S/ ${eraCortesia ? "0.00" : cuotaHistorica.toFixed(2)}`}</Text>
                        {haPagado && montoPagado !== cuotaHistorica && <Text style={{ color: `${colors.text}30`, fontFamily: "Asap", fontSize: 8, marginLeft: 8, textDecorationLine: "line-through" }}>(S/ {cuotaHistorica.toFixed(2)})</Text>}
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ backgroundColor: status.bgColor, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: eraCortesia ? 0 : 12 }}>
                      <Text style={{ color: status.textColor, fontFamily: "AsapBold", fontSize: 8, textTransform: "uppercase" }}>{status.label}</Text>
                    </View>
                    {!eraCortesia && (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {!haPagado && (
                          <TouchableOpacity 
                            onPress={() => onRemindParticipant(nombre)}
                            style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `${colors.income}15`, alignItems: "center", justifyContent: "center", marginRight: 8 }}
                          >
                            <Ionicons name="logo-whatsapp" size={16} color={colors.income} />
                          </TouchableOpacity>
                        )}
                        <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: haPagado ? colors.income : "transparent", borderWidth: haPagado ? 0 : 2, borderColor: colors.border }}>
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
        </View>
      )}

      {/* Modales de Historial */}
      <EVAModal visible={paymentModal.visible} title={`Pago de ${paymentModal.nombre}`} onClose={() => setPaymentModal({ ...paymentModal, visible: false })} primaryButtonText="Confirmar Pago" onPrimaryAction={confirmPayment} secondaryButtonText="Cancelar">
        <View style={{ paddingVertical: 16 }}>
          <Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Monto Recibido</Text>
          <View style={{ backgroundColor: colors.card, padding: 12, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <View><Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 9 }}>CUOTA SUGERIDA</Text><Text style={{ color: colors.textSecondary, fontFamily: "AsapBold", fontSize: 16 }}>S/ {paymentModal.montoSugerido.toFixed(2)}</Text></View>
            <Ionicons name="arrow-forward-outline" size={18} color={colors.muted} />
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 9, marginBottom: 4 }}>MONTO REAL</Text>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${colors.text}08`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 18, marginRight: 4 }}>S/</Text>
                <TextInput value={paymentModal.monto} onChangeText={(val) => setPaymentModal({ ...paymentModal, monto: val })} keyboardType="decimal-pad" style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 18, minWidth: 70, textAlign: "right" }} />
              </View>
            </View>
          </View>
          <Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Meses a Pagar</Text>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${colors.text}08`, padding: 8, borderRadius: 16, justifyContent: "space-between" }}>
            <TouchableOpacity onPress={() => setPaymentModal(p => ({ ...p, meses: Math.max(1, p.meses - 1) }))} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: colors.card, borderRadius: 12 }}><Ionicons name="remove" size={20} color={colors.primary} /></TouchableOpacity>
            <View style={{ flexDirection: "row", alignItems: "center" }}><Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 18, marginRight: 4 }}>{paymentModal.meses}</Text><Text style={{ color: colors.textSecondary, fontFamily: "AsapMedium", fontSize: 12 }}>{paymentModal.meses === 1 ? "mes" : "meses"}</Text></View>
            <TouchableOpacity onPress={() => setPaymentModal(p => ({ ...p, meses: p.meses + 1 }))} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: colors.card, borderRadius: 12 }}><Ionicons name="add" size={20} color={colors.primary} /></TouchableOpacity>
          </View>
        </View>
      </EVAModal>

      <EVAModal visible={isFilterModalVisible} title="Seleccionar Periodo" onClose={() => setIsFilterModalVisible(false)} secondaryButtonText="Cerrar">
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ color: colors.textSecondary, fontFamily: "AsapSemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Historial Disponible</Text>
          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {(historial_pagos || []).map((hist: any, idx: number) => (
              <TouchableOpacity key={idx} onPress={() => { onChangeMonth(idx); setIsFilterModalVisible(false); setShowFullHistory(false); }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, marginBottom: 8, borderRadius: 16, backgroundColor: selectedMonthIndex === idx ? `${colors.primary}15` : colors.card, borderWidth: 1, borderColor: selectedMonthIndex === idx ? colors.primary : "transparent" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 12, backgroundColor: selectedMonthIndex === idx ? `${colors.primary}20` : colors.background }}><Ionicons name="calendar" size={16} color={selectedMonthIndex === idx ? colors.primary : colors.textSecondary} /></View>
                  <Text style={{ fontFamily: "AsapBold", fontSize: 16, color: selectedMonthIndex === idx ? colors.primary : colors.text }}>{hist.mes_anio}</Text>
                </View>
                {selectedMonthIndex === idx && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
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
