import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/SubscriberDetailStyles";
import { colors } from "../../../../theme/colors";

interface ListItemProps {
  item: any; // Using same item structure as GridItem
  onPress: (item: any) => void;
  onLongPress: (item: any) => void;
  selectedItems: string[];
}

export const ListItem: React.FC<ListItemProps> = ({
  item,
  onPress,
  onLongPress,
  selectedItems,
}) => {
  const isPending = item.status === "pending";
  const isPaid = item.status === "paid";
  const isEmpty = item.status === "empty";
  const isSelected = selectedItems.includes(item.fullLabel);

  // Format Date if paid
  let statusText = "PENDIENTE";
  let dateText = "";
  if (isPaid && item.debt.paidAt) {
    statusText = "PAGADO";
    const dateObj = item.debt.paidAt.toDate
      ? item.debt.paidAt.toDate()
      : new Date(item.debt.paidAt);
    dateText = dateObj.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  }

  // Determine status text for empty items based on date
  let emptyText = "Sin Cobro";
  if (isEmpty) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Parse year from fullLabel "Enero 2024"
    const parts = item.fullLabel.split(" ");
    const itemYear = parseInt(parts[parts.length - 1]);

    if (itemYear > currentYear) {
      emptyText = "Próximo Cobro";
    } else if (itemYear === currentYear && item.index > currentMonth) {
      emptyText = "Próximo Cobro";
    } else if (itemYear === currentYear && item.index === currentMonth) {
      emptyText = "Cobro del Mes"; // Optional: Highlight current month
    }
  }

  // Determine amount
  const amount = item.debt?.amount || 0;

  return (
    <TouchableOpacity
      style={[
        styles.listItem,
        isPending && styles.listItemPending,
        isPaid && styles.listItemPaid,
        isEmpty && { borderColor: "rgba(255,255,255,0.05)" }, // Differentiate empty
        isSelected && {
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          borderColor: colors.primary,
        },
      ]}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
      delayLongPress={300}
      activeOpacity={0.7}
    >
      <View style={styles.listItemLeft}>
        <Text
          style={[
            styles.listItemMonth,
            isEmpty && { color: colors.textSecondary },
          ]}
        >
          {item.label}
        </Text>
        <Text style={styles.listItemSub}>
          {isEmpty ? emptyText : statusText}
        </Text>

        {/* Account Info in List */}
        {isPaid && item.debt?.accountName && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 4,
              opacity: 0.7,
            }}
          >
            <Ionicons
              name={(item.debt.accountIcon as any) || "wallet"}
              size={12}
              color={item.debt.accountColor || colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>
              {item.debt.accountName}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.listItemRight}>
        {!isEmpty ? (
          <>
            <Text style={styles.listAmount}>
              {isPaid || isPending ? `S/ ${amount}` : ""}
            </Text>
            {isPaid && (
              <Text
                style={[
                  styles.listStatus,
                  { color: colors.textSecondary, fontWeight: "normal" },
                ]}
              >
                {dateText}
              </Text>
            )}
            {isPending && (
              <Text style={[styles.listStatus, { color: colors.error }]}>
                DEBE
              </Text>
            )}
          </>
        ) : (
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
