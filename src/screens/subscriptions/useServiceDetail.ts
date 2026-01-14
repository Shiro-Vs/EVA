import { useState, useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { auth } from "../../config/firebaseConfig";
import {
  Service,
  OwnerDebt,
  checkAndGenerateServiceDebts,
  payOwnerDebt,
  addSubscriber,
  updateService,
  deleteService,
} from "../../services/subscriptionService";
import { useServiceData } from "../../hooks/useServiceData";

export const useServiceDetail = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { service } = route.params as { service: Service };
  const user = auth.currentUser;

  // Custom Hook for Data
  const {
    subscribers,
    ownerDebts,
    loading: dataLoading,
  } = useServiceData(user?.uid, service);

  // States
  const [activeTab, setActiveTab] = useState<"subscribers" | "payments">(
    "payments"
  );
  const [loading, setLoading] = useState(false); // Action loading

  // Modal Estados
  const [modalVisible, setModalVisible] = useState(false);

  // Payment Modal State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [targetPaymentItem, setTargetPaymentItem] = useState<OwnerDebt | null>(
    null
  );

  // Service Options State
  const [serviceOptionsVisible, setServiceOptionsVisible] = useState(false);
  const [editServiceModalVisible, setEditServiceModalVisible] = useState(false);

  // === Custom Alert State ===
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: "info" | "confirm" | "destructive";
    onConfirm?: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    variant: "info",
  });

  // Effect to handle automatic tab switching
  useEffect(() => {
    if (subscribers.length > 0) {
      setActiveTab("subscribers");
    } else {
      setActiveTab("payments");
    }
  }, [subscribers.length]);

  const showAlert = (
    title: string,
    message: string,
    variant: "info" | "confirm" | "destructive" = "info",
    onConfirm?: () => void
  ) => {
    setAlertState({
      visible: true,
      title,
      message,
      variant,
      onConfirm,
    });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  const handleAddSubscriber = async (name: string, quota: string) => {
    if (!name || !quota) {
      showAlert("Error", "Completa nombre y cuota", "info");
      return;
    }
    try {
      await addSubscriber(user!.uid, service.id!, {
        name: name,
        quota: parseFloat(quota),
        startDate: new Date(),
      });
      setModalVisible(false);
      showAlert("Éxito", "Suscriptor agregado", "info");
    } catch (e) {
      showAlert("Error", "No se pudo agregar", "info");
    }
  };

  const handlePayOwnerDebt = (debt: OwnerDebt) => {
    setTargetPaymentItem(debt);
    setPaymentModalVisible(true);
  };

  const handleConfirmOwnerPay = async (paymentDate: Date) => {
    if (!targetPaymentItem) return;

    try {
      setLoading(true);
      setPaymentModalVisible(false); // Close modal
      await payOwnerDebt(
        user!.uid,
        service.id!,
        targetPaymentItem,
        paymentDate
      );

      setTimeout(() => {
        showAlert("Éxito", "Pago registrado en tu Billetera", "info");
      }, 500);
    } catch (e) {
      showAlert("Error", "No se pudo registrar el pago", "info");
    } finally {
      setLoading(false);
      setTargetPaymentItem(null);
    }
  };

  const handleUpdateService = async (
    name: string,
    costStr: string,
    dayStr: string,
    color?: string,
    icon?: string,
    logoUrl?: string,
    iconLibrary?: string,
    shared?: boolean,
    startDate?: Date
  ) => {
    const cost = parseFloat(costStr);
    const day = parseInt(dayStr);

    if (!name.trim() || isNaN(cost) || isNaN(day) || day < 1 || day > 31) {
      showAlert("Error", "Verifica los datos del servicio.", "info");
      return;
    }

    try {
      // 1. Update Service
      await updateService(user!.uid, service.id!, {
        name: name,
        cost: cost,
        billingDay: day,
        color: color ?? null,
        icon: icon ?? null,
        logoUrl: logoUrl ?? null,
        iconLibrary: iconLibrary ?? null,
        shared: shared ?? false,
        startDate: startDate ?? undefined, // Save start date
      });

      // 2. Trigger Debt Check (Backfill/Refresh)
      const updatedService: Service = {
        ...service,
        name,
        cost,
        billingDay: day,
        createdAt: service.createdAt,
        startDate: startDate,
      };
      await checkAndGenerateServiceDebts(user!.uid, updatedService);

      setEditServiceModalVisible(false);
      setServiceOptionsVisible(false);
      navigation.setParams({
        service: {
          ...service,
          name: name,
          cost,
          billingDay: day,
          color,
          icon,
          logoUrl,
          iconLibrary,
          shared,
          startDate: startDate,
        },
      });
      showAlert("Éxito", "Servicio actualizado", "info");
    } catch (e) {
      showAlert("Error", "No se pudo actualizar", "info");
    }
  };

  const handleDeleteService = () => {
    showAlert(
      "Eliminar Servicio",
      "⚠️ ESTA ACCIÓN ES DESTRUCTIVA.\nSe borrará el servicio, todos los suscriptores y sus deudas pendientes.\n\n(Tu historial de Billetera NO se borrará).",
      "destructive",
      async () => {
        try {
          await deleteService(user!.uid, service.id!);
          navigation.goBack();
        } catch (e) {
          showAlert("Error", "No se pudo eliminar el servicio", "info");
        }
      }
    );
  };

  return {
    service,
    subscribers,
    ownerDebts,
    loading,
    dataLoading,
    activeTab,
    setActiveTab,
    modalVisible,
    setModalVisible,
    paymentModalVisible,
    setPaymentModalVisible,
    targetPaymentItem,
    serviceOptionsVisible,
    setServiceOptionsVisible,
    editServiceModalVisible,
    setEditServiceModalVisible,
    alertState,
    showAlert,
    closeAlert,
    handleAddSubscriber,
    handlePayOwnerDebt,
    handleConfirmOwnerPay,
    handleUpdateService,
    handleDeleteService,
    navigation, // exported for navigation calls
  };
};
