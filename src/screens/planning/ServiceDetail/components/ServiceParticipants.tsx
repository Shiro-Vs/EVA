import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { Subscriber } from "../../../../interfaces/Subscription";
import { EVAAvatar } from "../../../../components/common/EVAAvatar";
import { EVAActionButton } from "../../../../components/common/EVAActionButton";

interface ServiceParticipantsProps {
  suscriptores: Subscriber[];
  es_compartido: boolean;
  onEditSubscriber: (sub: Subscriber, index: number) => void;
  onAddSubscriber: () => void;
  onRemoveSubscriber: (sub: Subscriber) => void;
  onSharePress: () => void;
}

export const ServiceParticipants: React.FC<ServiceParticipantsProps> = ({
  suscriptores,
  es_compartido,
  onEditSubscriber,
  onAddSubscriber,
  onRemoveSubscriber,
  onSharePress,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={{ flex: 1, paddingHorizontal: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <View>
          <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 18 }}>Participantes</Text>
          <Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 12 }}>{suscriptores.length} personas dividiendo gastos</Text>
        </View>
        <TouchableOpacity onPress={onAddSubscriber} style={{ width: 40, height: 40, backgroundColor: `${colors.primary}15`, borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="person-add" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {suscriptores.map((sub: any, idx: number) => (
          <View key={idx} style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.card, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: `${colors.text}10` }}>
            <TouchableOpacity onPress={() => onEditSubscriber(sub, idx)} style={{ flex: 1, flexDirection: "row", alignItems: "center" }} activeOpacity={0.7}>
              <EVAAvatar name={sub.nombre} color={sub.color || colors.primary} size={40} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 14 }}>{sub.nombre}</Text>
                <Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 12 }}>
                  {sub.es_cortesia ? "Cortesía" : `Cuota: S/ ${sub.cuota.toFixed(2)}`}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <EVAActionButton type="delete" icon="trash-outline" onPress={() => onRemoveSubscriber(sub)} />
              <View style={{ marginLeft: 8 }}><Ionicons name="chevron-forward" size={16} color={colors.muted} /></View>
            </View>
          </View>
        ))}

        {!es_compartido && (
          <View style={{ backgroundColor: `${colors.card}80`, borderRadius: 24, padding: 32, alignItems: "center", borderStyle: "dashed", borderWidth: 1, borderColor: `${colors.border}30`, marginTop: 16 }}>
            <View style={{ width: 64, height: 64, backgroundColor: `${colors.primary}08`, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <View style={{ width: 48, height: 48, backgroundColor: `${colors.primary}15`, borderRadius: 24, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="share-social" size={24} color={colors.primary} />
              </View>
            </View>
            <Text style={{ color: colors.text, fontFamily: "AsapBold", textAlign: "center", marginBottom: 8 }}>Servicio Individual</Text>
            <Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 12, textAlign: "center", marginBottom: 24, paddingHorizontal: 16 }}>
              Este servicio no es compartido. Puedes cambiarlo en la configuración si deseas dividir gastos con otros.
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

export default ServiceParticipants;
