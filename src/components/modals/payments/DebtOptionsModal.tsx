import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../../screens/subscriptions/subscribers/styles/SubscriberDetailStyles";
import { colors } from "../../../theme/colors";
import { Debt } from "../../../services/subscriptionService";

interface DebtOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  debt: Debt | null;
  onRevert: () => void;
  onDelete: () => void;
}

export const DebtOptionsModal = ({
  visible,
  onClose,
  debt,
  onRevert,
  onDelete,
}: DebtOptionsModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            width: "80%",
            borderRadius: 20,
            padding: 20,
            alignItems: "center",
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: colors.text,
              marginBottom: 20,
            }}
          >
            {debt?.month}
          </Text>

          {debt?.status === "paid" && (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.background,
                padding: 15,
                borderRadius: 15,
                width: "100%",
                marginBottom: 10,
              }}
              onPress={() => {
                onClose();
                onRevert();
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  padding: 8,
                  borderRadius: 10,
                  marginRight: 15,
                }}
              >
                <Ionicons name="refresh" size={20} color={colors.text} />
              </View>
              <Text
                style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}
              >
                Marcar como Pendiente
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255, 68, 68, 0.1)",
              padding: 15,
              borderRadius: 15,
              width: "100%",
              marginBottom: 20,
            }}
            onPress={() => {
              onClose();
              onDelete();
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(255, 68, 68, 0.2)",
                padding: 8,
                borderRadius: 10,
                marginRight: 15,
              }}
            >
              <Ionicons name="trash" size={20} color={colors.error} />
            </View>
            <Text
              style={{ color: colors.error, fontWeight: "600", fontSize: 16 }}
            >
              Eliminar Mes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ padding: 10 }} onPress={onClose}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
