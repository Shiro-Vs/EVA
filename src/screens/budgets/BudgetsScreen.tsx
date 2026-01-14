import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default function BudgetsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Metas y Presupuestos</Text>
      <Text style={styles.subtext}>Próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  subtext: {
    color: colors.textSecondary,
    marginTop: 10,
  },
});
