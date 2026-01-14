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
import HomeScreen from "./src/screens/dashboard/HomeScreen";
import ProfileScreen from "./src/screens/profile/ProfileScreen";

// Wallet
import WalletScreen from "./src/screens/wallet/WalletScreen";
import AccountDetailScreen from "./src/screens/wallet/AccountDetailScreen";
import AddTransactionScreen from "./src/screens/actions/AddTransactionScreen";
import AccountsScreen from "./src/screens/accounts/AccountsScreen";
import BudgetsScreen from "./src/screens/budgets/BudgetsScreen";

// Services
import ServicesScreen from "./src/screens/subscriptions/ServicesScreen";
import ServiceDetailScreen from "./src/screens/subscriptions/ServiceDetailScreen";
import SubscriberDetailScreen from "./src/screens/subscriptions/SubscriberDetailScreen";
import AddServiceScreen from "./src/screens/subscriptions/AddServiceScreen";

// Components
import { CustomTabBarButton } from "./src/components/navigation/CustomTabBarButton";

// Creación de los Navegadores
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ServiceStack = createNativeStackNavigator();
const WalletStack = createNativeStackNavigator();

import { LinearGradient } from "expo-linear-gradient";

// --- 0. Componente de Icono con Brillo ---
const GlowIcon = ({
  focused,
  name,
  color,
}: {
  focused: boolean;
  name: any;
  color: string;
}) => (
  <View style={{ alignItems: "center", justifyContent: "center", top: 12 }}>
    {focused && (
      <View
        style={{
          position: "absolute",
          width: 32, // Más pequeño (antes 45)
          height: 32,
          borderRadius: 16,
          backgroundColor: color + "15", // Muy sutil (15% opacidad)
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8, // Sombra fuerte pero...
          shadowRadius: 15, // ...muy difuminada
          elevation: 0, // Sin sombra dura en Android
        }}
      />
    )}
    <Ionicons name={name} size={24} color={color} />
  </View>
);

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
            <GlowIcon
              focused={focused}
              name={focused ? "home" : "home-outline"}
              color={color}
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
            <GlowIcon
              focused={focused}
              name={focused ? "wallet" : "wallet-outline"}
              color={color}
            />
          ),
        }}
      />

      {/* 3. IZQUIERDA: Metas (Budgets) */}
      <Tab.Screen
        name="Metas"
        component={BudgetsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <GlowIcon
              focused={focused}
              name={focused ? "pie-chart" : "pie-chart-outline"}
              color={color}
            />
          ),
        }}
      />

      {/* 4. CENTRO: Botón Flotante (Custom) */}
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

      {/* 5. DERECHA: Servicios */}
      <Tab.Screen
        name="Servicios"
        component={ServicesStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <GlowIcon
              focused={focused}
              name={focused ? "grid" : "grid-outline"}
              color={color}
            />
          ),
        }}
      />

      {/* 6. DERECHA: Cuentas (Accounts) */}
      <Tab.Screen
        name="Cuentas"
        component={AccountsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <GlowIcon
              focused={focused}
              name={focused ? "card" : "card-outline"}
              color={color}
            />
          ),
        }}
      />

      {/* 7. DERECHA: Perfil */}
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <GlowIcon
              focused={focused}
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

import { GestureHandlerRootView } from "react-native-gesture-handler";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
              options={{
                presentation: "transparentModal",
                animation: "slide_from_bottom",
                contentStyle: { backgroundColor: "transparent" },
              }}
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
    </GestureHandlerRootView>
  );
}
// Force Reload
