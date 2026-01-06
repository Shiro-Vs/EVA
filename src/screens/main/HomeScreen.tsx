import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";
import { auth, db } from "../../config/firebaseConfig";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Tarjeta de Saldo */}
      <View style={styles.card}>
        <Text style={styles.label}>Saldo Total</Text>
        <Text style={styles.balance}>S/ 1,250.00</Text>
      </View>

      <Text style={[styles.label, { marginTop: 30 }]}>
        Movimientos Recientes
      </Text>
      {/* Aquí irán tus listas luego */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60, // Espacio para la barra de estado
    paddingHorizontal: 20,
    paddingBottom: 100, // Espacio para Navbar
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 5,
  },
  balance: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "bold",
  },
});
