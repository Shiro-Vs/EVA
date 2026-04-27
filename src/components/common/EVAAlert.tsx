import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

const { width } = Dimensions.get("window");

interface EVAAlertProps {
  visible: boolean;
  type?: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  iconName?: string; // Nuevo: Permite iconos personalizados de Ionicons
  buttonText?: string;
  onClose: () => void;
  secondaryButtonText?: string;
  onSecondaryAction?: () => void;
  horizontalButtons?: boolean; // Nuevo: Para layouts lado a lado
  onDismiss?: () => void; // Nuevo: Para cerrar sin ejecutar la acción principal (ej. click fuera)
}

export default function EVAAlert({
  visible,
  type = "info",
  title,
  message,
  iconName,
  buttonText = "Entendido",
  onClose,
  secondaryButtonText,
  onSecondaryAction,
  horizontalButtons = false,
  onDismiss,
}: EVAAlertProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    // Si el usuario envió un icono específico, lo usamos
    if (iconName) {
      const color =
        type === "success"
          ? "#10B981"
          : type === "error"
            ? "#E63946"
            : type === "warning"
              ? "#FF8C00"
              : "#1F7ECC";
      return { name: iconName, color };
    }

    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#10B981" };
      case "error":
        return { name: "alert-circle", color: "#E63946" };
      case "warning":
        return { name: "alert-circle", color: "#FF8C00" };
      default:
        return { name: "information-circle", color: "#1F7ECC" };
    }
  };

  const icon = getIcon();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleDismiss}
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? "rgba(5,10,14,0.85)"
                : "rgba(255,255,255,0.85)",
            },
          ]}
        />

        <View className="bg-card w-[85%] rounded-[32px] p-8 items-center shadow-2xl border border-white/10">
          {/* Icon Section */}
          <View
            className="mb-4 p-3 rounded-full"
            style={{ backgroundColor: `${icon.color}15` }}
          >
            <Ionicons name={icon.name as any} size={32} color={icon.color} />
          </View>

          {/* Text Section */}
          <Text
            className="font-asap-bold text-2xl text-center mb-2"
            style={{
              color:
                type === "error"
                  ? "#E63946"
                  : type === "warning"
                    ? "#FF8C00"
                    : isDark
                      ? "#FFFFFF"
                      : "#1F2937",
            }}
          >
            {title}
          </Text>
          <Text
            className="font-asap text-center text-base leading-6 mb-8 px-2"
            style={{ color: "#64748B" }}
          >
            {message}
          </Text>

          {/* Buttons Section */}
          <View
            className={`w-full ${horizontalButtons ? "flex-row gap-4" : "space-y-3"}`}
          >
            {secondaryButtonText && (
              <TouchableOpacity
                onPress={onSecondaryAction}
                className={`${horizontalButtons ? "flex-1" : "w-full"} h-14 rounded-2xl items-center justify-center bg-slate-200 dark:bg-slate-700`}
                activeOpacity={0.7}
              >
                <Text className="text-text-primary font-asap-semibold text-base">
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onClose}
              className={`${horizontalButtons ? "flex-1" : "w-full"} h-14 rounded-2xl items-center justify-center shadow-lg`}
              style={{
                backgroundColor: icon.color,
                shadowColor: icon.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
              }}
              activeOpacity={0.8}
            >
              <Text className="text-white font-asap-bold text-lg">
                {buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
});
