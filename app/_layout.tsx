import "../global.css";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import LoadingSplash from "../src/components/common/LoadingSplash";
import { useColorScheme } from "nativewind";
import { Appearance, View } from "react-native";
import { 
  useFonts,
  Asap_400Regular,
  Asap_500Medium,
  Asap_600SemiBold,
  Asap_700Bold,
  Asap_400Regular_Italic,
  Asap_500Medium_Italic,
  Asap_600SemiBold_Italic,
  Asap_700Bold_Italic
} from '@expo-google-fonts/asap';
import { ThemeProvider, useAppThemeContext } from "../src/context/ThemeContext";

// Prevenir que el splash screen nativo se oculte automáticamente
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { theme } = useAppThemeContext();
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'Asap': Asap_400Regular,
    'AsapMedium': Asap_500Medium,
    'AsapSemiBold': Asap_600SemiBold,
    'AsapBold': Asap_700Bold,
    'AsapItalic': Asap_400Regular_Italic,
    'AsapMediumItalic': Asap_500Medium_Italic,
    'AsapSemiBoldItalic': Asap_600SemiBold_Italic,
    'AsapBoldItalic': Asap_700Bold_Italic,
  });

  useEffect(() => {
    if (fontError) console.error("Error cargando fuentes:", fontError);

    async function prepare() {
      if (fontsLoaded || fontError) {
        try {
          // Ocultamos el splash nativo
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn(e);
        } finally {
          // Ajustado para un tiempo de 1.8 segundos (600ms entrada + 800ms espera + 400ms salida)
          setTimeout(() => {
            setAppIsReady(true);
          }, 1400);
        }
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  // Si las fuentes no han cargado, no renderizamos NADA para evitar que se vea la fuente del sistema
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} className={theme}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>

      {showSplash && (
        <LoadingSplash 
          isReady={appIsReady} 
          onAnimationComplete={() => setShowSplash(false)} 
        />
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
