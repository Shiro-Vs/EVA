import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EVAModal from "../../../../components/common/EVAModal";
import { PRESET_COLORS } from "../../../../utils/serviceIcons";
import { Contact } from "../../../../interfaces/Contact";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { EVAInput } from "../../../../components/common/EVAInput";
import { EVASeparator } from "../../../../components/common/EVASeparator";

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  contactDraft: Omit<Contact, "id">;
  setContactDraft: React.Dispatch<React.SetStateAction<Omit<Contact, "id">>>;
  isEditing: boolean;
}

export function ContactModal({
  visible,
  onClose,
  onSave,
  contactDraft,
  setContactDraft,
  isEditing,
}: ContactModalProps) {
  const { colors } = useAppTheme();
  const [errors, setErrors] = useState({ nombre: "" });

  const validateAndSave = () => {
    if (!contactDraft.nombre.trim()) {
      setErrors({ nombre: "El nombre es obligatorio" });
      return;
    }
    setErrors({ nombre: "" });
    onSave();
  };

  return (
    <EVAModal
      visible={visible}
      title={isEditing ? "Editar Contacto" : "Nuevo Contacto"}
      onClose={onClose}
      primaryButtonText={isEditing ? "Guardar" : "Crear"}
      onPrimaryAction={validateAndSave}
    >
      <ScrollView showsVerticalScrollIndicator={false} className="px-2">
        <EVAInput
          label="Nombre Completo"
          value={contactDraft.nombre}
          onChangeText={(text) => {
            setContactDraft((prev) => ({ ...prev, nombre: text }));
            if (errors.nombre) setErrors({ nombre: "" });
          }}
          placeholder="Ej. Juan Pérez"
          error={errors.nombre}
        />

        <EVASeparator />
        <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-3 ml-1">
          Color Identificador
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-8 -mx-2 px-2"
        >
          {PRESET_COLORS.map((c) => {
            const isSelected = contactDraft.color === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setContactDraft((prev) => ({ ...prev, color: c }))}
                style={{ 
                  backgroundColor: c,
                  borderWidth: isSelected ? 3 : 0,
                  borderColor: isSelected ? 'rgba(255,255,255,0.8)' : 'transparent',
                  opacity: isSelected ? 1 : 0.6
                }}
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                activeOpacity={0.8}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={20} color="white" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <EVASeparator />
        <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-3 ml-1">
          Información Opcional
        </Text>
        <EVAInput
          icon={<Ionicons name="call-outline" size={20} color={colors.muted} />}
          value={contactDraft.telefono}
          onChangeText={(text) => setContactDraft((prev) => ({ ...prev, telefono: text }))}
          placeholder="Teléfono (opcional)"
          keyboardType="phone-pad"
        />
      </ScrollView>
    </EVAModal>
  );
}
