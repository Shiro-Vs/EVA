import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../../../hooks/useAppTheme";

interface ContactsHeaderProps {
  totalDeuda: number;
  count: number;
  debtorCount: number;
  onAddPress: () => void;
  onRemindPress: () => void;
}

export function ContactsHeader({
  totalDeuda,
  count,
  debtorCount,
  onAddPress,
  onRemindPress,
}: ContactsHeaderProps) {
  const { colors, fonts } = useAppTheme();
  const onDayCount = count - debtorCount;

  return (
    <View 
      className="p-6 rounded-[32px] mb-8 shadow-lg relative overflow-hidden"
      style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.2 }}
    >
      {/* Círculos decorativos */}
      <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
      <View className="absolute -bottom-20 -left-10 w-32 h-32 bg-white/5 rounded-full" />

      <View className="flex-row justify-between items-start mb-6">
        <View>
          <Text className="text-white/70 text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: fonts.family.semiBold }}>
            Total por Cobrar
          </Text>
          <Text className="text-white text-4xl" style={{ fontFamily: fonts.family.bold }}>
            S/ {totalDeuda.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onAddPress}
          className="p-3 rounded-2xl shadow-md"
          style={{ backgroundColor: colors.background }}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View className="flex-row gap-4">
        <View className="flex-1 bg-white/10 p-3 rounded-2xl border border-white/5">
          <View className="flex-row items-center mb-1">
            <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.income }} />
            <Text className="text-white/70 text-[9px] uppercase" style={{ fontFamily: fonts.family.medium }}>Al día</Text>
          </View>
          <Text className="text-white text-lg" style={{ fontFamily: fonts.family.bold }}>{onDayCount}</Text>
        </View>

        <View className="flex-1 bg-white/10 p-3 rounded-2xl border border-white/5">
          <View className="flex-row items-center mb-1">
            <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.warning || "#F1C40F" }} />
            <Text className="text-white/70 text-[9px] uppercase" style={{ fontFamily: fonts.family.medium }}>Pendientes</Text>
          </View>
          <Text className="text-white text-lg" style={{ fontFamily: fonts.family.bold }}>{debtorCount}</Text>
        </View>

        <TouchableOpacity 
          onPress={onRemindPress}
          className="px-5 rounded-2xl items-center justify-center shadow-lg"
          style={{ backgroundColor: colors.background, shadowColor: "#000" }}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications" size={20} color={colors.primary} />
          <Text 
            className="text-[8px] mt-0.5 uppercase tracking-tighter"
            style={{ color: colors.primary, fontFamily: fonts.family.bold }}
          >
            Cobrar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
