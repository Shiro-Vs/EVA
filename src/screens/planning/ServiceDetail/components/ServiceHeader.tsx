import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ServiceIcon } from "../../../../utils/serviceIcons";

interface ServiceHeaderProps {
  nombre: string;
  costo_total_actual: number;
  frecuencia: string;
  dia_cobro: string;
  icon?: string;
  color?: string;
  accountName: string;
  accountIcon: any;
  accountColor: string;
  onEditPress: () => void;
}

const ServiceHeader: React.FC<ServiceHeaderProps> = ({
  nombre,
  costo_total_actual,
  frecuencia,
  dia_cobro,
  icon,
  color,
  accountName,
  accountIcon,
  accountColor,
  onEditPress,
}) => {
  return (
    <>
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center flex-1">
          {/* Logo Circular a la izquierda */}
          <View
            className="w-16 h-16 rounded-full items-center justify-center mr-4 overflow-hidden"
            style={{ backgroundColor: `${color || "#1F7ECC"}15` }}
          >
            <ServiceIcon
              name={icon || "receipt"}
              size={32}
              color={color || "#1F7ECC"}
            />
          </View>

          {/* Nombre y Detalles a la derecha del logo */}
          <View className="flex-1">
            <Text className="text-text-primary font-asap-bold text-2xl">
              {nombre}
            </Text>
            <Text className="text-text-secondary font-asap-medium text-sm mt-1">
              S/ {costo_total_actual.toFixed(2)} • {frecuencia}
            </Text>
            <Text className="text-text-secondary font-asap text-xs mt-0.5 mb-1">
              Día de cobro: {dia_cobro}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name={accountIcon} size={12} color={accountColor} />
              <Text className="text-text-secondary font-asap text-xs ml-1">
                {accountName}
              </Text>
            </View>
          </View>
        </View>

        {/* Botón de Editar al extremo derecho */}
        <TouchableOpacity
          onPress={onEditPress}
          className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center ml-2"
        >
          <Ionicons name="pencil" size={18} color="#1F7ECC" />
        </TouchableOpacity>
      </View>

      {/* Línea Divisoria */}
      <View className="h-[1px] bg-slate-200 w-full mb-6" />
    </>
  );
};

export default ServiceHeader;
