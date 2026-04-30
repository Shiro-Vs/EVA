import React, { createContext, useContext } from "react";

interface ThemeContextType {
  theme: "light";
  setTheme: (theme: "light") => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = "light";
  const isDark = false;

  const setTheme = () => {};
  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
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
