import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";

import { AuthService } from "../../services/AuthService";
import { AccountService } from "../../services/AccountService";
import { FinanceService } from "../../services/FinanceService";
import { User } from "../../interfaces/User";
import { Account } from "../../interfaces/Account";
import { Transaction } from "../../interfaces/Transaction";
import { Category } from "../../interfaces/Category";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const { colors } = useAppTheme();

  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [u, acc, txs, cats] = await Promise.all([
          AuthService.getUserProfile(),
          AccountService.getAccounts(),
          FinanceService.getTransactions(),
          FinanceService.getCategories()
        ]);
        setUser(u);
        setAccounts(acc);
        setTransactions(txs);
        setCategories(cats);
      } catch (error) {
        console.error("Error al cargar dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading || !user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const saldoTotal = accounts.reduce((sum, acc) => sum + (acc.saldo_actual || 0), 0);

  const formatCurrency = (amount: number) => {
    return `${user.moneda_principal === 'PEN' ? 'S/' : '$'}${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mt-6 mb-8">
          <View>
            <Text className="font-asap text-base" style={{ color: colors.textSecondary }}>
              Bienvenido de nuevo,
            </Text>
            <Text className="font-asap-bold text-2xl" style={{ color: colors.text }}>
              {user.nombre_pantalla} 👋
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 rounded-2xl items-center justify-center border"
            style={{ backgroundColor: colors.card, borderColor: `${colors.border}80` }}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View className="absolute top-3 right-3 w-2 h-2 rounded-full border-2" style={{ backgroundColor: colors.expense, borderColor: colors.card }} />
          </TouchableOpacity>
        </View>

        {/* Balance Card - Premium Design */}
        <View
          className="rounded-[32px] p-8 shadow-xl relative overflow-hidden"
          style={{ width: width - 48, backgroundColor: colors.primarySurface }}
        >
          {/* Círculos decorativos de fondo */}
          <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
          <View className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.1)" }} />

          <View className="flex-row justify-between items-start">
            <View>
              <Text className="font-asap-medium text-sm uppercase tracking-widest" style={{ color: colors.onPrimaryMuted }}>
                Saldo Total
              </Text>
              <Text className="font-asap-bold text-4xl mt-1" style={{ color: colors.onPrimary }}>
                {formatCurrency(saldoTotal)}
              </Text>
            </View>
            <View className="p-2 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <Ionicons name="wallet-outline" size={24} color={colors.onPrimary} />
            </View>
          </View>

          <View className="mt-8 flex-row items-center">
            <View className="flex-row items-center px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <Ionicons name="trending-up" size={16} color={colors.income} />
              <Text className="font-asap-semibold text-xs ml-1" style={{ color: colors.onPrimary }}>
                +12.5%
              </Text>
            </View>
            <Text className="font-asap-medium text-xs ml-3" style={{ color: colors.onPrimaryMuted }}>
              vs mes anterior
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mt-10">
          {[
            { label: "Enviar", icon: "paper-plane-outline", color: colors.primary },
            { label: "Analizar", icon: "pie-chart-outline", color: colors.income },
            { label: "Metas", icon: "trophy-outline", color: colors.warning },
            { label: "Más", icon: "grid-outline", color: colors.muted },
          ].map((action, index) => (
            <View key={index} className="items-center">
              <TouchableOpacity
                className="w-16 h-16 rounded-2xl items-center justify-center shadow-sm border"
                style={{ backgroundColor: colors.card, borderColor: `${colors.border}4D` }}
                activeOpacity={0.7}
              >
                <Ionicons name={action.icon as any} size={26} color={action.color} />
              </TouchableOpacity>
              <Text className="font-asap-medium text-xs mt-2" style={{ color: colors.textSecondary }}>
                {action.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Transactions Section */}
        <View className="mt-10 mb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-asap-bold text-xl" style={{ color: colors.text }}>
              Actividad Reciente
            </Text>
            <TouchableOpacity>
              <Text className="font-asap-semibold text-sm" style={{ color: colors.primary }}>
                Ver todo
              </Text>
            </TouchableOpacity>
          </View>

          {transactions.slice(0, 5).map((tx) => {
            const isIncome = tx.tipo === "ingreso";
            // Si la transacción no tiene detalle con categoría asignada, le ponemos un ícono genérico
            let iconName = isIncome ? "cash" : "cart";
            let iconColor = isIncome ? colors.income : colors.warning;
            let categoryName = isIncome ? "Ingresos" : "Gastos Varios";

            if (tx.detalles_desglose && tx.detalles_desglose.length > 0) {
              const cat = categories.find(c => c.id === tx.detalles_desglose![0].categoria_id);
              if (cat) {
                iconName = cat.icono;
                iconColor = cat.color;
                categoryName = cat.nombre;
              }
            }

            return (
              <View
                key={tx.id}
                className="flex-row items-center mb-4 p-4 rounded-3xl border"
                style={{ backgroundColor: `${colors.card}66`, borderColor: `${colors.border}33` }}
              >
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${iconColor}15` }}
                >
                  <Ionicons name={iconName as any} size={22} color={iconColor} />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="font-asap-bold text-base" style={{ color: colors.text }} numberOfLines={1}>
                    {tx.descripcion}
                  </Text>
                  <Text className="font-asap text-xs" style={{ color: colors.textSecondary }}>
                    {categoryName}
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    className="font-asap-bold text-base"
                    style={{ color: isIncome ? colors.incomeStrong : colors.text }}
                  >
                    {isIncome ? "+" : "-"}{formatCurrency(tx.monto_total)}
                  </Text>
                  <Text className="font-asap text-[10px]" style={{ color: colors.textSecondary }}>
                    Hoy
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
