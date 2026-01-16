import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { colors } from "../../../theme/colors";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const LEVELS = [
  {
    name: "Bronce",
    icon: "trophy-outline",
    color: "#CD7F32",
    bg: "#FFF8E1",
    req: "Crea tu cuenta.",
    done: true,
  },
  {
    name: "Plata",
    icon: "medal-outline",
    color: "#9E9E9E",
    bg: "#F5F5F5",
    req: "Registra 10 transacciones.",
    done: false,
  },
  {
    name: "Oro",
    icon: "star-outline",
    color: "#FFD700",
    bg: "#FFFDE7",
    req: "Ahorra el 20% de tus ingresos mes a mes.",
    done: false,
  },
  {
    name: "Platino",
    icon: "diamond-outline",
    color: "#E1F5FE",
    bg: "#E0F7FA",
    req: "Mantén una racha de ahorro por 6 meses.",
    done: false,
  },
];

export const UserLevelModal = ({ visible, onClose }: Props) => {
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

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
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
                      styles.modalContent,
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

                    <View style={styles.header}>
                      <View style={styles.titleRow}>
                        <View style={styles.iconContainer}>
                          <Ionicons name="podium" size={24} color="#673AB7" />
                        </View>
                        <Text style={styles.title}>Niveles de Usuario</Text>
                      </View>
                      <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={colors.text} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.description}>
                      Desbloquea nuevos niveles mejorando tus hábitos
                      financieros.
                    </Text>

                    <ScrollView
                      style={{ maxHeight: 500 }} // Increased visible area
                      contentContainerStyle={{ paddingBottom: 50 }}
                    >
                      {LEVELS.map((level, index) => (
                        <View
                          key={index}
                          style={[
                            styles.levelCard,
                            {
                              backgroundColor: colors.surface,
                              borderColor: level.color,
                              borderLeftWidth: 4, // Accent on the left
                            },
                            !level.done && {
                              opacity: 0.6,
                              borderColor: colors.border,
                              borderLeftWidth: 1,
                            },
                          ]}
                        >
                          <View style={styles.levelHeader}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <View
                                style={{
                                  padding: 8,
                                  borderRadius: 8,
                                  backgroundColor: level.bg, // Keep icon bg
                                }}
                              >
                                <Ionicons
                                  name={level.icon as any}
                                  size={20}
                                  color={level.color}
                                />
                              </View>
                              <Text
                                style={[
                                  styles.levelName,
                                  { color: level.color },
                                ]}
                              >
                                {level.name}
                              </Text>
                            </View>
                            {level.done ? (
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color="#4CAF50"
                              />
                            ) : (
                              <Ionicons
                                name="lock-closed"
                                size={16}
                                color={colors.textSecondary}
                              />
                            )}
                          </View>
                          <Text style={styles.levelReq}>{level.req}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </Animated.View>
                </PanGestureHandler>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 550, // Increased height
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#CCC",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    backgroundColor: "#EDE7F6",
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  levelCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  levelName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  levelReq: {
    fontSize: 13,
    color: colors.text,
  },
});
