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
  type?: "success" | "error" | "info";
  title: string;
  message: string;
  iconName?: string; // Nuevo: Permite iconos personalizados de Ionicons
  buttonText?: string;
  onClose: () => void;
  secondaryButtonText?: string;
  onSecondaryAction?: () => void;
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
}: EVAAlertProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const getIcon = () => {
    // Si el usuario envió un icono específico, lo usamos
    if (iconName) {
      const color = type === "success" ? "#10B981" : type === "error" ? "#E63946" : "#1F7ECC";
      return { name: iconName, color };
    }

    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#10B981" };
      case "error":
        return { name: "alert-circle", color: "#E63946" };
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
    >
      <View style={styles.overlay}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDark ? "rgba(5,10,14,0.85)" : "rgba(255,255,255,0.85)" }
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
          <Text className="text-text-primary font-asap-bold text-2xl text-center mb-2">
            {title}
          </Text>
          <Text className="text-text-secondary font-asap text-center text-base leading-6 mb-8 px-2">
            {message}
          </Text>

          {/* Buttons Section */}
          <View className="w-full space-y-3">
            <TouchableOpacity
              onPress={onClose}
              className="bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
              activeOpacity={0.8}
            >
              <Text className="text-white font-asap-bold text-lg">
                {buttonText}
              </Text>
            </TouchableOpacity>

            {secondaryButtonText && (
              <TouchableOpacity
                onPress={onSecondaryAction}
                className="h-14 rounded-2xl items-center justify-center border border-border/50"
                activeOpacity={0.7}
              >
                <Text className="text-text-primary font-asap-semibold text-base">
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}
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
