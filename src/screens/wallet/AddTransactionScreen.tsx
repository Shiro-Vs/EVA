import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { colors } from "../../theme/colors";
import { auth } from "../../config/firebaseConfig";
import { addTransaction, Transaction } from "../../services/transactionService";
import { Ionicons } from "@expo/vector-icons";

export default function AddTransactionScreen({ navigation }: any) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense"); // Default gasto
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || !description) {
      Alert.alert("Error", "Por favor completa el monto y la descripción");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const newTransaction: Transaction = {
        type,
        amount: parseFloat(amount),
        category: "General", // Podríamos agregar selector después
        description,
        date: new Date(),
      };

      await addTransaction(user.uid, newTransaction);
      Alert.alert("Éxito", "Movimiento guardado");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Nuevo Movimiento</Text>

      {/* Selector de Tipo */}
      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "income" && { backgroundColor: colors.success },
          ]}
          onPress={() => setType("income")}
        >
          <Ionicons
            name="arrow-up-circle"
            size={24}
            color={type === "income" ? "#000" : colors.success}
          />
          <Text
            style={[
              styles.typeText,
              type === "income" ? { color: "#000" } : { color: colors.success },
            ]}
          >
            Ingreso
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "expense" && { backgroundColor: colors.secondary },
          ]}
          onPress={() => setType("expense")}
        >
          <Ionicons
            name="arrow-down-circle"
            size={24}
            color={type === "expense" ? "#000" : colors.secondary}
          />
          <Text
            style={[
              styles.typeText,
              type === "expense"
                ? { color: "#000" }
                : { color: colors.secondary },
            ]}
          >
            Gasto
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Monto (S/)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          autoFocus
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Comida, Sueldo, Uber..."
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveText}>
          {loading ? "Guardando..." : "Guardar Movimiento"}
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
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 30,
    textAlign: "center",
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  typeButton: {
    flex: 0.48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeText: {
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
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
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  saveText: { color: "#000", fontWeight: "bold", fontSize: 18 },
  cancelButton: { padding: 15, alignItems: "center" },
  cancelText: { color: colors.textSecondary, fontSize: 16 },
});
