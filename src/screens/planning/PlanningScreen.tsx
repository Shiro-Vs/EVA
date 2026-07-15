import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppTheme } from "../../hooks/useAppTheme";
import { EVALoading } from "../../components/common/EVALoading";

import { SubscriptionService } from "../../services/SubscriptionService";
import { LoanService } from "../../services/LoanService";
import { Subscription } from "../../interfaces/Subscription";
import { Loan } from "../../interfaces/Loan";
import { getAdjustedColor } from "../../utils/serviceIcons";

export default function PlanningScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subs, ls] = await Promise.all([
          SubscriptionService.getSubscriptions(),
          LoanService.getLoans()
        ]);
        setSubscriptions(subs);
        setLoans(ls);
      } catch (error) {
        console.error("Error al cargar planificación", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <EVALoading message="Cargando planificación..." />;
  }

  // Calculamos el total mensual sumando las cuotas esperadas en préstamos y el costo actual de las suscripciones
  const totalSubs = subscriptions.reduce((acc, s) => acc + (s.costo_total_actual || 0), 0);
  const totalLoans = loans.reduce((acc, l) => acc + (l.monto_total_prestado / l.numero_cuotas_totales), 0);
  const totalMonthly = totalSubs + totalLoans;

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} className="px-6">
        {/* Header Section */}
        <View className="mt-6 mb-8">
          <Text className="text-text-primary font-asap-bold text-3xl" style={{ color: colors.text }}>Planificación</Text>
          <Text className="text-text-secondary font-asap text-base" style={{ color: colors.textSecondary }}>Tus compromisos del mes</Text>
        </View>

        {/* Monthly Summary Card - Compact Version */}
        <View 
          className="p-5 rounded-[28px] border mb-8 shadow-sm flex-row items-center justify-between"
          style={{ backgroundColor: colors.card, borderColor: `${colors.text}10` }}
        >
          <View>
            <Text className="font-asap-medium text-[10px] uppercase tracking-wider" style={{ color: colors.textSecondary }}>Total Comprometido</Text>
            <Text className="font-asap-bold text-2xl mt-0.5" style={{ color: colors.text }}>S/ {totalMonthly.toFixed(2)}</Text>
            
            <View className="flex-row mt-2">
              <View className="flex-row items-center mr-4">
                <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: colors.primary }} />
                <Text className="font-asap text-[10px]" style={{ color: colors.textSecondary }}>Subs: S/ {totalSubs.toFixed(2)}</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: colors.muted }} />
                <Text className="font-asap text-[10px]" style={{ color: colors.textSecondary }}>Préstamos: S/ {totalLoans.toFixed(2)}</Text>
              </View>
            </View>
          </View>
          
          <View 
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </View>
        </View>
        
        {/* Community & Contacts Access */}
        <TouchableOpacity 
          onPress={() => router.push("/contacts")}
          className="p-4 rounded-3xl border mb-8 flex-row items-center justify-between"
          style={{ backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}15` }}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View 
              className="w-10 h-10 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: `${colors.primary}15` }}
            >
              <Ionicons name="people" size={20} color={colors.primary} />
            </View>
            <View>
              <Text className="font-asap-bold text-base" style={{ color: colors.text }}>Mis Contactos</Text>
              <Text className="font-asap text-xs" style={{ color: colors.textSecondary }}>Gestiona tu comunidad y deudas</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* Subscriptions Section */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-asap-bold text-xl" style={{ color: colors.text }}>Suscripciones</Text>
            <TouchableOpacity 
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${colors.primary}15` }}
            >
              <Text className="font-asap-semibold text-xs" style={{ color: colors.primary }}>+ Añadir</Text>
            </TouchableOpacity>
          </View>

          {subscriptions.map((sub) => {
            const adjustedColor = getAdjustedColor(sub.color || colors.primary, isDark);
            
            return (
              <TouchableOpacity 
                key={sub.id}
                onPress={() => router.push(`/service/${sub.id}`)}
                className="p-4 rounded-3xl border flex-row items-center mb-4"
                style={{ backgroundColor: `${colors.card}80`, borderColor: `${colors.text}10` }}
                activeOpacity={0.7}
              >
                <View 
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${adjustedColor}15` }}
                >
                  <Ionicons name={(sub.icon as any) || 'play'} size={22} color={adjustedColor} />
                </View>
                
                <View className="flex-1 ml-4">
                  <View className="flex-row items-center">
                    <Text className="font-asap-bold text-base" style={{ color: colors.text }}>
                      {sub.nombre}
                    </Text>
                    {sub.es_compartido && (
                      <View 
                        className="ml-2 px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: `${colors.primary}15` }}
                      >
                        <Text className="font-asap text-[8px] font-bold" style={{ color: colors.primary }}>
                          COMPARTIDO
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-asap text-xs" style={{ color: colors.textSecondary }}>
                    Vence el día {sub.dia_cobro}
                  </Text>
                </View>
                
                <Text className="font-asap-bold text-base" style={{ color: colors.text }}>
                  S/ {sub.costo_total_actual.toFixed(2)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Loans Section */}
        <View className="mb-20">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-text-primary font-asap-bold text-xl">Préstamos Bancarios</Text>
            <TouchableOpacity className="bg-primary/10 px-3 py-1.5 rounded-full">
              <Text className="text-primary font-asap-semibold text-xs">+ Añadir</Text>
            </TouchableOpacity>
          </View>

          {loans.map((loan) => {
            const monthlyPayment = loan.monto_total_prestado / loan.numero_cuotas_totales;
            const paidQuotes = loan.cronograma ? loan.cronograma.filter(c => c.estado === 'pagado').length : 0;
            const progress = loan.numero_cuotas_totales > 0 ? (paidQuotes / loan.numero_cuotas_totales) * 100 : 0;

            return (
              <TouchableOpacity 
                key={loan.id}
                className="bg-card/40 p-6 rounded-3xl border border-border/10 mb-4"
                activeOpacity={0.7}
              >
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
                      <Ionicons name="business" size={20} color={colors.primary} />
                    </View>
                    <View className="ml-3">
                      <Text className="text-text-primary font-asap-bold text-base">Préstamo {loan.entidad}</Text>
                      <Text className="text-text-secondary font-asap text-xs">Cuota {paidQuotes} de {loan.numero_cuotas_totales}</Text>
                    </View>
                  </View>
                  <Text className="text-text-primary font-asap-bold text-lg">S/ {monthlyPayment.toFixed(2)}</Text>
                </View>

                {/* Progress Bar */}
                <View className="h-2 bg-border/10 rounded-full overflow-hidden mb-2">
                  <View 
                    className="h-full bg-primary" 
                    style={{ width: `${progress}%` }} 
                  />
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-text-secondary font-asap text-[10px]">Progreso de pago</Text>
                  <Text className="text-text-primary font-asap-semibold text-[10px]">
                    {Math.round(progress)}%
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
