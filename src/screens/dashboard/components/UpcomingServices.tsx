import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Service } from "../../../services/subscriptionService"; // Assuming Service type is exported here or needs to be imported from types
import { colors } from "../../../theme/colors";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale/es";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// We need to extend the Service type temporarily if it doesn't have nextPaymentDate in the source definition,
// but useDashboardData injects it. Let's assume passed data has it.
interface UpcomingService extends Service {
  nextPaymentDate?: Date;
}

interface Props {
  services: UpcomingService[];
}

export const UpcomingServices = ({ services }: Props) => {
  const navigation = useNavigation<any>();

  if (!services || services.length === 0) return null;

  const handlePress = (service: UpcomingService) => {
    // Avoid Non-serializable warning by converting Date to string
    const serviceParams = {
      ...service,
      nextPaymentDate: service.nextPaymentDate?.toISOString(),
    };
    navigation.navigate("Servicios", {
      screen: "ServiceDetail",
      params: { serviceId: service.id, service: serviceParams },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Próximos Pagos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {services.map((service) => {
          const daysLeft = service.nextPaymentDate
            ? differenceInDays(service.nextPaymentDate, new Date())
            : 0;

          let timeLabel = "";
          let urgencyColor = colors.textSecondary;

          if (daysLeft === 0) {
            timeLabel = "Hoy";
            urgencyColor = colors.error; // Red urgency
          } else if (daysLeft === 1) {
            timeLabel = "Mañana";
            urgencyColor = "#FF9800"; // Orange
          } else {
            timeLabel = `${daysLeft} días`;
            urgencyColor = colors.primary;
          }

          return (
            <TouchableOpacity
              key={service.id}
              style={styles.card}
              onPress={() => handlePress(service)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: service.color || colors.primary },
                ]}
              >
                {service.logoUrl ? (
                  <Image
                    source={{ uri: service.logoUrl }}
                    style={styles.iconImage}
                  />
                ) : service.icon ? (
                  service.iconLibrary === "MaterialCommunityIcons" ? (
                    <MaterialCommunityIcons
                      name={service.icon as any}
                      size={18} // Reduced from 24
                      color="#FFF"
                    />
                  ) : (
                    <Ionicons
                      name={service.icon as any}
                      size={18} // Reduced from 24
                      color="#FFF"
                    />
                  )
                ) : (
                  <Text style={styles.iconText}>
                    {(service.name || "?").charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {service.name}
                </Text>
                <Text style={styles.amount}>S/ {service.cost.toFixed(2)}</Text>
              </View>

              <View
                style={[styles.badge, { backgroundColor: urgencyColor + "20" }]}
              >
                <Text style={[styles.badgeText, { color: urgencyColor }]}>
                  {timeLabel}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16, // Reduced from 18
    fontWeight: "bold",
    color: colors.text,
    marginLeft: 20,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingRight: 10,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 10, // Reduced from 12
    borderRadius: 14, // Reduced radius slightly
    marginRight: 10,
    width: 120, // Reduced from 140
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 32, // Reduced from 40
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  info: {
    marginBottom: 6,
  },
  name: {
    fontSize: 12, // Reduced from 14
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  amount: {
    fontSize: 14, // Reduced from 16
    fontWeight: "bold",
    color: colors.text,
  },
  badge: {
    paddingVertical: 2, // Reduced
    paddingHorizontal: 6, // Reduced
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 10, // Reduced from 12
    fontWeight: "bold",
  },
  iconImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  iconText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14, // Reduced
  },
});
