import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { styles } from "../../screens/services/serviceDetail/styles/ServiceDetailStyles";
import { colors } from "../../theme/colors";

interface EditServiceModalProps {
  visible: boolean;
  onClose: () => void;
  initialName: string;
  initialCost: number;
  initialDay: number;
  onSubmit: (name: string, cost: string, day: string) => void;
}

export const EditServiceModal = ({
  visible,
  onClose,
  initialName,
  initialCost,
  initialDay,
  onSubmit,
}: EditServiceModalProps) => {
  const [editServiceName, setEditServiceName] = useState(initialName);
  const [editServiceCost, setEditServiceCost] = useState(
    initialCost.toString()
  );
  const [editServiceDay, setEditServiceDay] = useState(initialDay.toString());

  useEffect(() => {
    setEditServiceName(initialName);
    setEditServiceCost(initialCost.toString());
    setEditServiceDay(initialDay.toString());
  }, [initialName, initialCost, initialDay, visible]);

  const handleSave = () => {
    onSubmit(editServiceName, editServiceCost, editServiceDay);
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
          <Text style={styles.modalTitle}>Editar Servicio</Text>

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
            value={editServiceName}
            onChangeText={setEditServiceName}
          />

          <Text
            style={{
              alignSelf: "flex-start",
              color: colors.textSecondary,
              marginBottom: 5,
            }}
          >
            Costo Total (S/)
          </Text>
          <TextInput
            style={styles.input}
            value={editServiceCost}
            onChangeText={setEditServiceCost}
            keyboardType="numeric"
          />

          <Text
            style={{
              alignSelf: "flex-start",
              color: colors.textSecondary,
              marginBottom: 5,
            }}
          >
            Día de Corte
          </Text>
          <TextInput
            style={styles.input}
            value={editServiceDay}
            onChangeText={setEditServiceDay}
            keyboardType="numeric"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
