import React from "react";
import { View, ScrollView } from "react-native";
import { useAppTheme } from "../../../hooks/useAppTheme";
import EVAAlert from "../../../components/common/EVAAlert";

// Importación de componentes y modales
import ServiceHeader from "./components/ServiceHeader";
import ServiceHistory from "./components/ServiceHistory";
import ServiceParticipants from "./components/ServiceParticipants";
import EditServiceModal from "./components/EditServiceModal";
import SubscriberModal from "./components/SubscriberModal";
import PayServiceModal from "./components/PayServiceModal";

// Importación de lógica (Hook)
import { useServiceDetail } from "../../../hooks/useServiceDetail";

export default function ServiceDetailScreen({ serviceId: propServiceId }: { serviceId?: string }) {
  const { colors } = useAppTheme();
  
  const {
    service,
    activeTab,
    selectedMonthIndex,
    accounts,
    contacts,
    isEditModalVisible,
    isSubscriberModalVisible,
    isPayServiceModalVisible,
    draftService,
    costoInput,
    editingSubscriberIndex,
    subscriberDraft,
    subscriberQuotaInput,
    subscriberErrors,
    alertConfig,
    scrollViewRef,
    serviceStatus,
    currentAccount,
    SCREEN_WIDTH,
    setEditModalVisible,
    setSubscriberModalVisible,
    setPayServiceModalVisible,
    setDraftService,
    setCostoInput,
    setSubscriberDraft,
    setSubscriberQuotaInput,
    setSubscriberErrors,
    switchTab,
    openEditModal,
    handleUpdateService,
    openAddSubscriberModal,
    openSubscriberModal,
    handleSaveSubscriber,
    handleRemoveSubscriber,
    togglePaymentStatus,
    handleAdvancePayment,
    handleConfirmPayService,
    handlePayServicePress,
    handleRemindParticipant,
    sumValues,
    setSelectedMonthIndex,
    router
  } = useServiceDetail(propServiceId);

  if (!service) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 60 }}>
      {/* Header Fijo */}
      <ServiceHeader
        service={service}
        currentAccount={currentAccount}
        onBack={() => router.back()}
        onEdit={openEditModal}
        activeTab={activeTab}
        onSwitchTab={switchTab}
      />

      {/* Contenedor de Pestañas */}
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          onMomentumScrollEnd={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const newTab = x >= SCREEN_WIDTH / 2 ? "participantes" : "historial";
            if (newTab !== activeTab) switchTab(newTab);
          }}
          contentContainerStyle={{ width: SCREEN_WIDTH * 2 }}
        >
          {/* Pestaña: Historial */}
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <ServiceHistory
              historial_pagos={service.historial_pagos || []}
              suscriptores={service.suscriptores || []}
              screenWidth={SCREEN_WIDTH}
              onTogglePayment={togglePaymentStatus}
              accounts={accounts || []}
              currentAccount={currentAccount}
              serviceStatus={serviceStatus}
              onPayService={handlePayServicePress}
              selectedMonthIndex={selectedMonthIndex}
              onChangeMonth={setSelectedMonthIndex}
              diaCobro={service.dia_cobro}
              onAdvancePayment={handleAdvancePayment}
              onRemindParticipant={handleRemindParticipant}
            />
          </View>

          {/* Pestaña: Participantes */}
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <ServiceParticipants
              suscriptores={service.suscriptores || []}
              es_compartido={service.es_compartido}
              onEditSubscriber={openSubscriberModal}
              onAddSubscriber={openAddSubscriberModal}
              onRemoveSubscriber={handleRemoveSubscriber}
              onSharePress={() => {}}
            />
          </View>
        </ScrollView>
      </View>

      {/* Modales */}
      <EditServiceModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        service={service}
        draftService={draftService}
        setDraftService={setDraftService}
        costoInput={costoInput}
        setCostoInput={setCostoInput}
        onSave={handleUpdateService}
        accounts={accounts}
      />

      <SubscriberModal
        visible={isSubscriberModalVisible}
        onClose={() => setSubscriberModalVisible(false)}
        editingIndex={editingSubscriberIndex}
        subscriberDraft={subscriberDraft}
        setSubscriberDraft={setSubscriberDraft}
        subscriberQuotaInput={subscriberQuotaInput}
        setSubscriberQuotaInput={setSubscriberQuotaInput}
        subscriberErrors={subscriberErrors}
        setSubscriberErrors={setSubscriberErrors}
        onSave={handleSaveSubscriber}
        contacts={contacts}
        existingSubscriberNames={service?.suscriptores?.map(s => s.nombre) || []}
      />

      {isPayServiceModalVisible && (
        <PayServiceModal
          visible={isPayServiceModalVisible}
          onClose={() => setPayServiceModalVisible(false)}
          onConfirm={handleConfirmPayService}
          montoSugerido={service.costo_total_actual}
          mes={service?.historial_pagos?.[selectedMonthIndex]?.mes_anio || ""}
          accounts={accounts}
          initialAccountId={service?.historial_pagos?.[selectedMonthIndex]?.id_cuenta_pago_real}
          initialDate={service?.historial_pagos?.[selectedMonthIndex]?.fecha_real_pago}
        />
      )}

      <EVAAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type as any}
        buttonText={alertConfig.buttonText}
        onClose={alertConfig.onPrimaryAction}
        secondaryButtonText={alertConfig.secondaryButtonText}
        onSecondaryAction={alertConfig.onSecondaryAction}
        horizontalButtons={alertConfig.horizontalButtons}
        onDismiss={alertConfig.onDismiss}
      />
    </View>
  );
}
