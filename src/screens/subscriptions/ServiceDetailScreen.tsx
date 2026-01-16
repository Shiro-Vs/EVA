import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { colors } from "../../theme/colors";

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
  const layout = useWindowDimensions();
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
    accounts,
  } = useServiceDetail();

  const defaultAccount = accounts.find(
    (a) => a.id === service.defaultAccountId
  );

  // Configure Routes
  const [routes] = React.useState([
    { key: "subscribers", title: "Suscriptores" },
    { key: "payments", title: "Mis Pagos" },
  ]);

  // Render Scenes
  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case "subscribers":
        return (
          <SubscribersTab
            subscribers={subscribers}
            onSelectSubscriber={(item) =>
              navigation.navigate("SubscriberDetail", {
                serviceId: service.id,
                subscriber: item,
                serviceName: service.name,
              })
            }
          />
        );
      case "payments":
        return (
          <PaymentsTab debts={ownerDebts} onPayDebt={handlePayOwnerDebt} />
        );
      default:
        return null;
    }
  };

  // Render Tab Bar
  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: colors.primary, height: 3 }}
      style={{
        backgroundColor: colors.background,
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
      labelStyle={{ fontWeight: "bold", textTransform: "capitalize" }}
      activeColor={colors.primary}
      inactiveColor={colors.textSecondary}
      pressColor={colors.primary + "20"}
    />
  );

  return (
    <View style={styles.container}>
      <ServiceHeader
        // ... props (keep as is)
        name={service.name}
        billingDay={service.billingDay}
        cost={service.cost}
        color={service.color ?? undefined}
        icon={service.icon ?? undefined}
        logoUrl={service.logoUrl ?? undefined}
        iconLibrary={service.iconLibrary ?? undefined}
        accountName={defaultAccount?.name}
        accountIcon={defaultAccount?.icon}
        accountColor={defaultAccount?.color}
        onSettingsPress={() => setServiceOptionsVisible(true)}
      />

      {service.shared ? (
        <TabView
          navigationState={{
            index: activeTab === "subscribers" ? 0 : 1,
            routes,
          }}
          renderScene={renderScene}
          onIndexChange={(index) =>
            setActiveTab(index === 0 ? "subscribers" : "payments")
          }
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
          style={{ flex: 1 }}
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
        availableAccounts={accounts}
        initialAccountId={service.defaultAccountId}
        loading={loading}
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
        initialDefaultAccountId={service.defaultAccountId}
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
