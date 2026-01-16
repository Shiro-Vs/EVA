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
  processBulkPayment,
} from "../../services/subscriptionService";
import { monthsEs } from "../../utils/dateUtils";
import { useSubscriberDebts } from "../../hooks/useSubscriberDebts";
import { useSelectionMode } from "../../hooks/useSelectionMode";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./subscribers/styles/SubscriberDetailStyles";

// Components
import { GridItem } from "./subscribers/components/GridItem";
import { ListItem } from "./subscribers/components/ListItem";
import { SummarySection } from "./subscribers/components/SummarySection";
import { BulkAction } from "./subscribers/components/BulkAction";

// Modals
import { PaymentConfirmationModal } from "../../components/modals/payments/PaymentConfirmationModal";
import { DebtOptionsModal } from "../../components/modals/payments/DebtOptionsModal";
import { SubscriberOptionsModal } from "../../components/modals/subscribers/SubscriberOptionsModal";
import { EditSubscriberModal } from "../../components/modals/subscribers/EditSubscriberModal";
import { EmptyMonthOptionsModal } from "../../components/modals/services/EmptyMonthOptionsModal";
import { CustomAlertModal } from "../../components/common/CustomAlertModal";
import { useAccounts } from "../accounts/useAccounts"; // Correct path

export default function SubscriberDetailScreen({ route, navigation }: any) {
  const { serviceId, subscriber } = route.params as {
    serviceId: string;
    subscriber: Subscriber;
    serviceName: string;
  };
  const user = auth.currentUser;

  // Custom Hooks
  const { debts, loading } = useSubscriberDebts(
    user?.uid,
    serviceId,
    subscriber.id
  );
  const {
    selectionMode,
    selectedItems,
    toggleSelection,
    exitSelectionMode,
    enterSelectionMode,
    setSelectionMode, // Need this for prop passing or effects
  } = useSelectionMode();

  const { accounts } = useAccounts(); // Fetch accounts

  // const [debts, setDebts] = useState<Debt[]>([]); Removed local state

  // States for Modals
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [subscriberOptionsVisible, setSubscriberOptionsVisible] =
    useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<
    "info" | "confirm" | "destructive"
  >("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [onAlertConfirm, setOnAlertConfirm] = useState<
    (() => void) | undefined
  >(undefined);

  // Payment Modal State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [targetPaymentItem, setTargetPaymentItem] = useState<any>(null); // { label, amount, debtId? }
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Empty Modal State
  const [emptyModalVisible, setEmptyModalVisible] = useState(false);
  const [selectedEmptyItem, setSelectedEmptyItem] = useState<any>(null);

  // Filter: Solo Año
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      enterSelectionMode(item.fullLabel);
    } else {
      toggleSelection(item.fullLabel);
    }
  };

  // exitSelectionMode is from hook

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
      setAlertTitle("Error");
      setAlertMessage("No se pudo generar la deuda.");
      setAlertType("info");
      setAlertVisible(true);
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
    setTimeout(() => setPaymentModalVisible(true), 50);
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;

    setAlertTitle("Eliminar Meses");
    setAlertMessage(
      `¿Estás seguro de eliminar ${selectedItems.length} meses seleccionados? Si están pagados, se reembolsarán.`
    );
    setAlertType("destructive");
    setOnAlertConfirm(() => async () => {
      try {
        for (const label of selectedItems) {
          // Buscar deuda asociada
          const existingDebt = debts.find(
            (d) => d.month.replace(" de ", " ") === label.replace(" de ", " ")
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
        // Show error using the same modal properties but executed immediately as we are already in the context
        // However, alert is already closing. We might simply rely on console log or set a new alert timeout.
        // Ideally we shouldn't fail silently, but for now console.error is what was there (plus alert).
      }
    });
    setAlertVisible(true);
  };

  const handleConfirmPayment = async (
    paymentDate: Date,
    accountId?: string,
    amount?: number,
    note?: string
  ) => {
    if (!targetPaymentItem) return;

    if (!accountId) {
      setAlertTitle("Error");
      setAlertMessage("Selecciona una cuenta de pago.");
      setAlertType("info");
      setAlertVisible(true);
      return;
    }

    const selectedAccount = accounts.find((a) => a.id === accountId);
    if (!selectedAccount) return; // Should not happen if UI validates

    try {
      setPaymentLoading(true);

      let itemsToPay = [];

      if (targetPaymentItem.isBulk) {
        const itemsProcess = targetPaymentItem.items as string[];
        itemsToPay = itemsProcess.map((label) => {
          const existingDebt = debts.find(
            (d) => d.month.replace(" de ", " ") === label.replace(" de ", " ")
          );
          if (existingDebt && existingDebt.status === "pending") {
            return {
              label,
              amount: existingDebt.amount,
              debtId: existingDebt.id,
              isNew: false,
            };
          } else {
            return {
              label,
              amount: subscriber.quota,
              isNew: true,
            };
          }
        });
      } else {
        // Single Payment
        const payAmount =
          amount && amount > 0 ? amount : targetPaymentItem.amount;
        itemsToPay = [
          {
            label: targetPaymentItem.label,
            amount: payAmount,
            debtId: targetPaymentItem.debtId,
            isNew: targetPaymentItem.isNew,
          },
        ];
      }

      await processBulkPayment(
        user!.uid,
        serviceId,
        subscriber,
        itemsToPay,
        paymentDate,
        selectedAccount,
        route.params.serviceName || "Servicio",
        note
      );

      setPaymentModalVisible(false);
      if (targetPaymentItem.isBulk) {
        exitSelectionMode();
      }

      setAlertType("info");
      setAlertTitle("¡Pago Exitoso!");
      setAlertMessage(
        targetPaymentItem.isBulk
          ? "Pagos masivos registrados correctamente."
          : "Pago registrado correctamente."
      );
      setAlertVisible(true);
    } catch (e) {
      console.error(e);
      setAlertType("info");
      setAlertTitle("Error");
      setAlertMessage("No se pudo registrar el pago.");
      setAlertVisible(true);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDeleteSubscriber = () => {
    setAlertTitle("Eliminar Suscriptor");
    setAlertMessage(
      "Se borrará el suscriptor y todo su historial de deudas. ¿Estás seguro?"
    );
    setAlertType("destructive");
    setOnAlertConfirm(() => async () => {
      await deleteSubscriber(user!.uid, serviceId, subscriber.id!);
      navigation.goBack();
    });
    setAlertVisible(true);
  };

  const handleUpdateSubscriber = async (
    name: string,
    quota: string,
    color?: string
  ) => {
    const quotaNum = parseFloat(quota);
    if (!name.trim() || isNaN(quotaNum)) return;
    await updateSubscriber(user!.uid, serviceId, subscriber.id!, {
      name,
      quota: quotaNum,
      color,
    });
    setEditModalVisible(false);
    setSubscriberOptionsVisible(false);
    navigation.setParams({
      subscriber: { ...subscriber, name, quota: quotaNum, color },
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
        <View
          style={[
            styles.avatar,
            { borderColor: subscriber.color || colors.primary },
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              { color: subscriber.color || colors.primary },
            ]}
          >
            {subscriber.name[0]}
          </Text>
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

      {/* Year Filter & View Toggle */}
      <View style={styles.listHeaderContainer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ width: 40 }} />

          <View style={styles.yearFilter}>
            <TouchableOpacity onPress={() => setFilterYear((y) => y - 1)}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.yearFilterText}>{filterYear}</Text>
            <TouchableOpacity onPress={() => setFilterYear((y) => y + 1)}>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setViewMode((m) => (m === "grid" ? "list" : "grid"))}
            style={{
              width: 50,
              height: 40,
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={viewMode === "grid" ? "list" : "grid"}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid List */}
      {/* Grid/List */}
      <FlatList
        key={viewMode}
        data={calendarData}
        keyExtractor={(item) => item.fullLabel}
        renderItem={({ item }) =>
          viewMode === "grid" ? (
            <GridItem
              item={item}
              selectedItems={selectedItems}
              onPress={handleGridItemPress}
              onLongPress={handleLongPress}
            />
          ) : (
            <ListItem
              item={item}
              selectedItems={selectedItems}
              onPress={handleGridItemPress}
              onLongPress={handleLongPress}
            />
          )
        }
        numColumns={viewMode === "grid" ? 3 : 1}
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
        availableAccounts={accounts}
        loading={paymentLoading}
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
        initialColor={subscriber.color}
        onSave={handleUpdateSubscriber}
      />

      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        variant={alertType}
        onClose={() => setAlertVisible(false)}
        onConfirm={() => {
          if (onAlertConfirm) onAlertConfirm();
          setAlertVisible(false);
        }}
      />
    </View>
  );
}
