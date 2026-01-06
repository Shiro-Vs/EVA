import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/ServiceDetailStyles";
import { colors } from "../../../../theme/colors";

interface ServiceHeaderProps {
  name: string;
  billingDay: number;
  cost: number;
  onSettingsPress: () => void;
}

export const ServiceHeader: React.FC<ServiceHeaderProps> = ({
  name,
  billingDay,
  cost,
  onSettingsPress,
}) => {
  return (
    <View>
      <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
        <Ionicons
          name="settings-sharp"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <Text style={styles.title}>{name}</Text>
      <Text style={styles.subtitle}>
        Corte el día {billingDay} • Costo: S/ {cost}
      </Text>
    </View>
  );
};
