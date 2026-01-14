import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../../theme/colors";

interface ServiceHeaderProps {
  name: string;
  billingDay: number;
  cost: number;
  color?: string;
  icon?: string;
  iconLibrary?: string; // New prop
  logoUrl?: string;
  onSettingsPress: () => void;
}

export const ServiceHeader: React.FC<ServiceHeaderProps> = ({
  name,
  billingDay,
  cost,
  color,
  icon,
  iconLibrary,
  logoUrl,
  onSettingsPress,
}) => {
  const primaryColor = color || colors.primary;

  // Helper to render the correct icon
  const renderIcon = () => {
    if (iconLibrary === "MaterialCommunityIcons") {
      return (
        <MaterialCommunityIcons
          name={icon as any}
          size={30} // Slightly larger for header
          color={primaryColor}
        />
      );
    }
    // Default to Ionicons
    return <Ionicons name={icon as any} size={30} color={primaryColor} />;
  };

  return (
    <View style={headerStyles.header}>
      {/* Avatar / Icon Container */}
      <View
        style={[
          headerStyles.avatar,
          { borderColor: primaryColor },
          logoUrl ? { backgroundColor: "#fff", borderWidth: 1 } : {},
        ]}
      >
        {logoUrl ? (
          <Image
            source={{ uri: logoUrl }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 22.5,
              resizeMode: "cover",
            }}
          />
        ) : icon ? (
          renderIcon()
        ) : (
          <Text style={[headerStyles.avatarText, { color: primaryColor }]}>
            {name[0].toUpperCase()}
          </Text>
        )}
      </View>

      {/* Info Container */}
      <View style={headerStyles.infoContainer}>
        <Text style={headerStyles.name}>{name}</Text>
        <Text style={headerStyles.info}>
          Día de pago: {billingDay} • Costo: S/ {cost}
        </Text>
      </View>

      {/* Settings Button (Pushed to right) */}
      <TouchableOpacity
        style={headerStyles.settingsButton}
        onPress={onSettingsPress}
      >
        <Ionicons
          name="ellipsis-vertical" // Same icon as SubscriberDetailScreen
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  settingsButton: {
    padding: 8,
    marginLeft: "auto", // Push to right
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  infoContainer: {
    flexDirection: "column",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  info: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
