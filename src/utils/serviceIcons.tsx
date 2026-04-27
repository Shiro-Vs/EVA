import React from "react";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome,
  Feather,
  Fontisto,
} from "@expo/vector-icons";

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
  color = "#1F7ECC",
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
  "#1F7ECC", // Azul EVA
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
 * Sugiere un icono y color basado en el nombre del servicio
 */
export const getServiceDefaults = (name: string) => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("netflix"))
    return { icon: "netflix", color: "#E50914" };
  if (lowerName.includes("spotify"))
    return { icon: "spotify", color: "#1DB954" };
  if (lowerName.includes("youtube"))
    return { icon: "youtube", color: "#FF0000" };
  if (lowerName.includes("prime") || lowerName.includes("amazon"))
    return { icon: "amazon", color: "#00A8E1" };
  if (lowerName.includes("disney"))
    return { icon: "filmstrip", color: "#006E99" };
  if (lowerName.includes("hbo"))
    return { icon: "television-play", color: "#512DA8" };
  if (lowerName.includes("apple")) return { icon: "apple", color: "#000000" };
  if (lowerName.includes("google")) return { icon: "google", color: "#4285F4" };
  if (lowerName.includes("playstation"))
    return { icon: "playstation", color: "#003791" };
  if (lowerName.includes("xbox")) return { icon: "xbox", color: "#107C10" };
  if (lowerName.includes("nintendo"))
    return { icon: "nintendo-switch", color: "#E60012" };
  if (lowerName.includes("internet") || lowerName.includes("wifi"))
    return { icon: "wifi", color: "#1F7ECC" };
  if (lowerName.includes("luz") || lowerName.includes("electric"))
    return { icon: "lightning-bolt", color: "#FBBF24" };
  if (lowerName.includes("agua")) return { icon: "water", color: "#3B82F6" };

  return { icon: "receipt", color: "#1F7ECC" };
};
