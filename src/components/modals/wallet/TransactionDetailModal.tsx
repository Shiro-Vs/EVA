import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { Transaction } from "../../../services/transactionService";

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  onClose,
}) => {
  // Animation State
  const translateY = React.useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  React.useEffect(() => {
    if (visible) {
      translateY.setValue(Dimensions.get("window").height);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    }
  }, [visible]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      if (translationY > 150 || velocityY > 1000) {
        Animated.timing(translateY, {
          toValue: Dimensions.get("window").height,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onClose());
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }).start();
      }
    }
  };

  if (!transaction) return null;

  const isIncome = transaction.type === "income";
  const color = isIncome ? colors.success : colors.secondary;
  const icon = isIncome ? "arrow-up" : "arrow-down";

  // Format Date
  const dateObj = new Date(transaction.date);
  const dateStr = dateObj.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = dateObj.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={{ width: "100%" }}>
                <PanGestureHandler
                  onGestureEvent={onGestureEvent}
                  onHandlerStateChange={onHandlerStateChange}
                  activeOffsetY={10}
                  activeOffsetX={[-500, 500]}
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
                    <View style={styles.dragHandle} />

                    {/* Header: Amount & Icon */}
                    <View style={styles.header}>
                      <View
                        style={[
                          styles.iconCircle,
                          {
                            backgroundColor: isIncome
                              ? "rgba(76, 175, 80, 0.1)"
                              : "rgba(255, 68, 68, 0.1)",
                          },
                        ]}
                      >
                        <Ionicons name={icon} size={32} color={color} />
                      </View>
                      <Text style={[styles.amount, { color }]}>
                        {isIncome ? "+" : "-"} S/{" "}
                        {transaction.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.typeLabel}>
                        {isIncome ? "Ingreso" : "Egreso"}
                      </Text>
                    </View>

                    <ScrollView style={styles.detailsContainer}>
                      {/* Account */}
                      <View style={styles.row}>
                        <View style={styles.iconBox}>
                          <Ionicons
                            name="wallet-outline"
                            size={20}
                            color={colors.textSecondary}
                          />
                        </View>
                        <View style={styles.infoBox}>
                          <Text style={styles.label}>Cuenta</Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {/* Use account icon if available, or generic */}
                            <Text style={styles.value}>
                              {transaction.accountName}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Category */}
                      <View style={styles.row}>
                        <View style={styles.iconBox}>
                          <Ionicons
                            name="grid-outline"
                            size={20}
                            color={colors.textSecondary}
                          />
                        </View>
                        <View style={styles.infoBox}>
                          <Text style={styles.label}>Categoría</Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {transaction.categoryIcon && (
                              <Ionicons
                                name={transaction.categoryIcon as any}
                                size={16}
                                color={transaction.categoryColor || colors.text}
                              />
                            )}
                            <Text style={styles.value}>
                              {transaction.categoryName || "Sin Categoría"}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Service - if available */}
                      {transaction.serviceName && (
                        <View style={styles.row}>
                          <View style={styles.iconBox}>
                            <Ionicons
                              name="tv-outline"
                              size={20}
                              color={colors.textSecondary}
                            />
                          </View>
                          <View style={styles.infoBox}>
                            <Text style={styles.label}>Servicio</Text>
                            <Text style={styles.value}>
                              {transaction.serviceName}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Subscriber - if available */}
                      {transaction.subscriberName && (
                        <View style={styles.row}>
                          <View style={styles.iconBox}>
                            <Ionicons
                              name="person-outline"
                              size={20}
                              color={colors.textSecondary}
                            />
                          </View>
                          <View style={styles.infoBox}>
                            <Text style={styles.label}>Suscriptor</Text>
                            <Text style={styles.value}>
                              {transaction.subscriberName}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Date */}
                      <View style={styles.row}>
                        <View style={styles.iconBox}>
                          <Ionicons
                            name="calendar-outline"
                            size={20}
                            color={colors.textSecondary}
                          />
                        </View>
                        <View style={styles.infoBox}>
                          <Text style={styles.label}>Fecha y Hora</Text>
                          <Text style={styles.value}>{dateStr}</Text>
                          <Text style={styles.subValue}>{timeStr}</Text>
                        </View>
                      </View>

                      {/* Description / Note */}
                      <View style={[styles.row, { borderBottomWidth: 0 }]}>
                        <View style={styles.iconBox}>
                          <Ionicons
                            name="document-text-outline"
                            size={20}
                            color={colors.textSecondary}
                          />
                        </View>
                        <View style={styles.infoBox}>
                          <Text style={styles.label}>Nota</Text>
                          <Text style={styles.note}>
                            {transaction.description}
                          </Text>
                        </View>
                      </View>
                    </ScrollView>

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={onClose}
                    >
                      <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
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
    width: "100%",
    padding: 24,
    alignItems: "center",
    paddingBottom: 40,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#CCC",
    borderRadius: 3,
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    paddingBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  amount: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailsContainer: {
    width: "100%",
    maxHeight: 300,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  iconBox: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  infoBox: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  subValue: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  note: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
});
