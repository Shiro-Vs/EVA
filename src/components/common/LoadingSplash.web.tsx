import React, { useEffect, useState } from 'react';
import { Appearance, Platform, Image, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '../../constants/Colors';

const LOGO_LIGHT_BG = require('../../../assets/LogoEVA_Fclaro.png');
const LOGO_DARK_BG = require('../../../assets/LogoEVA_Foscuro.png');

interface LoadingSplashProps {
  onAnimationComplete?: () => void;
  isReady?: boolean;
}

export default function LoadingSplash({ onAnimationComplete, isReady }: LoadingSplashProps) {
  const { colorScheme } = useColorScheme();
  const isDark = (colorScheme || Appearance.getColorScheme()) === 'dark';
  
  const themeColors = isDark ? Colors.dark : Colors.light;
  const logoSource = isDark ? LOGO_DARK_BG : LOGO_LIGHT_BG;
  const textColor = isDark ? '#FFFFFF' : themeColors.primary;

  const [mounted, setMounted] = useState(false);
  const [fadedOut, setFadedOut] = useState(false);

  useEffect(() => {
    console.log("DEBUG: MOUNTING LoadingSplash.web.tsx (PURE CSS VERSION)");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isReady && !fadedOut) {
      console.log("DEBUG: STARTING FADE OUT LoadingSplash.web.tsx");
      setFadedOut(true);
      // La duración en CSS es de 3s (3000ms), le damos un un poco más de margen
      const timer = setTimeout(() => {
        if (onAnimationComplete) {
           console.log("DEBUG: NOTIFYING ANIMATION COMPLETE LoadingSplash.web.tsx");
           onAnimationComplete();
        }
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  // Estilos inline de DOM para asegurar que no hay interferencia de RN-Web
  const containerStyle: any = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: themeColors.background,
    opacity: fadedOut ? 0 : 1,
    transition: 'opacity 3000ms cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: fadedOut ? 'none' : 'auto',
  };

  const contentStyle: any = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 2000ms ease-out',
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'scale(1)' : 'scale(0.9)',
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <Image 
          source={logoSource} 
          style={{ width: 220, height: 220, alignSelf: 'center' }} 
          resizeMode="contain" 
        />
        <p style={{
          fontSize: '80px',
          fontWeight: 'bold',
          letterSpacing: '16px',
          fontFamily: 'AsapBoldItalic',
          color: textColor,
          marginTop: '30px',
          margin: 0
        }}>
          EVA
        </p>
      </div>
    </div>
  );
}
