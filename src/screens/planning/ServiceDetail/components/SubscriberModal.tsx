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
import { useAppTheme } from "../../../../hooks/useAppTheme";

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
  existingSubscriberNames?: string[];
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
  existingSubscriberNames = [],
}) => {
  const { colors } = useAppTheme();
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
              {contacts
                .filter(contact => !existingSubscriberNames.includes(contact.nombre))
                .map((contact) => (
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
          <Text className="text-expense font-asap-semibold text-[10px] mb-4 ml-1">
            {subscriberErrors.nombre}
          </Text>
        )}

        {/* Cuota */}
        <View style={{ backgroundColor: `${colors.primary}05`, padding: 12, borderRadius: 16, marginBottom: 12 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center">
                <Ionicons name="cash-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text className="text-text-primary font-asap-bold text-sm">
                  Cuota
                </Text>
              </View>
            </View>

            <View className="items-end">
              <View
                className={`flex-row items-center bg-card px-3 py-1.5 rounded-xl min-w-[100px] shadow-sm ${
                  subscriberDraft?.es_cortesia ? "opacity-40" : ""
                } ${subscriberErrors.cuota ? "border border-expense" : ""}`}
              >
                <Text className="text-primary font-asap-bold mr-1 text-sm">S/</Text>
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
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>
          {subscriberErrors.cuota && (
            <Text className="text-expense font-asap-semibold text-[9px] mt-1 text-right mr-1">
              {subscriberErrors.cuota}
            </Text>
          )}
        </View>

        {/* Detalles Secundarios */}
        <View style={{ backgroundColor: `${colors.card}80`, borderRadius: 20, padding: 14, marginBottom: 16 }}>
          {/* Fecha de Inicio */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-background items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              </View>
              <Text className="text-text-primary font-asap-semibold text-sm">
                Fecha de Ingreso
              </Text>
            </View>
            
            <View className="bg-background px-3 py-1.5 rounded-xl border border-border/10">
              <Text className="text-text-primary font-asap-bold text-xs capitalize">
                {subscriberDraft?.fecha_inicio 
                  ? new Date(subscriberDraft.fecha_inicio).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                  : new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Cortesía */}
          <View className="flex-row items-center justify-between pt-4 border-t border-border/10">
            <View className="flex-row items-center flex-1 mr-4">
              <View className="w-8 h-8 rounded-full bg-background items-center justify-center mr-3">
                <Ionicons name="gift-outline" size={14} color={subscriberDraft?.es_cortesia ? colors.primary : colors.textSecondary} />
              </View>
              <Text className="text-text-primary font-asap-semibold text-sm">
                Plan de Cortesía
              </Text>
            </View>
            <Switch
              value={subscriberDraft?.es_cortesia}
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
              onValueChange={(val) =>
                setSubscriberDraft((prev) =>
                  prev ? { ...prev, es_cortesia: val, cuota: val ? 0 : prev.cuota } : null,
                )
              }
              trackColor={{ false: colors.border, true: `${colors.primary}80` }}
              thumbColor={subscriberDraft?.es_cortesia ? colors.primary : colors.muted}
            />
          </View>
        </View>

        {/* Espacio final */}
        <View className="h-2" />
      </View>
    </EVAModal>
  );
};

export default SubscriberModal;
