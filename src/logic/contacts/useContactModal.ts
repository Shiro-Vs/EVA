import { useState } from "react";
import { Contact } from "../../interfaces/Contact";

export const useContactModal = (
  contactDraft: Omit<Contact, "id">,
  onSave: () => void
) => {
  const [errors, setErrors] = useState({ nombre: "" });

  const validateAndSave = () => {
    if (!contactDraft.nombre.trim()) {
      setErrors({ nombre: "El nombre es obligatorio" });
      return;
    }
    setErrors({ nombre: "" });
    onSave();
  };

  const clearErrors = () => {
    if (errors.nombre) {
      setErrors({ nombre: "" });
    }
  };

  return {
    errors,
    validateAndSave,
    clearErrors
  };
};
