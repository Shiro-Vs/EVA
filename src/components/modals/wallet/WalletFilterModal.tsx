import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { colors } from "../../../theme/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface WalletFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    months: string[];
    categories: string[];
    services: string[];
    subscribers: string[];
    accounts: string[];
  }) => void;
  onClear: () => void;
  uniqueCategories: { name: string; icon: string; color?: string }[];
  uniqueServices: {
    name: string;
    icon?: string;
    color?: string;
    iconLibrary?: string;
  }[];
  uniqueSubscribers: { name: string; color?: string }[];
  uniqueAccounts: { name: string; icon?: string; color?: string }[];
  activeFilters: {
    months: string[];
    categories: string[];
    services: string[];
    subscribers: string[];
    accounts: string[];
  };
}

export const WalletFilterModal = ({
  visible,
  onClose,
  onApply,
  onClear,
  uniqueCategories,
  uniqueServices,
  uniqueSubscribers,
  uniqueAccounts,
  activeFilters,
}: WalletFilterModalProps) => {
  // Local State
  const [selectedDisplayMonths, setSelectedDisplayMonths] = useState<string[]>(
    activeFilters.months || [] // Safety check
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    activeFilters.categories
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(
    activeFilters.services
  );
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>(
    activeFilters.subscribers
  );
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    activeFilters.accounts || []
  );

  // Grid Year State - Default to first selected month year or current year
  const [displayYear, setDisplayYear] = useState(() => {
    if (activeFilters.months.length > 0) {
      return parseInt(activeFilters.months[0].split("-")[0]);
    }
    return new Date().getFullYear();
  });

  // Animation State (useNativeDriver: true for fluidity)
  const translateY = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  // We use this to detect if we are at top of scroll to enable/disable gesture if needed
  // BUT the user wants "Add Transaction" behavior which uses activeOffsetY mostly.
  // We'll keep isScrollAtTop to be safe if activeOffsetY isn't enough for the scrollview conflict.
  const isScrollAtTop = useRef(true);

  useEffect(() => {
    if (visible) {
      // Slide UP animation on open
      translateY.setValue(Dimensions.get("window").height);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();

      isScrollAtTop.current = true;
      setSelectedDisplayMonths(activeFilters.months);
      // Determine year to show
      if (activeFilters.months.length > 0) {
        setDisplayYear(parseInt(activeFilters.months[0].split("-")[0]));
      } else {
        setDisplayYear(new Date().getFullYear());
      }

      setSelectedCategories(activeFilters.categories);
      setSelectedServices(activeFilters.services);
      setSelectedSubscribers(activeFilters.subscribers);
      setSelectedAccounts(activeFilters.accounts || []);
    }
  }, [visible, activeFilters]);

  // Gesture Handlers
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      // Close threshold
      if (translationY > 150 || velocityY > 1000) {
        // Animate off screen then call onClose
        Animated.timing(translateY, {
          toValue: Dimensions.get("window").height,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onClose());
      } else {
        // Spring back
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }).start();
      }
    }
  };

  // Handlers
  const handleApply = () => {
    onApply({
      months: selectedDisplayMonths,
      categories: selectedCategories,
      services: selectedServices,
      subscribers: selectedSubscribers,
      accounts: selectedAccounts,
    });
    // Animate closing manually could include calling onClose which implies unmounting or prop change.
    // Ideally we animate out before closing prop, but onClose usually just unmounts Modal.
    // For smoothness, better to just onClose() and let Modal unmount/slide (if Modal has animationType).
    // Modal has animationType="slide". If we animate translateY, we might conflict or double animate.
    // HOWEVER, typical bottom sheet usage with GestureHandler suggests implementing custom animation.
    // The previous code used Modal animationType="slide".
    // If we want "drag to dismiss", we need to control the position.
    // When opening, Modal "slide" handles it. When dragging, WE handle it.
    // We should probably set Modal animationType="none" and handle entrace/exit ourselves OR
    // stick to "slide" but sync our translateY? Syncing is hard.
    // Better: Modal transparent={true} animationType="fade" (for bg) and we slide the view.
    onClose();
  };

  const handleClear = () => {
    setSelectedDisplayMonths([]);
    setSelectedCategories([]);
    setSelectedServices([]);
    setSelectedSubscribers([]);
    setSelectedAccounts([]);
    onClear();
    onClose();
  };

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const toggleAccount = (name: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const toggleService = (name: string) => {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const toggleSubscriber = (name: string) => {
    setSelectedSubscribers((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  // Removed unused Single-Date logic (nextMonth, prevMonth)

  // Removed monthName calculation

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none" // We handle animation
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              {/* Wrapper for Gesture Handler to capture event properly */}
              <View style={{ width: "100%" }}>
                <PanGestureHandler
                  onGestureEvent={onGestureEvent}
                  onHandlerStateChange={onHandlerStateChange}
                  activeOffsetY={10} // Drag down threshold
                  activeOffsetX={[-500, 500]} // Ignore horizontal
                >
                  <Animated.View
                    style={[
                      styles.container,
                      {
                        transform: [
                          {
                            translateY: translateY.interpolate({
                              inputRange: [0, Dimensions.get("window").height],
                              outputRange: [0, Dimensions.get("window").height],
                              extrapolate: "clamp",
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {/* Draggable Header Zone (Handle + Title) */}
                    <View style={styles.draggableHeader}>
                      {/* Drag Handle */}
                      <View style={styles.dragVerifyContainer}>
                        <View style={styles.dragHandle} />
                      </View>

                      <View style={styles.header}>
                        <Text style={styles.title}>Filtros</Text>
                        <TouchableOpacity onPress={onClose}>
                          <Ionicons
                            name="close"
                            size={24}
                            color={colors.text}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <ScrollView
                      style={{ maxHeight: 600 }}
                      scrollEventThrottle={16}
                      onScroll={(event) => {
                        const yOffset = event.nativeEvent.contentOffset.y;
                        isScrollAtTop.current = yOffset <= 0;
                      }}
                    >
                      {/* Date Section - Grid Layout */}
                      <View style={styles.section}>
                        <View style={styles.dateHeader}>
                          <Text style={styles.sectionTitle}>Fecha</Text>
                          <TouchableOpacity
                            onPress={() => setSelectedDisplayMonths([])}
                            style={[
                              styles.allHistoryBadge,
                              selectedDisplayMonths.length === 0 &&
                                styles.allHistoryBadgeActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.allHistoryText,
                                selectedDisplayMonths.length === 0 &&
                                  styles.allHistoryTextActive,
                              ]}
                            >
                              Todo el Historial
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.calendarContainer}>
                          {/* Year Selector */}
                          <View style={styles.yearSelector}>
                            <TouchableOpacity
                              onPress={() => setDisplayYear((y) => y - 1)}
                              style={styles.yearArrow}
                            >
                              <Ionicons
                                name="chevron-back"
                                size={20}
                                color={colors.textSecondary}
                              />
                            </TouchableOpacity>
                            <Text style={styles.yearText}>{displayYear}</Text>
                            <TouchableOpacity
                              onPress={() => setDisplayYear((y) => y + 1)}
                              style={styles.yearArrow}
                            >
                              <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={colors.textSecondary}
                              />
                            </TouchableOpacity>
                          </View>

                          {/* Month Scroll List */}
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                          >
                            {[
                              "Ene",
                              "Feb",
                              "Mar",
                              "Abr",
                              "May",
                              "Jun",
                              "Jul",
                              "Ago",
                              "Sep",
                              "Oct",
                              "Nov",
                              "Dic",
                            ].map((monthStr, index) => {
                              // Key Format: YYYY-MM
                              const monthKey = `${displayYear}-${String(
                                index + 1
                              ).padStart(2, "0")}`;
                              const isSelected =
                                selectedDisplayMonths.includes(monthKey);

                              return (
                                <TouchableOpacity
                                  key={monthKey}
                                  style={[
                                    styles.monthChip,
                                    isSelected && styles.monthChipSelected,
                                  ]}
                                  onPress={() => {
                                    // Toggle logic
                                    setSelectedDisplayMonths((prev) => {
                                      if (prev.includes(monthKey)) {
                                        return prev.filter(
                                          (m) => m !== monthKey
                                        );
                                      } else {
                                        return [...prev, monthKey];
                                      }
                                    });
                                  }}
                                >
                                  <View
                                    style={[
                                      styles.monthIconCircle,
                                      isSelected && {
                                        backgroundColor:
                                          "rgba(255,255,255,0.2)",
                                      },
                                    ]}
                                  >
                                    <Ionicons
                                      name={
                                        isSelected
                                          ? "calendar"
                                          : "calendar-outline"
                                      }
                                      size={16}
                                      color={
                                        isSelected
                                          ? "#FFF"
                                          : colors.textSecondary
                                      }
                                    />
                                  </View>
                                  <Text
                                    style={[
                                      styles.monthChipText,
                                      isSelected &&
                                        styles.monthChipTextSelected,
                                    ]}
                                  >
                                    {monthStr}
                                  </Text>
                                  {isSelected && (
                                    <View
                                      style={{
                                        position: "absolute",
                                        top: 4,
                                        right: 4,
                                      }}
                                    >
                                      <Ionicons
                                        name="checkmark-circle"
                                        size={12}
                                        color="#FFF"
                                      />
                                    </View>
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        </View>
                      </View>

                      {/* Payment Methods (Accounts) */}
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Medios de Pago</Text>
                        {uniqueAccounts && uniqueAccounts.length > 0 ? (
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                          >
                            {uniqueAccounts.map((acc) => {
                              const isSelected = selectedAccounts.includes(
                                acc.name
                              );
                              const accColor = acc.color || colors.primary;
                              return (
                                <TouchableOpacity
                                  key={acc.name}
                                  style={[
                                    styles.chip,
                                    isSelected && {
                                      backgroundColor: accColor + "20",
                                      borderColor: accColor,
                                    },
                                    !isSelected && {
                                      borderColor: colors.border,
                                      backgroundColor: colors.surface,
                                    },
                                  ]}
                                  onPress={() => toggleAccount(acc.name)}
                                >
                                  <View
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: 12,
                                      backgroundColor: accColor + "20",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      marginRight: 8,
                                    }}
                                  >
                                    <Ionicons
                                      name={(acc.icon || "wallet") as any}
                                      size={14}
                                      color={accColor}
                                    />
                                  </View>
                                  <Text
                                    style={[
                                      styles.chipText,
                                      isSelected && {
                                        color: accColor,
                                        fontWeight: "bold",
                                      },
                                    ]}
                                  >
                                    {acc.name}
                                  </Text>
                                  {isSelected && (
                                    <Ionicons
                                      name="checkmark-circle"
                                      size={16}
                                      color={accColor}
                                      style={{ marginLeft: 6 }}
                                    />
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        ) : (
                          <Text style={styles.emptyText}>
                            No hay cuentas disponibles.
                          </Text>
                        )}
                      </View>

                      {/* Categories - Horizontal Scroll */}
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Categorías</Text>
                        {uniqueCategories.length > 0 ? (
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                          >
                            {uniqueCategories.map((cat) => {
                              const isSelected = selectedCategories.includes(
                                cat.name
                              );
                              const catColor = cat.color || colors.primary;

                              return (
                                <TouchableOpacity
                                  key={cat.name}
                                  style={[
                                    styles.chip,
                                    isSelected && {
                                      backgroundColor: catColor + "20",
                                      borderColor: catColor,
                                    },
                                    !isSelected && {
                                      borderColor: colors.border,
                                      backgroundColor: colors.surface,
                                    },
                                  ]}
                                  onPress={() => toggleCategory(cat.name)}
                                >
                                  <View
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: 12,
                                      backgroundColor: catColor + "20",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      marginRight: 8,
                                    }}
                                  >
                                    <Ionicons
                                      name={(cat.icon || "pricetag") as any}
                                      size={14}
                                      color={catColor}
                                    />
                                  </View>
                                  <Text
                                    style={[
                                      styles.chipText,
                                      isSelected && {
                                        color: catColor,
                                        fontWeight: "bold",
                                      },
                                    ]}
                                  >
                                    {cat.name}
                                  </Text>
                                  {isSelected && (
                                    <Ionicons
                                      name="checkmark-circle"
                                      size={16}
                                      color={catColor}
                                      style={{ marginLeft: 6 }}
                                    />
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        ) : (
                          <Text style={styles.emptyText}>
                            No hay categorías disponibles.
                          </Text>
                        )}
                      </View>

                      {/* Services */}
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Suscripciones</Text>
                        {uniqueServices.length > 0 ? (
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                          >
                            {uniqueServices.map((svc) => {
                              const isSelected = selectedServices.includes(
                                svc.name
                              );
                              const displayColor = svc.color || "#8E44AD";

                              return (
                                <TouchableOpacity
                                  key={svc.name}
                                  style={[
                                    styles.chip,
                                    isSelected && {
                                      backgroundColor: displayColor + "20",
                                      borderColor: displayColor,
                                    },
                                    !isSelected && {
                                      borderColor: colors.border,
                                      backgroundColor: colors.surface,
                                    },
                                  ]}
                                  onPress={() => toggleService(svc.name)}
                                >
                                  <View
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: 12,
                                      backgroundColor: displayColor + "20",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      marginRight: 8,
                                    }}
                                  >
                                    {svc.iconLibrary ===
                                    "MaterialCommunityIcons" ? (
                                      <MaterialCommunityIcons
                                        name={(svc.icon || "tv") as any}
                                        size={14}
                                        color={displayColor}
                                      />
                                    ) : (
                                      <Ionicons
                                        name={(svc.icon || "tv-outline") as any}
                                        size={14}
                                        color={displayColor}
                                      />
                                    )}
                                  </View>
                                  <Text
                                    style={[
                                      styles.chipText,
                                      isSelected && {
                                        color: displayColor,
                                        fontWeight: "bold",
                                      },
                                    ]}
                                  >
                                    {svc.name}
                                  </Text>
                                  {isSelected && (
                                    <Ionicons
                                      name="checkmark-circle"
                                      size={16}
                                      color={displayColor}
                                      style={{ marginLeft: 6 }}
                                    />
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        ) : (
                          <Text style={styles.emptyText}>
                            No hay suscripciones registradas.
                          </Text>
                        )}
                      </View>

                      {/* Subscribers */}
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Suscriptores</Text>
                        {uniqueSubscribers.length > 0 ? (
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                          >
                            {uniqueSubscribers.map((sub) => {
                              const isSelected = selectedSubscribers.includes(
                                sub.name
                              );
                              const subColor = sub.color || colors.primary;
                              const initial = sub.name.charAt(0).toUpperCase();

                              return (
                                <TouchableOpacity
                                  key={sub.name}
                                  style={[
                                    styles.chip,
                                    isSelected && {
                                      backgroundColor: subColor + "20",
                                      borderColor: subColor,
                                    },
                                    !isSelected && {
                                      borderColor: colors.border,
                                      backgroundColor: colors.surface,
                                    },
                                  ]}
                                  onPress={() => toggleSubscriber(sub.name)}
                                >
                                  <View
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: 12,
                                      backgroundColor: subColor + "20",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      marginRight: 8,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: subColor,
                                        fontSize: 12,
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {initial}
                                    </Text>
                                  </View>
                                  <Text
                                    style={[
                                      styles.chipText,
                                      isSelected && {
                                        color: subColor,
                                        fontWeight: "bold",
                                      },
                                    ]}
                                  >
                                    {sub.name}
                                  </Text>
                                  {isSelected && (
                                    <Ionicons
                                      name="checkmark-circle"
                                      size={16}
                                      color={subColor}
                                      style={{ marginLeft: 6 }}
                                    />
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        ) : (
                          <Text style={styles.emptyText}>
                            No hay suscriptores registrados.
                          </Text>
                        )}
                      </View>
                    </ScrollView>

                    <View style={styles.footer}>
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClear}
                      >
                        <Text style={styles.clearButtonText}>Restablecer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.applyButton}
                        onPress={handleApply}
                      >
                        <Text style={styles.applyButtonText}>
                          Aplicar Filtros
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </PanGestureHandler>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    width: "100%",
  },
  draggableHeader: {
    // Increase hit slop visually by ensuring it takes space
    paddingBottom: 10,
    backgroundColor: "transparent", // Explicitly interactive
  },
  dragVerifyContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    marginTop: -10, // Pull up slightly
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  allHistoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  allHistoryBadgeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  allHistoryText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  allHistoryTextActive: {
    color: "#FFF",
    fontWeight: "bold",
  },
  calendarContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  yearSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    gap: 20,
  },
  yearArrow: {
    padding: 5,
  },
  yearText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  monthButton: {
    width: "30%", // Approx 3 columns
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  monthButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  monthText: {
    fontSize: 14,
    color: colors.text,
  },
  monthTextSelected: {
    color: "#FFF",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 5,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 20,
  },
  // Category Card Style
  categoryCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 90,
    marginRight: 0, // handled by gap
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: colors.text,
    textAlign: "center",
    fontWeight: "500",
  },
  // General Chips
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 14,
  },
  chipTextSelected: {
    color: colors.background, // Assuming dark text on primary or vice versa.
    // Usually primary is distinct. If text is white, active text should be black or white.
    // Let's assume white text when selected if primary is dark, or dark if primary is light.
    // Safest is white if primary is a color.
    fontWeight: "bold",
  },
  // Month Chip (Scrollable)
  monthChip: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.surface, // or background
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 70,
    height: 70,
  },
  monthChipSelected: {
    backgroundColor: colors.primary + "15", // Transparent primary
    borderColor: colors.primary,
  },
  monthIconCircle: {
    marginBottom: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  monthChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  monthChipTextSelected: {
    color: colors.primary,
    fontWeight: "bold",
  },

  // Clean up unused grid styles if needed, but keeping for safety/fallback if reverting is requested
  footer: {
    flexDirection: "row",
    marginTop: 20,
    gap: 15,
  },
  applyButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  clearButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error,
    flex: 1,
  },
  clearButtonText: {
    color: colors.error,
    fontWeight: "bold",
    fontSize: 16,
  },
});
