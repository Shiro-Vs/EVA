import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useColorScheme } from "nativewind";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withTiming,
  withSequence
} from "react-native-reanimated";

export default function EVATabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Animación de pulso para el botón central
  const scale = useSharedValue(1);
  const auraScale = useSharedValue(1);
  const auraOpacity = useSharedValue(0.5);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const auraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: auraScale.value }],
    opacity: auraOpacity.value,
  }));

  useEffect(() => {
    // Pulso del botón principal
    scale.value = withRepeat(
      withTiming(1.1, { duration: 1200 }), 
      -1, 
      true
    );

    // Animación del Aura (onda expansiva)
    auraScale.value = withRepeat(
      withTiming(1.35, { duration: 1500 }), 
      -1, 
      false
    );
    auraOpacity.value = withRepeat(
      withTiming(0, { duration: 1500 }), 
      -1, 
      false
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={[
        styles.tabBar, 
        { backgroundColor: isDark ? "#121A21" : "#FFFFFF" }
      ]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Botón Central (Add)
          if (route.name === "add") {
            return (
                <View key={route.key} style={styles.centerButtonContainer}>
                  {/* Aura / Onda Expansiva */}
                  <Animated.View style={[styles.aura, auraStyle]} />
                  
                  {/* Botón Principal */}
                  <TouchableOpacity
                    onPress={onPress}
                    activeOpacity={0.8}
                  >
                    <Animated.View style={[styles.centerButton, animatedStyle]}>
                      <Ionicons name="add" size={32} color="white" />
                    </Animated.View>
                  </TouchableOpacity>
                </View>
            );
          }

          // Iconos normales
          const getIcon = (name: string, focused: boolean) => {
            const color = focused ? "#1F7ECC" : "#8F99A1";
            let iconName: any = "help-circle";

            if (name === "index") iconName = focused ? "grid" : "grid-outline";
            if (name === "planning") iconName = focused ? "receipt" : "receipt-outline";
            if (name === "goals") iconName = focused ? "pie-chart" : "pie-chart-outline";
            if (name === "profile") iconName = focused ? "person-circle" : "person-circle-outline";

            return <Ionicons name={iconName} size={24} color={color} />;
          };

          const labelText = typeof label === "string" ? label : route.name;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {getIcon(route.name, isFocused)}
              <Text style={[
                styles.tabLabel, 
                { color: isFocused ? "#1F7ECC" : "#8F99A1" }
              ]}>
                {labelText === "index" ? "Inicio" : labelText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  tabBar: {
    flexDirection: "row",
    height: 65,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    width: "100%",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: "Asap-Medium",
  },
  centerButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    top: -20,
  },
  aura: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1F7ECC",
  },
  centerButton: {
    width: 60,
    height: 60,
    backgroundColor: "#1F7ECC",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1F7ECC",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  }
});
