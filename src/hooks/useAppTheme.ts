import { Colors } from "../constants/Colors";
import { useAppThemeContext } from "../context/ThemeContext";

/**
 * Hook para obtener los colores del tema actual (light/dark/dark2)
 * Útil para componentes que requieren colores en sus props (como Ionicons o ActivityIndicator)
 */
export function useAppTheme() {
  const { theme } = useAppThemeContext();
  
  // Tipado seguro para el tema
  const currentTheme = (theme as keyof typeof Colors) || "light";
  
  return {
    colors: Colors[currentTheme],
    theme: currentTheme,
    isDark: currentTheme !== "light",
  };
}
