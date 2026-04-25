import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Appearance,
  Image, // Cambiado a Image nativo para sincronización total
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  withDelay,
} from "react-native-reanimated";
import { useColorScheme } from "nativewind";
import { Colors } from "../../constants/Colors";

const LOGO_LIGHT_BG = require("../../../assets/LogoEVA_Fclaro.png");
const LOGO_DARK_BG = require("../../../assets/LogoEVA_Foscuro.png");

interface LoadingSplashProps {
  onAnimationComplete?: () => void;
  isReady?: boolean;
}

export default function LoadingSplash({
  onAnimationComplete,
  isReady,
}: LoadingSplashProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Forzamos colores de tema claro para el splash por defecto para consistencia
  const themeColors = Colors.light;
  const logoSource = LOGO_LIGHT_BG;
  const textColor = "#1F7ECC"; // Azul EVA

  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.85);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Entrada fluida (600ms)
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    contentScale.value = withDelay(100, withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    }));
  }, []);

  useEffect(() => {
    if (isReady) {
      containerOpacity.value = withTiming(
        0,
        {
          duration: 400, // Salida rápida (400ms)
          easing: Easing.inOut(Easing.quad),
        },
        (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        },
      );
    }
  }, [isReady]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    backgroundColor: themeColors.background,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.content, contentStyle]}>
        <Image 
          source={logoSource} 
          style={styles.logo} 
          resizeMode="contain"
          fadeDuration={0}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 250, // Logo más grande
    height: 250,
  },
});
