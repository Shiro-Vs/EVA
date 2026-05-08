import React from "react";
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { PaymentHistory } from "../../../../interfaces/Subscription";
import { useAppTheme } from "../../../../hooks/useAppTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// The container in ServiceHistory has a horizontal padding of 24 on each side, so width is SCREEN_WIDTH - 48
const AVAILABLE_WIDTH = SCREEN_WIDTH - 48;
const ITEM_WIDTH = AVAILABLE_WIDTH / 3;

interface MonthCarouselProps {
  historial_pagos: PaymentHistory[];
  selectedMonthIndex: number;
  onChangeMonth: (index: number) => void;
  setIsTabScrollEnabled?: (val: boolean) => void;
}

export const MonthCarousel: React.FC<MonthCarouselProps> = ({
  historial_pagos,
  selectedMonthIndex,
  onChangeMonth,
}) => {
  const { colors } = useAppTheme();

  if (!historial_pagos || historial_pagos.length === 0) return null;

  const prevIndex = selectedMonthIndex - 1;
  const nextIndex = selectedMonthIndex + 1;

  const prevMonth = prevIndex >= 0 ? historial_pagos[prevIndex] : null;
  const currentMonth = historial_pagos[selectedMonthIndex];
  const nextMonth = nextIndex < historial_pagos.length ? historial_pagos[nextIndex] : null;

  const renderMonth = (item: PaymentHistory | null, indexToSet: number, isCenter: boolean) => {
    if (!item) {
      return <View style={{ width: ITEM_WIDTH }} />;
    }

    return (
      <TouchableOpacity
        onPress={() => {
          if (!isCenter) onChangeMonth(indexToSet);
        }}
        style={{
          width: ITEM_WIDTH,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={isCenter ? 1 : 0.6}
      >
        <Text
          style={{
            color: isCenter ? colors.primary : colors.textSecondary,
            fontFamily: isCenter ? "AsapBold" : "AsapSemiBold",
            fontSize: isCenter ? 16 : 12,
            textAlign: "center",
            opacity: isCenter ? 1 : 0.4,
            transform: [{ scale: isCenter ? 1.1 : 0.9 }],
          }}
        >
          {item.mes_anio}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {renderMonth(prevMonth, prevIndex, false)}
        {renderMonth(currentMonth, selectedMonthIndex, true)}
        {renderMonth(nextMonth, nextIndex, false)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 36,
    justifyContent: "center",
  },
});
