import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
  StyleSheet,
} from "react-native";
import { TransactionItem } from "./components/TransactionItem";
import { groupTransactionsByDate } from "../../utils/transactionUtils";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Transaction } from "../../services/transactionService";

import { styles } from "./WalletScreen.styles";
import { useWallet } from "./useWallet";
import { TransactionDetailModal } from "../../components/modals/wallet/TransactionDetailModal";
import { WalletFilterModal } from "../../components/modals/wallet/WalletFilterModal";

export default function WalletScreen({ navigation }: any) {
  const {
    incomeTransactions,
    expenseTransactions,
    loading,
    refreshing,
    onRefresh,
    activeFilters,
    applyFilters,
    clearFilters,
    setMonthsFilter, // Updated name
    uniqueCategories,
    uniqueServices,
    uniqueSubscribers,
    uniqueAccounts,
  } = useWallet();

  // Tab State
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");
  const { width } = Dimensions.get("window");
  const scrollRef = useRef<FlatList>(null);
  const isProgrammaticScroll = useRef(false); // Lock to prevent loop

  // Modal State
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaction | null>(null);
  const [detailModalVisible, setDetailModalVisible] = React.useState(false);
  const [filterModalVisible, setFilterModalVisible] = React.useState(false);

  // Header Subtitle Logic
  const hasMonths = activeFilters.months && activeFilters.months.length > 0;
  let headerSubtitle = "Todo el historial";

  if (hasMonths) {
    if (activeFilters.months.length === 1) {
      const [year, month] = activeFilters.months[0].split("-").map(Number);
      const date = new Date(year, month - 1);
      const monthName = date.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
      headerSubtitle = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    } else {
      headerSubtitle = `${activeFilters.months.length} Meses Seleccionados`;
    }
  }

  const hasActiveFilters =
    hasMonths ||
    activeFilters.categories.length > 0 ||
    activeFilters.services.length > 0 ||
    activeFilters.subscribers.length > 0;

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalVisible(true);
  };

  // Sync Tab -> Scroll
  const handleTabPress = (tab: "income" | "expense") => {
    if (activeTab === tab) return; // Avoid redundant press
    setActiveTab(tab);
    isProgrammaticScroll.current = true; // Lock

    if (tab === "income") {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
    } else {
      scrollRef.current?.scrollToOffset({ offset: width, animated: true });
    }

    // Release lock after animation
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
  };

  // Sync Scroll -> Tab
  const handleScroll = (event: any) => {
    if (isProgrammaticScroll.current) return; // Ignore if programmatic

    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / width);
    const newTab = index === 0 ? "income" : "expense";
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleTransactionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={item.type === "income" ? "arrow-up" : "arrow-down"}
          size={24}
          color={item.type === "income" ? colors.success : colors.secondary}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1} ellipsizeMode="tail">
          {item.description}
        </Text>
        <Text style={styles.date}>{item.date.toLocaleDateString()}</Text>
      </View>
      <Text
        style={[
          styles.amount,
          { color: item.type === "income" ? colors.success : colors.text },
        ]}
      >
        {item.type === "income" ? "+" : "-"} S/ {item.amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  const renderListPage = (data: Transaction[], emptyText: string) => (
    <View style={{ width: width }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={renderTransactionItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>Mis Movimientos</Text>
          <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              hasActiveFilters && styles.filterButtonActive,
            ]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons
              name={hasActiveFilters ? "funnel" : "funnel-outline"}
              size={20}
              color={hasActiveFilters ? "#FFF" : colors.text}
            />
            {hasActiveFilters && <View style={styles.badge} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs / Filtros */}
      {/* Tabs / Filtros */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "income" && {
              backgroundColor: "rgba(76, 175, 80, 0.15)",
            }, // Subtle Green
          ]}
          onPress={() => handleTabPress("income")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "income" && {
                color: "#4CAF50",
                fontWeight: "bold",
              },
            ]}
          >
            Ingresos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "expense" && {
              backgroundColor: "rgba(255, 68, 68, 0.15)",
            }, // Subtle Red
          ]}
          onPress={() => handleTabPress("expense")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "expense" && {
                color: "#FF4444",
                fontWeight: "bold",
              },
            ]}
          >
            Egresos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Swipeable */}
      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <Animated.FlatList
          ref={scrollRef}
          data={["income", "expense"]}
          keyExtractor={(item) => item}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          renderItem={({ item }) => {
            const isIncome = item === "income";
            const data = isIncome ? incomeTransactions : expenseTransactions;
            const groupedData = groupTransactionsByDate(data);
            const emptyText = isIncome
              ? "No hay ingresos registrados."
              : "No hay gastos registrados.";

            return (
              <View style={{ width: width, flex: 1 }}>
                <SectionList
                  sections={groupedData}
                  keyExtractor={(t) => t.id || Math.random().toString()}
                  stickySectionHeadersEnabled={false}
                  contentContainerStyle={{
                    paddingBottom: 80,
                    paddingHorizontal: 16,
                    paddingTop: 10,
                  }}
                  renderItem={({ item }) => (
                    <TransactionItem
                      transaction={item}
                      onPress={handleTransactionPress}
                    />
                  )}
                  renderSectionHeader={({ section: { title } }) => (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#9E9E9E",
                        marginTop: 16,
                        marginBottom: 8,
                        marginLeft: 4,
                      }}
                    >
                      {title}
                    </Text>
                  )}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor={colors.primary}
                    />
                  }
                  ListEmptyComponent={
                    <View style={{ paddingTop: 50, alignItems: "center" }}>
                      <Ionicons
                        name="documents-outline"
                        size={48}
                        color="#E0E0E0"
                      />
                      <Text style={styles.emptyText}>{emptyText}</Text>
                    </View>
                  }
                />
              </View>
            );
          }}
        />
      )}

      {/* FAB - Botón Flotante para Agregar */}

      {/* Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          visible={detailModalVisible}
          transaction={selectedTransaction}
          onClose={() => setDetailModalVisible(false)}
        />
      )}

      {/* Filter Modal */}
      <WalletFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={applyFilters}
        onClear={clearFilters}
        uniqueCategories={uniqueCategories}
        uniqueServices={uniqueServices}
        uniqueSubscribers={uniqueSubscribers}
        uniqueAccounts={uniqueAccounts}
        activeFilters={activeFilters}
      />
    </View>
  );
}
