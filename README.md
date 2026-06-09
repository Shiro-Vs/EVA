<div align="center">

# EVA

**Gestión financiera personal, inteligente y minimalista.**

[![Expo](https://img.shields.io/badge/Expo-54.0-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.10-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Plataforma](https://img.shields.io/badge/plataforma-Android%20%7C%20iOS%20%7C%20Web-lightgrey?style=flat-square)](https://expo.dev/)
[![Licencia](https://img.shields.io/badge/licencia-privada-red?style=flat-square)](#)

</div>

---

EVA es una aplicación móvil construida con **Expo** y **React Native** que te ayuda a tomar el control de tus finanzas personales. Administra tus cuentas, establece metas de ahorro, planifica tus gastos y recibe asistencia de inteligencia artificial, todo desde un solo lugar.

---

## Funcionalidades

- **Autenticación** — Inicio de sesión y registro con validación en tiempo real
- **Panel principal** — Vista general del estado financiero del usuario
- **Metas** — Creación y seguimiento de objetivos de ahorro e inversión
- **Planificación** — Organización de gastos e ingresos por períodos
- **Perfil** — Gestión de cuenta y preferencias personales
- **Contactos** — Administración de contactos financieros
- **Finanzas** — Control de cuentas, préstamos y suscripciones
- **Asistente IA** — Integración con Google Gemini para asistencia financiera

---

## Tecnologías

| Tecnología                                                                     | Versión  | Propósito                             |
| ------------------------------------------------------------------------------ | -------- | ------------------------------------- |
| [Expo](https://expo.dev/)                                                      | ~54.0.33 | Marco de trabajo principal            |
| [React Native](https://reactnative.dev/)                                       | 0.81.5   | Interfaz de usuario nativa            |
| [Expo Router](https://expo.github.io/router/)                                  | ~6.0.23  | Navegación basada en archivos         |
| [Firebase](https://firebase.google.com/)                                       | ^12.10.0 | Base de datos y autenticación         |
| [Google Generative AI](https://ai.google.dev/)                                 | ^0.24.1  | Asistente con inteligencia artificial |
| [NativeWind](https://www.nativewind.dev/)                                      | 4.2.2    | Estilos con Tailwind CSS              |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | ~4.1.1   | Animaciones fluidas                   |
| [TypeScript](https://www.typescriptlang.org/)                                  | ^5.9.3   | Tipado estático                       |

---

## Estructura del proyecto

```
EVA/
├── app/                          # Rutas gestionadas por Expo Router
│   ├── (main)/                   # Rutas protegidas (requieren sesión activa)
│   ├── _layout.tsx               # Diseño raíz de la aplicación
│   ├── index.tsx                 # Pantalla de entrada
│   ├── register.tsx              # Pantalla de registro
│   ├── forgot-password.tsx       # Recuperación de contraseña
│   └── contacts.tsx              # Pantalla de contactos
├── src/
│   ├── api/                      # Configuración y clientes de APIs externas
│   ├── components/               # Componentes reutilizables de la interfaz
│   │   └── common/               # EVAAlert, EVAInput, EVAModal, EVAAvatar...
│   ├── constants/                # Constantes globales de la aplicación
│   ├── context/                  # Estado global con Context API
│   ├── data/                     # Datos estáticos y de ejemplo
│   ├── hooks/                    # Hooks personalizados (useAppTheme, etc.)
│   ├── interfaces/               # Tipos e interfaces de TypeScript
│   ├── logic/                    # Lógica de negocio desacoplada de la interfaz
│   ├── screens/                  # Pantallas organizadas por módulo
│   │   ├── auth/                 # Inicio de sesión, registro, recuperación
│   │   ├── dashboard/            # Panel financiero principal
│   │   ├── goals/                # Metas de ahorro
│   │   ├── planning/             # Planificación financiera
│   │   └── profile/             # Perfil del usuario
│   ├── services/                 # Servicios de acceso a datos y APIs
│   │   ├── AuthService.ts        # Autenticación con Firebase
│   │   ├── AccountService.ts     # Gestión de cuentas
│   │   ├── FinanceService.ts     # Movimientos financieros
│   │   ├── LoanService.ts        # Préstamos
│   │   ├── SubscriptionService.ts# Suscripciones
│   │   └── ContactService.ts     # Contactos
│   └── utils/                    # Funciones de utilidad general
├── assets/                       # Imágenes, íconos y fuentes
├── app.json                      # Configuración de Expo
├── package.json                  # Dependencias del proyecto
└── tsconfig.json                 # Configuración de TypeScript
```

---

## Instalación

### Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/client) en tu dispositivo móvil, o un emulador configurado

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/EVA.git
cd EVA

# Instalar las dependencias
npm install

# Configurar las variables de entorno
cp .env.example .env

# Iniciar la aplicación
npx expo start
```

### Comandos disponibles

| Comando           | Descripción                           |
| ----------------- | ------------------------------------- |
| `npx expo start`  | Inicia el servidor de desarrollo      |
| `npm run android` | Ejecuta la app en un emulador Android |
| `npm run ios`     | Ejecuta la app en un simulador iOS    |
| `npm run web`     | Ejecuta la app en el navegador web    |

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto. Puedes obtener estos valores desde la consola de [Firebase](https://console.firebase.google.com/) y [Google AI Studio](https://aistudio.google.com/).

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# Google Gemini
EXPO_PUBLIC_GEMINI_API_KEY=
```

---

## Licencia

Este proyecto es privado. Todos los derechos reservados ©EVA.
