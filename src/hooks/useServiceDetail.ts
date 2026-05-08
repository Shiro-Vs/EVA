import { useState, useEffect, useRef } from "react";
import { Dimensions, ScrollView, Share, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AccountService } from "../services/AccountService";
import { ContactService } from "../services/ContactService";
import { SubscriptionService } from "../services/SubscriptionService";
import { FinanceService } from "../services/FinanceService";
import { Subscription, Subscriber } from "../interfaces/Subscription";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const sumValues = (obj: any) => Object.values(obj || {}).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);

export const useServiceDetail = (propServiceId?: string) => {
  const { id: paramId } = useLocalSearchParams<{ id: string }>();
  const serviceId = propServiceId || paramId;
  const router = useRouter();

  const [service, setService] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState<"historial" | "participantes">("historial");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // Estados para Modales
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isSubscriberModalVisible, setSubscriberModalVisible] = useState(false);
  const [isPayServiceModalVisible, setPayServiceModalVisible] = useState(false);

  // Estados de Drafts
  const [draftService, setDraftService] = useState<any>(null);
  const [costoInput, setCostoInput] = useState("");
  const [editingSubscriberIndex, setEditingSubscriberIndex] = useState<number | null>(null);
  const [subscriberDraft, setSubscriberDraft] = useState<Subscriber | null>(null);
  const [subscriberQuotaInput, setSubscriberQuotaInput] = useState("");
  const [subscriberErrors, setSubscriberErrors] = useState({ nombre: "", cuota: "" });
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

  const [isTabScrollEnabled, setIsTabScrollEnabled] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchServiceData();
    fetchAccounts();
    fetchContacts();
  }, [serviceId]);

  const fetchServiceData = async () => {
    if (serviceId) {
      const data = await SubscriptionService.getSubscriptionById(serviceId);
      setService(data);
      if (data) {
        setDraftService({ ...data });
        setCostoInput(data.costo_total_actual.toString());

        // Calcular el mes del ciclo actual
        const hoy = new Date();
        const diaActual = hoy.getDate();
        let mesIndex = hoy.getMonth();
        let anio = hoy.getFullYear();

        if (diaActual < data.dia_cobro) {
          mesIndex -= 1;
          if (mesIndex < 0) {
            mesIndex = 11;
            anio -= 1;
          }
        }

        const mesesStr = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        const mesCicloActual = `${mesesStr[mesIndex]} ${anio}`;

        const indexActual = data.historial_pagos?.findIndex(
          (h: any) => h.mes_anio === mesCicloActual
        );

        if (indexActual !== undefined && indexActual !== -1) {
          setSelectedMonthIndex(indexActual);
        } else {
          setSelectedMonthIndex(0); // Fallback
        }
      }
    }
  };

  const getServiceStatus = () => {
    if (!service) return { label: "PENDIENTE", status: "pending" };
    const hist = service.historial_pagos?.[selectedMonthIndex];
    if (!hist) return { label: "PENDIENTE", status: "pending" };
    
    const recHist = Object.values(hist.montos_pagados || {}).reduce((acc: number, val: number | undefined) => acc + (val || 0), 0);
    
    if (hist.fecha_real_pago) return { label: "PAGADO", status: "success" };
    if (recHist > 0 && recHist < (hist.costo_servicio_momento || 0)) return { label: "PARCIAL", status: "partial" };
    
    const miGasto = (hist.costo_servicio_momento || 0) - recHist;
    
    if (miGasto <= 0) return { label: "RECUPERADO", status: "success" };
    return { label: "PENDIENTE", status: "pending" };
  };

  const serviceStatus = getServiceStatus();
  const currentAccount = accounts?.find((a) => a.id === service?.id_cuenta_pago) || accounts?.[0] || { id: "none", nombre: "Sin Cuenta", icono: "card-outline", color: "#9ca3af" };

  const fetchAccounts = async () => {
    const data = await AccountService.getAccounts();
    setAccounts(data);
  };

  const fetchContacts = async () => {
    const data = await ContactService.getContacts();
    setContacts(data);
  };

  const switchTab = (tab: "historial" | "participantes") => {
    setActiveTab(tab);
    scrollViewRef.current?.scrollTo({
      x: tab === "historial" ? 0 : SCREEN_WIDTH,
      animated: true,
    });
  };

  // --- Lógica de Edición del Servicio ---
  const openEditModal = () => {
    if (service) {
      setDraftService({ ...service });
      setCostoInput(service.costo_total_actual.toString());
      setEditModalVisible(true);
    }
  };

  const handleUpdateService = async () => {
    if (draftService && serviceId) {
      const updated = {
        ...draftService,
        costo_total_actual: parseFloat(costoInput) || 0,
      };
      const result = await SubscriptionService.updateSubscription(serviceId, updated);
      setService(result);
      if (!result.es_compartido) {
        switchTab("historial");
      }
      setEditModalVisible(false);
    }
  };

  // --- Lógica de Participantes ---
  const openAddSubscriberModal = () => {
    setEditingSubscriberIndex(null);
    setSubscriberDraft({
      nombre: "",
      cuota: 0,
      es_cortesia: false,
      fecha_inicio: new Date().toISOString(),
      pagado_hasta: null,
    });
    setSubscriberQuotaInput("");
    setSubscriberErrors({ nombre: "", cuota: "" });
    setSubscriberModalVisible(true);
  };

  const openSubscriberModal = (sub: Subscriber, index: number) => {
    setEditingSubscriberIndex(index);
    setSubscriberDraft({ ...sub });
    setSubscriberQuotaInput(sub.cuota.toString());
    setSubscriberErrors({ nombre: "", cuota: "" });
    setSubscriberModalVisible(true);
  };

  const handleSaveSubscriber = async () => {
    if (subscriberDraft && serviceId) {
      let hasError = false;
      const errors = { nombre: "", cuota: "" };

      if (!subscriberDraft.nombre.trim()) {
        errors.nombre = "El nombre es obligatorio";
        hasError = true;
      }

      const cuotaNum = parseFloat(subscriberQuotaInput);
      if (!subscriberDraft.es_cortesia && (isNaN(cuotaNum) || cuotaNum < 0)) {
        errors.cuota = "Monto inválido";
        hasError = true;
      }

      if (hasError) {
        setSubscriberErrors(errors);
        return;
      }

      const updatedSub = {
        ...subscriberDraft,
        cuota: subscriberDraft.es_cortesia ? 0 : cuotaNum,
      };

      try {
        const result = await SubscriptionService.addOrUpdateSubscriber(serviceId, updatedSub, editingSubscriberIndex);
        setService(result);
        setSubscriberModalVisible(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRemoveSubscriber = (subscriber: Subscriber) => {
    setAlertConfig(prev => ({
      ...prev,
      visible: true,
      title: "¿Quitar Participante?",
      message: `¿Estás seguro de que deseas quitar a ${subscriber.nombre} de este servicio? Se mantendrá su registro en los meses anteriores del historial.`,
      type: "error",
      buttonText: "Sí, Quitar",
      onPrimaryAction: () => {
        confirmRemoveSubscriber(subscriber.nombre);
        setAlertConfig(p => ({ ...p, visible: false }));
      },
      secondaryButtonText: "Cancelar",
      onSecondaryAction: () => setAlertConfig(p => ({ ...p, visible: false })),
      horizontalButtons: true,
      onDismiss: () => setAlertConfig(p => ({ ...p, visible: false }))
    }));
  };

  const confirmRemoveSubscriber = async (nombre: string) => {
    if (serviceId) {
      const result = await SubscriptionService.removeSubscriber(serviceId, nombre);
      setService(result);
    }
  };

  // --- Lógica de Pagos ---
  const togglePaymentStatus = async (nombre: string, monto?: number, monthIndex?: number) => {
    if (service && serviceId) {
      const targetIndex = monthIndex !== undefined ? monthIndex : selectedMonthIndex;
      const currentMonth = service.historial_pagos?.[targetIndex];
      if (!currentMonth) return;

      const isPaid = currentMonth.registro_pagos_personas?.[nombre];

      // Si ya pagó y se intenta "desmarcar", pedir confirmación
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
            const result = await FinanceService.togglePaymentStatus(
              serviceId,
              targetIndex,
              nombre,
              monto
            );
            setService(result);
          },
          secondaryButtonText: "Cancelar",
          onSecondaryAction: () => setAlertConfig(p => ({ ...p, visible: false })),
          horizontalButtons: true,
          onDismiss: () => setAlertConfig(p => ({ ...p, visible: false }))
        }));
      } else {
        // Si no ha pagado o es un pago nuevo, proceder normalmente
        const result = await FinanceService.togglePaymentStatus(
          serviceId,
          targetIndex,
          nombre,
          monto
        );
        setService(result);
      }
    }
  };

  const handleAdvancePayment = async (nombre: string, months: number) => {
    if (serviceId) {
      const result = await FinanceService.registerAdvancePayment(serviceId, nombre, months);
      setService(result);
    }
  };

  const handleConfirmPayService = async (monto: number, idCuenta: string, fecha: Date) => {
    if (service && serviceId) {
      const currentMonth = service.historial_pagos?.[selectedMonthIndex];
      if (!currentMonth) return;
      const result = await FinanceService.registerServicePaymentToBank(
        serviceId,
        monto,
        selectedMonthIndex,
        fecha,
        idCuenta
      );
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
          const result = await FinanceService.undoServicePaymentToBank(serviceId, selectedMonthIndex);
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

    // Verificar si hay meses anteriores impagos (índices mayores en orden DESC)
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
    service,
    activeTab,
    selectedMonthIndex,
    accounts,
    contacts,
    isEditModalVisible,
    isSubscriberModalVisible,
    isPayServiceModalVisible,
    draftService,
    costoInput,
    editingSubscriberIndex,
    subscriberDraft,
    subscriberQuotaInput,
    subscriberErrors,
    alertConfig,
    scrollViewRef,
    serviceStatus,
    currentAccount,
    SCREEN_WIDTH,
    setService,
    setActiveTab,
    setSelectedMonthIndex,
    setEditModalVisible,
    setSubscriberModalVisible,
    setPayServiceModalVisible,
    setDraftService,
    setCostoInput,
    setSubscriberDraft,
    setSubscriberQuotaInput,
    setSubscriberErrors,
    setAlertConfig,
    fetchServiceData,
    switchTab,
    openEditModal,
    handleUpdateService,
    openAddSubscriberModal,
    openSubscriberModal,
    handleSaveSubscriber,
    handleRemoveSubscriber,
    togglePaymentStatus,
    handleAdvancePayment,
    handleConfirmPayService,
    handlePayServicePress,
    handleRemindParticipant,
    sumValues,
    router,
    isTabScrollEnabled,
    setIsTabScrollEnabled
  };
};
