import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import { colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../config/firebaseConfig";
import {
  Service,
  Subscriber,
  OwnerDebt,
  checkAndGenerateServiceDebts,
  payOwnerDebt,
  addSubscriber,
  updateService,
  deleteService,
} from "../services/subscriptionService";
// Aquí deberíamos tener funciones para getSubscribers y getServicePayments
// Por ahora simularemos o las agregaremos al servicio si faltan.
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

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

  // Inputs Agregado
  const [subName, setSubName] = useState("");
  const [subQuota, setSubQuota] = useState("");

  // Service Options State
  const [serviceOptionsVisible, setServiceOptionsVisible] = useState(false);
  const [editServiceModalVisible, setEditServiceModalVisible] = useState(false);
  const [editServiceName, setEditServiceName] = useState(service.name);
  const [editServiceCost, setEditServiceCost] = useState(
    service.cost.toString()
  );
  const [editServiceDay, setEditServiceDay] = useState(
    service.billingDay.toString()
  );

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

  const handleAddSubscriber = async () => {
    if (!subName || !subQuota) {
      showAlert("Error", "Completa nombre y cuota", "info");
      return;
    }
    try {
      await addSubscriber(user!.uid, service.id!, {
        name: subName,
        quota: parseFloat(subQuota),
        startDate: new Date(),
      });
      setModalVisible(false);
      setSubName("");
      setSubQuota("");
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

  const handleUpdateService = async () => {
    const cost = parseFloat(editServiceCost);
    const day = parseInt(editServiceDay);

    if (
      !editServiceName.trim() ||
      isNaN(cost) ||
      isNaN(day) ||
      day < 1 ||
      day > 31
    ) {
      showAlert("Error", "Verifica los datos del servicio.", "info");
      return;
    }

    try {
      await updateService(user!.uid, service.id!, {
        name: editServiceName,
        cost: cost,
        billingDay: day,
      });
      setEditServiceModalVisible(false);
      setServiceOptionsVisible(false);
      navigation.setParams({
        service: { ...service, name: editServiceName, cost, billingDay: day },
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
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setServiceOptionsVisible(true)}
      >
        <Ionicons
          name="settings-sharp"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <Text style={styles.title}>{service.name}</Text>
      <Text style={styles.subtitle}>
        Corte el día {service.billingDay} • Costo: S/ {service.cost}
      </Text>

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
        <FlatList
          data={subscribers}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("SubscriberDetail", {
                  serviceId: service.id,
                  subscriber: item,
                })
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSub}>Cuota: S/ {item.quota}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay suscriptores aún.</Text>
          }
        />
      ) : (
        <FlatList
          data={ownerDebts}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ marginRight: 15 }}>
                <Ionicons
                  name={item.status === "paid" ? "checkmark-circle" : "time"}
                  size={30}
                  color={
                    item.status === "paid" ? colors.success : colors.secondary
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.month}</Text>
                <Text style={styles.itemSub}>
                  {item.status === "paid" ? "Pagado" : "Pendiente de Pago"}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.amount}>- S/ {item.amount.toFixed(2)}</Text>
                {item.status === "pending" && (
                  <TouchableOpacity
                    style={styles.payButtonSmall}
                    onPress={() => handlePayOwnerDebt(item)}
                  >
                    <Text style={styles.payButtonTextSmall}>Pagar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes deudas de servicio.</Text>
          }
        />
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

      {/* Modal Simple */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Suscriptor</Text>

            <>
              <TextInput
                style={styles.input}
                placeholder="Nombre (Ej: Juan)"
                placeholderTextColor={colors.textSecondary}
                value={subName}
                onChangeText={setSubName}
              />
              <TextInput
                style={styles.input}
                placeholder="Cuota Mensual (S/)"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={subQuota}
                onChangeText={setSubQuota}
              />
              <Text style={styles.note}>
                * Se creará la deuda de este mes automáticamente.
              </Text>
            </>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddSubscriber}
                style={styles.saveButton}
              >
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL SERVICE OPTIONS */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={serviceOptionsVisible}
        onRequestClose={() => setServiceOptionsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opciones del Servicio</Text>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setServiceOptionsVisible(false);
                setEditServiceModalVisible(true);
              }}
            >
              <Ionicons name="pencil" size={20} color={colors.text} />
              <Text style={styles.optionText}>Editar Servicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleDeleteService}
            >
              <Ionicons name="trash" size={20} color={colors.secondary} />
              <Text style={[styles.optionText, { color: colors.secondary }]}>
                Eliminar Servicio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { borderBottomWidth: 0 }]}
              onPress={() => setServiceOptionsVisible(false)}
            >
              <Text style={styles.optionTextCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL EDIT SERVICE */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editServiceModalVisible}
        onRequestClose={() => setEditServiceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Servicio</Text>

            <Text
              style={{
                alignSelf: "flex-start",
                color: colors.textSecondary,
                marginBottom: 5,
              }}
            >
              Nombre
            </Text>
            <TextInput
              style={styles.input}
              value={editServiceName}
              onChangeText={setEditServiceName}
            />

            <Text
              style={{
                alignSelf: "flex-start",
                color: colors.textSecondary,
                marginBottom: 5,
              }}
            >
              Costo Total (S/)
            </Text>
            <TextInput
              style={styles.input}
              value={editServiceCost}
              onChangeText={setEditServiceCost}
              keyboardType="numeric"
            />

            <Text
              style={{
                alignSelf: "flex-start",
                color: colors.textSecondary,
                marginBottom: 5,
              }}
            >
              Día de Corte
            </Text>
            <TextInput
              style={styles.input}
              value={editServiceDay}
              onChangeText={setEditServiceDay}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setEditServiceModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateService}
                style={styles.saveButton}
              >
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CUSTOM ALERT */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertState.visible}
        onRequestClose={closeAlert}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{alertState.title}</Text>
            <Text
              style={{
                color: colors.textSecondary,
                textAlign: "center",
                marginBottom: 20,
                fontSize: 16,
              }}
            >
              {alertState.message}
            </Text>

            <View style={styles.modalButtons}>
              {/* Cancel/OK Button */}
              <TouchableOpacity
                onPress={closeAlert}
                style={
                  alertState.variant !== "info"
                    ? styles.cancelButton
                    : styles.saveButton
                }
              >
                <Text
                  style={
                    alertState.variant !== "info"
                      ? styles.cancelText
                      : styles.saveText
                  }
                >
                  {alertState.variant === "info" ? "Aceptar" : "Cancelar"}
                </Text>
              </TouchableOpacity>

              {/* Confirm Button (Only if not info) */}
              {alertState.variant !== "info" && (
                <TouchableOpacity
                  onPress={alertState.onConfirm}
                  style={[
                    styles.saveButton,
                    alertState.variant === "destructive" && {
                      backgroundColor: colors.secondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.saveText,
                      alertState.variant === "destructive" && { color: "#FFF" },
                    ]}
                  >
                    {alertState.variant === "destructive"
                      ? "Eliminar"
                      : "Confirmar"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 40 },
  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  avatarText: { color: colors.primary, fontWeight: "bold", fontSize: 18 },
  itemName: { color: colors.text, fontSize: 16, fontWeight: "bold" },
  itemSub: { color: colors.textSecondary, fontSize: 14 },
  amount: { color: colors.text, fontSize: 16, fontWeight: "bold" },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 50,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  note: { color: colors.textSecondary, fontSize: 12, marginBottom: 20 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  cancelButton: { padding: 15 },
  cancelText: { color: colors.textSecondary },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  saveText: { color: "#000", fontWeight: "bold" },
  payButtonSmall: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 5,
  },
  payButtonTextSmall: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  settingsButton: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
  },
  optionTextCancel: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    width: "100%",
  },
});
