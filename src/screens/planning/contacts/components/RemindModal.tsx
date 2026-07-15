import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Alert, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import EVAModal from "../../../../components/common/EVAModal";
import { Contact } from "../../../../interfaces/Contact";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { useRemindContact } from "../../../../logic/contacts/useRemindContact";

interface RemindModalProps {
  visible: boolean;
  onClose: () => void;
  debtors: Contact[];
}

export function RemindModal({ visible, onClose, debtors }: RemindModalProps) {
  const { colors, fonts } = useAppTheme();
  const {
    selectedId,
    setSelectedId,
    loading,
    message,
    handleShare,
    handleWhatsApp
  } = useRemindContact(visible, debtors);

  return (
    <EVAModal
      visible={visible}
      title="Cobranza Rápida"
      onClose={onClose}
      secondaryButtonText=""
    >
      <View className="mb-6">
        <Text 
          className="text-[10px] uppercase tracking-widest mb-4 ml-1"
          style={{ color: colors.textSecondary, fontFamily: fonts.family.semiBold }}
        >
          ¿A quién quieres cobrar?
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row -mx-2 px-2"
        >
          {debtors.map((d) => (
            <TouchableOpacity
              key={d.id}
              onPress={() => setSelectedId(d.id)}
              className="mr-5 items-center"
              activeOpacity={0.7}
            >
              <View 
                className="w-14 h-14 rounded-full items-center justify-center mb-2 border-2"
                style={{ 
                  backgroundColor: selectedId === d.id ? `${d.color}15` : `${d.color}10`,
                  borderColor: selectedId === d.id ? colors.primary : "transparent"
                }}
              >
                <Text className="text-lg" style={{ color: d.color, fontFamily: fonts.family.bold }}>
                  {d.nombre.charAt(0)}
                </Text>
                
                {selectedId === d.id && (
                  <View 
                    className="absolute -bottom-1 -right-1 rounded-full w-5 h-5 items-center justify-center border-2"
                    style={{ backgroundColor: colors.primary, borderColor: colors.background }}
                  >
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </View>
              <Text 
                className="text-[10px]"
                style={{ color: selectedId === d.id ? colors.primary : colors.textSecondary, fontFamily: fonts.family.bold }}
                numberOfLines={1}
              >
                {d.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text 
        className="text-[10px] uppercase tracking-widest mb-3 ml-1"
        style={{ color: colors.textSecondary, fontFamily: fonts.family.semiBold }}
      >
        Previsualización del Mensaje
      </Text>

      <View 
        className="p-5 pt-10 rounded-[24px] mb-8 relative"
        style={{ backgroundColor: colors.card }}
      >
        {!loading && (
          <TouchableOpacity 
            onPress={handleShare}
            className="absolute top-4 right-4 p-2 rounded-xl"
            style={{ backgroundColor: `${colors.text}10` }}
            activeOpacity={0.6}
          >
            <Ionicons name="share-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
        
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" className="py-10" />
        ) : (
          <>
            <Text 
              className="text-sm leading-6"
              style={{ color: colors.text, fontFamily: fonts.family.regular }}
            >
              {message}
            </Text>
            <View 
              className="absolute -bottom-2 right-6 w-4 h-4 rotate-45" 
              style={{ backgroundColor: colors.card }}
            />
          </>
        )}
      </View>

      <View className="flex-row gap-3 mb-2">
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 items-center justify-center h-14 rounded-2xl"
          style={{ backgroundColor: colors.card }}
          activeOpacity={0.7}
        >
          <Text 
            className="text-sm"
            style={{ color: colors.text, fontFamily: fonts.family.bold }}
          >
            Cancelar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleWhatsApp}
          className="flex-[1.5] flex-row items-center justify-center h-14 rounded-2xl shadow-lg"
          style={{ backgroundColor: colors.income, shadowColor: colors.income, shadowOpacity: 0.2 }}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-whatsapp" size={20} color="white" className="mr-2" />
          <Text className="text-white text-sm" style={{ fontFamily: fonts.family.bold }}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </EVAModal>
  );
}
