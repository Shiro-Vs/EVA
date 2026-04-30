import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Alert, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import EVAModal from "../../../../components/common/EVAModal";
import { Contact } from "../../../../interfaces/Contact";
import { mockDB } from "../../../../services/mockDatabase";
import { useAppTheme } from "../../../../hooks/useAppTheme";

interface RemindModalProps {
  visible: boolean;
  onClose: () => void;
  debtors: Contact[];
}

export function RemindModal({ visible, onClose, debtors }: RemindModalProps) {
  const { colors } = useAppTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (visible && debtors.length > 0) {
      setSelectedId(debtors[0].id);
    }
  }, [visible, debtors]);

  useEffect(() => {
    if (selectedId) {
      loadSummary(selectedId);
    }
  }, [selectedId]);

  const loadSummary = async (id: string) => {
    const contact = debtors.find(d => d.id === id);
    if (!contact) return;

    setLoading(true);
    try {
      const data = await mockDB.getContactSummary(contact.nombre);
      setSummary(data);
      generateMessage(contact.nombre, data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateMessage = (name: string, data: any) => {
    const debt = data?.totalDebt || 0;
    let msg = `Hola ${name}! 👋\n\nTu deuda total es de *S/ ${debt.toFixed(2)}* 💸\n\n`;
    
    if (data?.services) {
      data.services.forEach((s: any) => {
        if (s.debt > 0) {
          msg += `• *${s.serviceName}*: `;
          if (s.monthsDelay > 0) {
            msg += `${s.monthsDelay} ${s.monthsDelay === 1 ? 'mes' : 'meses'} (S/ ${s.debt.toFixed(2)})`;
          } else {
            msg += `S/ ${s.debt.toFixed(2)}`;
          }
          msg += `\n`;
        }
      });
    }

    msg += `\n¿Me podrías confirmar si lo logras pagar hoy? ¡Gracias! ✨`;
    setMessage(msg);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleWhatsApp = () => {
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("WhatsApp", "WhatsApp no está instalado en este dispositivo");
      }
    });
  };

  return (
    <EVAModal
      visible={visible}
      title="Cobranza Rápida"
      onClose={onClose}
      secondaryButtonText=""
    >
      <View className="mb-6">
        <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-4 ml-1">
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
                className={`w-14 h-14 rounded-full items-center justify-center mb-2 border-2 ${
                  selectedId === d.id ? "border-primary" : "border-transparent"
                }`}
                style={{ backgroundColor: selectedId === d.id ? `${d.color}15` : `${d.color}10` }}
              >
                <Text className="font-asap-bold text-lg" style={{ color: d.color }}>
                  {d.nombre.charAt(0)}
                </Text>
                
                {selectedId === d.id && (
                  <View className="absolute -bottom-1 -right-1 bg-primary rounded-full w-5 h-5 items-center justify-center border-2 border-background">
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </View>
              <Text 
                className={`text-[10px] font-asap-bold ${
                  selectedId === d.id ? "text-primary" : "text-text-secondary"
                }`}
                numberOfLines={1}
              >
                {d.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-3 ml-1">
        Previsualización del Mensaje
      </Text>

      <View className="bg-card p-5 pt-10 rounded-[24px] mb-8 relative">
        {!loading && (
          <TouchableOpacity 
            onPress={handleShare}
            className="absolute top-4 right-4 p-2 bg-background/50 rounded-xl"
            activeOpacity={0.6}
          >
            <Ionicons name="share-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
        
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" className="py-10" />
        ) : (
          <>
            <Text className="text-text-primary font-asap text-sm leading-6">
              {message}
            </Text>
            <View className="absolute -bottom-2 right-6 w-4 h-4 bg-card rotate-45" />
          </>
        )}
      </View>

      <View className="flex-row gap-3 mb-2">
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 items-center justify-center bg-card h-14 rounded-2xl"
          activeOpacity={0.7}
        >
          <Text className="text-text-primary font-asap-bold text-sm">Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleWhatsApp}
          className="flex-[1.5] flex-row items-center justify-center bg-income h-14 rounded-2xl shadow-lg shadow-income/20"
          activeOpacity={0.8}
        >
          <Ionicons name="logo-whatsapp" size={20} color="white" className="mr-2" />
          <Text className="text-white font-asap-bold text-sm">WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </EVAModal>
  );
}
