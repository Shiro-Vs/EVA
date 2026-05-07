import { useState, useEffect, useCallback, useMemo } from "react";
import { BackHandler } from "react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "./useAppTheme";
import { ContactService } from "../services/ContactService";
import { Contact } from "../interfaces/Contact";

export const useContacts = () => {
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
      await ContactService.pruneOrphanSubscribers();
      const data = await ContactService.getContacts();
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
        await ContactService.updateContact(editingContact.id, contactDraft);
      } else {
        await ContactService.createContact(contactDraft);
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
    const result = await ContactService.canDeleteContact(contact.id);
    
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
        await ContactService.deleteContact(contact.id);
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

  return {
    contacts,
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
    closeHistory,
    openHistory,
    setHistoryRefreshKey,
  };
};
