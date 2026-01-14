import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { styles } from "../../../screens/subscriptions/subscribers/styles/SubscriberDetailStyles";
import { colors } from "../../../theme/colors";

interface EditSubscriberModalProps {
  visible: boolean;
  onClose: () => void;
  initialName: string;
  initialQuota: number;
  initialColor?: string;
  onSave: (name: string, quota: string, color?: string) => void;
}

const PREDEFINED_COLORS = [
  "#FF5733", // Red/Orange
  "#33FF57", // Green
  "#3357FF", // Blue
  "#F1C40F", // Yellow
  "#9B59B6", // Purple
  "#E74C3C", // Red
  "#1ABC9C", // Teal
  "#34495E", // Dark Blue
  "#E67E22", // Orange
  "#2ECC71", // Emerald
];

export const EditSubscriberModal = ({
  visible,
  onClose,
  initialName,
  initialQuota,
  initialColor,
  onSave,
}: EditSubscriberModalProps) => {
  const [editName, setEditName] = useState(initialName);
  const [editQuota, setEditQuota] = useState(initialQuota.toString());
  const [editColor, setEditColor] = useState(
    initialColor || PREDEFINED_COLORS[0]
  );

  useEffect(() => {
    setEditName(initialName);
    setEditQuota(initialQuota.toString());
    setEditColor(initialColor || PREDEFINED_COLORS[0]);
  }, [initialName, visible, initialQuota, initialColor]);

  const handleSave = () => {
    onSave(editName, editQuota, editColor);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

              <Text
                style={{
                  alignSelf: "flex-start",
                  color: colors.textSecondary,
                  marginBottom: 10,
                  marginTop: 5,
                }}
              >
                Color de Perfil
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, marginBottom: 20 }}
              >
                {PREDEFINED_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setEditColor(color)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: color,
                      borderWidth: editColor === color ? 3 : 0,
                      borderColor: colors.text, // White border for selection
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {editColor === color && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "white",
                        }}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={styles.confirmButton}
                >
                  <Text style={styles.confirmButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
