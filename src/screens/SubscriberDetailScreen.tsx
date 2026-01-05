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
} from "../services/subscriptionService";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

export default function SubscriberDetailScreen({ route, navigation }: any) {
  const { serviceId, subscriber } = route.params as {
    serviceId: string;
    subscriber: Subscriber;
  };
  const [debts, setDebts] = useState<Debt[]>([]);
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

  const renderItem = ({ item }: { item: Debt }) => (
    <View style={styles.historyItem}>
      <View>
        <Text style={styles.month}>{item.month}</Text>
        <Text style={styles.amount}>S/ {item.amount.toFixed(2)}</Text>
      </View>

      {item.status === "paid" ? (
        <View style={[styles.badge, { backgroundColor: colors.success }]}>
          <Text style={styles.badgeText}>PAGADO</Text>
          <Ionicons name="checkmark" size={12} color="black" />
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.payButton]}
          onPress={() => handlePay(item)}
        >
          <Text style={styles.payText}>Cobrar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{subscriber.name[0]}</Text>
        </View>
        <Text style={styles.name}>{subscriber.name}</Text>
        <Text style={styles.info}>Cuota Pactada: S/ {subscriber.quota}</Text>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Historial de Meses</Text>
        <TouchableOpacity onPress={handleGenerateMonth}>
          <Text style={styles.addButton}>+ Generar Mes</Text>
        </TouchableOpacity>
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
});
