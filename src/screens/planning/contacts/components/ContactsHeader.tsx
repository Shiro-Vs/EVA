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
  const { colors } = useAppTheme();
  const onDayCount = count - debtorCount;

  return (
    <View className="bg-primary p-6 rounded-[32px] mb-8 shadow-lg shadow-primary/20 relative overflow-hidden">
      {/* Círculos decorativos */}
      <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
      <View className="absolute -bottom-20 -left-10 w-32 h-32 bg-white/5 rounded-full" />

      <View className="flex-row justify-between items-start mb-6">
        <View>
          <Text className="text-white/70 font-asap-semibold text-[10px] uppercase tracking-widest mb-1">
            Total por Cobrar
          </Text>
          <Text className="text-white font-asap-bold text-4xl">
            S/ {totalDeuda.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onAddPress}
          className="bg-white p-3 rounded-2xl shadow-md"
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View className="flex-row gap-4">
        <View className="flex-1 bg-white/10 p-3 rounded-2xl border border-white/5">
          <View className="flex-row items-center mb-1">
            <View className="w-2 h-2 rounded-full bg-income mr-2" />
            <Text className="text-white/70 font-asap-medium text-[9px] uppercase">Al día</Text>
          </View>
          <Text className="text-white font-asap-bold text-lg">{onDayCount}</Text>
        </View>

        <View className="flex-1 bg-white/10 p-3 rounded-2xl border border-white/5">
          <View className="flex-row items-center mb-1">
            <View className="w-2 h-2 rounded-full bg-warning mr-2" />
            <Text className="text-white/70 font-asap-medium text-[9px] uppercase">Pendientes</Text>
          </View>
          <Text className="text-white font-asap-bold text-lg">{debtorCount}</Text>
        </View>

        <TouchableOpacity 
          onPress={onRemindPress}
          className="bg-white px-5 rounded-2xl items-center justify-center shadow-lg shadow-black"
          activeOpacity={0.8}
        >
          <Ionicons name="notifications" size={20} color={colors.primary} />
          <Text className="text-primary font-asap-bold text-[8px] mt-0.5 uppercase tracking-tighter">Cobrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
