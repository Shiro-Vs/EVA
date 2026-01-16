import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ListItem } from "../../subscribers/components/ListItem"; // Import ListItem
// Use subscriber styles for the grid to ensure consistency
import { styles } from "../../subscribers/styles/SubscriberDetailStyles";
import { colors } from "../../../../theme/colors";
import { OwnerDebt } from "../../../../services/subscriptionService";
import { monthsEs } from "../../../../utils/dateUtils";

interface PaymentsTabProps {
  debts: OwnerDebt[];
  onPayDebt: (debt: OwnerDebt) => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  debts,
  onPayDebt,
}) => {
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const generateYearGrid = () => {
    const grid = [];
    for (let i = 0; i < 12; i++) {
      const monthName = monthsEs[i];
      // Note: check format in your DB. Usually "Enero 2024" or similar.
      // Assuming OwnerDebt also follows "Month Year" or similar pattern.
      // If OwnerDebt.month is just "Enero", we might need to adjust logic.
      // Based on previous chats, it seems to be "Enero 2024".
      const label = `${monthName} ${filterYear}`;

      const match = debts.find(
        (d) =>
          d.month.replace(" de ", " ").toLowerCase() === label.toLowerCase()
      );

      grid.push({
        label: monthName,
        fullLabel: label,
        index: i,
        debt: match || null,
        status: match ? match.status : "empty",
      });
    }
    return grid;
  };

  const calendarData = generateYearGrid();

  const renderItem = ({ item }: { item: any }) => {
    const isPending = item.status === "pending";
    const isPaid = item.status === "paid";
    const isEmpty = item.status === "empty";

    // Format Date if paid
    let statusText = "";
    if (isPaid && item.debt?.paidAt) {
      const dateObj = item.debt.paidAt.toDate
        ? item.debt.paidAt.toDate()
        : new Date(item.debt.paidAt);
      const day = dateObj.getDate();
      const mIndex = dateObj.getMonth();
      const shortMonths = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      statusText = `${day} ${shortMonths[mIndex]}`;
    }

    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          isPending && styles.gridItemPending,
          isPaid && styles.gridItemPaid,
          isEmpty && styles.gridItemEmpty,
        ]}
        onPress={() => {
          if (isPending) {
            onPayDebt(item.debt);
          }
          // If paid or empty, do nothing for now (or maybe show empty modal in future)
        }}
        activeOpacity={0.7}
        disabled={isEmpty} // Disable empty for now unless we want to allow generating debts
      >
        <Text style={styles.gridMonth}>{item.label.substring(0, 3)}</Text>

        {!isEmpty ? (
          <View
            style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
          >
            {isPaid ? (
              <>
                {/* Date (Top) */}
                <Text style={styles.gridPaidDate}>{statusText}</Text>

                {/* Amount (Principal) */}
                <Text style={styles.gridAmount}>
                  S/ {item.debt?.amount?.toFixed(2) || "0.00"}
                </Text>

                {/* Account Info (Bottom) */}
                {item.debt?.accountName && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 4,
                      opacity: 0.8,
                    }}
                  >
                    <Ionicons
                      name={(item.debt.accountIcon as any) || "wallet"}
                      size={10}
                      color={item.debt.accountColor || colors.textSecondary}
                      style={{ marginRight: 2 }}
                    />
                    <Text
                      style={{
                        fontSize: 9,
                        color: colors.textSecondary,
                        maxWidth: 50,
                      }}
                      numberOfLines={1}
                    >
                      {item.debt.accountName}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.gridPendingText}>DEBE</Text>
            )}
          </View>
        ) : (
          <Ionicons
            name="lock-closed"
            size={16}
            color={colors.textSecondary}
            style={{ opacity: 0.2 }}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Year Filter */}
      {/* Year Filter & View Toggle */}
      <View style={styles.listHeaderContainer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ width: 40 }} />

          <View style={styles.yearFilter}>
            <TouchableOpacity onPress={() => setFilterYear((y) => y - 1)}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.yearFilterText}>{filterYear}</Text>
            <TouchableOpacity onPress={() => setFilterYear((y) => y + 1)}>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setViewMode((m) => (m === "grid" ? "list" : "grid"))}
            style={{
              width: 50,
              height: 40,
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={viewMode === "grid" ? "list" : "grid"}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        key={viewMode}
        data={calendarData}
        keyExtractor={(item) => item.fullLabel}
        renderItem={
          viewMode === "grid"
            ? renderItem
            : ({ item }) => (
                <ListItem
                  item={item}
                  selectedItems={[]}
                  onPress={(itm) => {
                    if (itm.status === "pending") {
                      onPayDebt(itm.debt);
                    }
                  }}
                  onLongPress={() => {}}
                />
              )
        }
        numColumns={viewMode === "grid" ? 3 : 1}
        contentContainerStyle={styles.gridList}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: colors.textSecondary }}>
            No hay información para este año.
          </Text>
        }
      />
    </View>
  );
};
