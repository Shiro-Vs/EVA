import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { mockDB } from "../../../services/mockDatabase";
import { Contact } from "../../../interfaces/Contact";

import EVAAlert from "../../../components/common/EVAAlert";
import { EVALoading } from "../../../components/common/EVALoading";

// Importaciones directas para evitar errores de referencia
import { ContactsHeader } from "./components/ContactsHeader";
import { ContactList } from "./components/ContactList";
import { ContactModal } from "./components/ContactModal";
import { ContactHistory } from "./components/ContactHistory";
import { RemindModal } from "./components/RemindModal";
import { AddSubscriberModal } from "./components/AddSubscriberModal";

export default function ContactsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  // Estados de Datos
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "debt">("name");

  // Estados de Modales
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRemindModalVisible, setIsRemindModalVisible] = useState(false);
  const [isAddSubModalVisible, setIsAddSubModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactDraft, setContactDraft] = useState<Omit<Contact, "id">>({
    nombre: "",
    color: colors.primary,
  });

  // Estado de Alerta
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
    onConfirm?: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  // Estado de Historial
  const [showHistory, setShowHistory] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      await mockDB.pruneOrphanSubscribers();
      const data = await mockDB.getContacts();
      setContacts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Manejar botón de atrás físico en Android
  useEffect(() => {
    const backAction = () => {
      if (showHistory) {
        closeHistory();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [showHistory]);

  const handleSaveContact = async () => {
    if (!contactDraft.nombre.trim()) {
      setAlertConfig({
        visible: true,
        title: "Campo requerido",
        message: "Por favor, ingresa un nombre para el contacto.",
        type: "warning",
      });
      return;
    }

    try {
      if (editingContact) {
        await mockDB.updateContact(editingContact.id, contactDraft);
      } else {
        await mockDB.createContact(contactDraft);
      }
      setIsModalVisible(false);
      await loadContacts();
      setAlertConfig({
        visible: true,
        title: "¡Éxito!",
        message: `Contacto ${editingContact ? "actualizado" : "creado"} correctamente.`,
        type: "success",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setContactDraft({
      nombre: contact.nombre,
      color: contact.color,
      telefono: contact.telefono,
    });
    setIsModalVisible(true);
  };

  const handleDeleteContact = async (contact: Contact) => {
    const result = await mockDB.canDeleteContact(contact.id);
    
    if (!result.canDelete) {
      setAlertConfig({
        visible: true,
        title: "No se puede eliminar",
        message: result.reason || "Este contacto tiene deudas pendientes o servicios activos.",
        type: "error",
      });
      return;
    }

    setAlertConfig({
      visible: true,
      title: "¿Eliminar contacto?",
      message: `¿Estás seguro que deseas eliminar a ${contact.nombre}? Esta acción no se puede deshacer.`,
      type: "error",
      onConfirm: async () => {
        await mockDB.deleteContact(contact.id);
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        await loadContacts();
      },
    });
  };

  const filteredContacts = useMemo(() => {
    return contacts
      .filter((c) =>
        c.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.nombre.localeCompare(b.nombre);
        } else {
          return (b.total_deuda || 0) - (a.total_deuda || 0);
        }
      });
  }, [contacts, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const totalDeudaGlobal = contacts.reduce((acc, c) => acc + (c.total_deuda || 0), 0);
    const debtorCount = contacts.filter((c) => (c.total_deuda || 0) > 0).length;
    return { totalDeudaGlobal, debtorCount, totalCount: contacts.length };
  }, [contacts]);

  const closeHistory = () => {
    setShowHistory(false);
    setSelectedContact(null);
    loadContacts();
  };

  const openHistory = (contact: Contact) => {
    setSelectedContact(contact);
    setShowHistory(true);
  };

  if (loading && filteredContacts.length === 0) {
    return <EVALoading message="Cargando contactos..." />;
  }

  // Vista de Historial
  if (showHistory && selectedContact) {
    return (
      <View className="flex-1">
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
            setHistoryRefreshKey(prev => prev + 1);
          }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 flex-1">
        {/* Header */}
        <View className="flex-row items-center mt-6 mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-card rounded-full items-center justify-center mr-4"
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-text-primary font-asap-bold text-2xl">
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
            <View className="flex-1 bg-card flex-row items-center px-4 h-12 rounded-2xl border border-primary/5">
              <Ionicons name="search" size={20} color={colors.muted} />
              <TextInput
                placeholder="Buscar contacto..."
                placeholderTextColor={colors.textSecondary}
                className="flex-1 ml-2 font-asap text-text-primary"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View className="flex-row bg-card p-1 rounded-xl">
              <TouchableOpacity
                onPress={() => setSortBy("name")}
                className={`px-3 py-1.5 rounded-lg flex-row items-center ${sortBy === "name" ? "bg-primary" : ""}`}
              >
                <Ionicons 
                  name="text" 
                  size={14} 
                  color={sortBy === "name" ? "white" : colors.primary} 
                  style={{ marginRight: 4 }}
                />
                <Text className={`font-asap-bold text-[10px] ${sortBy === "name" ? "text-white" : "text-primary"}`}>
                  A-Z
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSortBy("debt")}
                className={`px-3 py-1.5 rounded-lg flex-row items-center ${sortBy === "debt" ? "bg-primary" : ""}`}
              >
                <Ionicons 
                  name="trending-down" 
                  size={14} 
                  color={sortBy === "debt" ? "white" : colors.primary} 
                  style={{ marginRight: 4 }}
                />
                <Text className={`font-asap-bold text-[10px] ${sortBy === "debt" ? "text-white" : "text-primary"}`}>
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
        onClose={alertConfig.onConfirm || (() => setAlertConfig((prev) => ({ ...prev, visible: false })))}
        secondaryButtonText={alertConfig.onConfirm ? "Cancelar" : undefined}
        onSecondaryAction={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        onDismiss={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
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
