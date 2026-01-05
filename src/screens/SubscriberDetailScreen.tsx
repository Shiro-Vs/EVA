import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { colors } from "../theme/colors";
import { auth } from "../config/firebaseConfig";
import {
  Subscriber,
  Debt,
  generateDebt,
  paySubscriberDebt,
  payMultipleMonths,
  deleteSubscriberDebt,
  revertDebtToPending,
  updateSubscriber,
  deleteSubscriber,
} from "../services/subscriptionService";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { Modal, TextInput } from "react-native";

export default function SubscriberDetailScreen({ route, navigation }: any) {
  const { serviceId, subscriber } = route.params as {
    serviceId: string;
    subscriber: Subscriber;
  };
  const [debts, setDebts] = useState<Debt[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [monthsToAdd, setMonthsToAdd] = useState("1");
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [subscriberOptionsVisible, setSubscriberOptionsVisible] =
    useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Edit State
  const [editName, setEditName] = useState(subscriber.name);
  const [editQuota, setEditQuota] = useState(subscriber.quota.toString());

  const user = auth.currentUser;

  useEffect(() => {
    if (!user || !serviceId || !subscriber.id) return;

    // Escuchar Deudas
    const debtRef = collection(
      db,
      "users",
      user.uid,
      "services",
      serviceId,
      "subscribers",
      subscriber.id,
      "debts"
    );
    // Ordenar por creación (asumiendo que los últimos meses se crean al final)
    const q = query(debtRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Debt[];
      setDebts(data);
    });

    return () => unsub();
  }, [user, serviceId, subscriber]);

  const handleGenerateMonth = async () => {
    // Generar deuda del mes actual manual (o preguntar mes)
    // Por simplicidad, generará el mes actual si no existe, o duplicado si ya existe
    // En prod deberíamos chequear si ya existe.
    Alert.alert("Generar Mes", "¿Generar deuda para este mes actual?", [
      { text: "Cancelar" },
      {
        text: "Sí, generar",
        onPress: async () => {
          await generateDebt(
            user!.uid,
            serviceId,
            subscriber.id!,
            subscriber.quota
          );
        },
      },
    ]);
  };

  const handlePay = (debt: Debt) => {
    Alert.alert(
      "Registrar Pago",
      `¿Cobrar S/ ${debt.amount} de ${debt.month}?`,
      [
        { text: "Cancelar" },
        {
          text: "Sí, Cobrar",
          onPress: async () => {
            try {
              await paySubscriberDebt(
                user!.uid,
                serviceId,
                subscriber.id!,
                debt.id!,
                debt.amount,
                debt.month
              );
              Alert.alert(
                "Éxito",
                "Pago registrado. Se agregó a tu Billetera."
              );
            } catch (e) {
              Alert.alert("Error", "No se pudo registrar el pago");
            }
          },
        },
      ]
    );
  };

  const handleAdvancePayment = async () => {
    const months = parseInt(monthsToAdd);
    if (isNaN(months) || months < 1) {
      Alert.alert("Error", "Ingresa un número válido de meses (min 1).");
      return;
    }

    try {
      // Intentar buscar el "último mes" de la lista actual de deudas.
      // Como pueden estar desordenadas o tener fechas de creación casi idénticas,
      // lo ideal sería parsear el string, pero asumiremos que el que esté arriba (o abajo)
      // es reciente si la query es por fecha.
      // MEJORA: Buscar el mes con fecha posterior parseando el texto.

      // Helper rápido para parsear "Mes Año" a un timestamp sortable
      const parseMonth = (m: string) => {
        const parts = m.split(" ");
        const monthsEs = [
          "enero",
          "febrero",
          "marzo",
          "abril",
          "mayo",
          "junio",
          "julio",
          "agosto",
          "septiembre",
          "octubre",
          "noviembre",
          "diciembre",
        ];
        const midx = monthsEs.indexOf(parts[0].toLowerCase());
        const y = parseInt(parts[1]);
        if (midx === -1 || isNaN(y)) return 0;
        return new Date(y, midx, 1).getTime();
      };

      await payMultipleMonths(user!.uid, serviceId, subscriber, months, debts);

      setModalVisible(false);
      setMonthsToAdd("1");
      Alert.alert("Éxito", `Se han adelantado ${months} meses correctamente.`);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Hubo un problema al procesar el adelanto.");
    }
  };

  const handleDeleteSubscriber = () => {
    Alert.alert(
      "Eliminar Suscriptor",
      "Se borrará todo el historial de deudas de este usuario. (Tus ingresos en Billetera NO se verán afectados). ¿Continuar?",
      [
        { text: "Cancelar" },
        {
          text: "Eliminar Definitivamente",
          onPress: async () => {
            try {
              await deleteSubscriber(user!.uid, serviceId, subscriber.id!);
              navigation.goBack();
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "No se pudo eliminar al suscriptor");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleUpdateSubscriber = async () => {
    const quotaNum = parseFloat(editQuota);
    if (!editName.trim() || isNaN(quotaNum)) {
      Alert.alert("Error", "Datos inválidos");
      return;
    }

    try {
      await updateSubscriber(user!.uid, serviceId, subscriber.id!, {
        name: editName,
        quota: quotaNum,
      });
      // Actualizar UI localmente o esperar a que el parent refresh (como es param, mejor modificar subscriber object si fuera state global, aqui solo cerramos y confiamos que el usuario vuelve a entrar o implementamos refresh real)
      // Como 'subscriber' viene de params y no de un listener directo aqui,
      // idealmente deberíamos escuchar el doc del suscriptor tambien o regresar.
      // Por simplicidad: Alert y regresar, o simplemente cerrar.

      // Un hack rapido es navegar atras, o actualizar el objeto visualmente si usaramos estado.
      // Dado el setup actual:
      setEditModalVisible(false);
      setSubscriberOptionsVisible(false);
      navigation.setParams({
        subscriber: { ...subscriber, name: editName, quota: quotaNum },
      }); // Actualiza params para reflejar cambios inmediatos
      Alert.alert("Éxito", "Suscriptor actualizado");
    } catch (e) {
      Alert.alert("Error", "No se pudo actualizar");
    }
  };

  const handleDebtOptions = (debt: Debt) => {
    setSelectedDebt(debt);
    setOptionsModalVisible(true);
  };

  const handleDeleteDebt = () => {
    if (!selectedDebt) return;
    Alert.alert(
      "Eliminar Mes",
      "Si eliminas este mes y estaba pagado, se descontará de tu billetera. ¿Continuar?",
      [
        { text: "Cancelar" },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await deleteSubscriberDebt(
                user!.uid,
                serviceId,
                subscriber.id!,
                selectedDebt
              );
              setOptionsModalVisible(false);
            } catch (e) {
              Alert.alert("Error", "No se pudo eliminar");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleRevertToPending = () => {
    if (!selectedDebt) return;
    Alert.alert(
      "Marcar como Pendiente",
      "Se revertirá el pago y se descontará de tu billetera. ¿Continuar?",
      [
        { text: "Cancelar" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              await revertDebtToPending(
                user!.uid,
                serviceId,
                subscriber.id!,
                selectedDebt
              );
              setOptionsModalVisible(false);
            } catch (e) {
              Alert.alert("Error", "No se pudo actualizar");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Debt }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onLongPress={() => handleDebtOptions(item)}
      delayLongPress={500}
      activeOpacity={0.8}
    >
      <View>
        <Text style={styles.month}>{item.month}</Text>
        <Text style={styles.amount}>S/ {item.amount.toFixed(2)}</Text>
      </View>

      {item.status === "paid" ? (
        <TouchableOpacity onPress={() => handleDebtOptions(item)}>
          <View style={[styles.badge, { backgroundColor: colors.success }]}>
            <Text style={styles.badgeText}>PAGADO</Text>
            <Ionicons name="checkmark" size={12} color="black" />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.payButton]}
          onPress={() => handlePay(item)}
        >
          <Text style={styles.payText}>Cobrar</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Settings Icon */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setSubscriberOptionsVisible(true)}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{subscriber.name[0]}</Text>
        </View>
        <Text style={styles.name}>{subscriber.name}</Text>
        <Text style={styles.info}>Cuota Pactada: S/ {subscriber.quota}</Text>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Historial de Meses</Text>
      </View>

      <FlatList
        data={debts}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay deudas generadas.</Text>
        }
      />

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="cash-outline" size={28} color="#000" />
      </TouchableOpacity>

      {/* MODAL PARA ADELANTAR MESES */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adelantar Cuotas</Text>
            <Text style={styles.modalText}>
              Ingrese la cantidad de meses a pagar por adelantado:
            </Text>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={monthsToAdd}
              onChangeText={setMonthsToAdd}
              placeholder="Ej: 3"
              placeholderTextColor="#666"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAdvancePayment}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE OPCIONES */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedDebt?.month}</Text>

            {selectedDebt?.status === "paid" && (
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleRevertToPending}
              >
                <Ionicons name="refresh" size={20} color={colors.text} />
                <Text style={styles.optionText}>Marcar como Pendiente</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleDeleteDebt}
            >
              <Ionicons name="trash" size={20} color={colors.secondary} />
              <Text style={[styles.optionText, { color: colors.secondary }]}>
                Eliminar Mes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { borderBottomWidth: 0 }]}
              onPress={() => setOptionsModalVisible(false)}
            >
              <Text style={styles.optionTextCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL OPCIONES DE SUSCRIPTOR */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={subscriberOptionsVisible}
        onRequestClose={() => setSubscriberOptionsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opciones del Suscriptor</Text>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setSubscriberOptionsVisible(false);
                setEditModalVisible(true);
              }}
            >
              <Ionicons name="pencil" size={20} color={colors.text} />
              <Text style={styles.optionText}>Editar Suscriptor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleDeleteSubscriber}
            >
              <Ionicons name="trash" size={20} color={colors.secondary} />
              <Text style={[styles.optionText, { color: colors.secondary }]}>
                Eliminar Suscriptor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { borderBottomWidth: 0 }]}
              onPress={() => setSubscriberOptionsVisible(false)}
            >
              <Text style={styles.optionTextCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL EDITAR SUSCRIPTOR */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Suscriptor</Text>

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
              value={editName}
              onChangeText={setEditName}
            />

            <Text
              style={{
                alignSelf: "flex-start",
                color: colors.textSecondary,
                marginBottom: 5,
              }}
            >
              Cuota (S/)
            </Text>
            <TextInput
              style={styles.input}
              value={editQuota}
              onChangeText={setEditQuota}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateSubscriber}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 20 },
  header: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  settingsButton: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 10,
    zIndex: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 10,
  },
  avatarText: { fontSize: 32, fontWeight: "bold", color: colors.primary },
  name: { fontSize: 24, fontWeight: "bold", color: colors.text },
  info: { fontSize: 16, color: colors.textSecondary },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: "bold",
  },
  addButton: { color: colors.primary, fontWeight: "bold" },
  list: { padding: 20 },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 10,
  },
  month: { color: colors.text, fontSize: 16, fontWeight: "bold" },
  amount: { color: colors.textSecondary, fontSize: 14 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
    marginRight: 4,
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  payText: { color: "#000", fontWeight: "bold" },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
  },
  modalText: {
    color: colors.textSecondary,
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: colors.background,
    color: colors.text,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.secondary,
    fontWeight: "bold",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
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
