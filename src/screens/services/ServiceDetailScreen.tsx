import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CustomAlertModal } from "../../components/common/CustomAlertModal";
import { AddSubscriberModal } from "../../components/modals/subscribers/AddSubscriberModal";
import { ServiceOptionsModal } from "../../components/modals/services/ServiceOptionsModal";
import { EditServiceModal } from "../../components/modals/services/EditServiceModal";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../config/firebaseConfig";
import {
  Service,
  Subscriber,
  OwnerDebt,
  checkAndGenerateServiceDebts,
  payOwnerDebt,
  addSubscriber,
  updateService,
  deleteService,
} from "../../services/subscriptionService";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { styles } from "./serviceDetail/styles/ServiceDetailStyles";

// New Components
import { ServiceHeader } from "./serviceDetail/components/ServiceHeader";
import { SubscribersTab } from "./serviceDetail/components/SubscribersTab";
import { PaymentsTab } from "./serviceDetail/components/PaymentsTab";

export default function ServiceDetailScreen({ route, navigation }: any) {
  const { service } = route.params as { service: Service };
  const [activeTab, setActiveTab] = useState<"subscribers" | "payments">(
    "subscribers"
  );
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [ownerDebts, setOwnerDebts] = useState<OwnerDebt[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal Estados
  const [modalVisible, setModalVisible] = useState(false);

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
    cancelText?: string;
    confirmText?: string;
  }>({
    visible: false,
    title: "",
    message: "",
    variant: "info",
  });

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

  const user = auth.currentUser;

  useEffect(() => {
    if (!user || !service.id) return;

    // 1. Ejecutar Lazy Check (Generación Automática)
    checkAndGenerateServiceDebts(user.uid, service);

    // 2. Escuchar Suscriptores
    const subRef = collection(
      db,
      "users",
      user.uid,
      "services",
      service.id,
      "subscribers"
    );
    const unsubSub = onSnapshot(subRef, (snapshot) => {
      const subs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subscriber[];
      setSubscribers(subs);
    });

    // 3. Escuchar Deudas del Dueño (OwnerDebts)
    const ownerDebtsRef = collection(
      db,
      "users",
      user.uid,
      "services",
      service.id,
      "owner_debts"
    );
    // Ordenar por fecha creación descendente
    const qOwner = query(ownerDebtsRef, orderBy("createdAt", "desc"));

    const unsubOwner = onSnapshot(qOwner, (snapshot) => {
      const debts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // createdAt viene como Timestamp
        createdAt: doc.data().createdAt?.toDate(),
      })) as OwnerDebt[];
      setOwnerDebts(debts);
    });

    return () => {
      unsubSub();
      unsubOwner();
    };
  }, [user, service]);

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
    showAlert(
      "Pagar Servicio",
      `¿Confirmar pago de S/ ${debt.amount} por ${debt.month}?`,
      "confirm",
      async () => {
        try {
          setLoading(true);
          closeAlert(); // Cerrar modal antes de procesar
          await payOwnerDebt(user!.uid, service.id!, debt);

          // Pequeño delay para que se note la transición si fuera necesario,
          // pero mejor mostrar éxito directo.
          setTimeout(() => {
            showAlert("Éxito", "Pago registrado en tu Billetera", "info");
          }, 500);
        } catch (e) {
          showAlert("Error", "No se pudo registrar el pago", "info");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleUpdateService = async (
    name: string,
    costStr: string,
    dayStr: string
  ) => {
    const cost = parseFloat(costStr);
    const day = parseInt(dayStr);

    if (!name.trim() || isNaN(cost) || isNaN(day) || day < 1 || day > 31) {
      showAlert("Error", "Verifica los datos del servicio.", "info");
      return;
    }

    try {
      await updateService(user!.uid, service.id!, {
        name: name,
        cost: cost,
        billingDay: day,
      });
      setEditServiceModalVisible(false);
      setServiceOptionsVisible(false); // Should check if this is needed if closed by modal
      navigation.setParams({
        service: { ...service, name: name, cost, billingDay: day },
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

  return (
    <View style={styles.container}>
      <ServiceHeader
        name={service.name}
        billingDay={service.billingDay}
        cost={service.cost}
        onSettingsPress={() => setServiceOptionsVisible(true)}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "subscribers" && styles.activeTab]}
          onPress={() => setActiveTab("subscribers")}
        >
          <Text style={styles.tabText}>Suscriptores</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "payments" && styles.activeTab]}
          onPress={() => setActiveTab("payments")}
        >
          <Text style={styles.tabText}>Mis Pagos</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      {activeTab === "subscribers" ? (
        <SubscribersTab
          subscribers={subscribers}
          onSelectSubscriber={(item) =>
            navigation.navigate("SubscriberDetail", {
              serviceId: service.id,
              subscriber: item,
            })
          }
        />
      ) : (
        <PaymentsTab debts={ownerDebts} onPayDebt={handlePayOwnerDebt} />
      )}

      {/* FAB Add (Solo para suscriptores ahora, pagos son automáticos) */}
      {activeTab === "subscribers" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={30} color="#000" />
        </TouchableOpacity>
      )}

      <AddSubscriberModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddSubscriber}
      />

      {/* MODAL SERVICE OPTIONS */}
      <ServiceOptionsModal
        visible={serviceOptionsVisible}
        onClose={() => setServiceOptionsVisible(false)}
        onEdit={() => setEditServiceModalVisible(true)}
        onDelete={handleDeleteService}
      />

      {/* MODAL EDIT SERVICE */}
      <EditServiceModal
        visible={editServiceModalVisible}
        onClose={() => setEditServiceModalVisible(false)}
        initialName={service.name}
        initialCost={service.cost}
        initialDay={service.billingDay}
        onSubmit={handleUpdateService}
      />

      {/* MODAL CUSTOM ALERT */}
      <CustomAlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        onClose={closeAlert}
        onConfirm={alertState.onConfirm}
      />
    </View>
  );
}
