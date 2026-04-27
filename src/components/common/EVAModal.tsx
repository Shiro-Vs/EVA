import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

interface EVAModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  primaryButtonText?: string;
  onPrimaryAction?: () => void;
  secondaryButtonText?: string;
  onSecondaryAction?: () => void;
  scrollEnabled?: boolean;
}

export default function EVAModal({
  visible,
  title,
  onClose,
  children,
  primaryButtonText = "Guardar",
  onPrimaryAction,
  secondaryButtonText = "Cancelar",
  onSecondaryAction,
  scrollEnabled = true,
}: EVAModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDark ? "rgba(5,10,14,0.85)" : "rgba(255,255,255,0.85)" }
          ]}
          onPress={onClose}
        />
        
        <View className="bg-background w-[85%] max-h-[85%] rounded-[32px] p-8 shadow-2xl flex flex-col">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-text-primary font-asap-bold text-xl">{title}</Text>
            <TouchableOpacity onPress={onClose} className="p-1" activeOpacity={0.6}>
              <Ionicons name="close" size={24} color="#8F99A1" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            className="mb-4" 
            nestedScrollEnabled={true}
            scrollEnabled={scrollEnabled}
          >
            {children}
          </ScrollView>

          {/* Buttons Section */}
          <View className="flex-row gap-3 pt-2">
            {secondaryButtonText && (
              <TouchableOpacity
                onPress={onSecondaryAction || onClose}
                className="flex-1 h-14 rounded-2xl items-center justify-center bg-card"
                activeOpacity={0.7}
              >
                <Text className="text-text-primary font-asap-bold text-base">
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}

            {primaryButtonText && onPrimaryAction && (
              <TouchableOpacity
                onPress={onPrimaryAction}
                className="flex-1 bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
                activeOpacity={0.8}
              >
                <Text className="text-white font-asap-bold text-base">
                  {primaryButtonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
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
