import { useState } from "react";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
    iconName: undefined as string | undefined,
  });

  const validateEmail = (text: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };

  const handleResetPassword = () => {
    if (!email.trim()) {
      setError("El correo es obligatorio");
      return;
    }
    if (!validateEmail(email)) {
      setError("Ingresa un correo válido");
      return;
    }

    // Simulación de envío exitoso
    setAlertConfig({
      visible: true,
      title: "Enlace Enviado",
      message: "Hemos enviado un correo a " + email + " con las instrucciones para restablecer tu contraseña.",
      type: "success",
      iconName: "mail-unread-outline",
    });
  };

  return {
    email,
    setEmail,
    error,
    setError,
    alertConfig,
    setAlertConfig,
    handleResetPassword,
  };
}
