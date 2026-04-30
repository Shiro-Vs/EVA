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
import { useAppTheme } from "../../hooks/useAppTheme";

const { width } = Dimensions.get("window");

interface EVAAlertProps {
  visible: boolean;
  type?: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  iconName?: string;
  buttonText?: string;
  onClose: () => void;
  secondaryButtonText?: string;
  onSecondaryAction?: () => void;
  horizontalButtons?: boolean;
  onDismiss?: () => void;
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
  const { colors, isDark } = useAppTheme();

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    let color = colors.primary;
    if (type === "success") color = colors.income;
    if (type === "error") color = colors.expense;
    if (type === "warning") color = colors.warning;

    if (iconName) {
      return { name: iconName, color };
    }

    switch (type) {
      case "success":
        return { name: "checkmark-circle", color };
      case "error":
        return { name: "alert-circle", color };
      case "warning":
        return { name: "alert-circle", color };
      default:
        return { name: "information-circle", color };
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
                ? "rgba(0,0,0,0.85)"
                : "rgba(0,0,0,0.5)",
            },
          ]}
        />

        <View className="bg-card w-[85%] rounded-[32px] p-8 items-center shadow-2xl border border-border/10">
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
                  ? colors.expense
                  : type === "warning"
                    ? colors.warning
                    : colors.textPrimary,
            }}
          >
            {title}
          </Text>
          <Text
            className="font-asap text-center text-base leading-6 mb-8 px-2"
            style={{ color: colors.textSecondary }}
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
                className={`${horizontalButtons ? "flex-1" : "w-full"} h-14 rounded-2xl items-center justify-center bg-muted/10`}
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
    justifyContent: "center",
    alignItems: "center",
  },
});
