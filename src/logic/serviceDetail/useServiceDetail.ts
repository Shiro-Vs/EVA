import { useState, useEffect, useRef } from "react";
import { Dimensions, ScrollView, Share, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AccountService } from "../../services/AccountService";
import { ContactService } from "../../services/ContactService";
import { SubscriptionService } from "../../services/SubscriptionService";
import { Subscription, Subscriber } from "../../interfaces/Subscription";
import { useServicePayments } from "./useServicePayments";

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

  const {
    alertConfig,
    setAlertConfig,
    togglePaymentStatus,
    handleAdvancePayment,
    handleConfirmPayService,
    handleUndoPayService,
    handlePayServicePress,
    handleRemindParticipant
  } = useServicePayments(service, serviceId, selectedMonthIndex, serviceStatus, setService, setPayServiceModalVisible);

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
      setEditModalVisible(true);
    }
  };

  // --- Lógica de Participantes ---
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [editingSubscriberIndex, setEditingSubscriberIndex] = useState<number | null>(null);

  const openAddSubscriberModal = () => {
    setEditingSubscriber(null);
    setEditingSubscriberIndex(null);
    setSubscriberModalVisible(true);
  };

  const openSubscriberModal = (sub: Subscriber, index: number) => {
    setEditingSubscriber(sub);
    setEditingSubscriberIndex(index);
    setSubscriberModalVisible(true);
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
        confirmRemoveSubscriber(subscriber.id);
        setAlertConfig(p => ({ ...p, visible: false }));
      },
      secondaryButtonText: "Cancelar",
      onSecondaryAction: () => setAlertConfig(p => ({ ...p, visible: false })),
      horizontalButtons: true,
      onDismiss: () => setAlertConfig(p => ({ ...p, visible: false }))
    }));
  };

  const confirmRemoveSubscriber = async (subscriberId: string) => {
    if (serviceId) {
      const result = await SubscriptionService.removeSubscriber(serviceId, subscriberId);
      setService(result);
    }
  };

  // --- Lógica de Pagos ---
  // (Manejada por useServicePayments, que expone estas funciones y nosotros las pasamos al return)


  return {
    service,
    activeTab,
    selectedMonthIndex,
    accounts,
    contacts,
    isEditModalVisible,
    isSubscriberModalVisible,
    isPayServiceModalVisible,
    editingSubscriberIndex,
    editingSubscriber,
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
    setAlertConfig,
    fetchServiceData,
    switchTab,
    openEditModal,
    openAddSubscriberModal,
    openSubscriberModal,
    handleRemoveSubscriber,
    togglePaymentStatus,
    handleAdvancePayment,
    handleConfirmPayService,
    handleUndoPayService,
    handlePayServicePress,
    handleRemindParticipant,
    sumValues,
    router,
    isTabScrollEnabled,
    setIsTabScrollEnabled
  };
};
