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
import { FinanceService } from "../../../../services/FinanceService";
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
      const data = await FinanceService.getContactSummary(contact.nombre);
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
      <SafeAreaView 
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <View className="px-6 pt-4">
          <TouchableOpacity 
            onPress={onBack} 
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: `${colors.text}05` }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text 
            className="mt-10 text-center font-asap"
            style={{ color: colors.textSecondary }}
          >
            No se pudo cargar la información.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-1">
        {/* Header - DISEÑO IDENTICO A SERVICIO */}
        <View 
          className="px-6 pt-4"
          style={{ backgroundColor: colors.background }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={onBack}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: `${colors.text}05` }}
            >
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onAddServicePress}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${colors.primary}15` }}
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
              <Text 
                className="font-asap-bold text-2xl"
                style={{ color: colors.text }}
              >
                {contact.nombre}
              </Text>
              <Text 
                className="font-asap-bold text-sm mt-1"
                style={{ color: summary.totalDebt > 0 ? colors.expense : colors.income }}
              >
                S/ {(summary.totalDebt || 0).toFixed(2)} • <Text style={{ color: colors.textSecondary, fontFamily: 'AsapMedium' }}>{summary.services.length} {summary.services.length === 1 ? 'servicio' : 'servicios'}</Text>
              </Text>
              <Text 
                className="font-asap text-xs mt-0.5 mb-1"
                style={{ color: colors.textSecondary }}
              >
                Estado: {summary.totalDebt > 0 ? 'Con deudas pendientes' : 'Al día'}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
                <Text 
                  className="font-asap text-xs ml-1"
                  style={{ color: colors.textSecondary }}
                >
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
              <View 
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: colors.card }}
              >
                <Ionicons name="document-text-outline" size={32} color={colors.muted} />
              </View>
              <Text 
                className="font-asap text-center px-10"
                style={{ color: colors.textSecondary }}
              >
                Este contacto aún no participa en ningún servicio. ¡Dale al botón de + Servicio para empezar!
              </Text>
            </View>
          ) : (
            summary.services.map((service: any) => {
              const isExpanded = !!expandedServices[service.serviceId];
              return (
                <View 
                  key={service.serviceId} 
                  className="rounded-[24px] mb-4 shadow-sm overflow-hidden"
                  style={{ 
                    backgroundColor: colors.card, 
                    shadowColor: "#000", 
                    shadowOpacity: 0.05,
                    borderWidth: 1,
                    borderColor: `${colors.text}05`
                  }}
                >
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
                        <Text 
                          className="font-asap-bold text-base" 
                          style={{ color: colors.text }}
                          numberOfLines={1}
                        >
                          {service.serviceName}
                        </Text>
                        {service.debt > 0 ? (
                          <Text 
                            className="font-asap-semibold text-[10px] uppercase"
                            style={{ color: colors.expense }}
                          >
                            {service.monthsDelay} {service.monthsDelay === 1 ? 'mes' : 'meses'} de retraso
                          </Text>
                        ) : (
                          <Text 
                            className="font-asap-semibold text-[10px] uppercase"
                            style={{ color: colors.income }}
                          >
                            Al día
                          </Text>
                        )}
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <Text 
                        className="font-asap-bold text-lg mr-3"
                        style={{ color: service.debt > 0 ? colors.expense : colors.text }}
                      >
                        S/ {(service.debt || 0).toFixed(2)}
                      </Text>
                      <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.muted} 
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View 
                      className="px-5 pb-5 pt-0"
                      style={{ backgroundColor: `${colors.background}60` }}
                    >
                      <View 
                        className="h-[1px] w-full mb-3" 
                        style={{ backgroundColor: `${colors.text}05` }}
                      />
                      {(service.history || []).map((pay: any, idx: number) => (
                        <View 
                          key={idx} 
                          className="flex-row justify-between items-center py-2.5"
                          style={{ 
                            borderBottomWidth: idx !== service.history.length - 1 ? 1 : 0,
                            borderBottomColor: `${colors.text}05`
                          }}
                        >
                          <Text 
                            className="font-asap text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            {pay.mes_anio}
                          </Text>
                          <View className="flex-row items-center">
                            <Text 
                              className="font-asap-semibold text-xs mr-3"
                              style={{ color: colors.text }}
                            >
                              {pay.cuota === 0 ? "Gratis" : `S/ ${(pay.cuota || 0).toFixed(2)}`}
                            </Text>
                            <View 
                              className="px-3 py-1 rounded-full"
                              style={{ 
                                backgroundColor: pay.cuota === 0 
                                  ? 'rgba(147, 51, 234, 0.1)' 
                                  : (pay.status === 'paid' ? `${colors.income}15` : `${colors.expense}15`)
                              }}
                            >
                              <Text 
                                className="text-[8px] font-asap-bold uppercase"
                                style={{ 
                                  color: pay.cuota === 0 
                                    ? 'rgb(147, 51, 234)' 
                                    : (pay.status === 'paid' ? colors.income : colors.expense)
                                }}
                              >
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
