import { useState, useEffect } from "react";
import { SubscriptionService } from "../../services/SubscriptionService";
import { Subscriber } from "../../interfaces/Subscription";

export const useSubscriber = (
  visible: boolean,
  serviceId: string | undefined,
  editingSubscriber: Subscriber | null,
  editingIndex: number | null,
  onClose: () => void,
  onSuccess: (updatedService: any) => void
) => {
  const [subscriberDraft, setSubscriberDraft] = useState<Subscriber | null>(null);
  const [subscriberQuotaInput, setSubscriberQuotaInput] = useState("");
  const [subscriberErrors, setSubscriberErrors] = useState({ nombre: "", cuota: "" });

  useEffect(() => {
    if (visible) {
      if (editingSubscriber) {
        setSubscriberDraft({ ...editingSubscriber });
        setSubscriberQuotaInput(editingSubscriber.cuota.toString());
      } else {
        setSubscriberDraft({
          id: "",
          nombre: "",
          cuota: 0,
          es_cortesia: false,
          fecha_inicio: new Date().toISOString(),
          pagado_hasta: null,
        });
        setSubscriberQuotaInput("");
      }
      setSubscriberErrors({ nombre: "", cuota: "" });
    }
  }, [visible, editingSubscriber]);

  const validateAndSave = async () => {
    if (!subscriberDraft || !serviceId) return;

    let hasError = false;
    const errors = { nombre: "", cuota: "" };

    if (!subscriberDraft.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio";
      hasError = true;
    }

    const cuotaNum = parseFloat(subscriberQuotaInput);
    if (!subscriberDraft.es_cortesia && (isNaN(cuotaNum) || cuotaNum < 0)) {
      errors.cuota = "Monto inválido";
      hasError = true;
    }

    if (hasError) {
      setSubscriberErrors(errors);
      return;
    }

    const updatedSub = {
      ...subscriberDraft,
      cuota: subscriberDraft.es_cortesia ? 0 : cuotaNum,
    };

    try {
      const result = await SubscriptionService.addOrUpdateSubscriber(serviceId, updatedSub, editingIndex);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const clearError = (field: "nombre" | "cuota") => {
    if (subscriberErrors[field]) {
      setSubscriberErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return {
    subscriberDraft,
    setSubscriberDraft,
    subscriberQuotaInput,
    setSubscriberQuotaInput,
    subscriberErrors,
    clearError,
    validateAndSave
  };
};
