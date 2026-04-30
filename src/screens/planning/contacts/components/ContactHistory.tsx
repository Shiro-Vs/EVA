import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { EVALoading } from "../../../../components/common/EVALoading";
import { EVASeparator } from "../../../../components/common/EVASeparator";
import { EVAActionButton } from "../../../../components/common/EVAActionButton";
import { EVAAvatar } from "../../../../components/common/EVAAvatar";
import { Contact } from "../../../../interfaces/Contact";
import { mockDB } from "../../../../services/mockDatabase";
import { ServiceIcon } from "../../../../utils/serviceIcons";

// Habilitar animaciones en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ContactHistoryProps {
  contact: Contact;
  onBack: () => void;
  onAddServicePress: () => void;
  refreshTrigger?: number;
}

export function ContactHistory({
  contact,
  onBack,
  onAddServicePress,
  refreshTrigger,
}: ContactHistoryProps) {
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});

  const loadSummary = async () => {
    try {
      const data = await mockDB.getContactSummary(contact.nombre);
      setSummary(data);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [contact, refreshTrigger]);

  const toggleService = (serviceId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  if (loading) {
    return <EVALoading message="Cargando historial..." />;
  }

  if (!summary || !summary.services) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="px-6 pt-4">
          <TouchableOpacity onPress={onBack} className="w-10 h-10 bg-card rounded-full items-center justify-center">
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="mt-10 text-center text-text-secondary font-asap">No se pudo cargar la información.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header - DISEÑO IDENTICO A SERVICIO */}
        <View className="px-6 pt-4 bg-background">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={onBack}
              className="w-10 h-10 bg-card rounded-full items-center justify-center"
            >
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onAddServicePress}
              className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mb-6">
            <EVAAvatar 
              name={contact.nombre} 
              color={contact.color} 
              size={64} 
              fontSize={28}
              className="mr-4"
            />

            {/* Nombre y Detalles a la derecha del logo */}
            <View className="flex-1">
              <Text className="text-text-primary font-asap-bold text-2xl">
                {contact.nombre}
              </Text>
              <Text 
                className={`font-asap-bold text-sm mt-1 ${summary.totalDebt > 0 ? "text-expense" : "text-income"}`}
              >
                S/ {(summary.totalDebt || 0).toFixed(2)} • <Text className="text-text-secondary font-asap-medium">{summary.services.length} {summary.services.length === 1 ? 'servicio' : 'servicios'}</Text>
              </Text>
              <Text className="text-text-secondary font-asap text-xs mt-0.5 mb-1">
                Estado: {summary.totalDebt > 0 ? 'Con deudas pendientes' : 'Al día'}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
                <Text className="text-text-secondary font-asap text-xs ml-1">
                  Miembro de Mis Contactos
                </Text>
              </View>
            </View>
          </View>

          {/* Línea Divisoria de Ancho Completo */}
          <EVASeparator className="mb-2" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="px-6">
          {summary.services.length === 0 ? (
            <View className="items-center justify-center py-20">
              <View className="bg-card w-20 h-20 rounded-full items-center justify-center mb-4">
                <Ionicons name="document-text-outline" size={32} color={colors.muted} />
              </View>
              <Text className="text-text-secondary font-asap text-center px-10">
                Este contacto aún no participa en ningún servicio. ¡Dale al botón de + Servicio para empezar!
              </Text>
            </View>
          ) : (
            summary.services.map((service: any) => {
              const isExpanded = !!expandedServices[service.serviceId];
              return (
                <View key={service.serviceId} className="bg-card rounded-[24px] mb-4 shadow-sm shadow-black/5 overflow-hidden">
                  <TouchableOpacity 
                    onPress={() => toggleService(service.serviceId)}
                    activeOpacity={0.7}
                    className="p-5 flex-row justify-between items-center"
                  >
                    <View className="flex-row items-center flex-1">
                      <View 
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${service.color}15` }}
                      >
                        <ServiceIcon name={service.icon} size={20} color={service.color} />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-text-primary font-asap-bold text-base" numberOfLines={1}>
                          {service.serviceName}
                        </Text>
                        {service.debt > 0 ? (
                          <Text className="text-expense font-asap-semibold text-[10px] uppercase">
                            {service.monthsDelay} {service.monthsDelay === 1 ? 'mes' : 'meses'} de retraso
                          </Text>
                        ) : (
                          <Text className="text-income font-asap-semibold text-[10px] uppercase">
                            Al día
                          </Text>
                        )}
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <Text className={`font-asap-bold text-lg mr-3 ${service.debt > 0 ? "text-expense" : "text-text-primary"}`}>
                        S/ {(service.debt || 0).toFixed(2)}
                      </Text>
                      <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.border} 
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View className="bg-background/40 px-5 pb-5 pt-0">
                      <View className="h-[1px] bg-primary/5 w-full mb-3" />
                      {(service.history || []).map((pay: any, idx: number) => (
                        <View 
                          key={idx} 
                          className={`flex-row justify-between items-center py-2.5 ${idx !== service.history.length - 1 ? "border-b border-primary/5" : ""}`}
                        >
                          <Text className="text-text-secondary font-asap text-xs">{pay.mes_anio}</Text>
                          <View className="flex-row items-center">
                            <Text className="text-text-primary font-asap-semibold text-xs mr-3">
                              {pay.cuota === 0 ? "Gratis" : `S/ ${(pay.cuota || 0).toFixed(2)}`}
                            </Text>
                            <View 
                              className={`px-3 py-1 rounded-full ${
                                pay.cuota === 0 ? 'bg-purple-100' : (pay.status === 'paid' ? 'bg-green-100' : 'bg-red-100')
                              }`}
                            >
                              <Text className={`text-[8px] font-asap-bold uppercase ${
                                pay.cuota === 0 ? 'text-purple-600' : (pay.status === 'paid' ? 'text-green-600' : 'text-red-600')
                              }`}>
                                {pay.cuota === 0 ? 'CORTESÍA' : (pay.status === 'paid' ? 'PAGADO' : 'PENDIENTE')}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
          <View className="h-20" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
