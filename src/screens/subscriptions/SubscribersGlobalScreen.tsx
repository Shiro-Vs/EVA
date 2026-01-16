import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, db } from "../../config/firebaseConfig";
import { collection, query, getDocs } from "firebase/firestore";
import { Service } from "../../services/types";
import { format } from "date-fns";

// Types
interface DebtItem {
  id: string; // Debt ID
  month: string;
  amount: number;
  status: "pending" | "paid";
  serviceName: string;
  serviceId: string;
}

interface SubscriberRow {
  name: string;
  totalDebt: number;
  services: {
    serviceName: string;
    // New Branding Fields
    serviceIcon?: string | null;
    logoUrl?: string | null;
    serviceColor?: string | null;
    debts: DebtItem[];
  }[];
}

export default function SubscribersGlobalScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SubscriberRow[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);

    try {
      // 1. Get All Services
      const qServices = query(collection(db, "users", user.uid, "services"));
      const serviceSnaps = await getDocs(qServices);
      const services = serviceSnaps.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Service)
      );

      const subscribersMap: Record<string, SubscriberRow> = {};

      // 2. Iterate Services -> Subscribers -> Debts
      for (const service of services) {
        if (!service.shared) continue;

        const subCol = collection(
          db,
          "users",
          user.uid,
          "services",
          service.id!,
          "subscribers"
        );
        const subSnaps = await getDocs(subCol);

        for (const subDoc of subSnaps.docs) {
          const subData = subDoc.data();
          const nameKey = subData.name.trim();

          // Init map entry
          if (!subscribersMap[nameKey]) {
            subscribersMap[nameKey] = {
              name: nameKey,
              totalDebt: 0,
              services: [],
            };
          }

          // Fetch ALL Debts (History)
          const debtCol = collection(
            db,
            "users",
            user.uid,
            "services",
            service.id!,
            "subscribers",
            subDoc.id,
            "debts"
          );
          const debtSnaps = await getDocs(debtCol);

          const serviceDebts: DebtItem[] = [];
          debtSnaps.forEach((d) => {
            const dData = d.data();
            if (dData.status === "pending") {
              subscribersMap[nameKey].totalDebt += dData.amount;
            }
            serviceDebts.push({
              id: d.id,
              month: dData.month,
              amount: dData.amount,
              status: dData.status,
              serviceName: service.name,
              serviceId: service.id!,
            });
          });

          // Sort debts: Pending first, then by Month (approximated by insertion or simple string sort for now)
          // ideally we map month name to index if needed, but per user request, just listing them.
          serviceDebts.sort((a, b) => {
            if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
            return 0;
          });

          subscribersMap[nameKey].services.push({
            serviceName: service.name,
            serviceIcon: service.icon,
            logoUrl: service.logoUrl,
            serviceColor: service.color,
            debts: serviceDebts,
          });
        }
      }

      // 3. Flatten and Sort
      const sortedList = Object.values(subscribersMap).sort(
        (a, b) => b.totalDebt - a.totalDebt
      );
      setData(sortedList);
    } catch (e) {
      console.error("Error fetching global subscribers:", e);
      Alert.alert("Error", "No se pudo cargar la información global.");
    } finally {
      setLoading(false);
    }
  };

  const [expandedServices, setExpandedServices] = useState<
    Record<string, boolean>
  >({});

  const toggleExpand = (name: string) => {
    setExpandedUser(expandedUser === name ? null : name);
    // Optional: Collapse services when user collapses?
    // setExpandedServices({});
  };

  const toggleServiceExpand = (userName: string, serviceName: string) => {
    const key = `${userName}-${serviceName}`;
    setExpandedServices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderItem = ({ item }: { item: SubscriberRow }) => {
    const isExpanded = expandedUser === item.name;

    return (
      <View style={styles.cardContainer}>
        {/* Header Row (Subscriber) */}
        <TouchableOpacity
          style={[styles.rowHeader, isExpanded && styles.rowHeaderActive]}
          onPress={() => toggleExpand(item.name)}
          activeOpacity={0.7}
        >
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{item.name}</Text>
          </View>

          <View style={styles.debtInfo}>
            {item.totalDebt > 0 ? (
              <Text style={styles.debtText}>
                Debe S/ {item.totalDebt.toFixed(2)}
              </Text>
            ) : (
              <Text style={styles.paidText}>Al día</Text>
            )}
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {/* Expanded Content (Services List) */}
        {isExpanded && (
          <View style={styles.detailsContainer}>
            {item.services.map((svc, idx) => {
              const serviceKey = `${item.name}-${svc.serviceName}`;
              const isServiceExpanded = !!expandedServices[serviceKey];

              // Determine Icon
              const hasLogo = !!svc.logoUrl;

              return (
                <View key={idx} style={styles.serviceBlock}>
                  {/* Service Header (Sub-Accordion) */}
                  <TouchableOpacity
                    style={styles.serviceHeader}
                    onPress={() =>
                      toggleServiceExpand(item.name, svc.serviceName)
                    }
                    activeOpacity={0.6}
                  >
                    <View style={styles.serviceHeaderLeft}>
                      {/* Service Icon */}
                      <View
                        style={[
                          styles.serviceIconContainer,
                          { backgroundColor: svc.serviceColor || "#eee" },
                        ]}
                      >
                        {svc.serviceIcon ? (
                          <Ionicons
                            name={svc.serviceIcon as any}
                            size={14}
                            color="#fff"
                          />
                        ) : (
                          <Text style={styles.serviceInitial}>
                            {svc.serviceName.charAt(0)}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.serviceTitle}>{svc.serviceName}</Text>
                    </View>

                    <View style={styles.serviceHeaderRight}>
                      {/* Tiny Badge for Pending Count? */}
                      {svc.debts.some((d) => d.status === "pending") && (
                        <View style={styles.pendingBadge} />
                      )}
                      <Ionicons
                        name={isServiceExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={colors.textSecondary}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Debts List (Vertical) */}
                  {isServiceExpanded && (
                    <View style={styles.debtListContainer}>
                      {svc.debts.length > 0 ? (
                        svc.debts.map((debt, dIdx) => (
                          <View key={dIdx} style={styles.debtRow}>
                            <View style={styles.debtRowLeft}>
                              <View
                                style={[
                                  styles.statusDot,
                                  {
                                    backgroundColor:
                                      debt.status === "paid"
                                        ? colors.success
                                        : colors.error,
                                  },
                                ]}
                              />
                              <Text style={styles.monthText}>{debt.month}</Text>
                            </View>

                            <View style={styles.debtRowRight}>
                              {debt.status === "paid" ? (
                                <Text style={styles.paidLabel}>Pagado</Text>
                              ) : (
                                <Text style={styles.pendingLabel}>
                                  S/ {debt.amount.toFixed(2)}
                                </Text>
                              )}
                            </View>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.emptyText}>
                          Sin historial registrado.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión Global</Text>
        <Text style={styles.subtitle}>Historial de todos los suscriptores</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyList}>
              No se encontraron suscriptores.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
    paddingTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyList: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
  // Card Accordion
  cardContainer: {
    backgroundColor: colors.surface,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.surface,
  },
  rowHeaderActive: {
    backgroundColor: colors.surface, // Or a slightly lighter shade manually
    opacity: 0.9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "20", // transparent
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 18,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  debtInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  debtText: {
    color: colors.error,
    fontWeight: "bold",
  },
  paidText: {
    color: colors.success,
    fontWeight: "bold",
    fontSize: 12,
  },
  // Details
  detailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background, // Inner contrast
  },
  serviceBlock: {
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border + "40",
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.surface + "80",
  },
  serviceHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  serviceIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceInitial: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  serviceHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pendingBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
  // Debt List Vertical
  debtListContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
  },
  debtRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "20",
  },
  debtRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  monthText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  debtRowRight: {},
  paidLabel: {
    fontSize: 14,
    color: colors.success,
    fontWeight: "600",
  },
  pendingLabel: {
    fontSize: 14,
    color: colors.error,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 12,
    fontStyle: "italic",
    color: colors.textSecondary,
    marginVertical: 4,
  },
});
