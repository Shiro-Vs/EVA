import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../config/firebaseConfig";
import { createService, getServices } from "../../services/serviceManager";
import { Service } from "../../services/types";
import { getAccounts, Account } from "../../services/accountService";

export const useAddService = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [billingDay, setBillingDay] = useState("");
  const [loading, setLoading] = useState(false);

  // Accounts
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [existingServices, setExistingServices] = useState<Service[]>([]); // Cache for validation
  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        // Fetch accounts
        const accs = await getAccounts(user.uid);
        setAccounts(accs);

        // Fetch existing services for validation
        const services = await getServices(user.uid);
        setExistingServices(services);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!name || !cost || !billingDay) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    // Duplicate Check
    const normalizedName = name.trim().toLowerCase();
    const isDuplicate = existingServices.some(
      (s) => s.name.trim().toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      Alert.alert("Error", "Ya existe un servicio con este nombre.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const newService: Service = {
        name: name.trim(), // Trim name
        cost: parseFloat(cost),
        billingDay: parseInt(billingDay),
        createdAt: new Date(),
        defaultAccountId: selectedAccountId,
      };

      await createService(user.uid, newService);
      Alert.alert("Éxito", "Servicio creado correctamente");
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo crear el servicio");
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    cost,
    setCost,
    billingDay,
    setBillingDay,
    loading,
    handleCreate,
    navigation,
    // New exports
    accounts,
    selectedAccountId,
    setSelectedAccountId,
  };
};
