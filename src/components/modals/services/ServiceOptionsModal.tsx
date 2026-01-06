import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../../screens/services/serviceDetail/styles/ServiceDetailStyles";
import { colors } from "../../../theme/colors";

interface ServiceOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ServiceOptionsModal = ({
  visible,
  onClose,
  onEdit,
  onDelete,
}: ServiceOptionsModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Opciones del Servicio</Text>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onClose();
              onEdit();
            }}
          >
            <Ionicons name="pencil" size={20} color={colors.text} />
            <Text style={styles.optionText}>Editar Servicio</Text>
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
              Eliminar Servicio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, { borderBottomWidth: 0 }]}
            onPress={onClose}
          >
            <Text style={styles.optionTextCancel}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
