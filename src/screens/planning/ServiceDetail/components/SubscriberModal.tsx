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
import { useSubscriber } from "../../../../logic/serviceDetail/useSubscriber";

interface SubscriberModalProps {
  visible: boolean;
  onClose: () => void;
  editingIndex: number | null;
  serviceId: string;
  editingSubscriber: Subscriber | null;
  onSuccess: (updatedService: any) => void;
  contacts: any[];
  existingSubscriberNames?: string[];
}

const SubscriberModal: React.FC<SubscriberModalProps> = ({
  visible,
  onClose,
  editingIndex,
  serviceId,
  editingSubscriber,
  onSuccess,
  contacts,
  existingSubscriberNames = [],
}) => {
  const { colors, fonts } = useAppTheme();
  
  const {
    subscriberDraft,
    setSubscriberDraft,
    subscriberQuotaInput,
    setSubscriberQuotaInput,
    subscriberErrors,
    clearError,
    validateAndSave
  } = useSubscriber(visible, serviceId, editingSubscriber, editingIndex, onClose, onSuccess);

  return (
    <EVAModal
      visible={visible}
      title={editingIndex !== null ? "Editar Participante" : "Añadir Participante"}
      onClose={onClose}
      primaryButtonText={editingIndex !== null ? "Guardar" : "Añadir"}
      onPrimaryAction={validateAndSave}
    >
      <View className="px-2">
        {/* Selector de Contactos Existentes (Solo al añadir nuevo) */}
        {editingIndex === null && (
          <View className="mb-6">
            <Text 
       className=" text-[10px] uppercase tracking-widest mb-3 ml-1"
       style={{ fontFamily: fonts.family.semiBold, color: colors.textSecondary }}
      >
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
                    clearError("nombre");
                  }}
                  className="items-center mr-4"
                >
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mb-1"
                    style={{ 
                      backgroundColor: `${contact.color}15`,
                      borderWidth: subscriberDraft?.nombre === contact.nombre ? 2 : 0,
                      borderColor: colors.primary
                    }}
                  >
                    <Text className=" text-sm" style={{ fontFamily: fonts.family.bold, color: contact.color }}>{contact.nombre.charAt(0)}</Text>
                  </View>
                  <Text 
          className=" text-[10px]"
          style={{ fontFamily: fonts.family.medium, color: colors.text }}
         >
                    {contact.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {subscriberErrors.nombre && !subscriberDraft?.nombre && (
          <Text 
      className=" text-[10px] mb-4 ml-1"
      style={{ fontFamily: fonts.family.semiBold, color: colors.expense }}
     >
            {subscriberErrors.nombre}
          </Text>
        )}

        {/* Cuota */}
        <View style={{ backgroundColor: `${colors.primary}10`, padding: 12, borderRadius: 16, marginBottom: 12 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center">
                <Ionicons name="cash-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text 
         className=" text-sm"
         style={{ fontFamily: fonts.family.bold, color: colors.text }}
        >
                  Cuota
                </Text>
              </View>
            </View>

            <View className="items-end">
              <View
                className="flex-row items-center px-3 py-1.5 rounded-xl min-w-[100px] shadow-sm"
                style={{ 
                  backgroundColor: colors.card,
                  opacity: subscriberDraft?.es_cortesia ? 0.4 : 1,
                  borderWidth: 1,
                  borderColor: subscriberErrors.cuota ? colors.expense : `${colors.text}10`
                }}
              >
                <Text style={{ color: colors.primary, fontFamily: 'AsapBold', fontSize: 14, marginRight: 4 }}>S/</Text>
                <TextInput
         className=" text-base flex-1 text-right"
         style={{ fontFamily: fonts.family.bold, color: colors.text }}
         value={subscriberDraft?.es_cortesia ? "0.00" : subscriberQuotaInput}
         onChangeText={(text) => {
                    const cleanText = text.replace(/[^0-9.]/g, "");
                    setSubscriberQuotaInput(cleanText);
                    clearError("cuota");
                  }}
                  keyboardType="decimal-pad"
                  editable={!subscriberDraft?.es_cortesia}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>
          </View>
          {subscriberErrors.cuota && (
            <Text 
       className=" text-[9px] mt-1 text-right mr-1"
       style={{ fontFamily: fonts.family.semiBold, color: colors.expense }}
      >
              {subscriberErrors.cuota}
            </Text>
          )}
        </View>

        {/* Detalles Secundarios */}
        <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: `${colors.text}05` }}>
          {/* Fecha de Inicio */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.background }}
              >
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              </View>
              <Text 
        className=" text-sm"
        style={{ fontFamily: fonts.family.semiBold, color: colors.text }}
       >
                Fecha de Ingreso
              </Text>
            </View>
            
            <View 
              className="px-3 py-1.5 rounded-xl border"
              style={{ backgroundColor: colors.background, borderColor: colors.border }}
            >
              <Text 
        className=" text-xs capitalize"
        style={{ fontFamily: fonts.family.bold, color: colors.text }}
       >
                {subscriberDraft?.fecha_inicio 
                  ? new Date(subscriberDraft.fecha_inicio).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                  : new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Cortesía */}
          <View 
            className="flex-row items-center justify-between pt-4 border-t"
            style={{ borderTopColor: colors.border }}
          >
            <View className="flex-row items-center flex-1 mr-4">
              <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.background }}
              >
                <Ionicons name="gift-outline" size={14} color={subscriberDraft?.es_cortesia ? colors.primary : colors.textSecondary} />
              </View>
              <Text 
        className=" text-sm"
        style={{ fontFamily: fonts.family.semiBold, color: colors.text }}
       >
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
