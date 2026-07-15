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
  const { colors, fonts, isDark } = useAppTheme();

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      onClose();
    }
  };

  const getThemeVars = () => {
    const alertTheme = (colors as any).alert[type] || (colors as any).alert.info;
    let iconNameStr = iconName;
    
    if (!iconNameStr) {
      switch (type) {
        case "success":
          iconNameStr = "checkmark-circle";
          break;
        case "error":
        case "warning":
          iconNameStr = "alert-circle";
          break;
        default:
          iconNameStr = "information-circle";
          break;
      }
    }

    return {
      name: iconNameStr,
      bg: alertTheme.bg,
      border: alertTheme.border,
      iconColor: alertTheme.icon,
    };
  };

  const themeVars = getThemeVars();

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

        <View 
          className="w-[85%] rounded-[32px] p-8 items-center shadow-2xl border"
          style={{ 
            backgroundColor: colors.card,
            borderColor: `${colors.text}05`
          }}
        >
          {/* Icon Section */}
          <View
            className="mb-4 p-3 rounded-full border"
            style={{ backgroundColor: themeVars.bg, borderColor: themeVars.border }}
          >
            <Ionicons name={themeVars.name as any} size={32} color={themeVars.iconColor} />
          </View>

          {/* Text Section */}
          <Text
            className="text-2xl text-center mb-2"
            style={{
              fontFamily: fonts.family.bold,
              color: colors.text,
            }}
          >
            {title}
          </Text>
          <Text
            className="text-center text-base leading-6 mb-8 px-2"
            style={{ fontFamily: fonts.family.regular, color: colors.textSecondary }}
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
                className={`${horizontalButtons ? "flex-1" : "w-full"} h-14 rounded-2xl items-center justify-center`}
                style={{ backgroundColor: `${colors.muted}15` }}
                activeOpacity={0.7}
              >
                <Text 
                  className="text-base"
                  style={{ fontFamily: fonts.family.semiBold, color: colors.text }}
                >
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onClose}
              className={`${horizontalButtons ? "flex-1" : "w-full"} h-14 rounded-2xl items-center justify-center shadow-lg`}
              style={{
                backgroundColor: themeVars.iconColor,
                shadowColor: themeVars.iconColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
              }}
              activeOpacity={0.8}
            >
              <Text 
                className="text-white text-lg"
                style={{ fontFamily: fonts.family.bold }}
              >
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
