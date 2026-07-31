import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: ResolvedTheme;
  themePreference: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
  isDark: boolean;
  fontFamily: "asap" | "roboto";
  setFontFamily: (font: "asap" | "roboto") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "eva.theme_preference";

const resolveTheme = (preference: ThemePreference): ResolvedTheme => {
  if (preference === "system") {
    return Appearance.getColorScheme() === "dark" ? "dark" : "light";
  }
  return preference;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("system");
  const [theme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme("system"));
  const [fontFamily, setFontFamilyState] = useState<"asap" | "roboto">("asap");

  // Cargar la preferencia guardada al arrancar
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemePreferenceState(stored);
        setResolvedTheme(resolveTheme(stored));
      }
    });
  }, []);

  // Si la preferencia es "system", seguir los cambios del SO en vivo
  useEffect(() => {
    if (themePreference !== "system") return;
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setResolvedTheme(colorScheme === "dark" ? "dark" : "light");
    });
    return () => subscription.remove();
  }, [themePreference]);

  const setTheme = (newPreference: ThemePreference) => {
    setThemePreferenceState(newPreference);
    setResolvedTheme(resolveTheme(newPreference));
    AsyncStorage.setItem(STORAGE_KEY, newPreference);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const setFontFamily = (newFont: "asap" | "roboto") => setFontFamilyState(newFont);

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider
      value={{ theme, themePreference, setTheme, toggleTheme, isDark, fontFamily, setFontFamily }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useAppThemeContext must be used within a ThemeProvider");
  }
  return context;
}
