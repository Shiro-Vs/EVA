import { useState, useCallback, useEffect } from "react";
import { Alert, BackHandler } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { auth, db } from "../../config/firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  getServices,
  Service,
  createService,
  checkAndGenerateServiceDebts,
  deleteService,
} from "../../services/subscriptionService";

export const useServices = () => {
  const navigation = useNavigation<any>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // View Mode State
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(
    new Set()
  );

  // Real-time listener for Services
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "users", user.uid, "services"),
      orderBy("name", "asc") // Default sort
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[];
        setServices(data);
        setLoading(false);
      },
      (e) => {
        console.error(e);
        Alert.alert("Error", "No se pudieron cargar los servicios.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Reset selection on focus
  useFocusEffect(
    useCallback(() => {
      setIsSelectionMode(false);
      setSelectedServiceIds(new Set());
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isSelectionMode) {
          setIsSelectionMode(false);
          setSelectedServiceIds(new Set());
          return true; // Prevent default behavior (exit)
        }
        return false; // Default behavior
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => backHandler.remove();
    }, [isSelectionMode])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // Real-time listener is already active. Just visual delay.
    setTimeout(() => setRefreshing(false), 500);
  };

  // Helper: Calculate Days Remaining
  const getDaysRemaining = (billingDay: number) => {
    if (!billingDay || isNaN(billingDay)) return "-";

    const today = new Date();
    const currentDay = today.getDate();

    if (billingDay === currentDay) return "Hoy";

    let targetDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      billingDay
    );
    if (currentDay > billingDay) {
      // Next month
      targetDate = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        billingDay
      );
    }

    const diffTime = Math.abs(targetDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} días`;
  };

  // Selection Handlers
  const handleLongPress = (serviceId: string) => {
    setIsSelectionMode(true);
    setSelectedServiceIds(new Set([serviceId]));
  };

  const handlePress = (service: Service) => {
    if (isSelectionMode) {
      if (!service.id) return;
      const newSelected = new Set(selectedServiceIds);
      if (newSelected.has(service.id)) {
        newSelected.delete(service.id);
        if (newSelected.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        newSelected.add(service.id);
      }
      setSelectedServiceIds(newSelected);
    } else {
      navigation.navigate("ServiceDetail", {
        service: {
          ...service,
          createdAt:
            service.createdAt && !isNaN(new Date(service.createdAt).getTime())
              ? new Date(service.createdAt).toISOString()
              : new Date().toISOString(),
        },
      });
    }
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedServiceIds(new Set());
  };

  const handleDeleteSelected = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    setShowDeleteModal(false);

    try {
      const deletePromises = Array.from(selectedServiceIds).map((id) =>
        deleteService(user.uid, id)
      );
      await Promise.all(deletePromises);
      // await fetchServices(); // Removed - automatic update
      setIsSelectionMode(false);
      setSelectedServiceIds(new Set());
    } catch (error) {
      console.error("Error deleting services: ", error);
      Alert.alert("Error", "Ocurrió un error al eliminar los servicios.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (
    name: string,
    cost: string,
    day: string,
    color?: string,
    icon?: string,
    logoUrl?: string,
    iconLibrary?: string,
    shared?: boolean,
    startDate?: Date
  ) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const newService: Service = {
        name,
        cost: parseFloat(cost),
        billingDay: parseInt(day),
        color: color || null,
        icon: icon || null,
        logoUrl: logoUrl || null,
        iconLibrary: iconLibrary || null,
        shared: shared || false,
        startDate: startDate || new Date(),
        createdAt: new Date(),
      };

      const newId = await createService(user.uid, newService);

      // Generate debts immediately (Backfill)
      await checkAndGenerateServiceDebts(user.uid, {
        ...newService,
        id: newId,
      });

      setShowCreateModal(false);
      // fetchServices(); // Removed - automatic update
    } catch (e) {
      console.error("Error creating service:", e);
    }
  };

  return {
    services,
    loading,
    refreshing,
    viewMode,
    setViewMode,
    showCreateModal,
    setShowCreateModal,
    showDeleteModal,
    setShowDeleteModal,
    isSelectionMode,
    selectedServiceIds,
    onRefresh,
    getDaysRemaining,
    handleLongPress,
    handlePress,
    cancelSelectionMode,
    handleDeleteSelected,
    confirmDelete,
    handleCreateService,
  };
};
