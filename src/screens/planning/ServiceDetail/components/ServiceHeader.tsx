import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ServiceIcon } from "../../../../utils/serviceIcons";
import { useAppTheme } from "../../../../hooks/useAppTheme";
import { Subscription } from "../../../../interfaces/Subscription";

interface ServiceHeaderProps {
  service: Subscription;
  currentAccount: any;
  onBack: () => void;
  onEdit: () => void;
  activeTab: "participantes" | "historial";
  onSwitchTab: (tab: "participantes" | "historial") => void;
}

export const ServiceHeader: React.FC<ServiceHeaderProps> = ({
  service,
  currentAccount,
  onBack,
  onEdit,
  activeTab,
  onSwitchTab,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 24, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, backgroundColor: colors.card, borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginRight: 16, backgroundColor: `${service.color || colors.primary}15` }}>
          <ServiceIcon name={service.icon || "receipt"} size={32} color={service.color || colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontFamily: "AsapBold", fontSize: 24 }}>{service.nombre}</Text>
          <Text style={{ color: colors.textSecondary, fontFamily: "AsapMedium", fontSize: 14, marginTop: 4 }}>
            S/ {service.costo_total_actual.toFixed(2)} • {service.frecuencia}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Ionicons name={(currentAccount?.icono || "card-outline") as any} size={12} color={currentAccount?.color || colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontFamily: "Asap", fontSize: 12, marginLeft: 4 }}>{currentAccount?.nombre || "N/A"}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onEdit} style={{ width: 40, height: 40, backgroundColor: `${colors.primary}15`, borderRadius: 20, alignItems: "center", justifyContent: "center", marginLeft: 8 }}>
          <Ionicons name="pencil" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={{ height: 1, backgroundColor: colors.border, opacity: 0.5, width: "100%", marginBottom: 24 }} />

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24, backgroundColor: colors.card, borderRadius: 12, padding: 4 }}>
        <TouchableOpacity
          style={{ 
            flex: 1, 
            paddingVertical: 8, 
            alignItems: "center", 
            borderRadius: 8, 
            backgroundColor: activeTab === "historial" ? colors.background : "transparent",
            shadowColor: activeTab === "historial" ? "#000" : "transparent",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: activeTab === "historial" ? 2 : 0
          }}
          onPress={() => onSwitchTab("historial")}
        >
          <Text style={{ fontFamily: "AsapBold", fontSize: 12, color: activeTab === "historial" ? colors.primary : colors.textSecondary }}>Historial de Pagos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ 
            flex: 1, 
            paddingVertical: 8, 
            alignItems: "center", 
            borderRadius: 8, 
            backgroundColor: activeTab === "participantes" ? colors.background : "transparent",
            shadowColor: activeTab === "participantes" ? "#000" : "transparent",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: activeTab === "participantes" ? 2 : 0
          }}
          onPress={() => onSwitchTab("participantes")}
        >
          <Text style={{ fontFamily: "AsapBold", fontSize: 12, color: activeTab === "participantes" ? colors.primary : colors.textSecondary }}>Participantes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ServiceHeader;
