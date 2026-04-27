import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Subscriber } from "../../../../interfaces/Subscription";

interface ServiceParticipantsProps {
  esCompartido: boolean;
  suscriptores: Subscriber[];
  screenWidth: number;
  onAddPress: () => void;
  onEditPress: (subscriber: Subscriber, index: number) => void;
  onRemovePress: (subscriber: Subscriber) => void;
  onSharePress: () => void;
  onAdvancePayment?: (nombre: string, months: number) => void;
}

const ServiceParticipants: React.FC<ServiceParticipantsProps> = ({
  esCompartido,
  suscriptores,
  screenWidth,
  onAddPress,
  onEditPress,
  onRemovePress,
  onSharePress,
  onAdvancePayment,
}) => {
  return (
    <View style={{ width: screenWidth }} className="min-h-[500px] px-6">
      <View className="mb-8 pr-1">
        <View className="flex-row justify-between items-center mb-4 ml-2 mr-2">
          <Text className="text-text-secondary font-asap-semibold text-xs uppercase tracking-wider">
            Participantes
          </Text>
          {esCompartido && (
            <TouchableOpacity onPress={onAddPress}>
              <Text className="text-primary font-asap-semibold text-xs">
                + Añadir
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {esCompartido ? (
          suscriptores.map((sub, idx) => (
            <View
              key={idx}
              className="bg-card rounded-2xl p-4 mb-3 flex-row items-center"
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${sub.color || "#1F7ECC"}15` }}
              >
                <Text
                  className="font-asap-bold text-base"
                  style={{ color: sub.color || "#1F7ECC" }}
                >
                  {sub.nombre.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-text-primary font-asap-bold text-base mr-2">
                    {sub.nombre}
                  </Text>
                  {sub.es_cortesia && (
                    <View 
                      style={{ backgroundColor: '#FF8C0026' }}
                      className="ml-2 px-3 py-1.5 rounded-full"
                    >
                      <Text className="text-[#FF8C00] font-asap-bold text-[8px] uppercase tracking-wider">
                        Cortesía
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center">
                  <Text className="text-text-secondary font-asap text-[10px] mr-2">
                    Cuota: S/ {sub.es_cortesia ? "0.00" : sub.cuota.toFixed(2)}
                  </Text>
                  <View className="w-1 h-1 rounded-full bg-slate-300 mr-2" />
                  <Text className="text-text-secondary/60 font-asap text-[10px]">
                    Desde {new Date(sub.fecha_inicio || new Date()).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => onEditPress(sub, idx)}
                  className="bg-background w-8 h-8 rounded-full items-center justify-center mr-2"
                >
                  <Ionicons name="pencil" size={14} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onRemovePress(sub)}
                  className="bg-red-50 w-8 h-8 rounded-full items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-card rounded-3xl p-8 items-center justify-center mb-3">
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
              <Ionicons name="people" size={32} color="#1F7ECC" />
            </View>
            <Text className="text-text-primary font-asap-bold text-lg mb-1">
              Servicio Personal
            </Text>
            <Text className="text-text-secondary font-asap text-center text-sm mb-6">
              Este servicio no está compartido con nadie actualmente.
            </Text>
            <TouchableOpacity
              className="bg-primary/10 px-6 py-3 rounded-xl"
              onPress={onSharePress}
            >
              <Text className="text-primary font-asap-bold text-sm">
                Compartir Servicio
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default ServiceParticipants;
