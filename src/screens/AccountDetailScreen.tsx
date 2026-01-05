import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function AccountDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Movimientos BCP</Text>
      <Text style={styles.text}>
        Aquí verás la lista de gastos solo de esta cuenta.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: { color: colors.textSecondary },
});
