import { useState } from "react";
import { Share, Linking } from "react-native";
import { Subscription } from "../../interfaces/Subscription";
// Wait, FinanceService is in src/services/FinanceService.ts. Let's fix imports.
import { FinanceService as FS } from "../../services/FinanceService";

export const useServicePayments = (
  service: Subscription | null,
  serviceId: string | undefined,
  selectedMonthIndex: number,
  serviceStatus: { label: string; status: string },
  setService: (s: Subscription) => void,
  setPayServiceModalVisible: (v: boolean) => void
) => {
  const [alertConfig, setAlertConfig] = useState({ 
    visible: false, 
    title: "", 
    message: "", 
    type: "success", 
    buttonText: "Entendido", 
    onPrimaryAction: () => {}, 
    secondaryButtonText: "", 
    onSecondaryAction: () => {}, 
    horizontalButtons: false, 
    onDismiss: () => {} 
  });

  const togglePaymentStatus = async (nombre: string, monto?: number, monthIndex?: number) => {
    if (service && serviceId) {
      const targetIndex = monthIndex !== undefined ? monthIndex : selectedMonthIndex;
      const currentMonth = service.historial_pagos?.[targetIndex];
      if (!currentMonth) return;

      const isPaid = currentMonth.registro_pagos_personas?.[nombre];

      if (isPaid && monto === undefined) {
        setAlertConfig(prev => ({
          ...prev,
          visible: true,
          title: "¿Retirar Pago?",
          message: `¿Estás seguro de que deseas retirar el pago de ${nombre} para el mes de ${currentMonth.mes_anio}?`,
          type: "warning",
          buttonText: "Sí, Retirar",
          onPrimaryAction: async () => {
            setAlertConfig(p => ({ ...p, visible: false }));
            const result = await FS.togglePaymentStatus(serviceId, targetIndex, nombre, monto);
            setService(result);
          },
          secondaryButtonText: "Cancelar",
          onSecondaryAction: () => setAlertConfig(p => ({ ...p, visible: false })),
          horizontalButtons: true,
          onDismiss: () => setAlertConfig(p => ({ ...p, visible: false }))
        }));
      } else {
        const result = await FS.togglePaymentStatus(serviceId, targetIndex, nombre, monto);
        setService(result);
      }
    }
  };

  const handleAdvancePayment = async (nombre: string, months: number) => {
    if (serviceId) {
      const result = await FS.registerAdvancePayment(serviceId, nombre, months);
      setService(result);
    }
  };

  const handleConfirmPayService = async (monto: number, idCuenta: string, fecha: Date) => {
    if (service && serviceId) {
      const currentMonth = service.historial_pagos?.[selectedMonthIndex];
      if (!currentMonth) return;
      const result = await FS.registerServicePaymentToBank(serviceId, monto, selectedMonthIndex, fecha, idCuenta);
      setService(result);
      setPayServiceModalVisible(false);
    }
  };

  const handleUndoPayService = async () => {
    if (serviceId && service) {
      const currentMonth = service.historial_pagos?.[selectedMonthIndex];
      if (!currentMonth) return;

      setAlertConfig(prev => ({
        ...prev,
        visible: true,
        title: "¿Retirar Pago del Servicio?",
        message: `¿Estás seguro de que deseas eliminar el registro de pago del servicio para ${currentMonth.mes_anio}?`,
        type: "warning",
        buttonText: "Sí, Retirar",
        onPrimaryAction: async () => {
          setAlertConfig(p => ({ ...p, visible: false }));
          const result = await FS.undoServicePaymentToBank(serviceId, selectedMonthIndex);
          setService(result);
        },
        secondaryButtonText: "Cancelar",
        onSecondaryAction: () => setAlertConfig(p => ({ ...p, visible: false })),
        horizontalButtons: true,
        onDismiss: () => setAlertConfig(p => ({ ...p, visible: false }))
      }));
    }
  };

  const handlePayServicePress = () => {
    if (!service) return;

    const hasUnpaidPastMonth = service.historial_pagos?.some((h, idx) => 
      idx > selectedMonthIndex && !h.fecha_real_pago
    );

    if (hasUnpaidPastMonth && serviceStatus.status !== "success") {
      const unpaidMonth = service.historial_pagos?.find((h, idx) => idx > selectedMonthIndex && !h.fecha_real_pago);
      setAlertConfig(prev => ({
        ...prev,
        visible: true,
        title: "Pago Pendiente",
        message: `No puedes pagar ${service.historial_pagos?.[selectedMonthIndex]?.mes_anio || "este mes"} porque aún tienes pendiente el pago de ${unpaidMonth?.mes_anio || "un mes anterior"}. Por favor, salda primero los meses más antiguos.`,
        type: "error",
        buttonText: "Entendido",
        onPrimaryAction: () => setAlertConfig(p => ({ ...p, visible: false })),
        onDismiss: () => setAlertConfig(p => ({ ...p, visible: false }))
      }));
      return;
    }

    if (serviceStatus.status === "success") {
      setAlertConfig(prev => ({
        ...prev,
        visible: true,
        title: "Opciones de Pago",
        message: "¿Qué deseas hacer con el registro de pago de este mes?",
        type: "info",
        buttonText: "Editar Datos",
        onPrimaryAction: () => {
          setAlertConfig(p => ({ ...p, visible: false }));
          setPayServiceModalVisible(true);
        },
        secondaryButtonText: "Quitar Pago",
        onSecondaryAction: () => {
          setAlertConfig(p => ({ ...p, visible: false }));
          handleUndoPayService();
        },
        horizontalButtons: true,
        onDismiss: () => setAlertConfig(p => ({ ...p, visible: false }))
      }));
    } else {
      setPayServiceModalVisible(true);
    }
  };

  const handleRemindParticipant = (nombre: string) => {
    if (!service) return;
    const hist = service.historial_pagos?.[selectedMonthIndex];
    if (!hist) return;

    const cuota = hist.cuotas_momento?.[nombre] ?? (service.suscriptores?.find(s => s.nombre === nombre)?.cuota || 0);
    const mes = hist.mes_anio;
    const servicio = service.nombre;

    const message = `Hola ${nombre}! 👋\n\nTe recuerdo que falta el pago de *S/ ${cuota.toFixed(2)}* para el servicio *${servicio}* correspondiente al mes de *${mes}* 💸\n\n¿Me podrías confirmar si lo logras pagar hoy? ¡Gracias! ✨`;
    
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Share.share({ message });
      }
    });
  };

  return {
    alertConfig,
    setAlertConfig,
    togglePaymentStatus,
    handleAdvancePayment,
    handleConfirmPayService,
    handleUndoPayService,
    handlePayServicePress,
    handleRemindParticipant
  };
};
