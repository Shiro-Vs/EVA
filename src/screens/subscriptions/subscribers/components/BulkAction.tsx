import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/SubscriberDetailStyles";
import { colors } from "../../../../theme/colors";

interface BulkActionProps {
  selectionMode: boolean;
  selectedCount: number;
  onExit: () => void;
  onDelete: () => void;
  onPay: () => void;
}

export const BulkAction: React.FC<BulkActionProps> = ({
  selectionMode,
  selectedCount,
  onExit,
  onDelete,
  onPay,
}) => {
  if (!selectionMode) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 120, // Raised slightly higher
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: 40,
        padding: 5,
        paddingHorizontal: 10,
        elevation: 10, // Strong shadow for floating effect
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        gap: 10,
      }}
    >
      {/* Cancel (Simple Icon) */}
      <TouchableOpacity onPress={onExit} style={{ padding: 10 }}>
        <Ionicons name="close" size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Divider */}
      <View style={{ width: 1, height: 20, backgroundColor: colors.border }} />

      {/* Delete (Icon only, red) */}
      <TouchableOpacity onPress={onDelete} style={{ padding: 10 }}>
        <Ionicons name="trash-outline" size={22} color={colors.error} />
      </TouchableOpacity>

      {/* Pay Button (Primary Pill) */}
      <TouchableOpacity
        onPress={onPay}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 30,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text style={{ color: "#000", fontWeight: "bold", fontSize: 14 }}>
          Pagar ({selectedCount})
        </Text>
        <Ionicons name="checkmark" size={18} color="#000" />
      </TouchableOpacity>
    </View>
  );
};
