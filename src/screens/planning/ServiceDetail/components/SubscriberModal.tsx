import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EVAModal from "../../../../components/common/EVAModal";
import { Subscriber } from "../../../../interfaces/Subscription";

interface SubscriberModalProps {
  visible: boolean;
  onClose: () => void;
  editingIndex: number | null;
  subscriberDraft: Subscriber | null;
  setSubscriberDraft: React.Dispatch<React.SetStateAction<Subscriber | null>>;
  subscriberQuotaInput: string;
  setSubscriberQuotaInput: (quota: string) => void;
  subscriberErrors: { nombre: string; cuota: string };
  setSubscriberErrors: React.Dispatch<
    React.SetStateAction<{ nombre: string; cuota: string }>
  >;
  onSave: () => void;
  contacts: any[];
}

const SubscriberModal: React.FC<SubscriberModalProps> = ({
  visible,
  onClose,
  editingIndex,
  subscriberDraft,
  setSubscriberDraft,
  subscriberQuotaInput,
  setSubscriberQuotaInput,
  subscriberErrors,
  setSubscriberErrors,
  onSave,
  contacts,
}) => {
  return (
    <EVAModal
      visible={visible}
      title={editingIndex !== null ? "Editar Participante" : "Añadir Participante"}
      onClose={onClose}
      primaryButtonText={editingIndex !== null ? "Guardar" : "Añadir"}
      onPrimaryAction={onSave}
    >
      <View className="px-2">
        {/* Selector de Contactos Existentes (Solo al añadir nuevo) */}
        {editingIndex === null && (
          <View className="mb-6">
            <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-3 ml-1">
              Seleccionar de tus Contactos
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2 px-2">
              {contacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  onPress={() => {
                    setSubscriberDraft((prev) => 
                      prev ? { ...prev, nombre: contact.nombre, color: contact.color } : null
                    );
                    if (subscriberErrors.nombre) setSubscriberErrors(p => ({...p, nombre: ""}));
                  }}
                  className="items-center mr-4"
                >
                  <View 
                    className={`w-12 h-12 rounded-full items-center justify-center mb-1 ${subscriberDraft?.nombre === contact.nombre ? "border-2 border-primary" : ""}`}
                    style={{ backgroundColor: `${contact.color}15` }}
                  >
                    <Text className="font-asap-bold text-sm" style={{ color: contact.color }}>{contact.nombre.charAt(0)}</Text>
                  </View>
                  <Text className="text-text-primary font-asap-medium text-[10px]">{contact.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {subscriberErrors.nombre && !subscriberDraft?.nombre && (
          <Text className="text-red-500 font-asap-semibold text-[10px] mb-4 ml-1">
            {subscriberErrors.nombre}
          </Text>
        )}

        {/* Cuota */}
        <View className="flex-row items-start justify-between mb-8">
          <View className="flex-1 mr-4 pt-1">
            <Text className="text-text-primary font-asap-bold text-base">
              Cuota Personal
            </Text>
            <Text className="text-text-secondary font-asap text-xs mt-1">
              Monto que esta persona debe pagar
            </Text>
          </View>

          <View className="items-end">
            <View
              className={`flex-row items-center bg-card px-3 py-2 rounded-xl min-w-[110px] ${
                subscriberDraft?.es_cortesia ? "opacity-40" : ""
              } ${subscriberErrors.cuota ? "border border-red-500" : ""}`}
            >
              <Text className="text-text-secondary font-asap mr-1">S/</Text>
              <TextInput
                className="text-text-primary font-asap-bold text-base flex-1 text-right"
                value={subscriberDraft?.es_cortesia ? "0.00" : subscriberQuotaInput}
                onChangeText={(text) => {
                  const cleanText = text.replace(/[^0-9.]/g, "");
                  setSubscriberQuotaInput(cleanText);
                  if (subscriberErrors.cuota) {
                    setSubscriberErrors((prev) => ({ ...prev, cuota: "" }));
                  }
                }}
                keyboardType="decimal-pad"
                editable={!subscriberDraft?.es_cortesia}
                placeholder="0.00"
                placeholderTextColor="#8F99A1"
              />
            </View>
            {subscriberErrors.cuota && (
              <Text className="text-red-500 font-asap-semibold text-[10px] mt-1 mr-1">
                {subscriberErrors.cuota}
              </Text>
            )}
          </View>
        </View>

        {/* Fecha de Inicio (Inmutable) */}
        <View className="flex-row items-center justify-between mb-6 pt-4 border-t border-border/10">
          <View className="flex-1 mr-4">
            <Text className="text-text-primary font-asap-bold text-base">
              Fecha de Inicio
            </Text>
            <Text className="text-text-secondary font-asap text-xs mt-1">
              Registro automático de ingreso
            </Text>
          </View>
          
          <View className="bg-card px-4 py-2 rounded-xl">
            <Text className="text-text-secondary font-asap-bold text-sm capitalize">
              {subscriberDraft?.fecha_inicio 
                ? new Date(subscriberDraft.fecha_inicio).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
                : new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Cortesía */}
        <View className="flex-row items-center justify-between mb-3 pt-2 border-t border-border/10">
          <View className="flex-1 mr-4">
            <Text className="text-text-primary font-asap-bold text-base">
              Cortesía
            </Text>
            <Text className="text-text-secondary font-asap text-xs mt-1">
              La persona no paga, tú asumes su parte
            </Text>
          </View>
          <Switch
            value={subscriberDraft?.es_cortesia}
            onValueChange={(val) =>
              setSubscriberDraft((prev) =>
                prev ? { ...prev, es_cortesia: val, cuota: val ? 0 : prev.cuota } : null,
              )
            }
            trackColor={{ false: "#E2E8F0", true: "#1F7ECC80" }}
            thumbColor={subscriberDraft?.es_cortesia ? "#1F7ECC" : "#94A3B8"}
          />
        </View>

        {/* Espacio final */}
        <View className="h-4" />
      </View>
    </EVAModal>
  );
};

export default SubscriberModal;
