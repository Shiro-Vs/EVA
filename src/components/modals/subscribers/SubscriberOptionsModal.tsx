import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  StyleSheet,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { styles as importedStyles } from "../../../screens/subscriptions/subscribers/styles/SubscriberDetailStyles";
import { colors } from "../../../theme/colors";

interface SubscriberOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const SubscriberOptionsModal = ({
  visible,
  onClose,
  onEdit,
  onDelete,
}: SubscriberOptionsModalProps) => {
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
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={localStyles.modalOverlay}>
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
                      importedStyles.modalContent,
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
                        backgroundColor: colors.background, // Ensure bg is set
                        paddingBottom: 40, // Extra padding for bottom safe area
                      },
                    ]}
                  >
                    <View style={localStyles.dragHandle} />
                    <Text style={importedStyles.modalTitle}>
                      Opciones del Suscriptor
                    </Text>

                    <TouchableOpacity
                      style={importedStyles.optionButton}
                      onPress={() => {
                        onClose();
                        onEdit();
                      }}
                    >
                      <Ionicons name="pencil" size={20} color={colors.text} />
                      <Text style={importedStyles.optionText}>
                        Editar Suscriptor
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={importedStyles.optionButton}
                      onPress={() => {
                        onClose();
                        onDelete();
                      }}
                    >
                      <Ionicons
                        name="trash"
                        size={20}
                        color={colors.secondary}
                      />
                      <Text
                        style={[
                          importedStyles.optionText,
                          { color: colors.secondary },
                        ]}
                      >
                        Eliminar Suscriptor
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        importedStyles.optionButton,
                        { borderBottomWidth: 0 },
                      ]}
                      onPress={onClose}
                    >
                      <Text style={importedStyles.optionTextCancel}>
                        Cancelar
                      </Text>
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

const localStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#CCC",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
    marginTop: -10, // Adjust layout as the original modalContent might have padding
  },
});
