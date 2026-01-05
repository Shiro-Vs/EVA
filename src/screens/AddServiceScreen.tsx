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
} from "react-native";
import { colors } from "../theme/colors";
import { auth } from "../config/firebaseConfig";
import { createService, Service } from "../services/subscriptionService";

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    color: colors.text,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  form: {
    marginBottom: 30,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },
  cancelButton: {
    padding: 15,
    alignItems: "center",
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
