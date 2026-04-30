import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Contact } from "../../../../interfaces/Contact";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { EVAActionButton } from "../../../../components/common/EVAActionButton";
import { EVAAvatar } from "../../../../components/common/EVAAvatar";

interface ContactListProps {
  contacts: Contact[];
  onContactPress: (contact: Contact) => void;
  onEditPress: (contact: Contact) => void;
  onDeletePress: (contact: Contact) => void;
}

export function ContactList({
  contacts,
  onContactPress,
  onEditPress,
  onDeletePress,
}: ContactListProps) {
  const { colors, isDark } = useAppTheme();

  if (contacts.length === 0) {
    return (
      <View className="items-center justify-center py-20">
        <View className="w-16 h-16 bg-muted/10 rounded-full items-center justify-center mb-4">
          <Ionicons name="people-outline" size={32} color={colors.muted} />
        </View>
        <Text className="text-text-secondary font-asap-medium text-sm">
          No se encontraron contactos
        </Text>
      </View>
    );
  }

  return (
    <View>
      {contacts.map((contact) => (
        <TouchableOpacity
          key={contact.id}
          onPress={() => onContactPress(contact)}
          className="bg-card p-4 rounded-[24px] flex-row items-center mb-3 shadow-sm shadow-black/5"
          activeOpacity={0.7}
        >
          <EVAAvatar 
            name={contact.nombre} 
            color={contact.color} 
            size={48} 
            fontSize={20}
            className="mr-4"
          />

          <View className="flex-1">
            <Text className="text-text-primary font-asap-bold text-base">
              {contact.nombre}
            </Text>
            <View className="flex-row items-center mt-1">
              <View
                className={`px-2 py-0.5 rounded-md ${
                  (contact.total_servicios || 0) === 0 
                    ? "bg-muted/10" 
                    : (contact.total_deuda && contact.total_deuda > 0 ? "bg-expense/10" : "bg-income/10")
                }`}
              >
                <Text
                  className={`font-asap-bold text-[8px] uppercase ${
                    (contact.total_servicios || 0) === 0 
                      ? "text-text-secondary" 
                      : (contact.total_deuda && contact.total_deuda > 0 ? "text-expense" : "text-income")
                  }`}
                >
                  {(contact.total_servicios || 0) === 0 
                    ? "0 servicios" 
                    : (contact.total_deuda && contact.total_deuda > 0
                      ? `Debe S/ ${contact.total_deuda.toFixed(2)}`
                      : "Al día")}
                </Text>
              </View>

              {/* Contador de Servicios */}
              {(contact.total_servicios || 0) > 0 && (
                <View className="flex-row items-center ml-2 opacity-70">
                  <View className="w-1 h-1 rounded-full bg-muted mx-1.5" />
                  <Ionicons name="layers-outline" size={10} color={colors.muted} />
                  <Text className="text-text-secondary font-asap-bold text-[9px] ml-1">
                    {contact.total_servicios} {contact.total_servicios === 1 ? 'servicio' : 'servicios'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Acciones Rápidas */}
          <View className="flex-row items-center gap-2">
            <EVAActionButton
              type="edit"
              icon="pencil-outline"
              size={16}
              onPress={() => onEditPress(contact)}
            />
            <EVAActionButton
              type="delete"
              icon="trash-outline"
              size={16}
              onPress={() => onDeletePress(contact)}
            />
            <Ionicons name="chevron-forward" size={16} color={colors.border} className="ml-1" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
