import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Text,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  Subscription,
  Subscriber,
  PaymentHistory,
} from "../../../interfaces/Subscription";
import { Contact } from "../../../interfaces/Contact";
import EVAAlert from "../../../components/common/EVAAlert";
import { PRESET_COLORS } from "../../../utils/serviceIcons";

// Importación de subcomponentes
import ServiceHeader from "./components/ServiceHeader";
import ServiceHistory from "./components/ServiceHistory";
import ServiceParticipants from "./components/ServiceParticipants";
import EditServiceModal from "./components/EditServiceModal";
import SubscriberModal from "./components/SubscriberModal";
import PayServiceModal from "./components/PayServiceModal";


import { mockDB } from "../../../services/mockDatabase";
import { Account } from "../../../interfaces/Account";

export default function ServiceDetail({
  serviceId,
}: {
  serviceId: string;
}) {
  const router = useRouter();
  const { width: SCREEN_WIDTH } = Dimensions.get("window");
  const scrollViewRef = useRef<ScrollView>(null);

  // Estados
  const [activeTab, setActiveTab] = useState<"participantes" | "historial">(
    "historial",
  );
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isSubscriberModalVisible, setSubscriberModalVisible] = useState(false);
  const [editingSubscriberIndex, setEditingSubscriberIndex] = useState<
    number | null
  >(null);
  const [subscriberDraft, setSubscriberDraft] = useState<Subscriber | null>(
    null,
  );
  const [subscriberQuotaInput, setSubscriberQuotaInput] = useState("");
  const [subscriberErrors, setSubscriberErrors] = useState({
    nombre: "",
    cuota: "",
  });

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    buttonText?: string;
    onPrimaryAction?: () => void;
    secondaryButtonText?: string;
    onSecondaryAction?: () => void;
    horizontalButtons?: boolean;
    onDismiss?: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    const backAction = () => {
      if (activeTab === "participantes") {
        setActiveTab("historial");
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [activeTab]);

  const [service, setService] = useState<Subscription | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedService, fetchedAccounts, fetchedContacts] = await Promise.all([
          mockDB.getSubscriptionById(serviceId),
          mockDB.getAccounts(),
          mockDB.getContacts()
        ]);
        
        if (fetchedService) {
          setService(fetchedService);
          setDraftService(fetchedService);
          setCostoInput(fetchedService.costo_total_actual.toString());
        }
        setAccounts(fetchedAccounts);
        setContacts(fetchedContacts);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [serviceId]);

  const [isPayServiceModalVisible, setPayServiceModalVisible] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [draftService, setDraftService] = useState<Subscription | null>(null);
  const [costoInput, setCostoInput] = useState("");

  if (!serviceId) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-text-secondary font-asap">Error: ID de servicio no especificado.</Text>
      </SafeAreaView>
    );
  }

  if (isLoading || !service) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-text-secondary font-asap">Cargando detalles del servicio...</Text>
      </SafeAreaView>
    );
  }

  // Lógica de color y estado del servicio
  const getServiceStatus = () => {
    const currentMonth = service.historial_pagos?.[selectedMonthIndex];
    const isPaid = !!currentMonth?.fecha_real_pago;
    
    if (isPaid) return { color: "bg-green-500", label: "PAGADO", status: "success" };

    const today = new Date();
    const currentDay = today.getDate();
    const payDay = service.dia_cobro || 1;
    
    if (currentDay > payDay) {
      return { color: "bg-red-500", label: "VENCIDO", status: "error" };
    } else if (payDay - currentDay <= 3) {
      return { color: "bg-orange-500", label: "PRÓXIMO", status: "warning" };
    }
    
    return { color: "bg-primary", label: "PENDIENTE", status: "info" };
  };

  const serviceStatus = getServiceStatus();

  const handlePayService = async (montoReal: number, cuentaId: string, fechaPago: Date) => {
    try {
      const updatedService = await mockDB.registerServicePaymentToBank(serviceId, montoReal, selectedMonthIndex, fechaPago);
      setService(updatedService);
      setPayServiceModalVisible(false);
      setAlertConfig({
        visible: true,
        title: "¡Pago Registrado!",
        message: "El pago del servicio ha sido registrado correctamente.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
    }
  };


  // Handlers para el Servicio
  const openEditModal = () => {
    if (service) {
      setDraftService(service);
      setCostoInput(service.costo_total_actual.toString());
      setEditModalVisible(true);
    }
  };


  const saveServiceChanges = async () => {
    if (!draftService) return;
    try {
      const updatedData = {
        ...draftService,
        costo_total_actual: parseFloat(costoInput) || 0,
      };
      const result = await mockDB.updateSubscription(serviceId, updatedData);
      setService(result);
      setEditModalVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Handlers para Suscriptores
  const openSubscriberModal = (subscriber: Subscriber, index: number) => {
    setEditingSubscriberIndex(index);
    setSubscriberDraft({ ...subscriber });
    setSubscriberQuotaInput(subscriber.cuota.toString());
    setSubscriberErrors({ nombre: "", cuota: "" });
    setSubscriberModalVisible(true);
  };

  const openAddSubscriberModal = () => {
    setEditingSubscriberIndex(null);
    setSubscriberDraft({
      nombre: "",
      cuota: 0,
      es_cortesia: false,
      pagado_hasta: new Date(),
      fecha_inicio: new Date(),
      color: PRESET_COLORS[0],
    });
    setSubscriberQuotaInput("");
    setSubscriberErrors({ nombre: "", cuota: "" });
    setSubscriberModalVisible(true);
  };

  const saveSubscriberChanges = async () => {
    if (subscriberDraft) {
      let hasError = false;
      const newErrors = { nombre: "", cuota: "" };

      if (!subscriberDraft.nombre.trim()) {
        newErrors.nombre = "El nombre es obligatorio";
        hasError = true;
      }

      const cuotaNum = parseFloat(subscriberQuotaInput) || 0;
      if (!subscriberDraft.es_cortesia && cuotaNum <= 0) {
        newErrors.cuota = "El monto debe ser mayor a 0";
        hasError = true;
      }

      if (hasError) {
        setSubscriberErrors(newErrors);
        return;
      }

      const updatedSub = {
        ...subscriberDraft,
        cuota: subscriberDraft.es_cortesia ? 0 : cuotaNum,
      };

      try {
        const result = await mockDB.addOrUpdateSubscriber(serviceId, updatedSub, editingSubscriberIndex);
        setService(result);
        setSubscriberModalVisible(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRemoveSubscriber = (subscriber: Subscriber) => {
    setAlertConfig({
      visible: true,
      title: "¿Quitar Participante?",
      message: `¿Estás seguro de que deseas quitar a ${subscriber.nombre} de este servicio? Se mantendrá su registro en los meses anteriores del historial.`,
      type: "error",
      buttonText: "Sí, Quitar",
      onPrimaryAction: () => confirmRemoveSubscriber(subscriber.nombre),
      secondaryButtonText: "Cancelar",
      onSecondaryAction: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      horizontalButtons: true,
      onDismiss: () => setAlertConfig(prev => ({ ...prev, visible: false }))
    });
  };

  const confirmRemoveSubscriber = async (nombre: string) => {
    try {
      const result = await mockDB.removeSubscriber(serviceId, nombre);
      setService(result);
      setAlertConfig({
        visible: true,
        title: "Participante Eliminado",
        message: `${nombre} ha sido quitado del servicio.`,
        type: "success",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const togglePaymentStatus = async (personaNombre: string, montoManual?: number) => {
    const currentMonth = service.historial_pagos?.[selectedMonthIndex];
    const isAlreadyPaid = currentMonth?.registro_pagos_personas?.[personaNombre];

    if (isAlreadyPaid && montoManual === undefined) {
      setAlertConfig({
        visible: true,
        title: "¿Retirar Pago?",
        message: `¿Estás seguro de que deseas retirar el registro de pago de ${personaNombre} para este mes?`,
        type: "warning",
        buttonText: "Sí, Retirar",
        onPrimaryAction: () => executeTogglePayment(personaNombre, montoManual),
        secondaryButtonText: "Cancelar",
        onSecondaryAction: () => setAlertConfig(prev => ({ ...prev, visible: false })),
        horizontalButtons: true,
        onDismiss: () => setAlertConfig(prev => ({ ...prev, visible: false }))
      });
      return;
    }

    executeTogglePayment(personaNombre, montoManual);
  };

  const executeTogglePayment = async (personaNombre: string, montoManual?: number) => {
    try {
      const updatedService = await mockDB.togglePaymentStatus(serviceId, selectedMonthIndex, personaNombre, montoManual);
      setService(updatedService);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdvancePayment = async (personaNombre: string, months: number) => {
    try {
      const updatedService = await mockDB.registerAdvancePayment(serviceId, personaNombre, months);
      setService(updatedService);
      setAlertConfig({
        visible: true,
        title: "¡Pago Adelantado!",
        message: `Se ha registrado el pago de ${personaNombre} por ${months} mes(es) adicional(es).`,
        type: "success",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const currentAccount =
    accounts.find((a) => a.id === service.id_cuenta_pago) ||
    accounts[0] || { nombre: "Sin Cuenta", icono: "card-outline", color: "#64748B" };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Cabecera de Navegación */}
      <View className="flex-row items-center px-6 mt-6 mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-card rounded-full items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#1F7ECC" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-6">
        {/* Resumen del Servicio */}
        <ServiceHeader
          nombre={service.nombre}
          costo_total_actual={service.costo_total_actual}
          frecuencia={service.frecuencia}
          dia_cobro={service.dia_cobro.toString()}
          icon={service.icon}
          color={service.color}
          accountName={currentAccount.nombre}
          accountIcon={currentAccount.icono}
          accountColor={currentAccount.color}
          onEditPress={openEditModal}
        />

        {/* Custom Tabs */}

        <View className="flex-row items-center mb-6 bg-card rounded-xl p-1">
          <TouchableOpacity
            className="flex-1 py-2.5 items-center rounded-lg"
            style={
              activeTab === "historial"
                ? {
                    backgroundColor: "#FFFFFF",
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                  }
                : {}
            }
            onPress={() => {
              setActiveTab("historial");
              scrollViewRef.current?.scrollTo({ x: 0, animated: true });
            }}
            activeOpacity={0.7}
          >
            <Text
              className="font-asap-bold text-sm"
              style={{
                color: activeTab === "historial" ? "#1F7ECC" : "#8F99A1",
              }}
            >
              Pagos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-2.5 items-center rounded-lg"
            style={
              activeTab === "participantes"
                ? {
                    backgroundColor: "#FFFFFF",
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                  }
                : {}
            }
            onPress={() => {
              setActiveTab("participantes");
              scrollViewRef.current?.scrollTo({
                x: SCREEN_WIDTH,
                animated: true,
              });
            }}
            activeOpacity={0.7}
          >
            <Text
              className="font-asap-bold text-sm"
              style={{
                color: activeTab === "participantes" ? "#1F7ECC" : "#8F99A1",
              }}
            >
              Participantes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido Dinámico con Swipe */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const newTab =
              offsetX > SCREEN_WIDTH / 2 ? "participantes" : "historial";
            if (activeTab !== newTab) {
              setActiveTab(newTab);
            }
          }}
          className="-mx-6"
        >
          {/* Pestaña: Historial */}
          <ServiceHistory
          historial_pagos={service.historial_pagos || []}
          suscriptores={service.suscriptores || []}
          screenWidth={SCREEN_WIDTH}
          onTogglePayment={togglePaymentStatus}
          accounts={accounts}
          serviceStatus={serviceStatus}
          onPayService={() => setPayServiceModalVisible(true)}
          selectedMonthIndex={selectedMonthIndex}
          onChangeMonth={setSelectedMonthIndex}
          diaCobro={service.dia_cobro}
          onAdvancePayment={handleAdvancePayment}
        />

          {/* Pestaña: Participantes */}
          <ServiceParticipants
            esCompartido={service.es_compartido}
            suscriptores={service.suscriptores || []}
            screenWidth={SCREEN_WIDTH}
            onAddPress={openAddSubscriberModal}
            onEditPress={openSubscriberModal}
            onRemovePress={handleRemoveSubscriber}
            onSharePress={() => {}}
            onAdvancePayment={handleAdvancePayment}
          />
        </ScrollView>
        <View className="h-10" />
      </ScrollView>

      {/* Modales */}
      <EditServiceModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        service={service}
        draftService={draftService}
        setDraftService={setDraftService}
        costoInput={costoInput}
        setCostoInput={setCostoInput}
        onSave={saveServiceChanges}
        accounts={accounts}
      />

      <SubscriberModal
        visible={isSubscriberModalVisible}
        onClose={() => setSubscriberModalVisible(false)}
        editingIndex={editingSubscriberIndex}
        subscriberDraft={subscriberDraft}
        setSubscriberDraft={setSubscriberDraft}
        subscriberQuotaInput={subscriberQuotaInput}
        setSubscriberQuotaInput={setSubscriberQuotaInput}
        subscriberErrors={subscriberErrors}
        setSubscriberErrors={setSubscriberErrors}
        onSave={saveSubscriberChanges}
        contacts={contacts}
      />

      <PayServiceModal
        visible={isPayServiceModalVisible}
        onClose={() => setPayServiceModalVisible(false)}
        onConfirm={handlePayService}
        montoSugerido={service.costo_total_actual}
        mes={service.historial_pagos?.[selectedMonthIndex]?.mes_anio || "Mes Actual"}
        accounts={accounts}
      />

      {/* Alerta Personalizada */}
      <EVAAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonText={alertConfig.buttonText}
        onClose={() => {
          if (alertConfig.onPrimaryAction) {
            alertConfig.onPrimaryAction();
          }
          setAlertConfig({ ...alertConfig, visible: false });
        }}
        onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
        secondaryButtonText={alertConfig.secondaryButtonText}
        onSecondaryAction={alertConfig.onSecondaryAction}
        horizontalButtons={alertConfig.horizontalButtons}
      />
    </SafeAreaView>
  );
}
