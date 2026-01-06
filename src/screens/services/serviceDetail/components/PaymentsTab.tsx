import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/ServiceDetailStyles";
import { colors } from "../../../../theme/colors";
import { OwnerDebt } from "../../../../services/subscriptionService";

interface PaymentsTabProps {
  debts: OwnerDebt[];
  onPayDebt: (debt: OwnerDebt) => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  debts,
  onPayDebt,
}) => {
  return (
    <FlatList
      data={debts}
      keyExtractor={(item) => item.id!}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{ marginRight: 15 }}>
            <Ionicons
              name={item.status === "paid" ? "checkmark-circle" : "time"}
              size={30}
              color={item.status === "paid" ? colors.success : colors.secondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.month}</Text>
            <Text style={styles.itemSub}>
              {item.status === "paid" ? "Pagado" : "Pendiente de Pago"}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.amount}>- S/ {item.amount.toFixed(2)}</Text>
            {item.status === "pending" && (
              <TouchableOpacity
                style={styles.payButtonSmall}
                onPress={() => onPayDebt(item)}
              >
                <Text style={styles.payButtonTextSmall}>Pagar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No tienes deudas de servicio.</Text>
      }
    />
  );
};
