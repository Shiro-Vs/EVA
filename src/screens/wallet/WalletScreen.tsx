import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Transaction } from "../../services/transactionService";

import { styles } from "./WalletScreen.styles";
import { useWallet } from "./useWallet";

export default function WalletScreen({ navigation }: any) {
  const { filter, setFilter, transactions, loading, refreshing, onRefresh } =
    useWallet();

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={item.type === "income" ? "arrow-up" : "arrow-down"}
          size={24}
          color={item.type === "income" ? colors.success : colors.secondary}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.date}>
          {item.date.toLocaleDateString()} -{" "}
          {item.date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          { color: item.type === "income" ? colors.success : colors.text },
        ]}
      >
        {item.type === "income" ? "+" : "-"} S/ {item.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Movimientos</Text>

      {/* Tabs / Filtros */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, filter === "income" && styles.activeTab]}
          onPress={() => setFilter("income")}
        >
          <Text
            style={[
              styles.tabText,
              filter === "income" && { color: colors.background },
            ]}
          >
            Ingresos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === "expense" && styles.activeTab]}
          onPress={() => setFilter("expense")}
        >
          <Text
            style={[
              styles.tabText,
              filter === "expense" && { color: colors.background },
            ]}
          >
            Egresos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay movimientos registrados</Text>
          }
        />
      )}

      {/* FAB - Botón Flotante para Agregar */}
    </View>
  );
}
