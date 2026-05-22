import { useState } from "react";
import { AuthService } from "../../services/AuthService";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Estados de error
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateEmail = (text: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };

  // Estados de alerta
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
    iconName: undefined as string | undefined,
  });

  const handleLogin = async () => {
    if (isAuthenticating) return;
    
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "El correo es obligatorio";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Correo inválido";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsAuthenticating(true);
      try {
        await AuthService.login(email.trim(), password);
        setAlertConfig({
          visible: true,
          title: "¡Hola de nuevo!",
          message: "Has iniciado sesión correctamente. Estamos preparando tus finanzas.",
          type: "success",
          iconName: "log-in-outline",
        });
      } catch (error: any) {
        setAlertConfig({
          visible: true,
          title: "Error de autenticación",
          message: error.message || "Usuario o contraseña incorrectos.",
          type: "error",
          iconName: "warning-outline",
        });
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isAuthenticating,
    errors,
    setErrors,
    alertConfig,
    setAlertConfig,
    handleLogin,
  };
}
