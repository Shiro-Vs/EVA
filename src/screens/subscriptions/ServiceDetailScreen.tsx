import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Modals
import { CustomAlertModal } from "../../components/common/CustomAlertModal";
import { AddSubscriberModal } from "../../components/modals/subscribers/AddSubscriberModal";
import { ServiceOptionsModal } from "../../components/modals/services/ServiceOptionsModal";
import { EditServiceModal } from "../../components/modals/services/EditServiceModal";
import { PaymentConfirmationModal } from "../../components/modals/payments/PaymentConfirmationModal";
// Components
import { ServiceHeader } from "./serviceDetail/components/ServiceHeader";
import { SubscribersTab } from "./serviceDetail/components/SubscribersTab";
import { PaymentsTab } from "./serviceDetail/components/PaymentsTab";

import { styles } from "./ServiceDetailScreen.styles";
import { useServiceDetail } from "./useServiceDetail";

export default function ServiceDetailScreen() {
  const {
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
    closeAlert,
    handleAddSubscriber,
    handlePayOwnerDebt,
    handleConfirmOwnerPay,
    handleUpdateService,
    handleDeleteService,
    navigation,
  } = useServiceDetail();

  return (
    <View style={styles.container}>
      <ServiceHeader
        name={service.name}
        billingDay={service.billingDay}
        cost={service.cost}
        color={service.color ?? undefined}
        icon={service.icon ?? undefined}
        logoUrl={service.logoUrl ?? undefined}
        iconLibrary={service.iconLibrary ?? undefined}
        onSettingsPress={() => setServiceOptionsVisible(true)}
      />

      {/* Tabs - Only show if shared */}
      {service.shared && (
        <View style={styles.tabContainer}>
          {subscribers.length > 0 && (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "subscribers" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("subscribers")}
            >
              <Text style={styles.tabText}>Suscriptores</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.tab, activeTab === "payments" && styles.activeTab]}
            onPress={() => setActiveTab("payments")}
          >
            <Text style={styles.tabText}>Mis Pagos</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Contenido */}
      {service.shared && activeTab === "subscribers" ? (
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

      {/* FAB Add (Solo si es compartido) */}
      {service.shared &&
        (activeTab === "subscribers" || subscribers.length === 0) && (
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

      <PaymentConfirmationModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onConfirm={handleConfirmOwnerPay}
        monthLabel={targetPaymentItem?.month || ""}
        amount={targetPaymentItem?.amount || 0}
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
        isEditing={true}
        initialName={service.name}
        initialCost={service.cost}
        initialDay={service.billingDay}
        initialColor={service.color ?? undefined}
        initialIcon={service.icon ?? undefined}
        initialLogoUrl={service.logoUrl ?? undefined}
        initialIconLibrary={service.iconLibrary ?? undefined}
        initialShared={service.shared}
        initialStartDate={
          service.startDate
            ? (service.startDate as any).toDate
              ? (service.startDate as any).toDate()
              : new Date(service.startDate)
            : undefined
        }
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
