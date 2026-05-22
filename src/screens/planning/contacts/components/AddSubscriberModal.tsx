import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EVAModal from "../../../../components/common/EVAModal";
import EVAAlert from "../../../../components/common/EVAAlert";
import { Contact } from "../../../../interfaces/Contact";
import { useAddSubscriber } from "../../../../logic/contacts/useAddSubscriber";
import { ServiceIcon } from "../../../../utils/serviceIcons";

import { useAppTheme } from "../../../../hooks/useAppTheme";

interface AddSubscriberModalProps {
  visible: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSuccess: () => void;
}

export function AddSubscriberModal({ visible, onClose, contact, onSuccess }: AddSubscriberModalProps) {
  const { colors, fonts } = useAppTheme();
  
  const {
    services,
    loading,
    selectedServiceId,
    setSelectedServiceId,
    cuota,
    setCuota,
    isCourtesy,
    setIsCourtesy,
    saving,
    alertConfig,
    setAlertConfig,
    handleSave
  } = useAddSubscriber(visible, contact, onSuccess);

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
            className="text-[10px] uppercase tracking-widest mb-4 ml-1"
            style={{ color: colors.textSecondary, fontFamily: fonts.family.semiBold }}
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
                className="text-[11px] text-center mt-2"
                style={{ color: colors.textSecondary, fontFamily: fonts.family.regular }}
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
                    className="text-[10px] text-center mt-2"
                    style={{ color: selectedServiceId === s.id ? colors.primary : colors.textSecondary, fontFamily: fonts.family.bold }}
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
              className="text-[10px] uppercase tracking-widest mb-4"
              style={{ color: colors.textSecondary, fontFamily: fonts.family.semiBold }}
            >
              Configurar Cuota
            </Text>

            <View className="flex-row items-center justify-between mb-4">
              <Text 
                className="text-sm"
                style={{ color: colors.text, fontFamily: fonts.family.medium }}
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
                  className="text-sm mr-2"
                  style={{ color: colors.textSecondary, fontFamily: fonts.family.bold }}
                >
                  S/
                </Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  className="flex-1 text-lg"
                  style={{ color: colors.text, fontFamily: fonts.family.bold }}
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
