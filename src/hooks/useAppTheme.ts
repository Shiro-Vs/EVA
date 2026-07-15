import { Colors } from "../constants/Colors";
import { FontFamilies, FontSizes } from "../constants/Fonts";
import { useAppThemeContext } from "../context/ThemeContext";

/**
 * Hook para obtener los colores y fuentes del tema actual
 * Útil para componentes que requieren estilos en sus props (como Ionicons o Text)
 */
export function useAppTheme() {
  const { theme, fontFamily } = useAppThemeContext();
  
  // Tipado seguro para el tema
  const currentTheme = (theme as keyof typeof Colors) || "light";
  // Obtener la familia de fuentes actual desde el contexto
  const currentFontFamily = FontFamilies[fontFamily] || FontFamilies.asap;
  
  return {
    colors: Colors[currentTheme],
    fonts: {
      family: currentFontFamily,
      size: FontSizes
    },
    theme: currentTheme,
    isDark: currentTheme !== "light",
  };
}
