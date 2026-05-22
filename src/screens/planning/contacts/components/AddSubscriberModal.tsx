import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EVAModal from "../../../../components/common/EVAModal";
import EVAAlert from "../../../../components/common/EVAAlert";
import { Contact } from "../../../../interfaces/Contact";
import { SubscriptionService } from "../../../../services/SubscriptionService";
import { ServiceIcon } from "../../../../utils/serviceIcons";

import { useAppTheme } from "../../../../hooks/useAppTheme";

interface AddSubscriberModalProps {
  visible: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSuccess: () => void;
}

export function AddSubscriberModal({ visible, onClose, contact, onSuccess }: AddSubscriberModalProps) {
  const { colors } = useAppTheme();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [cuota, setCuota] = useState("");
  const [isCourtesy, setIsCourtesy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  useEffect(() => {
    if (visible) {
      loadServices();
    }
  }, [visible]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await SubscriptionService.getSubscriptions();
      // Filtrar servicios donde el contacto aún NO está
      const availableServices = data.filter(s => 
        !s.suscriptores?.some(sub => sub.nombre === contact?.nombre)
      );
      setServices(availableServices);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedServiceId || !contact) return;
    
    const finalCuota = isCourtesy ? 0 : parseFloat(cuota);
    if (!isCourtesy && (isNaN(finalCuota) || finalCuota <= 0)) {
      setAlertConfig({
        visible: true,
        title: "Dato inválido",
        message: "Ingresa un monto válido o marca la casilla de cortesía.",
        type: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      await SubscriptionService.addSubscriberToService(selectedServiceId, {
        nombre: contact.nombre,
        cuota: finalCuota,
        color: contact.color
      });
      
      // Resetear para permitir agregar a otro servicio
      setSelectedServiceId(null);
      setCuota("");
      setIsCourtesy(false);
      loadServices();
      onSuccess();
      
      setAlertConfig({
        visible: true,
        title: "¡Hecho!",
        message: `${contact.nombre} ahora forma parte del servicio.`,
        type: "success",
      });
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: "Error",
        message: "No pudimos completar la asignación. Intenta de nuevo.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!contact) return null;

  return (
    <>
      <EVAModal
        visible={visible}
        title={`Asignar a ${contact.nombre}`}
        onClose={onClose}
        primaryButtonText={
          services.length === 0 
            ? "Entendido" 
            : (selectedServiceId ? "Asignar Ahora" : undefined)
        }
        onPrimaryAction={services.length === 0 ? onClose : handleSave}
        secondaryButtonText="Cerrar"
      >
        <View className="mb-6">
          <Text 
            className="font-asap-semibold text-[10px] uppercase tracking-widest mb-4 ml-1"
            style={{ color: colors.textSecondary }}
          >
            Elegir Servicio
          </Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} className="py-4" />
          ) : services.length === 0 ? (
            <View 
              className="p-6 rounded-2xl items-center"
              style={{ backgroundColor: colors.card }}
            >
              <Ionicons name="checkmark-done-circle-outline" size={32} color={colors.income} />
              <Text 
                className="font-asap text-[11px] text-center mt-2"
                style={{ color: colors.textSecondary }}
              >
                Ya participa en todos los servicios creados
              </Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="flex-row -mx-2 px-2"
            >
              {services.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSelectedServiceId(s.id)}
                  className="mr-3 items-center p-3 rounded-2xl border"
                  style={{ 
                    width: 100,
                    backgroundColor: selectedServiceId === s.id ? `${colors.primary}15` : colors.card,
                    borderColor: selectedServiceId === s.id ? colors.primary : "transparent"
                  }}
                >
                  <ServiceIcon name={s.icon} color={s.color} size={24} />
                  <Text 
                    className="text-[10px] font-asap-bold text-center mt-2"
                    style={{ color: selectedServiceId === s.id ? colors.primary : colors.textSecondary }}
                    numberOfLines={1}
                  >
                    {s.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {selectedServiceId && (
          <View 
            className="p-5 rounded-[24px] mb-4"
            style={{ backgroundColor: colors.card }}
          >
            <Text 
              className="font-asap-semibold text-[10px] uppercase tracking-widest mb-4"
              style={{ color: colors.textSecondary }}
            >
              Configurar Cuota
            </Text>

            <View className="flex-row items-center justify-between mb-4">
              <Text 
                className="font-asap-medium text-sm"
                style={{ color: colors.text }}
              >
                ¿Es cortesía?
              </Text>
              <TouchableOpacity 
                onPress={() => setIsCourtesy(!isCourtesy)}
                className="w-12 h-6 rounded-full px-1 justify-center"
                style={{ backgroundColor: isCourtesy ? colors.primary : colors.border }}
              >
                <View 
                  className="w-4 h-4 rounded-full bg-white" 
                  style={{ alignSelf: isCourtesy ? 'flex-end' : 'flex-start' }}
                />
              </TouchableOpacity>
            </View>

            {!isCourtesy && (
              <View 
                className="flex-row items-center px-4 h-14 rounded-2xl border"
                style={{ backgroundColor: colors.background, borderColor: `${colors.primary}20` }}
              >
                <Text 
                  className="font-asap-bold text-sm mr-2"
                  style={{ color: colors.textSecondary }}
                >
                  S/
                </Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  className="flex-1 font-asap-bold text-lg"
                  style={{ color: colors.text }}
                  value={cuota}
                  onChangeText={setCuota}
                />
              </View>
            )}

            {saving && (
              <View 
                className="absolute inset-0 rounded-[24px] items-center justify-center"
                style={{ backgroundColor: `${colors.background}90` }}
              >
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
          </View>
        )}
      </EVAModal>

      <EVAAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        onDismiss={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}
