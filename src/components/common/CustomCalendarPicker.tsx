import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

interface CustomCalendarPickerProps {
  initialDate?: Date;
  onDateChange: (date: Date) => void;
}

export const CustomCalendarPicker: React.FC<CustomCalendarPickerProps> = ({
  initialDate,
  onDateChange,
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [viewDate, setViewDate] = useState(initialDate || new Date());

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      setViewDate(initialDate);
    }
  }, [initialDate]);

  const changeMonth = (increment: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setViewDate(newDate);
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const generateDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ empty: true, key: `pre-${i}` });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, empty: false, key: `day-${i}` });
    }
    return days;
  };

  const dayItems = generateDays();
  const monthsNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calHeader}>
        <TouchableOpacity
          onPress={() => changeMonth(-1)}
          style={styles.arrowBtn}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.calTitle}>
          {monthsNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </Text>
        <TouchableOpacity
          onPress={() => changeMonth(1)}
          style={styles.arrowBtn}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {["d", "l", "m", "m", "j", "v", "s"].map((d, i) => (
          <Text key={i} style={styles.weekText}>
            {d.toUpperCase()}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {dayItems.map((item: any) => {
          if (item.empty) {
            return <View key={item.key} style={styles.dayCellEmpty} />;
          }
          const isSelected =
            item.day === selectedDate.getDate() &&
            viewDate.getMonth() === selectedDate.getMonth() &&
            viewDate.getFullYear() === selectedDate.getFullYear();

          return (
            <View key={item.key} style={styles.dayCellWrapper}>
              <TouchableOpacity
                style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                onPress={() => handleDateSelect(item.day)}
              >
                <Text
                  style={[styles.dayText, isSelected && styles.dayTextSelected]}
                >
                  {item.day}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Optional: Show selected date below or above? Assuming container will handle it or user just visually sees it selected. */}
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
  },
  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  arrowBtn: { padding: 5 },
  calTitle: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  weekText: {
    width: "14%",
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "bold",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCellEmpty: {
    width: "14.28%", // 1/7th
    aspectRatio: 1,
  },
  dayCellWrapper: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    elevation: 3,
  },
  dayText: {
    color: colors.text,
    fontSize: 14,
    textAlign: "center",
  },
  dayTextSelected: {
    color: "#000",
    fontWeight: "bold",
  },
});
