import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../config/firebaseConfig";
import {
  Service,
  Subscriber,
  ServicePayment,
  addSubscriber,
  recordServicePayment,
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
  const [payments, setPayments] = useState<ServicePayment[]>([]);

  // Modal Estados
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"addSub" | "addPay">("addSub");

  // Inputs Agregado
  const [subName, setSubName] = useState("");
  const [subQuota, setSubQuota] = useState("");
  const [payAmount, setPayAmount] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    if (!user || !service.id) return;

    // Escuchar Suscriptores en tiempo real
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

    // Escuchar Mis Pagos en tiempo real
    const payRef = collection(
      db,
      "users",
      user.uid,
      "services",
      service.id,
      "owner_payments"
    );
    const unsubPay = onSnapshot(
      query(payRef, orderBy("date", "desc")),
      (snapshot) => {
        const pays = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate(),
        })) as ServicePayment[];
        setPayments(pays);
      }
    );

    return () => {
      unsubSub();
      unsubPay();
    };
  }, [user, service]);

  const handleAddSubscriber = async () => {
    if (!subName || !subQuota) {
      Alert.alert("Error", "Completa nombre y cuota");
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
      Alert.alert("Éxito", "Suscriptor agregado");
    } catch (e) {
      Alert.alert("Error", "No se pudo agregar");
    }
  };

  const handleAddPayment = async () => {
    if (!payAmount) {
      Alert.alert("Error", "Ingresa el monto pagado");
      return;
    }
    try {
      await recordServicePayment(
        user!.uid,
        service.id!,
        service.name,
        parseFloat(payAmount)
      );
      setModalVisible(false);
      setPayAmount("");
      Alert.alert("Éxito", "Pago registrado y descontado de billetera");
    } catch (e) {
      Alert.alert("Error", "No se pudo registrar");
    }
  };

  const openAddModal = () => {
    if (activeTab === "subscribers") {
      setModalType("addSub");
    } else {
      setModalType("addPay");
    }
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
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
          data={payments}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Ionicons
                name="checkmark-circle"
                size={30}
                color={colors.success}
                style={{ marginRight: 15 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>Pago Realizado</Text>
                <Text style={styles.itemSub}>
                  {item.date.toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.amount}>- S/ {item.amount.toFixed(2)}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No has registrado pagos.</Text>
          }
        />
      )}

      {/* FAB Add */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={30} color="#000" />
      </TouchableOpacity>

      {/* Modal Simple */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === "addSub"
                ? "Agregar Suscriptor"
                : "Registrar Mi Pago"}
            </Text>

            {modalType === "addSub" ? (
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
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Monto Pagado (S/)"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={payAmount}
                  onChangeText={setPayAmount}
                />
                <Text style={styles.note}>
                  * Esto se registrará como un EGRESO en tu billetera.
                </Text>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={
                  modalType === "addSub"
                    ? handleAddSubscriber
                    : handleAddPayment
                }
                style={styles.saveButton}
              >
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
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
});
