import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { colors } from "../../theme/colors";
import { auth } from "../../config/firebaseConfig";
import { createService, Service } from "../../services/subscriptionService";

export default function AddServiceScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [billingDay, setBillingDay] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !cost || !billingDay) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const newService: Service = {
        name,
        cost: parseFloat(cost),
        billingDay: parseInt(billingDay),
        createdAt: new Date(),
      };

      await createService(user.uid, newService);
      Alert.alert("Éxito", "Servicio creado correctamente");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "No se pudo crear el servicio");
    } finally {
      setLoading(false);
    }
  };

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Fondo transparente controlado por el componente padre o nulo
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.0)", // Transparente total como pediste
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "90%", // Más estrecho
    maxWidth: 400, // Límite máximo menor
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 15, // Menos padding interno
    shadowColor: "#3ed2ffff",
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
    // Borde para separar del fondo transparente
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
