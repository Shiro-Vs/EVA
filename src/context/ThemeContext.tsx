import React, { createContext, useContext } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  isDark: boolean;
  fontFamily: "asap" | "roboto";
  setFontFamily: (font: "asap" | "roboto") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<"light" | "dark">("light");
  const [fontFamily, setFontFamilyState] = React.useState<"asap" | "roboto">("asap");

  const setTheme = (newTheme: "light" | "dark") => setThemeState(newTheme);
  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setFontFamily = (newFont: "asap" | "roboto") => setFontFamilyState(newFont);

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark, fontFamily, setFontFamily }}>
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
