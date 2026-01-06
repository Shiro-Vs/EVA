import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { styles } from "../../../screens/services/subscribers/styles/SubscriberDetailStyles";
import { colors } from "../../../theme/colors";

interface EditSubscriberModalProps {
  visible: boolean;
  onClose: () => void;
  initialName: string;
  initialQuota: number;
  onSave: (name: string, quota: string) => void;
}

export const EditSubscriberModal = ({
  visible,
  onClose,
  initialName,
  initialQuota,
  onSave,
}: EditSubscriberModalProps) => {
  const [editName, setEditName] = useState(initialName);
  const [editQuota, setEditQuota] = useState(initialQuota.toString());

  useEffect(() => {
    setEditName(initialName);
    setEditQuota(initialQuota.toString());
  }, [initialName, visible, initialQuota]);

  const handleSave = () => {
    onSave(editName, editQuota);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Suscriptor</Text>

          <Text
            style={{
              alignSelf: "flex-start",
              color: colors.textSecondary,
              marginBottom: 5,
            }}
          >
            Nombre
          </Text>
          <TextInput
            style={styles.input}
            value={editName}
            onChangeText={setEditName}
          />

          <Text
            style={{
              alignSelf: "flex-start",
              color: colors.textSecondary,
              marginBottom: 5,
            }}
          >
            Cuota (S/)
          </Text>
          <TextInput
            style={styles.input}
            value={editQuota}
            onChangeText={setEditQuota}
            keyboardType="numeric"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
