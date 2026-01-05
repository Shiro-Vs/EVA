import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // Iconos bonitos

// Importamos el Tema
import { colors } from "./src/theme/colors";

// Importamos Pantallas
import SplashScreen from "./src/screens/SplashScreen"; // <--- Importamos Splash
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import WalletScreen from "./src/screens/WalletScreen";
import AccountDetailScreen from "./src/screens/AccountDetailScreen";
import ServicesScreen from "./src/screens/ServicesScreen";
import ServiceDetailScreen from "./src/screens/ServiceDetailScreen";
import SubscriberDetailScreen from "./src/screens/SubscriberDetailScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import AddTransactionScreen from "./src/screens/AddTransactionScreen";
import AddServiceScreen from "./src/screens/AddServiceScreen";

// Creación de los Navegadores
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ServiceStack = createNativeStackNavigator();
const WalletStack = createNativeStackNavigator();

// --- 1. Sub-Navegador para Servicios ---
function ServicesStackNavigator() {
  return (
    <ServiceStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <ServiceStack.Screen
        name="ServicesList"
        component={ServicesScreen}
        options={{ headerShown: false }}
      />
      <ServiceStack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{ title: "" }}
      />
      <ServiceStack.Screen
        name="SubscriberDetail"
        component={SubscriberDetailScreen}
        options={{ title: "Detalle Suscriptor" }}
      />
    </ServiceStack.Navigator>
  );
}

// --- 2. Sub-Navegador para Billetera ---
function WalletStackNavigator() {
  return (
    <WalletStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <WalletStack.Screen
        name="WalletList"
        component={WalletScreen}
        options={{ headerShown: false }}
      />
      <WalletStack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{ title: "Movimientos" }}
      />
    </WalletStack.Navigator>
  );
}

// --- 3. Navegador Principal de Pestañas ---
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === "Dashboard")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Servicios")
            iconName = focused ? "grid" : "grid-outline";
          else if (route.name === "Billetera")
            iconName = focused ? "wallet" : "wallet-outline";
          else if (route.name === "Perfil")
            iconName = focused ? "person" : "person-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Servicios" component={ServicesStackNavigator} />
      <Tab.Screen name="Billetera" component={WalletStackNavigator} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// --- 4. Navegador Raíz ---
export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    // Simular tiempo de carga de 3 segundos
    const timer = setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isShowSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Grupo: Autenticación */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Grupo: App Principal */}
        <Stack.Screen name="Home" component={MainTabs} />

        {/* Grupo: Modales */}
        <Stack.Group screenOptions={{ presentation: "modal" }}>
          <Stack.Screen
            name="AddTransaction"
            component={AddTransactionScreen}
          />
          <Stack.Screen name="AddService" component={AddServiceScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
