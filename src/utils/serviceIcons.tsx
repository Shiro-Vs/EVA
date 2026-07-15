import React from "react";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome,
  Feather,
  Fontisto,
} from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

// Tipos de iconos soportados
export type IconLibrary =
  | "Ionicons"
  | "MaterialCommunityIcons"
  | "FontAwesome5"
  | "Feather";

/**
 * Componente universal para renderizar iconos de servicios desde múltiples fuentes.
 */
export const ServiceIcon = ({
  name,
  size = 24,
  color = Colors.light.primary,
}: {
  name: string;
  size?: number;
  color?: string;
}) => {
  if (name === "netflix") {
    return <Fontisto name="netflix" size={size} color={color} />;
  }
  if (name === "youtube") {
    return <FontAwesome name="youtube-play" size={size} color={color} />;
  }

  // 1. Prioridad: Marcas en FontAwesome (v4 y v5)
  const brandsV4 = [
    "spotify",
    "facebook",
    "twitter",
    "instagram",
    "github",
    "linkedin",
    "whatsapp",
    "telegram",
    "amazon",
    "apple",
    "google",
  ];
  const brandsV5 = [
    "discord",
    "steam",
    "twitch",
    "slack",
    "adobe",
    "reddit",
    "playstation",
    "xbox",
  ];

  if (brandsV4.includes(name)) {
    return <FontAwesome name={name as any} size={size} color={color} />;
  }
  if (brandsV5.includes(name)) {
    return (
      <FontAwesome5
        name={name as any}
        size={size}
        color={color}
        brands={true}
      />
    );
  }

  // 2. Prioridad: Marcas en Ionicons (Logos estables)
  const ioniconsLogos: Record<string, string> = {
    youtube: "logo-youtube",
    apple: "logo-apple",
    google: "logo-google",
    playstation: "logo-playstation",
    xbox: "logo-xbox",
    microsoft: "logo-microsoft",
  };
  if (ioniconsLogos[name]) {
    return (
      <Ionicons name={ioniconsLogos[name] as any} size={size} color={color} />
    );
  }

  // 3. Prioridad: Iconos estilizados en Feather
  const featherIcons = [
    "tv",
    "music",
    "shopping-cart",
    "gift",
    "smartphone",
    "wifi",
    "activity",
    "heart",
    "star",
    "home",
    "shopping-bag",
    "zap",
    "camera",
    "video",
    "headphone",
  ];
  if (featherIcons.includes(name)) {
    return <Feather name={name as any} size={size} color={color} />;
  }

  // 4. Prioridad: Todo lo demás en MaterialCommunityIcons
  return (
    <MaterialCommunityIcons name={name as any} size={size} color={color} />
  );
};

/**
 * Lista curada de iconos populares para el selector
 */
export const POPULAR_ICONS = [
  // Marcas
  "netflix",
  "spotify",
  "youtube",
  "apple",
  "google",
  "amazon",
  "playstation",
  "xbox",
  "discord",
  "telegram",
  "whatsapp",
  "facebook",
  "instagram",
  "twitter",
  "github",
  "steam",
  "twitch",

  // Multimedia (Mezcla de Feather y MCI)
  "play-circle",
  "music",
  "tv",
  "video",
  "filmstrip",
  "gamepad-variant",
  "headset",
  "camera",
  "ticket",

  // Utilidades y Hogar (Estilizados con Feather donde sea posible)
  "credit-card",
  "shopping-cart",
  "wallet",
  "bank",
  "receipt",
  "shopping-bag",
  "food-apple",
  "silverware-fork-knife",
  "coffee",
  "cup-water",
  "home",
  "zap",
  "water",
  "gas-station",
  "wifi",
  "smartphone",
  "car",
  "airplane",
  "bus",
  "school",
  "heart",
  "star",
  "phone",
];

/**
 * Paleta de colores premium para servicios
 */
export const PRESET_COLORS = [
  Colors.light.primary, // Azul EVA
  "#E50914", // Netflix Red
  "#1DB954", // Spotify Green
  "#00A8E1", // Prime Video Blue
  "#FF0000", // YouTube Red
  "#512DA8", // HBO Max Purple
  "#006E99", // Disney+ Blue
  "#FF9900", // Amazon Orange
  "#003791", // PlayStation Blue
  "#107C10", // Xbox Green
  "#E60012", // Nintendo Red
  "#5865F2", // Discord Blurple
  "#6441A5", // Twitch Purple
  "#25D366", // WhatsApp Green
  "#4285F4", // Google Blue
  "#000000", // Apple Black
  "#64748B", // Slate Grey
];

/**
 * Ajusta un color para que sea armónico con el tema oscuro (lo hace más suave/pastel)
 */
export const getAdjustedColor = (color: string, isDark: boolean) => {
  if (!isDark) return color;
  
  // Colores que no queremos tocar mucho (blanco/negro/slate)
  if (color === "#000000" || color === "#FFFFFF" || color === "#64748B") {
    return isDark && color === "#000000" ? "#E2E8F0" : color;
  }

  // Si el color es hexadecimal, lo suavizamos para Dark Mode
  if (color.startsWith("#") && color.length === 7) {
    // Algoritmo simple para "pastelizar": mezclamos el color con blanco (70% original, 30% blanco)
    // Esto reduce la saturación y aumenta la luminosidad para que no brille agresivamente
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    const softR = Math.round(r * 0.8 + 255 * 0.2).toString(16).padStart(2, '0');
    const softG = Math.round(g * 0.8 + 255 * 0.2).toString(16).padStart(2, '0');
    const softB = Math.round(b * 0.8 + 255 * 0.2).toString(16).padStart(2, '0');
    
    return `#${softR}${softG}${softB}`;
  }
  
  return color;
};

/**
 * Sugiere un icono y color basado en el nombre del servicio y el tema
 */
export const getServiceDefaults = (name: string, isDark: boolean = false) => {
  const lowerName = name.toLowerCase();
  let color = Colors.light.primary;
  let icon = "receipt";

  if (lowerName.includes("netflix")) {
    icon = "netflix";
    color = "#E50914";
  } else if (lowerName.includes("spotify")) {
    icon = "spotify";
    color = "#1DB954";
  } else if (lowerName.includes("youtube")) {
    icon = "youtube";
    color = "#FF0000";
  } else if (lowerName.includes("prime") || lowerName.includes("amazon")) {
    icon = "amazon";
    color = "#00A8E1";
  } else if (lowerName.includes("disney")) {
    icon = "filmstrip";
    color = "#006E99";
  } else if (lowerName.includes("hbo")) {
    icon = "television-play";
    color = "#512DA8";
  } else if (lowerName.includes("apple")) {
    icon = "apple";
    color = isDark ? "#FFFFFF" : "#000000";
  } else if (lowerName.includes("google")) {
    icon = "google";
    color = "#4285F4";
  } else if (lowerName.includes("playstation")) {
    icon = "playstation";
    color = "#003791";
  } else if (lowerName.includes("xbox")) {
    icon = "xbox";
    color = "#107C10";
  } else if (lowerName.includes("nintendo")) {
    icon = "nintendo-switch";
    color = "#E60012";
  } else if (lowerName.includes("internet") || lowerName.includes("wifi")) {
    icon = "wifi";
    color = Colors.light.primary;
  } else if (lowerName.includes("luz") || lowerName.includes("electric")) {
    icon = "lightning-bolt";
    color = "#FBBF24";
  } else if (lowerName.includes("agua")) {
    icon = "water";
    color = "#3B82F6";
  }

  return { 
    icon, 
    color: getAdjustedColor(color, isDark) 
  };
};
