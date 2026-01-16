import React from "react";
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
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

interface Props {
  visible: boolean;
  onClose: () => void;
  imageUri: string | null;
}

export const ImageViewModal = ({ visible, onClose, imageUri }: Props) => {
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      translateY.setValue(0);
    }
  }, [visible]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      if (translationY > 100 || velocityY > 1000) {
        // Animate off screen
        Animated.timing(translateY, {
          toValue: Dimensions.get("window").height,
          duration: 200,
          useNativeDriver: true,
        }).start(onClose);
      } else {
        // Reset
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }).start();
      }
    }
  };

  if (!imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade" // Keep fade ensuring background fades in
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.closeArea}
            onPress={onClose}
            activeOpacity={1}
          >
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
              activeOffsetY={10}
              activeOffsetX={[-500, 500]}
            >
              <Animated.View
                style={[
                  styles.imageContainer,
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
                <TouchableWithoutFeedback onPress={onClose}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </TouchableWithoutFeedback>
              </Animated.View>
            </PanGestureHandler>
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)", // Fondo semitransparente
  },
  closeArea: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
