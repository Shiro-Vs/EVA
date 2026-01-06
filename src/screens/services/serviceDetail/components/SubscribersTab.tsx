import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/ServiceDetailStyles";
import { colors } from "../../../../theme/colors";
import { Subscriber } from "../../../../services/subscriptionService";

interface SubscribersTabProps {
  subscribers: Subscriber[];
  onSelectSubscriber: (subscriber: Subscriber) => void;
}

export const SubscribersTab: React.FC<SubscribersTabProps> = ({
  subscribers,
  onSelectSubscriber,
}) => {
  return (
    <FlatList
      data={subscribers}
      keyExtractor={(item) => item.id!}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => onSelectSubscriber(item)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemSub}>Cuota: S/ {item.quota}</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No hay suscriptores aún.</Text>
      }
    />
  );
};
