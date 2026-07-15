import { useState, useEffect } from "react";
import { SubscriptionService } from "../../services/SubscriptionService";
import { Subscription } from "../../interfaces/Subscription";

export const useEditService = (
  visible: boolean,
  service: Subscription | null,
  onClose: () => void,
  onSuccess: (updatedService: Subscription) => void
) => {
  const [draftService, setDraftService] = useState<any>(null);
  const [costoInput, setCostoInput] = useState("");
  const [errors, setErrors] = useState({ nombre: "", costo: "" });

  useEffect(() => {
    if (visible && service) {
      setDraftService({ ...service });
      setCostoInput(service.costo_total_actual.toString());
      setErrors({ nombre: "", costo: "" });
    }
  }, [visible, service]);

  const validateAndSave = async () => {
    if (!draftService) return;

    let hasError = false;
    const newErrors = { nombre: "", costo: "" };

    if (!draftService.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
      hasError = true;
    }

    const costoNum = parseFloat(costoInput);
    if (!costoInput.trim() || isNaN(costoNum) || costoNum <= 0) {
      newErrors.costo = "El costo debe ser un número mayor a 0";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({ nombre: "", costo: "" });

    try {
      const updated = {
        ...draftService,
        costo_total_actual: costoNum,
      };
      const result = await SubscriptionService.updateSubscription(service!.id, updated);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error("Error updating service", error);
    }
  };

  const clearError = (field: "nombre" | "costo") => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return {
    draftService,
    setDraftService,
    costoInput,
    setCostoInput,
    errors,
    clearError,
    validateAndSave,
  };
};
