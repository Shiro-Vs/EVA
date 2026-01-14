import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/SubscriberDetailStyles";
import { colors } from "../../../../theme/colors";

interface GridItemProps {
  item: any;
  selectedItems: string[];
  onPress: (item: any) => void;
  onLongPress: (item: any) => void;
}

export const GridItem: React.FC<GridItemProps> = ({
  item,
  selectedItems,
  onPress,
  onLongPress,
}) => {
  const isPending = item.status === "pending";
  const isPaid = item.status === "paid";
  const isEmpty = item.status === "empty";
  const isSelected = selectedItems.includes(item.fullLabel);

  // Format Date if paid
  let statusText = "";
  if (isPaid && item.debt.paidAt) {
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
        isSelected && {
          backgroundColor: "rgba(33, 150, 243, 0.2)", // Visible Blue Tint
          transform: [{ scale: 0.95 }], // Slight shrink effect
        },
      ]}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
      delayLongPress={300}
      activeOpacity={0.7}
    >
      <Text style={styles.gridMonth}>{item.label.substring(0, 3)}</Text>

      {!isEmpty ? (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          {isPaid ? (
            <Text style={styles.gridPaidDate}>{statusText}</Text>
          ) : (
            <Text style={styles.gridPendingText}>DEBE</Text>
          )}
        </View>
      ) : (
        <Ionicons
          name="add"
          size={16}
          color={colors.textSecondary}
          style={{ opacity: 0.2 }}
        />
      )}

      {isSelected && (
        <View style={{ position: "absolute", top: 2, right: 2 }}>
          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};
