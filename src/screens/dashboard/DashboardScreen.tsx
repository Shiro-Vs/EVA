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
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";

import { mockDB } from "../../services/mockDatabase";
import { User } from "../../interfaces/User";
import { Account } from "../../interfaces/Account";
import { Transaction } from "../../interfaces/Transaction";
import { Category } from "../../interfaces/Category";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [u, acc, txs, cats] = await Promise.all([
          mockDB.getUserProfile(),
          mockDB.getAccounts(),
          mockDB.getTransactions(),
          mockDB.getCategories()
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
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#1F7ECC" />
      </SafeAreaView>
    );
  }

  const saldoTotal = accounts.reduce((sum, acc) => sum + (acc.saldo_actual || 0), 0);

  const formatCurrency = (amount: number) => {
    return `${user.moneda_principal === 'PEN' ? 'S/' : '$'}${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mt-6 mb-8">
          <View>
            <Text className="text-text-secondary font-asap text-base">
              Bienvenido de nuevo,
            </Text>
            <Text className="text-text-primary font-asap-bold text-2xl">
              {user.nombre_pantalla} 👋
            </Text>
          </View>
          <TouchableOpacity 
            className="w-12 h-12 rounded-2xl bg-card items-center justify-center border border-border/50"
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color={isDark ? "#F3F6F8" : "#0C1B26"} />
            <View className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
          </TouchableOpacity>
        </View>

        {/* Balance Card - Premium Design */}
        <View 
          className="bg-primary rounded-[32px] p-8 shadow-xl shadow-primary/40 relative overflow-hidden"
          style={{ width: width - 48 }}
        >
          {/* Círculos decorativos de fondo */}
          <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <View className="absolute -bottom-20 -left-10 w-60 h-60 bg-black/10 rounded-full" />

          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-white/80 font-asap-medium text-sm uppercase tracking-widest">
                Saldo Total
              </Text>
              <Text className="text-white font-asap-bold text-4xl mt-1">
                {formatCurrency(saldoTotal)}
              </Text>
            </View>
            <View className="bg-white/20 p-2 rounded-xl">
              <Ionicons name="wallet-outline" size={24} color="white" />
            </View>
          </View>

          <View className="mt-8 flex-row items-center">
            <View className="flex-row items-center bg-white/20 px-3 py-1 rounded-full">
              <Ionicons name="trending-up" size={16} color="#10B981" />
              <Text className="text-white font-asap-semibold text-xs ml-1">
                +12.5%
              </Text>
            </View>
            <Text className="text-white/60 font-asap text-xs ml-3">
              vs mes anterior
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mt-10">
          {[
            { label: "Enviar", icon: "paper-plane-outline", color: "#1F7ECC" },
            { label: "Analizar", icon: "pie-chart-outline", color: "#10B981" },
            { label: "Metas", icon: "trophy-outline", color: "#F59E0B" },
            { label: "Más", icon: "grid-outline", color: "#6366F1" },
          ].map((action, index) => (
            <View key={index} className="items-center">
              <TouchableOpacity 
                className="w-16 h-16 rounded-2xl bg-card items-center justify-center shadow-sm border border-border/30"
                activeOpacity={0.7}
              >
                <Ionicons name={action.icon as any} size={26} color={action.color} />
              </TouchableOpacity>
              <Text className="text-text-secondary font-asap-medium text-xs mt-2">
                {action.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Transactions Section */}
        <View className="mt-10 mb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-text-primary font-asap-bold text-xl">
              Actividad Reciente
            </Text>
            <TouchableOpacity>
              <Text className="text-primary font-asap-semibold text-sm">
                Ver todo
              </Text>
            </TouchableOpacity>
          </View>

          {transactions.slice(0, 5).map((tx) => {
            const isIncome = tx.tipo === "ingreso";
            // Si la transacción no tiene detalle con categoría asignada, le ponemos un ícono genérico
            let iconName = isIncome ? "cash" : "cart";
            let iconColor = isIncome ? "#10B981" : "#F59E0B";
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
                className="flex-row items-center bg-card/40 mb-4 p-4 rounded-3xl border border-border/20"
              >
                <View 
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${iconColor}15` }}
                >
                  <Ionicons name={iconName as any} size={22} color={iconColor} />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-text-primary font-asap-bold text-base" numberOfLines={1}>
                    {tx.descripcion}
                  </Text>
                  <Text className="text-text-secondary font-asap text-xs">
                    {categoryName}
                  </Text>
                </View>
                <View className="items-end">
                  <Text 
                    className={`font-asap-bold text-base ${isIncome ? 'text-green-500' : 'text-text-primary'}`}
                  >
                    {isIncome ? "+" : "-"}{formatCurrency(tx.monto_total)}
                  </Text>
                  <Text className="text-text-secondary font-asap text-[10px]">
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
