import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { colors } from "../../theme/colors";
import { styles } from "./AddServiceScreen.styles";
import { useAddService } from "./useAddService";

export default function AddServiceScreen() {
  const {
    name,
    setName,
    cost,
    setCost,
    billingDay,
    setBillingDay,
    loading,
    handleCreate,
    navigation,
  } = useAddService();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              <Text style={styles.title}>Nuevo Servicio</Text>

              <View style={styles.form}>
                <Text style={styles.label}>Nombre del Servicio</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Netflix, Spotify, Gym..."
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />

                <Text style={styles.label}>Costo Total Mensual (S/)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={cost}
                  onChangeText={setCost}
                />

                <Text style={styles.label}>Día de Pago (1-31)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 15"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={billingDay}
                  onChangeText={setBillingDay}
                  maxLength={2}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleCreate}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Creando..." : "Crear Servicio"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
