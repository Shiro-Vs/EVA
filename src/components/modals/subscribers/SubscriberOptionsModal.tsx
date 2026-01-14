import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../../screens/subscriptions/subscribers/styles/SubscriberDetailStyles";
import { colors } from "../../../theme/colors";

interface SubscriberOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const SubscriberOptionsModal = ({
  visible,
  onClose,
  onEdit,
  onDelete,
}: SubscriberOptionsModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Opciones del Suscriptor</Text>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  onClose();
                  onEdit();
                }}
              >
                <Ionicons name="pencil" size={20} color={colors.text} />
                <Text style={styles.optionText}>Editar Suscriptor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  onClose();
                  onDelete();
                }}
              >
                <Ionicons name="trash" size={20} color={colors.secondary} />
                <Text style={[styles.optionText, { color: colors.secondary }]}>
                  Eliminar Suscriptor
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { borderBottomWidth: 0 }]}
                onPress={onClose}
              >
                <Text style={styles.optionTextCancel}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
