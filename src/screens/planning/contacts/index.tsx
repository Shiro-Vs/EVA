import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useContacts } from "../../../hooks/useContacts";

import EVAAlert from "../../../components/common/EVAAlert";
import { EVALoading } from "../../../components/common/EVALoading";

// Importaciones de componentes
import { ContactsHeader } from "./components/ContactsHeader";
import { ContactList } from "./components/ContactList";
import { ContactModal } from "./components/ContactModal";
import { ContactHistory } from "./components/ContactHistory";
import { RemindModal } from "./components/RemindModal";
import { AddSubscriberModal } from "./components/AddSubscriberModal";

export default function ContactsScreen() {
  const {
    loading,
    searchQuery,
    sortBy,
    isModalVisible,
    isRemindModalVisible,
    isAddSubModalVisible,
    editingContact,
    contactDraft,
    alertConfig,
    showHistory,
    selectedContact,
    historyRefreshKey,
    filteredContacts,
    stats,
    colors,
    router,
    setSearchQuery,
    setSortBy,
    setIsModalVisible,
    setIsRemindModalVisible,
    setIsAddSubModalVisible,
    setContactDraft,
    setAlertConfig,
    loadContacts,
    handleSaveContact,
    handleEditContact,
    handleDeleteContact,
    openHistory,
    closeHistory,
    setHistoryRefreshKey,
  } = useContacts();

  if (loading && filteredContacts.length === 0) {
    return <EVALoading message="Cargando contactos..." />;
  }

  // Vista de Historial
  if (showHistory && selectedContact) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <ContactHistory
          contact={selectedContact}
          onBack={closeHistory}
          onAddServicePress={() => setIsAddSubModalVisible(true)}
          refreshTrigger={historyRefreshKey}
        />
        <AddSubscriberModal
          visible={isAddSubModalVisible}
          onClose={() => setIsAddSubModalVisible(false)}
          contact={selectedContact}
          onSuccess={() => {
            loadContacts();
            setHistoryRefreshKey((prev) => prev + 1);
          }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="px-6 flex-1">
        {/* Header */}
        <View className="flex-row items-center mt-6 mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center mr-4"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: `${colors.text}05`,
            }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text
            className="font-asap-bold text-2xl"
            style={{ color: colors.text }}
          >
            Mis Contactos
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <ContactsHeader
            totalDeuda={stats.totalDeudaGlobal}
            count={stats.totalCount}
            debtorCount={stats.debtorCount}
            onAddPress={() => {
              setContactDraft({ nombre: "", color: colors.primary });
              setIsModalVisible(true);
            }}
            onRemindPress={() => setIsRemindModalVisible(true)}
          />

          {/* Buscador y Filtros */}
          <View className="flex-row items-center gap-3 mb-6">
            <View
              className="flex-1 flex-row items-center px-4 h-12 rounded-2xl border"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="search" size={20} color={colors.muted} />
              <TextInput
                placeholder="Buscar contacto..."
                placeholderTextColor={colors.muted}
                className="flex-1 ml-2 font-asap"
                style={{ color: colors.text }}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View
              className="flex-row p-1 rounded-xl"
              style={{ backgroundColor: colors.card }}
            >
              <TouchableOpacity
                onPress={() => setSortBy("name")}
                className="px-3 py-1.5 rounded-lg flex-row items-center"
                style={{
                  backgroundColor:
                    sortBy === "name" ? colors.primary : "transparent",
                }}
              >
                <Ionicons
                  name="text"
                  size={14}
                  color={sortBy === "name" ? "white" : colors.primary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  className="font-asap-bold text-[10px]"
                  style={{
                    color: sortBy === "name" ? "white" : colors.primary,
                  }}
                >
                  A-Z
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSortBy("debt")}
                className="px-3 py-1.5 rounded-lg flex-row items-center"
                style={{
                  backgroundColor:
                    sortBy === "debt" ? colors.primary : "transparent",
                }}
              >
                <Ionicons
                  name="trending-down"
                  size={14}
                  color={sortBy === "debt" ? "white" : colors.primary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  className="font-asap-bold text-[10px]"
                  style={{
                    color: sortBy === "debt" ? "white" : colors.primary,
                  }}
                >
                  Deuda
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ContactList
            contacts={filteredContacts}
            onContactPress={openHistory}
            onEditPress={handleEditContact}
            onDeletePress={handleDeleteContact}
          />

          <View className="h-20" />
        </ScrollView>
      </View>

      {/* Modales */}
      <ContactModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveContact}
        contactDraft={contactDraft}
        setContactDraft={setContactDraft}
        isEditing={!!editingContact}
      />

      <EVAAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonText={alertConfig.onConfirm ? "Confirmar" : "Entendido"}
        onClose={
          alertConfig.onConfirm ||
          (() => setAlertConfig((prev) => ({ ...prev, visible: false })))
        }
        secondaryButtonText={alertConfig.onConfirm ? "Cancelar" : undefined}
        onSecondaryAction={() =>
          setAlertConfig((prev) => ({ ...prev, visible: false }))
        }
        onDismiss={() =>
          setAlertConfig((prev) => ({ ...prev, visible: false }))
        }
        horizontalButtons={!!alertConfig.onConfirm}
      />

      <RemindModal
        visible={isRemindModalVisible}
        onClose={() => setIsRemindModalVisible(false)}
        debtors={filteredContacts.filter((c) => (c.total_deuda || 0) > 0)}
      />
    </SafeAreaView>
  );
}
