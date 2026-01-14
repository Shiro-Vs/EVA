import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../config/firebaseConfig";
import { createService, Service } from "../../services/subscriptionService";

export const useAddService = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [billingDay, setBillingDay] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !cost || !billingDay) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const newService: Service = {
        name,
        cost: parseFloat(cost),
        billingDay: parseInt(billingDay),
        createdAt: new Date(),
      };

      await createService(user.uid, newService);
      Alert.alert("Éxito", "Servicio creado correctamente");
      navigation.goBack();
    } catch (e) {
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
    navigation, // exported in case view needs it for other things
  };
};
