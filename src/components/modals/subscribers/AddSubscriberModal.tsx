import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../../../theme/colors";

interface AddSubscriberModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, quota: string) => void;
}

export const AddSubscriberModal = ({
  visible,
  onClose,
  onSubmit,
}: AddSubscriberModalProps) => {
  const [subName, setSubName] = useState("");
  const [subQuota, setSubQuota] = useState("");

  const handleSave = () => {
    onSubmit(subName, subQuota);
    // Limpiar al guardar o cerrar
    setSubName("");
    setSubQuota("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardContainer}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.content}>
                <Text style={styles.title}>Agregar Suscriptor</Text>

                <View style={styles.form}>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Juan"
                    placeholderTextColor={colors.textSecondary}
                    value={subName}
                    onChangeText={setSubName}
                    autoFocus
                  />

                  <Text style={styles.label}>Cuota Mensual (S/)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={subQuota}
                    onChangeText={setSubQuota}
                  />
                  <Text style={styles.note}>
                    * Se creará la deuda de este mes automáticamente.
                  </Text>
                </View>

                <TouchableOpacity onPress={handleSave} style={styles.button}>
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.0)", // Transparente total
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  keyboardContainer: {
    width: "100%",
    alignItems: "center",
  },
  content: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 15,
    shadowColor: "#3ed2ffff",
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 24,
    color: colors.text,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: -8,
    marginLeft: 4,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    padding: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
