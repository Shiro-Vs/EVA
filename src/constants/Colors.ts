const tintColorLight = "#1F7ECC";
const tintColorDark = "#79B6F2";

export const Colors = {
  light: {
    text: "#0C1B26",
    textSecondary: "#8F99A1",
    background: "#FFFFFF",
    card: "#F1F4F7",
    border: "#E2E8F0",
    tint: tintColorLight,
    primary: "#1F7ECC",
    income: "#4CAF50",
    warning: "#F59E0B",
    expense: "#E63946",
    muted: "#94A3B8",
    tabIconDefault: "#8F99A1",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECF2F7", // Casi blanco para alta legibilidad
    textSecondary: "#94A3B8", // Gris azulado suave
    background: "#020202ff", // Fondo estándar Material Dark
    card: "#1E293B", // Superficie elevada (un gris azulado oscuro)
    border: "#334155", // Contraste sutil sobre el fondo oscuro
    tint: tintColorDark,
    primary: "#79B6F2", // Azul primario suavizado para evitar destellos
    income: "#81C784", // Verde desaturado
    warning: "#FBBF24", // Ámbar más claro
    expense: "#b3463cff", // Rojo pastel/suave
    muted: "#64748B",
    tabIconDefault: "#64748B",
    tabIconSelected: tintColorDark,
  },
};
