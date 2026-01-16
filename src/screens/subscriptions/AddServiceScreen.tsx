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
import { Ionicons } from "@expo/vector-icons";
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
    accounts,
    selectedAccountId,
    setSelectedAccountId,
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

              {/* Account Selector */}
              <Text style={[styles.label, { marginTop: 15 }]}>
                Cuenta de Pago por Defecto
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {accounts.map((acc) => (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => setSelectedAccountId(acc.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor:
                        selectedAccountId === acc.id
                          ? acc.color || colors.primary
                          : "#2C2C2E",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor:
                        selectedAccountId === acc.id
                          ? "transparent"
                          : "#3A3A3C",
                    }}
                  >
                    <Ionicons
                      name={acc.icon as any}
                      size={16}
                      color={selectedAccountId === acc.id ? "#FFF" : "#8E8E93"}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color:
                          selectedAccountId === acc.id ? "#FFF" : "#8E8E93",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {acc.name}
                    </Text>
                  </TouchableOpacity>
                ))}
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
