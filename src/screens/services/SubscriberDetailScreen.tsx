import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  BackHandler,
} from "react-native";
import { colors } from "../../theme/colors";
import { auth } from "../../config/firebaseConfig";
import {
  Subscriber,
  Debt,
  generateDebt,
  paySubscriberDebt,
  deleteSubscriberDebt,
  revertDebtToPending,
  updateSubscriber,
  deleteSubscriber,
} from "../../services/subscriptionService";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./subscribers/styles/SubscriberDetailStyles";

// Components
import { GridItem } from "./subscribers/components/GridItem";
import { SummarySection } from "./subscribers/components/SummarySection";
import { BulkAction } from "./subscribers/components/BulkAction";

// Modals
import { PaymentConfirmationModal } from "../../components/modals/payments/PaymentConfirmationModal";
import { DebtOptionsModal } from "../../components/modals/payments/DebtOptionsModal";
import { SubscriberOptionsModal } from "../../components/modals/subscribers/SubscriberOptionsModal";
import { EditSubscriberModal } from "../../components/modals/subscribers/EditSubscriberModal";
import { EmptyMonthOptionsModal } from "../../components/modals/services/EmptyMonthOptionsModal";
import { CustomAlertModal } from "../../components/common/CustomAlertModal";

export default function SubscriberDetailScreen({ route, navigation }: any) {
  const { serviceId, subscriber } = route.params as {
    serviceId: string;
    subscriber: Subscriber;
  };
  const [debts, setDebts] = useState<Debt[]>([]);

  // States for Modals
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [subscriberOptionsVisible, setSubscriberOptionsVisible] =
    useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">(
    "success"
  );
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Payment Modal State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [targetPaymentItem, setTargetPaymentItem] = useState<any>(null); // { label, amount, debtId? }

  // Empty Modal State
  const [emptyModalVisible, setEmptyModalVisible] = useState(false);
  const [selectedEmptyItem, setSelectedEmptyItem] = useState<any>(null);

  // Filter: Solo Año
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // Multi-Select State (NEW)
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Array of fullLabels

  const user = auth.currentUser;

  useEffect(() => {
    if (!user || !serviceId || !subscriber.id) return;

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

  // Handle Hardware Back Button
  useEffect(() => {
    const backAction = () => {
      if (selectionMode) {
        exitSelectionMode();
        return true; // Prevent default behavior (exit screen)
      }
      return false; // Let default behavior happen
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [selectionMode]);

  // Auto-Exit Selection Mode if Empty
  useEffect(() => {
    if (selectionMode && selectedItems.length === 0) {
      setSelectionMode(false);
    }
  }, [selectedItems, selectionMode]);

  // --- Grid Data Generation ---
  const generateYearGrid = () => {
    const monthsEs = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const grid = [];
    for (let i = 0; i < 12; i++) {
      const monthName = monthsEs[i];
      const label = `${monthName} ${filterYear}`;

      const match = debts.find(
        (d) =>
          d.month.replace(" de ", " ").toLowerCase() === label.toLowerCase()
      );

      grid.push({
        label: monthName,
        fullLabel: label,
        index: i,
        debt: match || null,
        status: match ? match.status : "empty",
      });
    }
    return grid;
  };

  const calendarData = generateYearGrid();

  // --- Handlers ---

  // Toggle Selection
  const toggleSelection = (fullLabel: string) => {
    setSelectedItems((prev) => {
      const exists = prev.includes(fullLabel);
      if (exists) return prev.filter((l) => l !== fullLabel);
      return [...prev, fullLabel];
    });
  };

  const handleGridItemPress = (item: any) => {
    // SELECTION MODE LOGIC
    if (selectionMode) {
      if (item.status === "paid") return; // Cannot select paid for bulk payment
      toggleSelection(item.fullLabel);
      return;
    }

    // NORMAL MODE LOGIC
    if (item.status === "empty") {
      setSelectedEmptyItem(item);
      setEmptyModalVisible(true);
      return;
    }

    if (item.debt.status === "pending") {
      setTargetPaymentItem({
        label: item.fullLabel,
        amount: item.debt.amount,
        debtId: item.debt.id,
        isNew: false,
      });
      setPaymentModalVisible(true);
    } else if (item.debt.status === "paid") {
      setSelectedDebt(item.debt);
      setOptionsModalVisible(true);
    }
  };

  const handleLongPress = (item: any) => {
    if (item.status === "paid") return;
    if (!selectionMode) {
      setSelectionMode(true);
      toggleSelection(item.fullLabel);
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const handleBulkPay = () => {
    if (selectedItems.length === 0) return;

    const totalAmount = selectedItems.length * subscriber.quota;

    setTargetPaymentItem({
      label: `Pagando ${selectedItems.length} meses`,
      amount: totalAmount,
      isNew: false,
      isBulk: true, // Marker for bulk
      items: selectedItems,
    });
    setPaymentModalVisible(true);
  };

  const handleEmptyGenerate = async () => {
    if (!selectedEmptyItem) return;
    setEmptyModalVisible(false);
    try {
      await generateDebt(
        user!.uid,
        serviceId,
        subscriber.id!,
        subscriber.quota,
        selectedEmptyItem.fullLabel,
        "pending"
      );
    } catch (e) {
      Alert.alert("Error");
    }
  };

  const handleEmptyPay = () => {
    if (!selectedEmptyItem) return;
    setEmptyModalVisible(false);

    setTargetPaymentItem({
      label: selectedEmptyItem.fullLabel,
      amount: subscriber.quota,
      isNew: true,
    });
    setTimeout(() => setPaymentModalVisible(true), 300);
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;

    Alert.alert(
      "Eliminar Meses",
      `¿Estás seguro de eliminar ${selectedItems.length} meses seleccionados? Si están pagados, se reembolsarán.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              for (const label of selectedItems) {
                // Buscar deuda asociada
                const existingDebt = debts.find(
                  (d) =>
                    d.month.replace(" de ", " ") === label.replace(" de ", " ")
                );
                if (existingDebt) {
                  await deleteSubscriberDebt(
                    user!.uid,
                    serviceId,
                    subscriber.id!,
                    existingDebt
                  );
                }
                // Si no existe (empty/lazy), no hay nada que borrar en la BD
              }
              exitSelectionMode();
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Ocurrió un error al eliminar.");
            }
          },
        },
      ]
    );
  };

  const handleConfirmPayment = async (paymentDate: Date) => {
    if (!targetPaymentItem) return;

    try {
      // BULK PAYMENT LOGIC
      if (targetPaymentItem.isBulk) {
        const itemsProcess = targetPaymentItem.items as string[];
        for (const label of itemsProcess) {
          const existingDebt = debts.find(
            (d) => d.month.replace(" de ", " ") === label.replace(" de ", " ")
          );

          if (existingDebt && existingDebt.status === "pending") {
            await paySubscriberDebt(
              user!.uid,
              serviceId,
              subscriber.id!,
              existingDebt.id!,
              existingDebt.amount,
              label,
              paymentDate
            );
          } else {
            const newId = await generateDebt(
              user!.uid,
              serviceId,
              subscriber.id!,
              subscriber.quota,
              label,
              "paid",
              paymentDate
            );
            if (newId) {
              await paySubscriberDebt(
                user!.uid,
                serviceId,
                subscriber.id!,
                newId,
                subscriber.quota,
                label,
                paymentDate
              );
            }
          }
        }
        setPaymentModalVisible(false);
        exitSelectionMode();

        setAlertType("success");
        setAlertTitle("¡Pagos Masivos Exitosos!");
        setAlertMessage("Se han registrado todos los pagos seleccionados.");
        setAlertVisible(true);
        return;
      }

      // SINGLE PAYMENT LOGIC
      if (targetPaymentItem.isNew) {
        const newId = await generateDebt(
          user!.uid,
          serviceId,
          subscriber.id!,
          targetPaymentItem.amount,
          targetPaymentItem.label,
          "paid",
          paymentDate
        );
        if (newId) {
          await paySubscriberDebt(
            user!.uid,
            serviceId,
            subscriber.id!,
            newId,
            targetPaymentItem.amount,
            targetPaymentItem.label,
            paymentDate
          );
        }
      } else {
        await paySubscriberDebt(
          user!.uid,
          serviceId,
          subscriber.id!,
          targetPaymentItem.debtId,
          targetPaymentItem.amount,
          targetPaymentItem.label,
          paymentDate
        );
      }
      setPaymentModalVisible(false);

      // SHOW SUCCESS MODAL instead of Alert.alert
      setAlertType("success");
      setAlertTitle("¡Pago Exitoso!");
      setAlertMessage(
        targetPaymentItem.isBulk
          ? "Pagos masivos registrados correctamente."
          : "Pago registrado correctamente."
      );
      setAlertVisible(true);
    } catch (e) {
      console.error(e);
      setAlertType("error");
      setAlertTitle("Error");
      setAlertMessage("No se pudo registrar el pago.");
      setAlertVisible(true);
    }
  };

  const handleDeleteSubscriber = () => {
    Alert.alert("Eliminar Suscriptor", "Se borrará todo. ¿Continuar?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        onPress: async () => {
          await deleteSubscriber(user!.uid, serviceId, subscriber.id!);
          navigation.goBack();
        },
        style: "destructive",
      },
    ]);
  };

  const handleUpdateSubscriber = async (name: string, quota: string) => {
    const quotaNum = parseFloat(quota);
    if (!name.trim() || isNaN(quotaNum)) return;
    await updateSubscriber(user!.uid, serviceId, subscriber.id!, {
      name,
      quota: quotaNum,
    });
    setEditModalVisible(false);
    setSubscriberOptionsVisible(false);
    navigation.setParams({
      subscriber: { ...subscriber, name, quota: quotaNum },
    });
  };

  const handleDeleteDebt = async () => {
    if (!selectedDebt) return;
    await deleteSubscriberDebt(
      user!.uid,
      serviceId,
      subscriber.id!,
      selectedDebt
    );
    setOptionsModalVisible(false);
  };

  const handleRevertToPending = async () => {
    if (!selectedDebt) return;
    await revertDebtToPending(
      user!.uid,
      serviceId,
      subscriber.id!,
      selectedDebt
    );
    setOptionsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{subscriber.name[0]}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{subscriber.name}</Text>
          <Text style={styles.info}>Cuota: S/ {subscriber.quota}</Text>
        </View>
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
      </View>

      {/* SUMMARY SECTION - 2 CARDS */}
      <SummarySection debts={debts} />

      {/* Year Filter */}
      <View style={styles.listHeaderContainer}>
        <View style={styles.yearFilter}>
          <TouchableOpacity onPress={() => setFilterYear((y) => y - 1)}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.yearFilterText}>{filterYear}</Text>
          <TouchableOpacity onPress={() => setFilterYear((y) => y + 1)}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid List */}
      <FlatList
        key="grid-3"
        data={calendarData}
        keyExtractor={(item) => item.fullLabel}
        renderItem={({ item }) => (
          <GridItem
            item={item}
            selectedItems={selectedItems}
            onPress={handleGridItemPress}
            onLongPress={handleLongPress}
          />
        )}
        numColumns={3}
        contentContainerStyle={styles.gridList}
      />

      {/* Bulk Action */}
      <BulkAction
        selectionMode={selectionMode}
        selectedCount={selectedItems.length}
        onExit={exitSelectionMode}
        onDelete={handleBulkDelete}
        onPay={handleBulkPay}
      />

      {/* Modals */}
      <EmptyMonthOptionsModal
        visible={emptyModalVisible}
        onClose={() => setEmptyModalVisible(false)}
        monthLabel={selectedEmptyItem?.fullLabel || ""}
        onGenerateDebt={handleEmptyGenerate}
        onPayNow={handleEmptyPay}
      />

      <PaymentConfirmationModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onConfirm={handleConfirmPayment}
        monthLabel={targetPaymentItem?.label || ""}
        amount={targetPaymentItem?.amount || 0}
      />

      <DebtOptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        debt={selectedDebt}
        onRevert={handleRevertToPending}
        onDelete={handleDeleteDebt}
      />

      <SubscriberOptionsModal
        visible={subscriberOptionsVisible}
        onClose={() => setSubscriberOptionsVisible(false)}
        onEdit={() => setEditModalVisible(true)}
        onDelete={handleDeleteSubscriber}
      />

      <EditSubscriberModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        initialName={subscriber.name}
        initialQuota={subscriber.quota}
        onSave={handleUpdateSubscriber}
      />

      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        variant="info"
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}
