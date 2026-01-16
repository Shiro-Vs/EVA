import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { colors } from "../../../theme/colors";

interface AddSubscriberModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, quota: string) => void;
}

export const AddSubscriberModal = ({
  visible,
  onClose,
  onSubmit,
}: AddSubscriberModalProps) => {
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
  const [subName, setSubName] = useState("");
  const [subQuota, setSubQuota] = useState("");

  const handleSave = () => {
    onSubmit(subName, subQuota);
    // Limpiar al guardar o cerrar
    setSubName("");
    setSubQuota("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={localStyles.overlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={localStyles.keyboardContainer}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ width: "100%" }}>
                  <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                    activeOffsetY={10}
                    activeOffsetX={[-500, 500]}
                  >
                    <Animated.View
                      style={[
                        localStyles.content,
                        {
                          transform: [
                            {
                              translateY: translateY.interpolate({
                                inputRange: [
                                  0,
                                  Dimensions.get("window").height,
                                ],
                                outputRange: [
                                  0,
                                  Dimensions.get("window").height,
                                ],
                                extrapolate: "clamp",
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <View style={localStyles.dragHandle} />
                      <Text style={localStyles.title}>Agregar Suscriptor</Text>

                      <View style={localStyles.form}>
                        <Text style={localStyles.label}>Nombre</Text>
                        <TextInput
                          style={localStyles.input}
                          placeholder="Ej: Juan"
                          placeholderTextColor={colors.textSecondary}
                          value={subName}
                          onChangeText={setSubName}
                          autoFocus
                        />

                        <Text style={localStyles.label}>
                          Cuota Mensual (S/)
                        </Text>
                        <TextInput
                          style={localStyles.input}
                          placeholder="0.00"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="numeric"
                          value={subQuota}
                          onChangeText={setSubQuota}
                        />
                        <Text style={localStyles.note}>
                          * Se creará la deuda de este mes automáticamente.
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={handleSave}
                        style={localStyles.button}
                      >
                        <Text style={localStyles.buttonText}>Guardar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={onClose}
                        style={localStyles.cancelButton}
                      >
                        <Text style={localStyles.cancelText}>Cancelar</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  </PanGestureHandler>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </GestureHandlerRootView>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  keyboardContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#CCC",
    borderRadius: 3,
    marginBottom: 20,
    alignSelf: "center",
  },
  content: {
    width: "100%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    color: colors.text,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: -8,
    marginLeft: 4,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    padding: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
