import { useState, useEffect } from "react";
import { Keyboard } from "react-native";
import { AuthService } from "../../services/AuthService";

export function useRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Detectar teclado
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Estados de error
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateEmail = (text: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };

  const validateName = (text: string) => {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
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

  const handleRegister = async () => {
    if (isAuthenticating) return;

    const newErrors = { name: "", email: "", password: "", confirmPassword: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
      isValid = false;
    } else if (!validateName(name)) {
      newErrors.name = "Solo se permiten letras";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "El correo es obligatorio";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Correo inválido";
      isValid = false;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
      isValid = false;
    } else if (!hasUppercase || !hasNumber) {
      newErrors.password = "Usa una mayúscula y un número";
      isValid = false;
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = "No coinciden";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsAuthenticating(true);
      try {
        await AuthService.register(email.trim(), password, name.trim());
        setAlertConfig({
          visible: true,
          title: "¡Bienvenido!",
          message: "Tu cuenta ha sido creada con éxito. Ya puedes comenzar a gestionar tus finanzas.",
          type: "success",
          iconName: "person-add-outline",
        });
      } catch (error: any) {
        setAlertConfig({
          visible: true,
          title: "Error al registrar",
          message: error.message || "Hubo un problema al crear tu cuenta.",
          type: "error",
          iconName: "warning-outline",
        });
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    isKeyboardVisible,
    isAuthenticating,
    errors,
    setErrors,
    alertConfig,
    setAlertConfig,
    handleRegister,
  };
}
