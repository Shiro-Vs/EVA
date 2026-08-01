import { useState, useEffect } from "react";
import { Contact } from "../../interfaces/Contact";
import { SubscriptionService } from "../../services/SubscriptionService";

export const useAddSubscriber = (visible: boolean, contact: Contact | null, onSuccess: () => void) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [cuota, setCuota] = useState("");
  const [isCourtesy, setIsCourtesy] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  useEffect(() => {
    if (visible) {
      loadServices();
    }
  }, [visible]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await SubscriptionService.getSubscriptions();
      const availableServices = data.filter(s =>
        !s.suscriptores?.some(sub => sub.id === contact?.id)
      );
      setServices(availableServices);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedServiceId || !contact) return;
    
    const finalCuota = isCourtesy ? 0 : parseFloat(cuota);
    if (!isCourtesy && (isNaN(finalCuota) || finalCuota <= 0)) {
      setAlertConfig({
        visible: true,
        title: "Dato inválido",
        message: "Ingresa un monto válido o marca la casilla de cortesía.",
        type: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      await SubscriptionService.addSubscriberToService(selectedServiceId, {
        id: contact.id,
        nombre: contact.nombre,
        cuota: finalCuota,
        color: contact.color
      });
      
      setSelectedServiceId(null);
      setCuota("");
      setIsCourtesy(false);
      loadServices();
      onSuccess();
      
      setAlertConfig({
        visible: true,
        title: "¡Hecho!",
        message: `${contact.nombre} ahora forma parte del servicio.`,
        type: "success",
      });
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: "Error",
        message: "No pudimos completar la asignación. Intenta de nuevo.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    services,
    loading,
    selectedServiceId,
    setSelectedServiceId,
    cuota,
    setCuota,
    isCourtesy,
    setIsCourtesy,
    saving,
    alertConfig,
    setAlertConfig,
    handleSave,
    loadServices
  };
};
