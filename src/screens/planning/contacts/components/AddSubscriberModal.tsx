import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EVAModal from "../../../../components/common/EVAModal";
import EVAAlert from "../../../../components/common/EVAAlert";
import { Contact } from "../../../../interfaces/Contact";
import { mockDB } from "../../../../services/mockDatabase";
import { ServiceIcon } from "../../../../utils/serviceIcons";

interface AddSubscriberModalProps {
  visible: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSuccess: () => void;
}

export function AddSubscriberModal({ visible, onClose, contact, onSuccess }: AddSubscriberModalProps) {
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
      const data = await mockDB.getSubscriptions();
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
      await mockDB.addSubscriberToService(selectedServiceId, {
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
          <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-4 ml-1">
            Elegir Servicio
          </Text>

          {loading ? (
            <ActivityIndicator color="#1F7ECC" className="py-4" />
          ) : services.length === 0 ? (
            <View className="bg-card p-6 rounded-2xl items-center">
              <Ionicons name="checkmark-done-circle-outline" size={32} color="#10B981" />
              <Text className="text-text-secondary font-asap text-[11px] text-center mt-2">
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
                  className={`mr-3 items-center p-3 rounded-2xl border ${
                    selectedServiceId === s.id ? "bg-primary/10 border-primary" : "bg-card border-transparent"
                  }`}
                  style={{ width: 100 }}
                >
                  <ServiceIcon name={s.icon} color={s.color} size={24} />
                  <Text 
                    className={`text-[10px] font-asap-bold text-center mt-2 ${
                      selectedServiceId === s.id ? "text-primary" : "text-text-secondary"
                    }`}
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
          <View className="bg-card p-5 rounded-[24px] mb-4">
            <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-4">
              Configurar Cuota
            </Text>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text-primary font-asap-medium text-sm">¿Es cortesía?</Text>
              <TouchableOpacity 
                onPress={() => setIsCourtesy(!isCourtesy)}
                className={`w-12 h-6 rounded-full px-1 justify-center ${isCourtesy ? 'bg-primary' : 'bg-slate-300'}`}
              >
                <View className={`w-4 h-4 rounded-full bg-white ${isCourtesy ? 'self-end' : 'self-start'}`} />
              </TouchableOpacity>
            </View>

            {!isCourtesy && (
              <View className="bg-background flex-row items-center px-4 h-14 rounded-2xl border border-primary/10">
                <Text className="text-text-secondary font-asap-bold mr-2">S/</Text>
                <TextInput
                  placeholder="0.00"
                  keyboardType="numeric"
                  className="flex-1 font-asap-bold text-lg text-text-primary"
                  value={cuota}
                  onChangeText={setCuota}
                />
              </View>
            )}

            {saving && (
              <View className="absolute inset-0 bg-white/60 rounded-[24px] items-center justify-center">
                <ActivityIndicator color="#1F7ECC" />
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
