import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // Iconos bonitos

// Importamos el Tema
// Importamos el Tema
import { colors } from "./src/theme/colors";

// Importamos Pantallas
import SplashScreen from "./src/screens/auth/SplashScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";

// Main
import HomeScreen from "./src/screens/main/HomeScreen";
import ProfileScreen from "./src/screens/main/ProfileScreen";

// Wallet
import WalletScreen from "./src/screens/wallet/WalletScreen";
import AccountDetailScreen from "./src/screens/wallet/AccountDetailScreen";
import AddTransactionScreen from "./src/screens/wallet/AddTransactionScreen";

// Services
import ServicesScreen from "./src/screens/services/ServicesScreen";
import ServiceDetailScreen from "./src/screens/services/ServiceDetailScreen";
import SubscriberDetailScreen from "./src/screens/services/SubscriberDetailScreen";
import AddServiceScreen from "./src/screens/services/AddServiceScreen";

// Components
import { CustomTabBarButton } from "./src/components/navigation/CustomTabBarButton";

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
function MainTabs({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          height: 60,
          paddingBottom: 0,
          position: "absolute",
          bottom: 15,
          marginHorizontal: 15,
          borderRadius: 20,
          zIndex: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarItemStyle: {
          // Centrar iconos verticalmente
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarIconStyle: {
          marginBottom: 0,
          marginTop: 0,
          height: 25,
          width: 25,
        },
        tabBarShowLabel: false,
      })}
    >
      {/* 1. IZQUIERDA: Dashboard (Home) */}
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
              style={{ top: 12 }}
            />
          ),
        }}
      />

      {/* 2. IZQUIERDA: Billetera ("Movimientos") */}
      <Tab.Screen
        name="Billetera"
        component={WalletStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={24}
              color={color}
              style={{ top: 12 }}
            />
          ),
        }}
      />

      {/* 3. CENTRO: Botón Flotante (Custom) */}
      <Tab.Screen
        name="AddAction"
        component={View}
        options={{
          tabBarIcon: ({ focused }) => <View />,
          tabBarButton: (props) => (
            <CustomTabBarButton
              onPress={() => navigation.navigate("AddTransaction")}
            />
          ),
        }}
      />

      {/* 4. DERECHA: Servicios */}
      <Tab.Screen
        name="Servicios"
        component={ServicesStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={24}
              color={color}
              style={{ top: 12 }}
            />
          ),
        }}
      />

      {/* 5. DERECHA: Perfil */}
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
              style={{ top: 12 }}
            />
          ),
        }}
      />
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
          <Stack.Screen
            name="AddService"
            component={AddServiceScreen}
            options={{
              presentation: "transparentModal",
              animation: "fade",
              contentStyle: { backgroundColor: "transparent" }, // IMPORTANTE: Para que no herede el fondo negro global
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
