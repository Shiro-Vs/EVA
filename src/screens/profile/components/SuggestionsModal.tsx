import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { colors } from "../../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../../config/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { CustomAlertModal } from "../../../components/common/CustomAlertModal";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SuggestionsModal = ({ visible, onClose }: Props) => {
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  // Custom Alerts State
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Animation State
  const translateY = React.useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  React.useEffect(() => {
    if (visible) {
      // Slide UP animation on open
      translateY.setValue(Dimensions.get("window").height);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();

      // Reset fields
      setSuggestion("");
      setErrorTitle("");
      setErrorMessage("");
    }
  }, [visible]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      // Close threshold
      if (translationY > 150 || velocityY > 1000) {
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

  const handleSubmit = async () => {
    if (suggestion.trim().length < 10) {
      setErrorTitle("Muy corto");
      setErrorMessage("Por favor detalla un poco más tu sugerencia.");
      setShowErrorAlert(true);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "suggestions"), {
        userId: user?.uid || "anonymous",
        userEmail: user?.email || "anonymous",
        content: suggestion,
        createdAt: serverTimestamp(),
        status: "new",
      });

      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error sending suggestion:", error);
      setErrorTitle("Error");
      setErrorMessage(
        "No se pudo enviar la sugerencia. Intenta de nuevo más tarde."
      );
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none" // Handled manually
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
                    {/* Swipe Handle */}
                    <View style={styles.dragHandle} />

                    <View style={styles.header}>
                      <View style={styles.titleRow}>
                        <View style={styles.iconContainer}>
                          <Ionicons name="bulb" size={24} color="#FBC02D" />
                        </View>
                        <Text style={styles.title}>Sugerencias</Text>
                      </View>
                      <TouchableOpacity onPress={onClose} disabled={loading}>
                        <Ionicons name="close" size={24} color={colors.text} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.description}>
                      ¿Tienes alguna idea para mejorar EVA? ¡Cuéntanos! Leemos
                      todos los mensajes.
                    </Text>

                    <View style={styles.userInfo}>
                      <Text style={styles.label}>Enviando como:</Text>
                      <Text style={styles.userEmail}>{user?.email}</Text>
                    </View>

                    <TextInput
                      style={styles.input}
                      value={suggestion}
                      onChangeText={setSuggestion}
                      placeholder="Escribe tu sugerencia aquí..."
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                    />

                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        loading && styles.disabledButton,
                      ]}
                      onPress={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <Text style={styles.submitButtonText}>
                          Enviar Sugerencia
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </PanGestureHandler>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </GestureHandlerRootView>

      {/* Error / Validation Alert */}
      <CustomAlertModal
        visible={showErrorAlert}
        title={errorTitle}
        message={errorMessage}
        onClose={() => setShowErrorAlert(false)}
        variant="info"
        confirmText="Entendido"
      />

      {/* Success Alert */}
      <CustomAlertModal
        visible={showSuccessAlert}
        title="¡Gracias!"
        message="Hemos recibido tu sugerencia. La tomaremos en cuenta para futuras actualizaciones."
        onClose={() => {
          setShowSuccessAlert(false);
          setSuggestion("");
          onClose();
        }}
        variant="info"
        confirmText="Genial"
      />
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
    minHeight: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#CCC",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    backgroundColor: "#FFF9C4",
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
    lineHeight: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
