import React from "react";
import { View, Text } from "react-native";
import { styles } from "./HomeScreen.styles";
import { useHome } from "./useHome";

export default function HomeScreen() {
  const {} = useHome();

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
