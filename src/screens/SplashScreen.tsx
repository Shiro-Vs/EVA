import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { colors } from "../theme/colors";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacidad inicial 0
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Escala inicial 0.8

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Logo */}
        <Image
          source={require("../../assets/logo-eva.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* Texto EVA */}
        <Text style={styles.text}>EVA</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", // Todo negro como pediste
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    flexDirection: "row", // Logo y texto en fila
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 80, // Tamaño ajustado
    height: 80,
    marginRight: 15, // Separación entre logo y texto
  },
  text: {
    color: "#FFFFFF", // Blanco
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: 2,
  },
});
